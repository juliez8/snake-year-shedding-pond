'use client';

import { useEffect } from 'react';

interface SnakeModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function SnakeModal({ isOpen, message, onClose }: SnakeModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-600 leading-relaxed">
            You have shed:
          </p>
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 italic leading-relaxed break-words">
            "{message}"
          </p>
          <p className="text-lg text-gray-600 leading-relaxed pt-4">
            You are ready for the Fire Horse Year.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
