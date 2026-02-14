'use client';

import { useState } from 'react';
import SnakeCanvas from '@/components/SnakeCanvas';
import ColorPicker from '@/components/ColorPicker';
import { DrawingData } from '@/types/snake';

interface DrawPanelProps {
  onSuccess?: () => void;
}

export default function DrawPanel({ onSuccess }: DrawPanelProps) {
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

      setMessage('');
      setDrawingData(null);
      setClearTrigger((prev) => prev + 1);

      onSuccess?.();
    } catch {
      setError('Something went wrong.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-amber-50/80 rounded-[1.25rem] shadow-[0_4px_20px_rgba(251,191,36,0.12),0_2px_6px_rgba(0,0,0,0.04)] p-5 space-y-3 w-full max-w-[340px] h-full min-h-0 flex flex-col overflow-y-auto border border-amber-100/80">

      <h2 className="text-lg font-medium text-amber-900/90 text-center tracking-wide">
        Draw Your Snake
      </h2>

      {/* Color Picker - contained within panel */}
      <div className="w-full overflow-visible">
        <ColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      </div>

      {/* Canvas - cozy framed card container */}
      <div className="w-full flex-shrink-0 rounded-2xl p-2 bg-white/70 border border-amber-100 shadow-[0_2px_12px_rgba(251,191,36,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]">
        <SnakeCanvas
          width={300}
          height={300}
          selectedColor={selectedColor}
          onDrawingChange={setDrawingData}
          clearTrigger={clearTrigger}
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
        rows={3}
        placeholder="What do you wish to shed?"
        className="w-full flex-shrink-0 px-4 py-2.5 border border-amber-200/80 rounded-2xl resize-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300/70 bg-white/60 text-sm text-amber-900/90 placeholder-amber-400/70 transition-colors"
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

      {/* Spacer to fill remaining height and align with Island */}
      <div className="flex-1 min-h-2" />

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
