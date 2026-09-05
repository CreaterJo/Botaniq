import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateUsername } from '@/lib/usernameGenerator';

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

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
  const key = `auth:${ip}`;

  if (!checkRateLimit(key)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { message: 'Supabase not configured. Use client-side registration.', offline: true },
      { status: 503 }
    );
  }

  try {
    let username = generateUsername();
    let retries = 3;

    while (retries > 0) {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (!existing) break;
      username = generateUsername();
      retries--;
    }

    const { data: user, error } = await supabase
      .from('user_profiles')
      .insert([{ username }] as any)
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      last_seen: user.last_seen
    });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to register a new user', docs: '/api/auth/me' });
}
