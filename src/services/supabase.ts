import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '../types/game.js';

// Retrieve credentials from environment variables (.env via Vite)
// Supports db_url, anon, VITE_SUPABASE_URL, and VITE_SUPABASE_ANON_KEY
const supabaseUrl = (
  (import.meta.env.db_url as string) ||
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  ''
).trim();

const supabaseAnonKey = (
  (import.meta.env.anon as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  ''
).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * แปลง row จาก Supabase ให้อยู่ในรูป LeaderboardEntry
 * โดยดึงชื่อเรียกขาน (callsign, call_sign, nickname) มาแสดงผล
 */
export function mapSupabaseRowToEntry(row: any): LeaderboardEntry {
  const callsign =
    row.callsign ||
    row.call_sign ||
    row.nickname ||
    row.name ||
    row.player_name ||
    'UNKNOWN_DEFENDER';

  return {
    id: String(row.id || `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    nickname: String(callsign).toUpperCase(),
    score: Number(row.score) || 0,
    rank: row.rank || 'B',
    timeFormatted: row.time_formatted || row.timeFormatted || '05:00',
    timeSeconds: Number(row.time_seconds ?? row.timeSeconds ?? 300),
    threatsBlocked: Number(row.threats_blocked ?? row.threatsBlocked ?? 0),
    difficulty: row.difficulty || 'normal',
    completedAt: row.completed_at || row.completedAt || new Date().toISOString(),
  };
}

/**
 * ดึงข้อมูล Leaderboard จริงจากตาราง leaderboard ใน Supabase
 */
export async function fetchSupabaseLeaderboard(limit = 50): Promise<{
  entries: LeaderboardEntry[];
  isRealSupabase: boolean;
}> {
  if (!supabase) {
    // Fallback: ดึงจาก local API
    try {
      const res = await fetch(`/api/leaderboard?limit=${limit}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        return { entries: data.leaderboard, isRealSupabase: false };
      }
    } catch (e) {
      console.warn('Fallback local leaderboard fetch error:', e);
    }
    return { entries: [], isRealSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard from Supabase:', error);
      // Fallback to local server if Supabase query fails
      const res = await fetch(`/api/leaderboard?limit=${limit}`);
      const fallback = await res.json();
      return {
        entries: fallback.success ? fallback.leaderboard : [],
        isRealSupabase: false,
      };
    }

    const entries = (data || []).map(mapSupabaseRowToEntry);
    return { entries, isRealSupabase: true };
  } catch (err) {
    console.error('Unexpected error fetching from Supabase:', err);
    return { entries: [], isRealSupabase: false };
  }
}

/**
 * สมัครรับการอัปเดตแบบ Realtime จาก Supabase เมื่อมีการบันทึกคะแนนใหม่
 */
export function subscribeToSupabaseLeaderboard(
  onUpdate: () => void
): () => void {
  if (!supabase) {
    return () => {};
  }

  const channelName = `realtime:leaderboard:${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboard',
      },
      (payload) => {
        console.log('⚡ Supabase Realtime Leaderboard Update:', payload.eventType);
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log(`🔌 Supabase Realtime status: ${status}`);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * บันทึกคะแนนและชื่อเรียกขานของผู้เล่นลง Supabase
 */
export async function submitScoreToSupabase(scoreData: {
  callsign: string;
  score: number;
  rank: string;
  timeFormatted: string;
  timeSeconds: number;
  threatsBlocked: number;
  difficulty: string;
}): Promise<boolean> {
  if (!supabase) return false;

  try {
    const callsignUpper = scoreData.callsign.toUpperCase();
    
    // Check if an entry for this callsign/nickname already exists
    const { data: existingList } = await supabase
      .from('leaderboard')
      .select('id, score')
      .or(`callsign.ilike.${callsignUpper},nickname.ilike.${callsignUpper}`)
      .limit(1);

    if (existingList && existingList.length > 0) {
      const existing = existingList[0];
      // Only update if new score is HIGHER than existing score
      if (scoreData.score > Number(existing.score)) {
        const { error } = await supabase
          .from('leaderboard')
          .update({
            score: scoreData.score,
            rank: scoreData.rank,
            time_formatted: scoreData.timeFormatted,
            time_seconds: scoreData.timeSeconds,
            threats_blocked: scoreData.threatsBlocked,
            difficulty: scoreData.difficulty,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Supabase update score error:', error);
          return false;
        }
      }
      return true;
    }

    const { error } = await supabase.from('leaderboard').insert([
      {
        callsign: callsignUpper,
        nickname: callsignUpper,
        score: scoreData.score,
        rank: scoreData.rank,
        time_formatted: scoreData.timeFormatted,
        time_seconds: scoreData.timeSeconds,
        threats_blocked: scoreData.threatsBlocked,
        difficulty: scoreData.difficulty,
      },
    ]);

    if (error) {
      console.error('Supabase submit score error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to submit score to Supabase:', err);
    return false;
  }
}

export async function clearSupabaseLeaderboard(): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Delete all records in leaderboard table
    const { error } = await supabase.from('leaderboard').delete().gte('score', -999999);
    if (error) {
      console.error('Supabase clear leaderboard error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to clear Supabase leaderboard:', err);
    return false;
  }
}

export async function deleteSingleSupabaseEntry(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('leaderboard').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete entry error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete single entry from Supabase:', err);
    return false;
  }
}

