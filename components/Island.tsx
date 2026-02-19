/**
 * Island (pond) visualization.
 * Clips a blob-shaped pond, layers water + decorations, and places snakes with fading.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Snake } from '@/types/snake';
import { calculateOpacityIsland } from '@/lib/fade';
import SnakeDisplay from './SnakeDisplay';
import SnakeModal from './SnakeModal';

const SHED_DURATION_MS = 8_000;

/* ── Pink lotus flower with yellow centre ── */
function LotusFlowerSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Back petals — lighter pink */}
      <ellipse cx="60" cy="48" rx="12" ry="30" fill="#f8bbd0" opacity="0.7" transform="rotate(-50 60 48)" />
      <ellipse cx="60" cy="48" rx="12" ry="30" fill="#f8bbd0" opacity="0.7" transform="rotate(50 60 48)" />
      <ellipse cx="60" cy="48" rx="11" ry="28" fill="#f8bbd0" opacity="0.65" transform="rotate(-30 60 48)" />
      <ellipse cx="60" cy="48" rx="11" ry="28" fill="#f8bbd0" opacity="0.65" transform="rotate(30 60 48)" />
      {/* Mid petals — soft rose */}
      <ellipse cx="60" cy="46" rx="10" ry="26" fill="#f48fb1" opacity="0.75" transform="rotate(-18 60 46)" />
      <ellipse cx="60" cy="46" rx="10" ry="26" fill="#f48fb1" opacity="0.75" transform="rotate(18 60 46)" />
      {/* Centre petal */}
      <ellipse cx="60" cy="44" rx="8" ry="22" fill="#f06292" opacity="0.8" />
      {/* Yellow stamen centre */}
      <circle cx="60" cy="38" r="6" fill="#fff176" opacity="0.9" />
      <circle cx="60" cy="38" r="3.5" fill="#ffee58" opacity="0.95" />
    </svg>
  );
}

/* ── Round green lily pad ── */
function LilyPadSVG({ className, style, flip }: { className?: string; style?: React.CSSProperties; flip?: boolean }) {
  return (
    <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }}>
      <ellipse cx="50" cy="30" rx="46" ry="26" fill="#4a7c59" opacity="0.7" />
      <ellipse cx="50" cy="30" rx="46" ry="26" fill="url(#padGrad)" opacity="0.5" />
      {/* Notch / slit */}
      <line x1="50" y1="30" x2="50" y2="4" stroke="#3a6348" strokeWidth="1.5" opacity="0.5" />
      {/* Vein lines */}
      <line x1="50" y1="30" x2="20" y2="18" stroke="#5a9a6a" strokeWidth="0.7" opacity="0.3" />
      <line x1="50" y1="30" x2="80" y2="18" stroke="#5a9a6a" strokeWidth="0.7" opacity="0.3" />
      <line x1="50" y1="30" x2="16" y2="36" stroke="#5a9a6a" strokeWidth="0.7" opacity="0.3" />
      <line x1="50" y1="30" x2="84" y2="36" stroke="#5a9a6a" strokeWidth="0.7" opacity="0.3" />
      <defs>
        <radialGradient id="padGrad" cx="45%" cy="40%">
          <stop offset="0%" stopColor="#81c784" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.1" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Lotus + pad combo (flower sitting on a pad) ── */
function LotusWithPad({ padClass, flowerClass, style, flip, duration }: {
  padClass: string; flowerClass: string; style: React.CSSProperties; flip?: boolean; duration: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={style}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="relative">
        <LilyPadSVG className={padClass} flip={flip} />
        <LotusFlowerSVG className={flowerClass} style={{ position: 'absolute', left: '18%', top: '-55%' }} />
      </div>
    </motion.div>
  );
}

type PadEntry = { top?: string; left?: string; right?: string; bottom?: string; size: string; opacity: string; flip?: boolean; duration: number; rotate?: number };
type LotusEntry = { top?: string; left?: string; right?: string; bottom?: string; padSize: string; flowerSize: string; opacity: string; flip?: boolean; duration: number };

/* ── Desktop: full decoration set (landscape 4:3) ── */
const desktopPads: PadEntry[] = [
  { top: '4%',  left: '4%',  size: 'w-24', opacity: 'opacity-60', duration: 9, rotate: -12 },
  { top: '6%',  left: '20%', size: 'w-20', opacity: 'opacity-50', flip: true, duration: 10, rotate: 8 },
  { top: '3%',  right: '8%', size: 'w-28', opacity: 'opacity-55', duration: 8.5, rotate: 15 },
  { top: '10%', right: '30%', size: 'w-16', opacity: 'opacity-45', flip: true, duration: 11, rotate: -20 },
  { top: '8%',  left: '42%', size: 'w-18', opacity: 'opacity-40', duration: 10.5, rotate: 25 },
  { bottom: '5%', left: '8%', size: 'w-26', opacity: 'opacity-55', duration: 9.5, rotate: 5 },
  { bottom: '3%', left: '32%', size: 'w-20', opacity: 'opacity-50', flip: true, duration: 10.5, rotate: -8 },
  { bottom: '8%', right: '5%', size: 'w-24', opacity: 'opacity-60', duration: 8, rotate: 22 },
  { bottom: '12%', right: '28%', size: 'w-18', opacity: 'opacity-45', duration: 11.5, rotate: -15 },
  { bottom: '6%', left: '55%', size: 'w-16', opacity: 'opacity-42', flip: true, duration: 9.8, rotate: 35 },
  { top: '30%', left: '2%', size: 'w-18', opacity: 'opacity-45', flip: true, duration: 10, rotate: 30 },
  { top: '55%', left: '3%', size: 'w-22', opacity: 'opacity-50', duration: 9.2, rotate: -18 },
  { top: '38%', right: '2%', size: 'w-20', opacity: 'opacity-45', duration: 9, rotate: -25 },
  { top: '58%', right: '4%', size: 'w-16', opacity: 'opacity-40', flip: true, duration: 10.8, rotate: 12 },
  { top: '22%', left: '55%', size: 'w-16', opacity: 'opacity-35', duration: 11, rotate: 40 },
  { top: '65%', left: '22%', size: 'w-16', opacity: 'opacity-35', flip: true, duration: 10.2, rotate: -35 },
  { top: '35%', left: '30%', size: 'w-14', opacity: 'opacity-30', duration: 10.8, rotate: 15 },
  { top: '48%', left: '50%', size: 'w-16', opacity: 'opacity-32', flip: true, duration: 11.3, rotate: -22 },
  { top: '28%', left: '72%', size: 'w-14', opacity: 'opacity-28', duration: 9.7, rotate: 55 },
  { top: '55%', left: '65%', size: 'w-15', opacity: 'opacity-30', flip: true, duration: 10.5, rotate: -10 },
  { top: '70%', left: '50%', size: 'w-14', opacity: 'opacity-28', duration: 11.8, rotate: 32 },
  { top: '42%', left: '18%', size: 'w-14', opacity: 'opacity-30', flip: true, duration: 10.1, rotate: -45 },
];

const desktopLotus: LotusEntry[] = [
  { top: '5%',  left: '30%',  padSize: 'w-40', flowerSize: 'w-24', opacity: 'opacity-80', duration: 7.5 },
  { top: '4%',  right: '15%', padSize: 'w-44', flowerSize: 'w-26', opacity: 'opacity-85', flip: true, duration: 8.5 },
  { top: '12%', left: '8%',   padSize: 'w-36', flowerSize: 'w-20', opacity: 'opacity-70', duration: 9.2 },
  { bottom: '5%', left: '15%', padSize: 'w-42', flowerSize: 'w-24', opacity: 'opacity-75', duration: 9 },
  { bottom: '8%', right: '15%', padSize: 'w-40', flowerSize: 'w-22', opacity: 'opacity-70', flip: true, duration: 7 },
  { bottom: '4%', left: '45%', padSize: 'w-36', flowerSize: 'w-20', opacity: 'opacity-72', duration: 8.8 },
  { top: '28%', left: '3%', padSize: 'w-36', flowerSize: 'w-20', opacity: 'opacity-65', duration: 8 },
  { top: '48%', right: '3%', padSize: 'w-34', flowerSize: 'w-18', opacity: 'opacity-60', flip: true, duration: 9.5 },
  { top: '62%', left: '5%', padSize: 'w-32', flowerSize: 'w-18', opacity: 'opacity-55', flip: true, duration: 10 },
  { top: '35%', right: '5%', padSize: 'w-36', flowerSize: 'w-20', opacity: 'opacity-65', duration: 7.8 },
  { top: '38%', left: '35%', padSize: 'w-32', flowerSize: 'w-18', opacity: 'opacity-50', duration: 9.2 },
  { top: '55%', left: '55%', padSize: 'w-28', flowerSize: 'w-16', opacity: 'opacity-45', flip: true, duration: 10.3 },
  { top: '25%', left: '48%', padSize: 'w-28', flowerSize: 'w-16', opacity: 'opacity-48', duration: 8.7 },
];

/* ── Mobile: lush decorations matching desktop richness in vertical pond ── */
const mobilePads: PadEntry[] = [
  // Top edge
  { top: '2%',  left: '5%',  size: 'w-20', opacity: 'opacity-55', duration: 9, rotate: -10 },
  { top: '3%',  right: '8%', size: 'w-22', opacity: 'opacity-50', flip: true, duration: 10, rotate: 15 },
  { top: '8%',  left: '45%', size: 'w-16', opacity: 'opacity-40', duration: 10.5, rotate: 25 },
  // Upper-mid
  { top: '18%', left: '3%', size: 'w-18', opacity: 'opacity-45', flip: true, duration: 11, rotate: -20 },
  { top: '22%', right: '5%', size: 'w-16', opacity: 'opacity-40', duration: 9.5, rotate: 30 },
  { top: '16%', left: '55%', size: 'w-14', opacity: 'opacity-35', duration: 10.8, rotate: 35 },
  // Mid
  { top: '35%', left: '5%', size: 'w-18', opacity: 'opacity-45', duration: 10.2, rotate: -15 },
  { top: '38%', right: '6%', size: 'w-16', opacity: 'opacity-40', flip: true, duration: 9.8, rotate: 20 },
  { top: '32%', left: '38%', size: 'w-14', opacity: 'opacity-32', duration: 11.3, rotate: 40 },
  // Lower-mid
  { top: '50%', right: '4%', size: 'w-18', opacity: 'opacity-45', duration: 9.2, rotate: -25 },
  { top: '52%', left: '8%', size: 'w-16', opacity: 'opacity-40', flip: true, duration: 10.5, rotate: -30 },
  { top: '48%', left: '48%', size: 'w-14', opacity: 'opacity-30', duration: 11, rotate: 55 },
  // Lower
  { top: '65%', left: '4%', size: 'w-20', opacity: 'opacity-50', duration: 9.5, rotate: 12 },
  { top: '68%', right: '8%', size: 'w-16', opacity: 'opacity-40', flip: true, duration: 10.2, rotate: -18 },
  { top: '62%', left: '42%', size: 'w-14', opacity: 'opacity-32', duration: 11.5, rotate: 28 },
  // Bottom edge
  { bottom: '4%', left: '10%', size: 'w-20', opacity: 'opacity-50', duration: 10.8, rotate: 5 },
  { bottom: '3%', right: '12%', size: 'w-18', opacity: 'opacity-45', flip: true, duration: 9.2, rotate: -22 },
  { bottom: '6%', left: '48%', size: 'w-14', opacity: 'opacity-35', duration: 10, rotate: 15 },
];

const mobileLotus: LotusEntry[] = [
  { top: '4%',  left: '22%', padSize: 'w-28', flowerSize: 'w-16', opacity: 'opacity-80', duration: 8 },
  { top: '12%', right: '5%', padSize: 'w-30', flowerSize: 'w-17', opacity: 'opacity-75', flip: true, duration: 9 },
  { top: '26%', left: '4%', padSize: 'w-28', flowerSize: 'w-16', opacity: 'opacity-70', duration: 8.5 },
  { top: '38%', right: '4%', padSize: 'w-26', flowerSize: 'w-14', opacity: 'opacity-65', flip: true, duration: 9.5 },
  { top: '52%', left: '6%', padSize: 'w-28', flowerSize: 'w-16', opacity: 'opacity-70', duration: 7.8 },
  { top: '58%', right: '5%', padSize: 'w-24', flowerSize: 'w-14', opacity: 'opacity-60', flip: true, duration: 8.8 },
  { top: '72%', left: '20%', padSize: 'w-26', flowerSize: 'w-14', opacity: 'opacity-65', duration: 9.2 },
  { bottom: '5%', right: '18%', padSize: 'w-24', flowerSize: 'w-14', opacity: 'opacity-60', flip: true, duration: 8.2 },
  { top: '42%', left: '35%', padSize: 'w-22', flowerSize: 'w-12', opacity: 'opacity-50', duration: 10 },
];

interface IslandProps {
  /** Snakes currently rendered in the pond (location is respected by caller). */
  snakes: Snake[];
  /** ID of most recently-added snake, used to trigger entry + auto-popup flow. */
  lastAddedSnakeId?: string | null;
  /** Called when the auto-popup flow for the last added snake has completed. */
  onEntryAnimationComplete?: () => void;
}

export default function Island({ snakes, lastAddedSnakeId, onEntryAnimationComplete }: IslandProps) {
  const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);
  const [opacities, setOpacities] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [entryAnimatingId, setEntryAnimatingId] = useState<string | null>(null);
  const onCompleteRef = useRef(onEntryAnimationComplete);

  useEffect(() => {
    onCompleteRef.current = onEntryAnimationComplete;
  }, [onEntryAnimationComplete]);

  useEffect(() => {
    if (lastAddedSnakeId) setEntryAnimatingId(lastAddedSnakeId);
  }, [lastAddedSnakeId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const updateOpacities = () => {
      const newOpacities: Record<string, number> = {};
      snakes.forEach((snake) => {
        newOpacities[snake.id] = calculateOpacityIsland(snake.created_at);
      });
      setOpacities(newOpacities);
    };

    updateOpacities();
    const interval = setInterval(updateOpacities, 200);
    return () => clearInterval(interval);
  }, [snakes]);

  useEffect(() => {
    if (!lastAddedSnakeId) return;
    const snake = snakes.find((s) => s.id === lastAddedSnakeId);
    if (!snake) return;

    const createdAt = new Date(snake.created_at).getTime();
    const elapsed = Date.now() - createdAt;
    const delay = Math.max(0, SHED_DURATION_MS - elapsed);

    const timer = setTimeout(() => {
      setSelectedSnake(snake);
      onCompleteRef.current?.();
    }, delay);

    return () => clearTimeout(timer);
  }, [lastAddedSnakeId, snakes]);

  return (
    <>
      <div
        className="relative w-full max-w-4xl mx-auto py-1 sm:py-4 overflow-visible"
        style={{ filter: isMobile
          ? 'drop-shadow(0 4px 12px rgba(0,60,80,0.10))'
          : 'drop-shadow(0 12px 32px rgba(0,60,80,0.22)) drop-shadow(0 4px 14px rgba(0,40,60,0.12))'
        }}
      >
        {/* SVG clip-path definitions — vertical blob for mobile, horizontal for desktop */}
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <clipPath id="pondClipDesktop" clipPathUnits="objectBoundingBox">
              <path d="M0.44,0.06 C0.56,0.03 0.72,0.03 0.84,0.08 C0.93,0.14 0.96,0.26 0.95,0.40 C0.94,0.52 0.96,0.60 0.94,0.72 C0.91,0.83 0.85,0.91 0.76,0.95 C0.66,0.98 0.54,0.96 0.44,0.94 C0.35,0.92 0.27,0.97 0.18,0.94 C0.10,0.90 0.06,0.80 0.05,0.69 C0.04,0.57 0.07,0.48 0.06,0.37 C0.05,0.26 0.04,0.18 0.09,0.11 C0.16,0.04 0.32,0.03 0.44,0.06Z" />
            </clipPath>
            <clipPath id="pondClipMobile" clipPathUnits="objectBoundingBox">
              <path d="M0.50,0.03 C0.68,0.02 0.85,0.04 0.93,0.10 C0.98,0.16 0.97,0.26 0.96,0.36 C0.95,0.46 0.97,0.54 0.95,0.64 C0.93,0.74 0.96,0.82 0.92,0.90 C0.86,0.96 0.72,0.98 0.56,0.97 C0.42,0.96 0.30,0.99 0.18,0.96 C0.08,0.92 0.04,0.84 0.04,0.74 C0.04,0.64 0.06,0.55 0.05,0.45 C0.04,0.35 0.03,0.26 0.05,0.17 C0.08,0.08 0.18,0.03 0.32,0.02 C0.40,0.02 0.45,0.03 0.50,0.03Z" />
            </clipPath>
          </defs>
        </svg>

        <div
          className={`relative w-full overflow-hidden transition-all duration-300 ease-out ${isMobile ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
          style={{
            clipPath: isMobile ? 'url(#pondClipMobile)' : 'url(#pondClipDesktop)',
            background: 'linear-gradient(155deg, #7DCDD8 0%, #5ABEC9 15%, #48B0BF 35%, #5CBDCC 50%, #42A8B8 70%, #55B8C8 85%, #6AC5D2 100%)',
          }}
        >
          {/* ── Depth layer: darker edges for 3D pond feel ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 40%, rgba(30,90,105,0.18) 100%)',
              zIndex: 0,
            }}
          />

          {/* ── Layer 1: Water surface light reflections ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 50% 40% at 30% 25%, rgba(255,255,255,0.28) 0%, transparent 65%)',
              zIndex: 1,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 45% 35% at 70% 65%, rgba(255,255,255,0.16) 0%, transparent 55%)',
              zIndex: 1,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 35% 30% at 50% 42%, rgba(200,245,255,0.10) 0%, transparent 70%)',
              zIndex: 1,
            }}
          />

          {/* ── Decorations ── */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            {(isMobile ? mobilePads : desktopPads).map((pad, i) => (
              <motion.div
                key={`pad-${i}`}
                className={`absolute ${pad.size} ${pad.opacity} pointer-events-none`}
                style={{
                  top: pad.top, left: pad.left, right: pad.right, bottom: pad.bottom,
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: pad.duration, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div style={{ transform: `rotate(${pad.rotate ?? 0}deg)` }}>
                  <LilyPadSVG flip={pad.flip} />
                </div>
              </motion.div>
            ))}

            {(isMobile ? mobileLotus : desktopLotus).map((g, i) => (
              <LotusWithPad
                key={`lotus-${i}`}
                padClass={g.padSize}
                flowerClass={g.flowerSize}
                flip={g.flip}
                duration={g.duration}
                style={{
                  top: g.top, left: g.left, right: g.right, bottom: g.bottom,
                  zIndex: 3, opacity: parseFloat(g.opacity.replace('opacity-', '')) / 100,
                }}
              />
            ))}
          </div>

          {/* ── Layer 3: Snakes (rendered above everything) ── */}
          {snakes.map((snake) => {
            const inset = 0.1;
            const left = `${inset * 100 + snake.position_x * (1 - 2 * inset) * 100}%`;
            const top = `${inset * 100 + snake.position_y * (1 - 2 * inset) * 100}%`;
            const opacity = opacities[snake.id] ?? 1;

            return (
              <div
                key={snake.id}
                className="absolute cursor-pointer transition-transform hover:scale-110"
                style={{
                  left,
                  top,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
                onClick={() => setSelectedSnake(snake)}
              >
                <div
                  className={
                    entryAnimatingId === snake.id
                      ? 'animate-snakeEntry'
                      : 'hover:animate-wiggle'
                  }
                  onAnimationEnd={() => {
                    if (entryAnimatingId === snake.id) {
                      setEntryAnimatingId(null);
                    }
                  }}
                >
                  <SnakeDisplay
                    drawing={snake.drawing_data}
                    opacity={opacity}
                    width={150}
                    height={90}
                  />
                </div>
              </div>
            );
          })}

          {snakes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
              <p className="text-white/60 text-center px-4">
                The pond awaits its first snake...
              </p>
            </div>
          )}
        </div>
      </div>

      <SnakeModal
        isOpen={selectedSnake !== null}
        snakeId={selectedSnake?.id}
        message={selectedSnake?.message ?? ''}
        onClose={() => setSelectedSnake(null)}
      />
    </>
  );
}
