'use client';

import { useState } from 'react';
import { Snake } from '@/types/snake';
import SnakeDisplay from '@/components/SnakeDisplay';
import SnakeModal from '@/components/SnakeModal';

interface GalleryClientProps {
  snakes: Snake[];
}

export default function GalleryClient({ snakes }: GalleryClientProps) {
  const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-3 md:gap-4">
        {snakes.map((snake) => (
            <div
              key={snake.id}
              className="bg-amber-50/80 rounded-xl p-1.5 sm:p-2 md:p-3 border border-amber-100 hover:shadow-[0_2px_12px_rgba(251,191,36,0.2)] transition-all cursor-pointer flex items-center justify-center aspect-square overflow-hidden min-w-0"
              onClick={() => setSelectedSnake(snake)}
            >
              <SnakeDisplay
                drawing={snake.drawing_data}
                opacity={1}
                width={80}
                height={48}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>
        ))}
      </div>

      <SnakeModal
        isOpen={selectedSnake !== null}
        message={selectedSnake?.message ?? ''}
        onClose={() => setSelectedSnake(null)}
      />
    </>
  );
}
