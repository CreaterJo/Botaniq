import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 60;

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `auth:me:${ip}`;

  if (!checkRateLimit(key)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, created_at, last_seen')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await supabase
      .from('user_profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({
      id: data.id,
      username: data.username,
      created_at: data.created_at,
      last_seen: data.last_seen
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
