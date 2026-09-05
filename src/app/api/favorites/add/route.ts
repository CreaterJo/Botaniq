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

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `fav:add:${ip}`;

  if (!checkRateLimit(key)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { user_id, plant_name, plant_id } = body;

    if (!user_id || !plant_name || !plant_id) {
      return NextResponse.json({ error: 'Missing required fields: user_id, plant_name, plant_id' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('plant_name', plant_name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Already a favorite' }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id, plant_name, plant_id }] as any)
      .select()
      .single();

    if (error) {
      console.error('Add favorite error:', error);
      return NextResponse.json({ error: 'Failed to add favorite', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Add favorite failed:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `fav:del:${ip}`;

  if (!checkRateLimit(key)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { user_id, plant_name } = body;

    if (!user_id || !plant_name) {
      return NextResponse.json({ error: 'user_id and plant_name are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user_id)
      .eq('plant_name', plant_name);

    if (error) {
      return NextResponse.json({ error: 'Failed to remove favorite', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite failed:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
