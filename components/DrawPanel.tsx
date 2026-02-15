'use client';

import { useState } from 'react';
import SnakeCanvas from '@/components/SnakeCanvas';
import ColorPicker from '@/components/ColorPicker';
import { DrawingData } from '@/types/snake';

interface DrawPanelProps {
  onSuccess?: (result: { snakeId: string; addedToGallery: boolean }) => void;
  /** Compact mode for modal - smaller canvas, tighter layout, no scroll */
  compact?: boolean;
  /** Embedded in modal - no inner border/shadow, outer container provides the glow */
  embedded?: boolean;
}

export default function DrawPanel({ onSuccess, compact = false, embedded = false }: DrawPanelProps) {
  const [selectedColor, setSelectedColor] = useState('#9B1C31');
  const [drawingData, setDrawingData] = useState<DrawingData | null>(null);
  const [message, setMessage] = useState('');
  const [clearTrigger, setClearTrigger] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClear = () => {
    setClearTrigger((prev) => prev + 1);
    setDrawingData(null);
  };

  const handleSubmit = async () => {
    setError('');

    if (!message.trim()) {
      setError('Please write what you wish to shed.');
      return;
    }

    if (!drawingData || drawingData.strokes.length === 0) {
      setError('Please draw your snake first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawing_data: drawingData,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit');
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      setMessage('');
      setDrawingData(null);
      setClearTrigger((prev) => prev + 1);

      onSuccess?.({ snakeId: data.snake.id, addedToGallery: data.addedToGallery });
    } catch {
      setError('Something went wrong.');
    }

    setIsSubmitting(false);
  };

  const canvasSize = compact ? 200 : 300;

  const outerStyles = embedded
    ? 'bg-transparent w-full max-w-[340px] flex flex-col items-center'
    : 'bg-amber-50/80 rounded-[1.25rem] shadow-[0_4px_20px_rgba(251,191,36,0.12),0_2px_6px_rgba(0,0,0,0.04)] w-full max-w-[340px] flex flex-col border border-amber-100/80';

  return (
    <div className={`${outerStyles} ${compact ? 'p-4 pt-14 space-y-2' : 'p-5 space-y-3 h-full min-h-0 overflow-y-auto'}`}>

      <h2 className={`font-medium text-amber-900/90 text-center tracking-wide ${compact ? 'text-base' : 'text-lg'}`}>
        Draw Your Snake
      </h2>

      {/* Color Picker */}
      <div className="w-full overflow-visible flex-shrink-0">
        <ColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      </div>

      {/* Canvas - no frame/border, background matches panel (amber-50) */}
      <div className="w-full flex-shrink-0 flex justify-center">
        <SnakeCanvas
          width={canvasSize}
          height={canvasSize}
          selectedColor={selectedColor}
          onDrawingChange={setDrawingData}
          clearTrigger={clearTrigger}
          wrapperClassName="bg-amber-50 border border-dashed border-amber-300/70 shadow-none rounded-2xl"
        />
      </div>

      {/* Clear button */}
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          className="text-xs text-amber-700/70 hover:text-amber-800 underline decoration-amber-200 hover:decoration-amber-300 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Message textarea */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={140}
        rows={compact ? 2 : 3}
        placeholder="What do you wish to shed?"
        className="w-full flex-shrink-0 px-4 py-2.5 border border-amber-200/80 rounded-2xl resize-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300/70 bg-white text-amber-900/90 placeholder-amber-900/80 placeholder:text-lg transition-colors"
        style={{ fontSize: '18px' }}
      />

      <div className="text-right text-xs text-amber-600/70">
        {message.length}/140
      </div>

      {/* Error message */}
      {error && (
        <div className="text-rose-700 text-sm bg-rose-50/90 border border-rose-200/80 rounded-2xl p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] flex-shrink-0">
          {error}
        </div>
      )}

      {/* Spacer - only when not compact (desktop side panel) */}
      {!compact && <div className="flex-1 min-h-2" />}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex-shrink-0 py-3 bg-amber-400 text-amber-950 rounded-full hover:bg-amber-500 disabled:bg-amber-200 disabled:text-amber-600/70 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-[0_2px_8px_rgba(251,191,36,0.25)] hover:shadow-[0_4px_12px_rgba(251,191,36,0.3)] active:scale-[0.99]"
      >
        {isSubmitting ? 'Releasing...' : 'Release Snake'}
      </button>
    </div>
  );
}
