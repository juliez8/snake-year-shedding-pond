/**
 * Canvas-based snake drawing component.
 * Collects strokes from pointer + touch input and reports DrawingData upstream.
 */
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Stroke, Point, DrawingData } from '@/types/snake';

interface SnakeCanvasProps {
  width?: number;
  height?: number;
  selectedColor: string;
  onDrawingChange: (drawing: DrawingData) => void;
  clearTrigger?: number;
  wrapperClassName?: string;
}

const BRUSH_WIDTH = 11;

export default function SnakeCanvas({
  width = 340,
  height = 340,
  selectedColor,
  onDrawingChange,
  clearTrigger = 0,
  wrapperClassName,
}: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const selectedColorRef = useRef(selectedColor);

  useEffect(() => {
    selectedColorRef.current = selectedColor;
  }, [selectedColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [width, height]);

  useEffect(() => {
    if (clearTrigger > 0) {
      setStrokes([]);
      currentStrokeRef.current = [];
      isDrawingRef.current = false;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }
      }
    }
  }, [clearTrigger, width, height]);

  useEffect(() => {
    onDrawingChange({ strokes, width, height });
  }, [strokes, width, height, onDrawingChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = BRUSH_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.stroke();
    });
  }, [strokes, width, height]);

  const getPoint = useCallback((clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;

      const point = getPoint(touch.clientX, touch.clientY);
      if (!point) return;

      isDrawingRef.current = true;
      currentStrokeRef.current = [point];
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const point = getPoint(touch.clientX, touch.clientY);
      if (!point) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pts = currentStrokeRef.current;
      const last = pts[pts.length - 1];

      ctx.strokeStyle = selectedColorRef.current;
      ctx.lineWidth = BRUSH_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      currentStrokeRef.current = [...pts, point];
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;

      const pts = currentStrokeRef.current;
      if (pts.length >= 1) {
        const points = pts.length >= 2 ? [...pts] : [pts[0], { ...pts[0] }];
        setStrokes((prev) => [...prev, { color: selectedColorRef.current, points }]);
      }
      currentStrokeRef.current = [];
      isDrawingRef.current = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [getPoint]);

  const start = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    const point = getPoint(e.clientX, e.clientY);
    if (!point) return;

    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    currentStrokeRef.current = [point];
  };

  const move = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const point = getPoint(e.clientX, e.clientY);
    if (!point) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts = currentStrokeRef.current;
    const last = pts[pts.length - 1];

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = BRUSH_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    currentStrokeRef.current = [...pts, point];
  };

  const stop = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const pts = currentStrokeRef.current;
    if (pts.length >= 1) {
      const points = pts.length >= 2 ? [...pts] : [pts[0], { ...pts[0] }];
      setStrokes((prev) => [...prev, { color: selectedColor, points }]);
    }
    currentStrokeRef.current = [];
    isDrawingRef.current = false;
  };

  return (
    <div className={`rounded-2xl border-2 shadow-inner touch-none shrink-0 ${wrapperClassName ?? 'border-gray-200 bg-white'}`} style={{ width: width, minWidth: width, height: height, minHeight: height }}>
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair touch-none"
        style={{ width: width, height: height, touchAction: 'none', display: 'block', boxSizing: 'border-box' }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
    </div>
  );
}
