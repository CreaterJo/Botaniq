import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 30;

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
  const userId = url.searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `fav:list:${ip}`;

  if (!checkRateLimit(key)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('plant_id, plant_name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('List favorites failed:', error);
    return NextResponse.json({ error: 'Failed to list favorites' }, { status: 500 });
  }
}
