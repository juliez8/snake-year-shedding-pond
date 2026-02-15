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
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 sm:gap-4">
        {snakes.map((snake) => (
            <div
              key={snake.id}
              className="bg-amber-50/80 rounded-xl p-2 sm:p-3 border border-amber-100 hover:shadow-[0_2px_12px_rgba(251,191,36,0.2)] transition-all cursor-pointer flex items-center justify-center aspect-square"
              onClick={() => setSelectedSnake(snake)}
            >
              <SnakeDisplay
                drawing={snake.drawing_data}
                opacity={1}
                width={80}
                height={48}
                className="w-full h-auto max-h-full object-contain"
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
