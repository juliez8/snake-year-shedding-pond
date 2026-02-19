/**
 * Drawing panel UI.
 * Wraps color picker, canvas, message input, and submit/clear controls.
 */
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
        let errMessage = 'Failed to submit';
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch {
          // Server may return non-JSON (e.g. 500 error page)
        }
        setError(errMessage);
        setIsSubmitting(false);
        return;
      }

      let data: { snake?: { id: string }; addedToGallery?: boolean };
      try {
        data = await res.json();
      } catch {
        // Success status but body failed to parse (e.g. truncated) — snake may still have been saved
        setMessage('');
        setDrawingData(null);
        setClearTrigger((prev) => prev + 1);
        setError('Submitted! If you don\'t see your snake, refresh the page.');
        setIsSubmitting(false);
        return;
      }

      setMessage('');
      setDrawingData(null);
      setClearTrigger((prev) => prev + 1);
      if (data?.snake?.id != null) {
        onSuccess?.({ snakeId: data.snake.id, addedToGallery: data.addedToGallery ?? false });
      } else {
        setError('Submitted! If you don\'t see your snake, refresh the page.');
      }
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
    <div className={`${outerStyles} ${compact ? 'p-4 pt-14 space-y-2' : 'p-5 space-y-2'}`}>

      <h2 className={`font-medium text-amber-900/90 text-center tracking-wide ${compact ? 'text-xl' : 'text-2xl'}`}>
        Draw Your Snake
      </h2>

      <div className="w-full overflow-visible flex-shrink-0">
        <ColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      </div>

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

      <div className="flex justify-end">
        <button
          onClick={handleClear}
          className="text-sm text-amber-800 hover:text-amber-900 underline decoration-amber-300 hover:decoration-amber-400 transition-colors"
        >
          Clear
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={140}
        rows={compact ? 2 : 3}
        placeholder="What do you wish to shed?"
        className="w-full flex-shrink-0 px-4 py-2.5 border border-amber-200/80 rounded-2xl resize-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300/70 bg-white text-amber-900/90 placeholder-amber-900/80 placeholder:text-lg transition-colors"
        style={{ fontSize: '18px' }}
      />

      <div className="text-right text-sm text-amber-700">
        {message.length}/140
      </div>

      {error && (
        <div role="alert" className="text-rose-800 text-base bg-rose-50/90 border border-rose-200/80 rounded-2xl p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] flex-shrink-0">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex-shrink-0 py-3 bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-200 text-amber-900 rounded-full hover:from-amber-400 hover:via-amber-300 hover:to-yellow-300 disabled:from-amber-100 disabled:via-amber-100 disabled:to-amber-100 disabled:text-amber-400 disabled:cursor-not-allowed transition-all duration-200 text-lg font-medium shadow-[0_2px_10px_rgba(217,168,68,0.3)] hover:shadow-[0_4px_14px_rgba(217,168,68,0.4)] active:scale-[0.99]"
      >
        {isSubmitting ? 'Releasing...' : 'Release Snake'}
      </button>
    </div>
  );
}
