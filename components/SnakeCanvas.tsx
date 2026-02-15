'use client';

import { useRef, useEffect, useState } from 'react';
import { Stroke, Point, DrawingData } from '@/types/snake';

interface SnakeCanvasProps {
  width?: number;
  height?: number;
  selectedColor: string;
  onDrawingChange: (drawing: DrawingData) => void;
  clearTrigger?: number;
  wrapperClassName?: string;
}

const BRUSH_WIDTH = 13;

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
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Setup canvas with proper DPI scaling for crisp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size (with DPI scaling)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size (CSS pixels)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context to match DPI
    ctx.scale(dpr, dpr);

    // Set rendering quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [width, height]);

  // Clear canvas
  useEffect(() => {
    if (clearTrigger > 0) {
      setStrokes([]);
      setCurrentStroke([]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }
      }
    }
  }, [clearTrigger, width, height]);

  // Notify parent of drawing changes
  useEffect(() => {
    onDrawingChange({ strokes, width, height });
  }, [strokes, width, height, onDrawingChange]);

  // Redraw all strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all strokes
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

  // Get coordinates in canvas space - account for visual viewport on mobile
  const getPoint = (clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const vv = typeof window !== 'undefined' && window.visualViewport;
    const offsetX = vv ? vv.offsetLeft : 0;
    const offsetY = vv ? vv.offsetTop : 0;
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const x = (clientX + offsetX - rect.left) * scaleX;
    const y = (clientY + offsetY - rect.top) * scaleY;

    return { x, y };
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    const point = getPoint(e.clientX, e.clientY);
    if (!point) return;

    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setCurrentStroke([point]);
  };

  const move = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getPoint(e.clientX, e.clientY);
    if (!point) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const last = currentStroke[currentStroke.length - 1];

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = BRUSH_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    setCurrentStroke([...currentStroke, point]);
  };

  const stop = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isDrawing && currentStroke.length >= 1) {
      const points =
        currentStroke.length >= 2
          ? currentStroke
          : [currentStroke[0], { ...currentStroke[0] }];
      setStrokes([...strokes, { color: selectedColor, points }]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
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
