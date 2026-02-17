import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { validateSnakeGeometry, sanitizeMessage } from '@/lib/validation';
import { SnakeSubmission } from '@/types/snake';
import { generateRandomPosition } from '@/lib/positions';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit';

const MIGRATE_BATCH_SIZE = 3;
const MAX_MIGRATE_ATTEMPTS = 5;
const MAX_BODY_SIZE = 512 * 1024; // 512 KB — generous for drawing data, blocks abuse

export async function POST(request: NextRequest) {
  try {
    // --- IP extraction (works behind Vercel/Cloudflare proxies) ---
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() ?? request.headers.get('x-real-ip') ?? 'unknown';

    // --- Rate limiting (atomic, fail-closed) ---
    const rateResult = await checkRateLimit(ip);
    const rlHeaders = rateLimitHeaders(rateResult);

    if (rateResult.limited) {
      return NextResponse.json(
        { error: "You're releasing snakes too fast! Please try again in a bit." },
        { status: 429, headers: rlHeaders }
      );
    }

    // --- Request body size check ---
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request too large.' },
        { status: 413, headers: rlHeaders }
      );
    }

    // Read body as text first to enforce size limit even without content-length
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request too large.' },
        { status: 413, headers: rlHeaders }
      );
    }

    let body: SnakeSubmission;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON.' },
        { status: 400, headers: rlHeaders }
      );
    }

    const { drawing_data, message } = body;

    // --- Validate and sanitize message ---
    const messageResult = sanitizeMessage(message);
    if ('error' in messageResult) {
      return NextResponse.json(
        { error: messageResult.error },
        { status: 400, headers: rlHeaders }
      );
    }
    const cleanMessage = messageResult.message;

    // --- Validate drawing data (deep validation: colors, coordinates, structure) ---
    if (!drawing_data || typeof drawing_data !== 'object') {
      return NextResponse.json(
        { error: 'Drawing data is required.' },
        { status: 400, headers: rlHeaders }
      );
    }

    const validation = validateSnakeGeometry(drawing_data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: rlHeaders }
      );
    }

    // --- Find position on island ---
    const supabase = getSupabaseClient();

    let existing: { position_x: number; position_y: number }[] = [];
    const { data: existingData } = await supabase
      .from('snake_segments')
      .select('position_x, position_y')
      .eq('location', 'island');
    existing = existingData || [];

    let position = generateRandomPosition(existing);

    for (let attempt = 0; !position.found && attempt < MAX_MIGRATE_ATTEMPTS; attempt++) {
      const { data: oldestSnakes } = await supabase
        .from('snake_segments')
        .select('id')
        .eq('location', 'island')
        .order('created_at', { ascending: true })
        .limit(MIGRATE_BATCH_SIZE);

      if (!oldestSnakes?.length) break;

      await supabase
        .from('snake_segments')
        .update({ location: 'gallery' })
        .in('id', oldestSnakes.map((s) => s.id));

      const { data: refreshed } = await supabase
        .from('snake_segments')
        .select('position_x, position_y')
        .eq('location', 'island');
      existing = refreshed || [];
      position = generateRandomPosition(existing);
    }

    const location = position.found ? 'island' : 'gallery';
    const insertPosition = position.found ? position : { x: 0.5, y: 0.5 };

    // --- Insert snake (only store validated/sanitized data) ---
    const { data, error } = await supabase
      .from('snake_segments')
      .insert({
        drawing_data: {
          strokes: drawing_data.strokes.map((s) => ({
            color: s.color,
            points: s.points.map((p) => ({ x: p.x, y: p.y })),
          })),
          width: drawing_data.width,
          height: drawing_data.height,
        },
        message: cleanMessage,
        location,
        position_x: insertPosition.x,
        position_y: insertPosition.y,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save snake.' },
        { status: 500, headers: rlHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        snake: data,
        addedToGallery: location === 'gallery',
      },
      { headers: rlHeaders }
    );
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
