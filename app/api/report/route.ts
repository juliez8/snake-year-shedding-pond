import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { snake_id } = await request.json();

    if (!snake_id || typeof snake_id !== 'string') {
      return NextResponse.json({ error: 'Invalid snake ID.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch the snake so we can store its message for easy reference
    const { data: snake } = await supabase
      .from('snake_segments')
      .select('id, message')
      .eq('id', snake_id)
      .single();

    if (!snake) {
      return NextResponse.json({ error: 'Snake not found.' }, { status: 404 });
    }

    // Insert report with message for easy review
    const { error } = await supabase
      .from('reports')
      .insert({
        snake_id,
        message: snake.message,
      });

    if (error) {
      console.error('Report error:', error);
      return NextResponse.json({ error: 'Failed to submit report.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
