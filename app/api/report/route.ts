import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { snake_id } = await request.json();

    if (!snake_id || typeof snake_id !== 'string') {
      return NextResponse.json({ error: 'Invalid snake ID.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if this snake exists
    const { data: snake } = await supabase
      .from('snake_segments')
      .select('id')
      .eq('id', snake_id)
      .single();

    if (!snake) {
      return NextResponse.json({ error: 'Snake not found.' }, { status: 404 });
    }

    // Insert report (duplicates are fine — more reports = more urgency)
    const { error } = await supabase
      .from('reports')
      .insert({
        snake_id,
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
