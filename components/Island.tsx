'use client';

import { useState, useEffect } from 'react';
import { Snake } from '@/types/snake';
import { calculateOpacity } from '@/lib/fade';
import SnakeDisplay from './SnakeDisplay';
import SnakeModal from './SnakeModal';

interface IslandProps {
  snakes: Snake[];
}

export default function Island({ snakes }: IslandProps) {
  const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);
  const [opacities, setOpacities] = useState<Record<string, number>>({});

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
      <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-3xl shadow-xl overflow-hidden">

        {snakes.map((snake) => {
          const left = `${snake.position_x * 100}%`;
          const top = `${snake.position_y * 100}%`;
          const opacity = opacities[snake.id] ?? 1;

          return (
            <div
              key={snake.id}
              className="absolute"
              style={{ left, top }}
            >
              {/* Position centering wrapper */}
              <div className="-translate-x-1/2 -translate-y-1/2">

                {/* Wiggle wrapper */}
                <div
                  className="cursor-pointer transition-transform duration-200 hover:animate-wiggle"
                  onClick={() => setSelectedSnake(snake)}
                >
                  <SnakeDisplay
                    drawing={snake.drawing_data}
                    opacity={opacity}
                    width={150}
                    height={90}
                  />
                </div>

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
