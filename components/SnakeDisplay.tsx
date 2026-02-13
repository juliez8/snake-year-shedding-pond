'use client';

import { useEffect, useRef } from 'react';
import { DrawingData } from '@/types/snake';

interface SnakeDisplayProps {
  drawing: DrawingData;
  opacity?: number;
  width?: number;
  height?: number;
  className?: string;
}

const BRUSH_WIDTH = 3;

export default function SnakeDisplay({
  drawing,
  opacity = 1,
  width = 500,
  height = 300,
  className = '',
}: SnakeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Set global alpha for fading effect
  ctx.globalAlpha = opacity;

  const originalWidth = 500;
  const originalHeight = 300;

  const scaleX = width / originalWidth;
  const scaleY = height / originalHeight;

  // Draw all strokes
  drawing.strokes.forEach((stroke) => {
    if (!stroke.points || stroke.points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = BRUSH_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(
      stroke.points[0].x * scaleX,
      stroke.points[0].y * scaleY
    );

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(
        stroke.points[i].x * scaleX,
        stroke.points[i].y * scaleY
      );
    }

    ctx.stroke();
  });

  // Reset global alpha
  ctx.globalAlpha = 1;
}, [drawing, opacity, width, height]);


  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}
