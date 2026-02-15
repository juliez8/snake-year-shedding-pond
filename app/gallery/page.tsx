import { supabase } from '@/lib/supabase';
import { Snake } from '@/types/snake';
import GalleryClient from './GalleryClient';

export const revalidate = 60; // Revalidate every 60 seconds

async function getGallerySnakes(): Promise<Snake[]> {
  const { data, error } = await supabase
    .from('snake_segments')
    .select('*')
    .eq('location', 'gallery')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gallery snakes:', error);
    return [];
  }

  return data || [];
}

export default async function GalleryPage() {
  const snakes = await getGallerySnakes();

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 py-4 px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header: title + count left, back button right; stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">SNAKE GALLERY</h1>
            <p className="text-amber-800/80 font-semibold text-sm sm:text-base mt-0.5">
              {snakes.length.toLocaleString()} TOTAL SNAKES
            </p>
            <p className="text-amber-700/60 text-sm mt-1.5 max-w-md">
              Tap any snake to read what was released—and what they are ready to become.
            </p>
          </div>
          <a
            href="/"
            className="shrink-0 px-4 py-2 border-2 border-amber-800 text-amber-900 rounded-lg font-semibold hover:bg-amber-100 transition-colors text-sm sm:text-base self-start"
          >
            ← BACK TO ISLAND
          </a>
        </div>

        <GalleryClient snakes={snakes} />

        {snakes.length === 0 && (
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
