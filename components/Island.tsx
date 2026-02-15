'use client';

import { useState, useEffect } from 'react';
import { Snake } from '@/types/snake';
import { calculateOpacityIsland } from '@/lib/fade';
import SnakeDisplay from './SnakeDisplay';
import SnakeModal from './SnakeModal';

interface IslandProps {
  snakes: Snake[];
  lastAddedSnakeId?: string | null;
  onEntryAnimationComplete?: () => void;
}

export default function Island({ snakes, lastAddedSnakeId, onEntryAnimationComplete }: IslandProps) {
  const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);
  const [opacities, setOpacities] = useState<Record<string, number>>({});

  useEffect(() => {
    const updateOpacities = () => {
      const newOpacities: Record<string, number> = {};
      snakes.forEach((snake) => {
        newOpacities[snake.id] = calculateOpacityIsland(snake.created_at);
      });
      setOpacities(newOpacities);
    };

    updateOpacities();
    const interval = setInterval(updateOpacities, 200);
    return () => clearInterval(interval);
  }, [snakes]);

  return (
    <>
      <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out">

        {snakes.map((snake) => {
          const inset = 0.1;
          const left = `${inset * 100 + snake.position_x * (1 - 2 * inset) * 100}%`;
          const top = `${inset * 100 + snake.position_y * (1 - 2 * inset) * 100}%`;
          const opacity = opacities[snake.id] ?? 1;

          return (
            <div
              key={snake.id}
              className="absolute cursor-pointer transition-transform hover:scale-110"
              style={{
                left,
                top,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => setSelectedSnake(snake)}
            >
              <div
                className={
                  lastAddedSnakeId === snake.id
                    ? 'animate-snakeEntry'
                    : 'hover:animate-wiggle'
                }
                onAnimationEnd={() => {
                  if (lastAddedSnakeId === snake.id) {
                    onEntryAnimationComplete?.();
                  }
                }}
              >
                <SnakeDisplay
                  drawing={snake.drawing_data}
                  opacity={opacity}
                  width={150}
                  height={90}
                />
              </div>
            </div>
          );
        })}

        {snakes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 text-center px-4">
              The island awaits its first snake...
            </p>
          </div>
        )}
      </div>

      <SnakeModal
        isOpen={selectedSnake !== null}
        message={selectedSnake?.message ?? ''}
        onClose={() => setSelectedSnake(null)}
      />
    </>
  );
}
