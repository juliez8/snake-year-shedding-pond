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
    <div className="bg-white rounded-2xl shadow-xl p-5 space-y-4 w-full max-w-[340px]">

      <h2 className="text-lg font-semibold text-gray-900 text-center">
        Draw Your Snake
      </h2>

      {/* Color Picker - contained within panel */}
      <div className="w-full overflow-hidden">
        <ColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      </div>

      {/* Canvas - properly sized */}
      <div className="w-full">
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
          className="text-xs text-gray-500 hover:text-gray-800 underline"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
      />

      <div className="text-right text-xs text-gray-500">
        {message.length}/140
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {isSubmitting ? 'Releasing...' : 'Release Snake'}
      </button>
    </div>
  );
}
