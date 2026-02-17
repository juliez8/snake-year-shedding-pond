'use client';

import { useState, useCallback } from 'react';
import { Snake } from '@/types/snake';
import SnakeDisplay from '@/components/SnakeDisplay';
import SnakeModal from '@/components/SnakeModal';

interface GalleryClientProps {
  initialSnakes: Snake[];
  totalCount: number;
  pageSize: number;
}

export default function GalleryClient({ initialSnakes, totalCount, pageSize }: GalleryClientProps) {
  const [snakes, setSnakes] = useState<Snake[]>(initialSnakes);
  const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = snakes.length < totalCount;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/gallery?page=${nextPage}&limit=${pageSize}`);

      if (!res.ok) {
        console.error('Failed to load more snakes');
        return;
      }

      const data = await res.json();
      setSnakes((prev) => [...prev, ...data.snakes]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more snakes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, pageSize]);

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

      {hasMore && (
        <div className="flex justify-center mt-8 mb-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-8 py-3 bg-amber-400 text-amber-950 rounded-xl font-medium text-sm shadow-[0_2px_8px_rgba(251,191,36,0.25)] hover:shadow-[0_4px_12px_rgba(251,191,36,0.3)] hover:bg-amber-500 disabled:bg-amber-200 disabled:text-amber-600/70 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'Loading...' : `Load More (${snakes.length} of ${totalCount})`}
          </button>
        </div>
      )}

      <SnakeModal
        isOpen={selectedSnake !== null}
        snakeId={selectedSnake?.id}
        message={selectedSnake?.message ?? ''}
        onClose={() => setSelectedSnake(null)}
      />
    </>
  );
}
