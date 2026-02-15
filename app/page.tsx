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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 flex flex-col px-4 sm:px-6 py-4 sm:py-6" style={{ zoom: 0.9 }}>
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* Compact header - title + one-line description + buttons */}
        <div className="text-center flex-shrink-0 pb-2 sm:pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🐍 Shedding Island
          </h1>
          <p className="text-sm sm:text-base font-semibold text-gray-700 mt-1">
            Draw a snake, shed what you wish—it fades over 8 hours
          </p>
          {/* On mobile: both buttons in header so no scroll needed */}
          {isMobile ? (
            <div className="flex justify-center gap-4 mt-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-amber-400 text-amber-950 rounded-xl font-medium text-base shadow-[0_2px_8px_rgba(251,191,36,0.3)] hover:shadow-[0_4px_14px_rgba(251,191,36,0.4)] hover:bg-amber-500 transition-all duration-200"
              >
                Draw a Snake
              </button>
              <a
                href="/gallery"
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium text-base shadow-[0_2px_8px_rgba(220,38,38,0.35)] hover:shadow-[0_4px_14px_rgba(220,38,38,0.5)] hover:bg-red-700 transition-all duration-200"
              >
                Visit Gallery
              </a>
            </div>
          ) : null}
        </div>

        {/* Main content - takes remaining space */}
        <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row lg:items-stretch gap-2 sm:gap-4 lg:gap-8 transition-all duration-300">
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

        {/* Footer - snake count left, Visit Gallery right (desktop only; mobile has it in header) */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-2 sm:pt-4">
          <span className="text-gray-700 text-sm sm:text-base font-semibold">
            {snakes.length} snake{snakes.length !== 1 ? 's' : ''} on the island
          </span>
          {!isMobile && (
            <a
              href="/gallery"
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium text-base shrink-0 shadow-[0_2px_8px_rgba(220,38,38,0.35)] hover:shadow-[0_4px_14px_rgba(220,38,38,0.5)] hover:bg-red-700 transition-all duration-200"
            >
              Visit Gallery
            </a>
          )}
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
