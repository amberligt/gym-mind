import { createClient } from '@supabase/supabase-js';

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are an expert personal trainer AI that creates structured, periodised workout plans in JSON format.

RULES:
- Respond ONLY with valid JSON. No markdown, no explanation, no code blocks.
- Organise every workout into blocks (e.g. "Warm-up", "Strength", "Superset A", "Cardio Finisher", "Cool-down").
- Each block has a type: "warmup", "strength", "hypertrophy", "circuit", "superset", "cardio", or "cooldown".
- For superset blocks set rounds and rest_between_rounds_seconds; exercises inside alternate with no rest between them.
- Choose sets, reps, duration, and rest values appropriate to the block type.
- If the user's exercise history is provided, use it to set suggested_weight_kg intelligently:
  - Rating 1–2 (easy): increase weight next time.
  - Rating 3 (perfect): small increase.
  - Rating 4 (hard): keep same.
  - Rating 5 (failed): decrease weight.
- If no history is available for an exercise, suggest conservative weights for a general adult.
- Every exercise MUST have a unique id (short slug, e.g. "bb-bench-1").
- For supersets, set superset_with to the id of the paired exercise.
- Use duration_seconds for time-based exercises (planks, cardio intervals).
- Use distance_meters for distance-based cardio (rowing, running).
- Omit fields that don't apply (e.g. no sets/reps for pure cardio, no weight for bodyweight).

OUTPUT SCHEMA:
{
  "title": string,
  "estimated_duration_minutes": number,
  "blocks": [
    {
      "label": string,
      "name": string,
      "duration_minutes": number,
      "type": "warmup" | "strength" | "hypertrophy" | "circuit" | "superset" | "cardio" | "cooldown",
      "rounds": number | null,
      "rest_between_rounds_seconds": number | null,
      "exercises": [
        {
          "id": string,
          "name": string,
          "superset_with": string | null,
          "sets": number | null,
          "reps": string | null,
          "duration_seconds": number | null,
          "distance_meters": number | null,
          "suggested_weight_kg": number | null,
          "rest_seconds": number | null,
          "notes": string | null
        }
      ]
    }
  ]
}`;

const POST_WORKOUT_SYSTEM = `You are a personal trainer analysing a user's full workout history. Based on actual weights lifted, difficulty ratings, and volume trends across all sessions, return a JSON object with: one coaching_summary (plain language paragraph, specific and encouraging, referencing actual numbers) and a recommendations array where each item has exercise name, suggested_weight_kg, volume_trend (up/down/same), and pr_flag (boolean). Respond only with valid JSON.`;

const ALTERNATIVES_SYSTEM = `You are a personal trainer. Given an exercise to replace, return exactly 3 alternative exercises with similar movement pattern and intent.

Respond ONLY with valid JSON in this exact format:
{
  "alternatives": [
    { "name": "Exercise Name", "reason": "One-line reason why it's a good substitute" },
    { "name": "Exercise Name", "reason": "One-line reason why it's a good substitute" },
    { "name": "Exercise Name", "reason": "One-line reason why it's a good substitute" }
  ]
}`;

const ADJUST_SYSTEM = `You are a personal trainer. Given a workout JSON and an adjustment instruction, return the FULL updated workout in the SAME schema.

Rules:
- Apply the adjustment to the workout structure.
- Preserve all existing fields and IDs.
- Return ONLY valid JSON. No markdown, no explanation.`;

const PARSE_PROFILE_SYSTEM = `Parse this training profile text. The input may be a numbered list, paragraphs, markdown, or mixed format—extract what you can and ignore the rest.

Return ONLY valid JSON (no markdown, no code fences) with these exact fields:
training_goal (string), secondary_goal (string or null), experience_level (beginner/intermediate/advanced), experience_years (number or null), strength_numbers (object: push_ups, pull_ups, squat, deadlift, bench_press, overhead_press as strings or null), bodyweight (string or null), injuries (string or null), days_per_week (number or null), session_duration_minutes (number or null), recovery_quality (low/medium/high or null), skill_goals (array of strings or empty array).

If a field says unknown or is missing, set it to null. Be lenient: infer from context when possible.`;

function cors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
}

async function callClaude(system: string, userContent: string, maxTokens: number) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  const res = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': CLAUDE_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data: any = await res.json();
  return data.content[0].text as string;
}

function cleanJson(text: string) {
  return text.replace(/```json|```/g, '').trim();
}

export default async function handler(req: any, res: any) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ error: 'Missing authorization' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnon = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) {
      return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_ANON_KEY not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const { action, payload } = req.body || {};
    if (!action || !payload) {
      return res.status(400).json({ error: 'Missing action or payload' });
    }

    const validActions = ['generate', 'analyse', 'alternatives', 'adjust', 'parse_profile'] as const;
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    // Rate limit via database RPC (uses auth.uid()).
    const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc('check_and_increment_rate_limit', {
      p_action: action,
    });

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      return res.status(500).json({ error: 'Rate limit check failed. Try again.' });
    }

    const rl = rateLimitResult as {
      allowed?: boolean;
      error?: string;
      reset_seconds?: number;
      limit?: number;
      remaining?: number;
    };

    if (rl?.allowed === false) {
      if (rl.error === 'Not authenticated') {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const retryAfter = Math.min(rl.reset_seconds ?? 60, 60);
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('X-RateLimit-Limit', String(rl.limit ?? 10));
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait before trying again.',
        retry_after_seconds: retryAfter,
      });
    }

    const rateLimitHeaders: Record<string, string> = {};
    if (rl?.limit != null) rateLimitHeaders['X-RateLimit-Limit'] = String(rl.limit);
    if (rl?.remaining != null) rateLimitHeaders['X-RateLimit-Remaining'] = String(rl.remaining);
    Object.entries(rateLimitHeaders).forEach(([k, v]) => res.setHeader(k, v));

    const { data: userData } = await supabase.auth.getUser();
    const userId = (userData as any)?.user?.id ?? null;

    let result: any;

    switch (action) {
      case 'generate': {
        const { userInput, history, profile } = payload;
        let systemPrompt = SYSTEM_PROMPT;
        if (profile && Object.keys(profile).length > 0) {
          systemPrompt += `\n\nUser profile: ${JSON.stringify(profile)}. Use this to personalise exercise selection, weights, and coaching tone.`;
        }
        let message = userInput;
        if (history?.length > 0) {
          const historyBlock = history
            .map((w: { date: string; title: string; exercises: any[] }) => {
              const date = new Date(w.date).toLocaleDateString();
              const exercises = (w.exercises || [])
                .map((ex: { name: string; sets: ExerciseSet[]; reps?: string }) => {
                  const sets = Array.isArray(ex.sets) ? ex.sets : [];
                  const avgWeight =
                    sets.length > 0
                      ? (
                          sets.reduce(
                            (sum: number, set: ExerciseSet) => sum + (set.weight_kg || 0),
                            0
                          ) / sets.length
                        ).toFixed(1)
                      : '0';
                  const reps = sets[0]?.target_reps ?? ex.reps ?? '—';
                  const rated = sets.filter((s) => s.difficulty != null);
                  const avgRating =
                    rated.length > 0
                      ? (
                          rated.reduce(
                            (sum: number, s: ExerciseSet) => sum + (s.difficulty ?? 0),
                            0
                          ) / rated.length
                        ).toFixed(0)
                      : '';
                  const rating = avgRating ? ` (difficulty: ${avgRating}/5)` : '';
                  return `  - ${ex.name}: ${avgWeight}kg × ${sets.length}×${reps}${rating}`;
                })
                .join('\n');
              return `${date} — ${w.title}:\n${exercises}`;
            })
            .join('\n');
          message += `\n\nMy recent workout history (use this to personalize weight suggestions):\n${historyBlock}`;
        }
        const text = await callClaude(systemPrompt, message, 2048);
        result = { success: true, raw: cleanJson(text) };
        break;
      }

      case 'analyse': {
        const { current_session, all_sessions, profile } = payload;
        let analysePrompt = POST_WORKOUT_SYSTEM;
        if (profile && Object.keys(profile).length > 0) {
          analysePrompt += ` User profile for context: ${JSON.stringify(profile)}.`;
        }
        const text = await callClaude(
          analysePrompt,
          JSON.stringify({ current_session, all_sessions }),
          1024
        );
        const parsed = JSON.parse(cleanJson(text));
        result = { success: true, analysis: parsed };
        break;
      }

      case 'alternatives': {
        const { original_exercise, block_type, workout_goal, equipment } = payload;
        const text = await callClaude(
          ALTERNATIVES_SYSTEM,
          JSON.stringify({
            original_exercise: typeof original_exercise === 'object' ? original_exercise?.name : original_exercise,
            block_type,
            workout_goal: workout_goal || 'general fitness',
            equipment: equipment ?? null,
          }),
          512
        );
        const parsed = JSON.parse(cleanJson(text));
        if (!parsed.alternatives || !Array.isArray(parsed.alternatives)) {
          throw new Error('Invalid alternatives response');
        }
        result = { success: true, alternatives: parsed.alternatives.slice(0, 3) };
        break;
      }

      case 'adjust': {
        const { workout, adjustment } = payload;
        const text = await callClaude(ADJUST_SYSTEM, JSON.stringify({ workout, adjustment }), 4096);
        result = { success: true, raw: cleanJson(text) };
        break;
      }

      case 'parse_profile': {
        const { rawText } = payload;
        const text = await callClaude(PARSE_PROFILE_SYSTEM, rawText, 1024);
        const parsed = JSON.parse(cleanJson(text));
        result = { success: true, profile: parsed };
        break;
      }

      default:
        throw new Error(`Unhandled action: ${action}`);
    }

    if (userId) {
      try {
        await supabase.from('claude_logs').insert({
          user_id: userId,
          action,
          request_payload: payload,
          response_payload: result,
        });
      } catch (logErr) {
        console.error('Failed to log claude request:', logErr);
      }
    }

    return res.status(200).json(result);
  } catch (err: any) {
    console.error(err);
    const message = err?.message || 'Internal error';
    return res.status(500).json({ error: message });
  }
}

