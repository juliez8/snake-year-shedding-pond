/**
 * Bulk migration API for Vercel Cron.
 * Requires Bearer CRON_SECRET; moves oldest island snakes to gallery when over capacity.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const MAX_ISLAND_CAPACITY = 80;
const MIGRATION_BATCH_SIZE = 20;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = getSupabaseClient();

    const { count, error: countError } = await supabase
      .from('snake_segments')
      .select('*', { count: 'exact', head: true })
      .eq('location', 'island');

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json(
        { error: 'Failed to count snakes' },
        { status: 500 }
      );
    }

    if (!count || count <= MAX_ISLAND_CAPACITY) {
      return NextResponse.json({ 
        migrated: false, 
        count,
        message: 'No migration needed' 
      });
    }

    const { data: oldestSnakes, error: fetchError } = await supabase
      .from('snake_segments')
      .select('id')
      .eq('location', 'island')
      .order('created_at', { ascending: true })
      .limit(MIGRATION_BATCH_SIZE);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch snakes for migration' },
        { status: 500 }
      );
    }

    if (!oldestSnakes || oldestSnakes.length === 0) {
      return NextResponse.json({ 
        migrated: false, 
        message: 'No snakes to migrate' 
      });
    }

    const ids = oldestSnakes.map(snake => snake.id);
    const { error: updateError } = await supabase
      .from('snake_segments')
      .update({ location: 'gallery' })
      .in('id', ids);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to migrate snakes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      migrated: true, 
      count: ids.length,
      message: `Migrated ${ids.length} snakes to gallery`
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during migration' },
      { status: 500 }
    );
  }
}
