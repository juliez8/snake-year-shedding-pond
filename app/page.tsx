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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 py-8 px-4 sm:py-12 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">

        {/* Header - ALWAYS VISIBLE */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            🐍 Shedding Island
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Draw a snake and attach what you wish to shed.
            Watch it fade over 8 hours as you step into the new year.
          </p>

          {/* Buttons - ALWAYS VISIBLE on both mobile and desktop */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-6 flex-wrap">
            {isMobile && (
              <button
                onClick={() => setShowModal(true)}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
              >
                Draw a Snake
              </button>
            )}

            <a
              href="/gallery"
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-xl shadow-md hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Visit Gallery
            </a>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {isMobile ? (
            // Mobile: Full width island
            <div className="w-full">
              <Island snakes={snakes} />
            </div>
          ) : (
            // Desktop: Island + Draw Panel side by side, same height
            <div className="flex justify-center gap-6 lg:gap-12 items-stretch">
              {/* Island - flexible width */}
              <div className="flex-1 min-w-0 max-w-4xl">
                <Island snakes={snakes} />
              </div>

              {/* Draw Panel - fixed width, stretches to match Island height */}
              <div className="w-[340px] flex-shrink-0 flex">
                <DrawPanel onSuccess={fetchSnakes} />
              </div>
            </div>
          )}
        </div>

        {/* Snake count */}
        <div className="text-center text-gray-600 text-sm">
          {snakes.length} snake{snakes.length !== 1 ? 's' : ''} on the island
        </div>
      </div>

      {/* Mobile Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl leading-none w-8 h-8 flex items-center justify-center"
              aria-label="Close"
            >
              ×
            </button>

            <DrawPanel
              onSuccess={() => {
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
