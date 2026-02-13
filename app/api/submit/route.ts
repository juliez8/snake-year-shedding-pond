import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { validateSnakeGeometry } from '@/lib/validation';
import { SnakeSubmission } from '@/types/snake';
import { generateRandomPosition } from '@/lib/positions';

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

    // Get existing island snakes
    const { data: existing } = await supabase
      .from('snake_segments')
      .select('position_x, position_y')
      .eq('location', 'island');

    // Generate non-overlapping position
    const position = generateRandomPosition(existing || []);

    // Insert into database
    const { data, error } = await supabase
      .from('snake_segments')
      .insert({
        drawing_data,
        message: trimmedMessage,
        location: 'island',
        position_x: position.x,
        position_y: position.y,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save snake' }, { status: 500 });
    }

    return NextResponse.json({ success: true, snake: data });

  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your snake' },
      { status: 500 }
    );
  }
}
