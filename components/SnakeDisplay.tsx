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

const BRUSH_WIDTH = 4;

export default function SnakeDisplay({
  drawing,
  opacity = 1,
  width = 150,
  height = 90,
  className = '',
}: SnakeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size (with DPI scaling for crisp rendering)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size (CSS pixels)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context to match DPI
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set global alpha for fading effect
    ctx.globalAlpha = opacity;

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate scale to fit original drawing into display size
    const scaleX = width / drawing.width;
    const scaleY = height / drawing.height;
    const scale = Math.min(scaleX, scaleY);

    // Center the drawing
    const offsetX = (width - drawing.width * scale) / 2;
    const offsetY = (height - drawing.height * scale) / 2;

    // Draw all strokes with scaling
    drawing.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = BRUSH_WIDTH * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(
        stroke.points[0].x * scale + offsetX,
        stroke.points[0].y * scale + offsetY
      );

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(
          stroke.points[i].x * scale + offsetX,
          stroke.points[i].y * scale + offsetY
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
      className={className}
    />
  );
}
