/**
 * Profile CRUD. Fetches and saves user training profiles.
 */
import { supabase } from '../lib/supabase';

export async function fetchProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, raw_text, profile_json, created_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveProfile(userId, rawText, profileJson) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        raw_text: rawText,
        profile_json: profileJson,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

export async function deleteProfile(userId) {
  if (!userId) return;
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}
