'use client';

import { useState, useEffect } from 'react';
import { Snake } from '@/types/snake';
import { calculateOpacity } from '@/lib/fade';
import SnakeDisplay from '@/components/SnakeDisplay';
import SnakeModal from '@/components/SnakeModal';

interface GalleryClientProps {
  snakes: Snake[];
}

export default function GalleryClient({ snakes }: GalleryClientProps) {
  const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);
  const [opacities, setOpacities] = useState<Record<string, number>>({});

  // Update opacities every minute
  useEffect(() => {
    const updateOpacities = () => {
      const newOpacities: Record<string, number> = {};
      snakes.forEach((snake) => {
        newOpacities[snake.id] = calculateOpacity(snake.created_at);
      });
      setOpacities(newOpacities);
    };

    updateOpacities();
    const interval = setInterval(updateOpacities, 60000);

    return () => clearInterval(interval);
  }, [snakes]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {snakes.map((snake) => {
          const opacity = opacities[snake.id] ?? 1;

          return (
            <div
              key={snake.id}
              className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSnake(snake)}
            >
              <SnakeDisplay
                drawing={snake.drawing_data}
                opacity={opacity}
                width={200}
                height={120}
                className="w-full h-auto"
              />
            </div>
          );
        })}
      </div>

      <SnakeModal
        isOpen={selectedSnake !== null}
        message={selectedSnake?.message ?? ''}
        onClose={() => setSelectedSnake(null)}
      />
    </>
  );
}
