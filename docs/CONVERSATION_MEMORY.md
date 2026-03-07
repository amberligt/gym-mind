# Conversation state / memory — current vs optional

## What’s already working

Your app **already** does two of the three things from that breakdown:

### 1. User profile in the system prompt ✅

- **Storage:** `profiles` table (`profile_json`).
- **Flow:** `fetchProfile(userId)` → passed as `profile` in the generate/analyse payload → API appends to system prompt:  
  `"User profile: ${JSON.stringify(profile)}. Use this to personalise exercise selection, weights, and coaching tone."`
- So Claude already gets training goal, experience, strength numbers, etc., every request.

### 2. “History” in context ✅ (workout history, not chat)

- **Storage:** Sessions + sets (and derived “recent workouts”).
- **Flow:** `getRecentHistory(userId, 5)` → last 5 sessions with exercises/weights/difficulty → passed as `history` → API appends to the **user** message so Claude can personalise weight suggestions.
- This is **workout/session history**, not chat message history.

### 3. Conversation history (message turns) ❌ Not implemented

- **Current behaviour:** Each “Generate workout” is a single shot: one `userInput` string, one API call, one workout back. No stored array of user/assistant **message turns**.
- So there is **no continuity across multiple messages** (e.g. “Upper body 45 min” → “Actually make it harder” → second call has no memory of the first).
- There is also **no rolling “memory summary”** of past conversations.

---

## Do you need to implement it?

- **If the UX stays single-shot** (user picks focus + duration or pastes once → one workout): you’re fine. Profile + workout history already give strong personalisation.
- **If you want multi-turn “conversation”** (e.g. follow-ups like “swap X for Y”, “make it shorter”, “add more legs”): then you need **conversation history injection** (and optionally **user memory summaries**).

---

## Sketch: adding conversation memory

If you want to add it, this is a minimal way that fits your stack.

### 1. Supabase schema

One table is enough if you don’t need multiple concurrent threads per user:

```sql
-- Optional: conversation threads (one per “flow” if you want multiple later)
CREATE TABLE conversation_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversation_threads_user_id ON conversation_threads(user_id);

-- Message turns (user + assistant)
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES conversation_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversation_messages_thread_id ON conversation_messages(thread_id);
```

RLS: user can only read/write rows where `thread_id` → `conversation_threads.user_id = auth.uid()`.

Simpler variant: no threads, only `conversation_messages(user_id, role, content, created_at)` and “last N messages for this user”.

### 2. Flow (per request)

1. **Before calling Claude**
   - Load “current thread” (e.g. latest thread for user or create one).
   - Load last N messages (e.g. 10) for that thread, order by `created_at`.
   - Build `messages: [{ role, content }, ...]` for the API.

2. **Call Claude**
   - Send **conversation history** as `messages` (Anthropic API format).
   - Append **profile** (and optionally **workout history**) to the system prompt as you already do.
   - Latest user input is either the last element of `messages` or a separate “current turn” you append.

3. **After Claude responds**
   - Insert user message row (`role: 'user'`, `content: currentInput`).
   - Insert assistant message row (`role: 'assistant'`, `content: workoutOrReply`).
   - Optionally run a job or a simple “summary” step that updates a `user_memory_summary` (e.g. in `profiles` or a small `user_memory` table) so you can inject “Previous context: …” in the system prompt and keep the message window small.

### 3. API change (conceptual)

- **Today:** `callClaude(systemPrompt, userContent, maxTokens)` → single user message.
- **With history:**  
  `callClaude(systemPrompt, messages, maxTokens)`  
  where `messages` is the array of `{ role, content }` (e.g. last 10 from DB + new user turn).  
  Anthropic’s API already takes a `messages` array; you’d stop building one big string and pass that array instead.

### 4. Optional: user memory summary

- Add a column or table, e.g. `profiles.memory_summary` or `user_memory(summary)`.
- Periodically (e.g. every 5 turns or on session end) call Claude with “Summarise this in 2–3 sentences for next time: …” and store the result.
- On each request, prepend to system prompt: “Previous conversation context: {memory_summary}”.
- That keeps behaviour “continuous” without sending the full message history every time.

---

## Summary

| Piece                         | Status in mygym | Notes                                      |
|------------------------------|------------------|--------------------------------------------|
| User profile in system prompt| ✅ Implemented   | `profile` from DB → system prompt          |
| Workout history in context   | ✅ Implemented   | Last 5 sessions → user message              |
| Conversation history (turns)| ❌ Not implemented | No table, no `messages` array per request |
| User memory summary          | ❌ Not implemented | No rolling summary field / job           |

So: **profile + workout history are already working.** To get “continuous conversation” you’d add **conversation history injection** (store and pass last N messages) and optionally **user memory summaries** as above. If you want, the next step is to implement the “simpler variant” (one table `conversation_messages(user_id, role, content, created_at)`) and wire it into `workoutService` + `api/claude-workout` so generate uses last N messages.
