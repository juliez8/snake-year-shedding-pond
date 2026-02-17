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
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 flex flex-col px-2 sm:px-6 py-2 sm:py-5 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* Header */}
        <div className="flex-shrink-0 pb-0 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                🐍 Julie&apos;s Snake Shedding Pond
              </h1>
              <p className="text-sm sm:text-lg font-semibold text-gray-700 mt-0.5 sm:mt-1">
                Draw a snake and release what no longer serves you. Watch it fade as you step into the Year of the Fire Horse
              </p>
              {/* On mobile: buttons in header, compact */}
              {isMobile ? (
                <div className="flex justify-center gap-3 mt-1.5">
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-amber-400 text-amber-950 rounded-xl font-medium text-sm shadow-[0_0_12px_rgba(251,191,36,0.5),0_2px_8px_rgba(251,191,36,0.35)] hover:shadow-[0_0_18px_rgba(251,191,36,0.6),0_4px_12px_rgba(251,191,36,0.4)] hover:bg-amber-500 transition-all duration-200"
                  >
                    Draw a Snake
                  </button>
                  <a
                    href="/gallery"
                    className="px-5 py-2.5 bg-red-900 text-amber-50 rounded-xl font-medium text-sm shadow-[0_0_10px_rgba(127,29,29,0.5),0_2px_8px_rgba(120,30,30,0.4)] hover:shadow-[0_0_16px_rgba(127,29,29,0.6),0_4px_12px_rgba(120,30,30,0.5)] hover:bg-red-950 transition-all duration-200"
                  >
                    Visit Gallery
                  </a>
                </div>
              ) : null}
            </div>
            {/* Desktop: Visit Gallery in header */}
            {!isMobile && (
              <a
                href="/gallery"
                className="shrink-0 px-6 py-3 bg-red-900 text-amber-50 rounded-xl font-medium text-base shadow-[0_0_10px_rgba(127,29,29,0.5),0_2px_8px_rgba(120,30,30,0.4)] hover:shadow-[0_0_16px_rgba(127,29,29,0.6),0_4px_12px_rgba(120,30,30,0.5)] hover:bg-red-950 transition-all duration-200 self-center sm:self-start"
              >
                Visit Gallery
              </a>
            )}
          </div>
        </div>

        {/* Main content — pond fills available space immediately */}
        <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row lg:items-stretch gap-0 sm:gap-4 lg:gap-8 transition-all duration-300">
          <div className="flex-1 min-w-0 flex items-start sm:items-center justify-center overflow-visible pt-1 sm:pt-0">
            <Island
              snakes={snakes}
              lastAddedSnakeId={lastAddedSnakeId}
              onEntryAnimationComplete={() => setLastAddedSnakeId(null)}
            />
          </div>

          {!isMobile && (
            <div className="w-[340px] flex-shrink-0 self-start">
              <DrawPanel
                onSuccess={(result) => {
                  if (!result.addedToGallery) setLastAddedSnakeId(result.snakeId);
                  fetchSnakes();
                }}
              />
            </div>
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
