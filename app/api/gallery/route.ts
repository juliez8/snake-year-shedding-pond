import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const PAGE_SIZE = 60;
const MAX_PAGE_SIZE = 120;

/**
 * GET /api/gallery?page=1&limit=60
 * Paginated gallery endpoint for scalable snake loading.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10) || PAGE_SIZE)
    );

    const offset = (page - 1) * limit;

    const supabase = getSupabaseClient();

    // Fetch one extra to determine if there are more pages
    const { data, error } = await supabase
      .from('snake_segments')
      .select('*')
      .eq('location', 'gallery')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (error) {
      console.error('Gallery fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gallery.' },
        { status: 500 }
      );
    }

    // Get total count for pagination metadata
    const { count } = await supabase
      .from('snake_segments')
      .select('*', { count: 'exact', head: true })
      .eq('location', 'gallery');

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      snakes: data || [],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Gallery error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
