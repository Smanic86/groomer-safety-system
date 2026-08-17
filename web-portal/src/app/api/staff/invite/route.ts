import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Simple in-memory rate limiting cache
// Key: user_id, Value: array of timestamps (in ms)
const rateLimitMap = new Map<string, number[]>();

const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5;  // Max 5 invites per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userTimestamps = rateLimitMap.get(userId) || [];

  // Filter out timestamps older than 1 minute
  const validTimestamps = userTimestamps.filter(
    (timestamp) => now - timestamp < LIMIT_WINDOW_MS
  );

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  rateLimitMap.set(userId, validTimestamps);
  return true; // Allowed
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // 1. Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check rate limit for the requesting user
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many invite requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    // 3. Check user role & business ID in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('business_id, role')
      .eq('id', user.id)
      .single();

    if (
      profileError ||
      !profile ||
      (profile.role !== 'owner' && profile.role !== 'manager')
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Admin permissions required' },
        { status: 403 }
      );
    }

    // 4. Parse request payload
    const body = await request.json();
    const { email, full_name, role } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, role' },
        { status: 400 }
      );
    }

    // 5. Initialize Supabase Admin client with service_role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 6. Call inviteUserByEmail with attached metadata for Phase 2 trigger
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          business_id: profile.business_id,
          full_name: full_name,
          role: role,
        },
      });

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Staff invitation sent successfully',
      user: inviteData.user,
    });
  } catch (error) {
    console.error('Error in staff invite route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}