/**
 * Gallery page (server component).
 * Renders the first page of gallery snakes and passes data to GalleryClient.
 */
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amber-900">SNAKE GALLERY</h1>
            <p className="text-amber-900 font-semibold text-xl sm:text-xl lg:text-2xl mt-1">
              {totalCount.toLocaleString()} TOTAL SNAKES
            </p>
            <p className="text-amber-800/80 text-lg sm:text-lg lg:text-xl mt-2 max-w-lg">
              Tap any snake to read what was released.
            </p>
          </div>
          <a
            href="/"
            className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-red-900 via-red-800 to-rose-700 text-amber-50 rounded-xl font-medium shadow-[0_0_10px_rgba(127,29,29,0.5),0_2px_8px_rgba(120,30,30,0.4)] hover:shadow-[0_0_16px_rgba(127,29,29,0.6),0_4px_12px_rgba(120,30,30,0.5)] hover:from-red-950 hover:via-red-900 hover:to-rose-800 transition-all duration-200 text-base sm:text-lg self-start"
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
