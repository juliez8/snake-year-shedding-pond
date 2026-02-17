import { getSupabaseClient } from '@/lib/supabase';
import { Snake } from '@/types/snake';
import GalleryClient from './GalleryClient';

export const revalidate = 60;

const PAGE_SIZE = 60;

async function getGallerySnakes(): Promise<{ snakes: Snake[]; totalCount: number }> {
  const supabase = getSupabaseClient();

  // Fetch initial page server-side
  const { data, error } = await supabase
    .from('snake_segments')
    .select('*')
    .eq('location', 'gallery')
    .order('created_at', { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (error) {
    console.error('Error fetching gallery snakes:', error);
    return { snakes: [], totalCount: 0 };
  }

  // Get total count
  const { count } = await supabase
    .from('snake_segments')
    .select('*', { count: 'exact', head: true })
    .eq('location', 'gallery');

  return {
    snakes: data || [],
    totalCount: count ?? 0,
  };
}

export default async function GalleryPage() {
  const { snakes, totalCount } = await getGallerySnakes();

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 py-4 px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900">SNAKE GALLERY</h1>
            <p className="text-amber-800/80 font-semibold text-base sm:text-lg lg:text-xl mt-1">
              {totalCount.toLocaleString()} TOTAL SNAKES
            </p>
            <p className="text-amber-700/60 text-sm sm:text-base lg:text-lg mt-2 max-w-lg">
              Tap any snake to read what was released.
            </p>
          </div>
          <a
            href="/"
            className="shrink-0 px-4 py-2 border-2 border-amber-800 text-amber-900 rounded-lg font-semibold hover:bg-amber-100 transition-colors text-sm sm:text-base self-start"
          >
            ← BACK TO ISLAND
          </a>
        </div>

        <GalleryClient
          initialSnakes={snakes}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
        />

        {totalCount === 0 && (
          <div className="text-center py-12">
            <p className="text-amber-700/70 font-medium">
              The gallery is empty. Visit the island to see active snakes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
