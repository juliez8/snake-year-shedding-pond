'use client';

import { useRef, useEffect, useState } from 'react';
import { Stroke, Point, DrawingData } from '@/types/snake';

interface SnakeCanvasProps {
  width?: number;
  height?: number;
  selectedColor: string;
  onDrawingChange: (drawing: DrawingData) => void;
  clearTrigger?: number;
}

const BRUSH_WIDTH = 9;

export default function SnakeCanvas({
  width = 420,
  height = 420,
  selectedColor,
  onDrawingChange,
  clearTrigger = 0,
}: SnakeCanvasProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (clearTrigger > 0) {
      setStrokes([]);
      setCurrentStroke([]);
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.clearRect(0, 0, width, height);
    }
  }, [clearTrigger, width, height]);

  useEffect(() => {
    onDrawingChange({ strokes, width, height });
  }, [strokes, width, height, onDrawingChange]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
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

  const getPoint = (e: any): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const start = (e: any) => {
    e.preventDefault();
    const point = getPoint(e);
    if (!point) return;
    setIsDrawing(true);
    setCurrentStroke([point]);
  };

  const move = (e: any) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getPoint(e);
    if (!point) return;

    const ctx = canvasRef.current?.getContext('2d');
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

  const stop = () => {
    if (isDrawing && currentStroke.length > 1) {
      setStrokes([...strokes, { color: selectedColor, points: currentStroke }]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  return (
    <div className="border border-gray-200 rounded-3xl shadow-inner overflow-hidden bg-white mx-auto max-w-[340px]">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full aspect-square cursor-crosshair touch-none"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
      />
    </div>
  );
}
