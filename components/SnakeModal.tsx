/**
 * Snake message modal.
 * Shows the \"you have shed\" text and allows reporting a snake.
 */
'use client';

import { useEffect, useState } from 'react';

interface SnakeModalProps {
  isOpen: boolean;
  snakeId?: string;
  message: string;
  onClose: () => void;
}

export default function SnakeModal({ isOpen, snakeId, message, onClose }: SnakeModalProps) {
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setReported(false);
      setReporting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleReport = async () => {
    if (!snakeId || reporting || reported) return;

    setReporting(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snake_id: snakeId }),
      });

      if (res.ok) {
        setReported(true);
      }
    } catch {
      /* ignore */
    }
    setReporting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-amber-50/95 rounded-2xl p-8 max-w-md w-full shadow-[0_0_20px_rgba(251,191,36,0.45),0_0_40px_rgba(251,191,36,0.25),0_0_60px_rgba(251,191,36,0.15)] border-2 border-amber-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <p className="text-2xl text-amber-800/80 leading-relaxed">
            You have shed:
          </p>
          <p className="text-2xl sm:text-3xl font-medium text-amber-950 italic leading-relaxed break-words">
            &ldquo;{message}&rdquo;
          </p>
          <p className="text-xl text-amber-800/70 leading-relaxed pt-4">
            You are ready for the Fire Horse Year.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-red-900 text-amber-50 rounded-xl font-medium shadow-[0_0_10px_rgba(127,29,29,0.5),0_2px_8px_rgba(120,30,30,0.4)] hover:shadow-[0_0_16px_rgba(127,29,29,0.6),0_4px_12px_rgba(120,30,30,0.5)] hover:bg-red-950 transition-all duration-200"
        >
          Close
        </button>

        {snakeId && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={handleReport}
              disabled={reported || reporting}
              className={`text-sm px-4 py-1.5 rounded-full transition-all duration-200 ${
                reported
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'text-amber-700 border border-amber-300 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/50'
              }`}
            >
              {reported ? (
                'Thanks for reporting 💛'
              ) : reporting ? (
                'Reporting...'
              ) : (
                '🚩 Report'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
