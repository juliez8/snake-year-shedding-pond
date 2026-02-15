'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Island from '@/components/Island';
import DrawPanel from '@/components/DrawPanel';
import { Snake } from '@/types/snake';

export default function HomePage() {
  const [snakes, setSnakes] = useState<Snake[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastAddedSnakeId, setLastAddedSnakeId] = useState<string | null>(null);

  // Responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch snakes
  const fetchSnakes = useCallback(async () => {
    const { data } = await supabase
      .from('snake_segments')
      .select('*')
      .eq('location', 'island')
      .order('created_at', { ascending: false });

    setSnakes(data || []);
  }, []);

  useEffect(() => {
    fetchSnakes();
  }, [fetchSnakes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 flex flex-col px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* Compact header - title + one-line description + Draw button (mobile) */}
        <div className="text-center flex-shrink-0 pb-3 sm:pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🐍 Shedding Island
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Draw a snake, shed what you wish—it fades over 8 hours
          </p>
          {isMobile && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-colors text-sm"
            >
              Draw a Snake
            </button>
          )}
        </div>

        {/* Main content - takes remaining space */}
        <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-8 transition-all duration-300">
          <div className="flex-1 min-w-0 min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] flex items-center justify-center">
            <Island
              snakes={snakes}
              lastAddedSnakeId={lastAddedSnakeId}
              onEntryAnimationComplete={() => setLastAddedSnakeId(null)}
            />
          </div>

          {!isMobile && (
            <div className="w-[340px] flex-shrink-0 flex">
              <DrawPanel
                onSuccess={(result) => {
                  if (!result.addedToGallery) setLastAddedSnakeId(result.snakeId);
                  fetchSnakes();
                }}
              />
            </div>
          )}
        </div>

        {/* Footer - snake count left, Visit Gallery bottom right */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-3 sm:pt-4">
          <span className="text-gray-600 text-xs sm:text-sm">
            {snakes.length} snake{snakes.length !== 1 ? 's' : ''} on the island
          </span>
          <a
            href="/gallery"
            className="px-4 py-2 bg-gray-800 text-white rounded-xl shadow-md hover:bg-gray-700 transition-colors text-sm shrink-0"
          >
            Visit Gallery
          </a>
        </div>
      </div>

      {/* Mobile Modal - no scroll, fits viewport */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-amber-50/95 w-full max-w-sm rounded-2xl shadow-[0_4px_24px_rgba(251,191,36,0.2),0_2px_8px_rgba(0,0,0,0.06)] p-0 relative max-h-[90vh] flex flex-col items-center min-h-0 overflow-hidden border-2 border-amber-200/90"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 z-10 text-amber-800 font-bold text-2xl leading-none w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:shadow-[0_0_16px_rgba(251,191,36,0.6)] hover:bg-amber-200/60"
              aria-label="Close"
            >
              ×
            </button>

            <DrawPanel
              compact
              embedded
              onSuccess={(result) => {
                if (!result.addedToGallery) setLastAddedSnakeId(result.snakeId);
                fetchSnakes();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
