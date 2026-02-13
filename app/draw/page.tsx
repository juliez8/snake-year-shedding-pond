'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Island from '@/components/Island';
import DrawPanel from '@/components/DrawPanel';
import { Snake } from '@/types/snake';

export default function HomePage() {
  const [snakes, setSnakes] = useState<Snake[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch snakes
  useEffect(() => {
    const fetchSnakes = async () => {
      const { data } = await supabase
        .from('snake_segments')
        .select('*')
        .eq('location', 'island')
        .order('created_at', { ascending: false });

      setSnakes(data || []);
    };

    fetchSnakes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 py-12 px-6">
      <div className="max-w-[1400px] mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            🐍 Shedding Island
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Draw a snake and attach what you wish to shed.
            Watch it fade over 8 hours as you step into the new year.
          </p>

          {isMobile && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition"
              >
                Draw a Snake
              </button>

              <a
                href="/gallery"
                className="px-6 py-3 bg-gray-800 text-white rounded-xl shadow-md hover:bg-gray-700 transition"
              >
                Visit Garden
              </a>
            </div>
          )}
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-12 gap-16 items-start">

          {/* 🌿 BIG Island */}
          <div className="lg:col-span-9">
            <Island snakes={snakes} />
          </div>

          {/* ✏️ Smaller Draw Panel (desktop only) */}
          {!isMobile && (
            <div className="lg:col-span-3 w-full">
              <div className="sticky top-8">
                <DrawPanel />
              </div>
            </div>
          )}

        </div>

        {/* Snake count */}
        <div className="text-center text-gray-600">
          {snakes.length} snake{snakes.length !== 1 ? 's' : ''} on the island
        </div>

      </div>

      {/* Mobile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <DrawPanel />
          </div>
        </div>
      )}
    </div>
  );
}
