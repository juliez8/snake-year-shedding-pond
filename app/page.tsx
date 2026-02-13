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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 py-12 px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            🐍 Shedding Island
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Draw a snake and attach what you wish to shed.
            Watch it fade over 8 hours as you step into the new year.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            {isMobile && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700"
              >
                Draw a Snake
              </button>
            )}

            <a
              href="/gallery"
              className="px-6 py-3 bg-gray-800 text-white rounded-xl shadow-md hover:bg-gray-700"
            >
              Visit Garden
            </a>
          </div>
        </div>

        {/* Layout */}
        <div className="flex justify-center">
          <div className="flex gap-12 items-start w-full max-w-6xl">

            <div className="flex-1 min-w-[300px]">
              <Island snakes={snakes} />
            </div>

            {!isMobile && (
              <div className="w-[320px] shrink-0">
                <DrawPanel onSuccess={fetchSnakes} />
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-gray-600">
          {snakes.length} snake{snakes.length !== 1 ? 's' : ''} on the island
        </div>
      </div>

      {/* Mobile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
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
