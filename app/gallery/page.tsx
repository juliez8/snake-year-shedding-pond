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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-stone-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">The Gallery</h1>
          <p className="text-gray-600">
            Snakes that have completed their journey on the island
          </p>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Island
          </a>
        </div>

        <GalleryClient snakes={snakes} />

        {snakes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              The gallery is empty. Visit the island to see active snakes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
