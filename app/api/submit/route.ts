import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { validateSnakeGeometry } from '@/lib/validation';
import { SnakeSubmission } from '@/types/snake';
import { generateRandomPosition } from '@/lib/positions';

const MIGRATE_BATCH_SIZE = 3;
const MAX_MIGRATE_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const body: SnakeSubmission = await request.json();
    const { drawing_data, message } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (trimmedMessage.length > 140) {
      return NextResponse.json(
        { error: 'Message must be 140 characters or less' },
        { status: 400 }
      );
    }

    // Validate drawing
    if (!drawing_data || !drawing_data.strokes) {
      return NextResponse.json({ error: 'Drawing data is required' }, { status: 400 });
    }

    const validation = validateSnakeGeometry(drawing_data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Get existing island snakes and find non-overlapping position.
    // If no spot found (island crowded), migrate oldest snakes to gallery and retry.
    let existing: { position_x: number; position_y: number }[] = [];
    const { data: existingData } = await supabase
      .from('snake_segments')
      .select('position_x, position_y')
      .eq('location', 'island');
    existing = existingData || [];

    let position = generateRandomPosition(existing);

    for (let migrateAttempt = 0; !position.found && migrateAttempt < MAX_MIGRATE_ATTEMPTS; migrateAttempt++) {
      // Migrate oldest snake(s) to gallery to make room
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

    // If still no spot after migrating, add to gallery so the user doesn't lose their snake
    const location = position.found ? 'island' : 'gallery';
    const insertPosition = position.found ? position : { x: 0.5, y: 0.5 };

    const { data, error } = await supabase
      .from('snake_segments')
      .insert({
        drawing_data,
        message: trimmedMessage,
        location,
        position_x: insertPosition.x,
        position_y: insertPosition.y,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save snake' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      snake: data,
      addedToGallery: location === 'gallery',
    });

  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your snake' },
      { status: 500 }
    );
  }
}
