'use client';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const COLORS = [
  '#9B1C31',
  '#C2410C',
  '#D97706',
  '#7A9E5F',
  '#3F7F5C',
  '#6B4DBF',
  '#2E3440',
];

export default function ColorPicker({
  selectedColor,
  onColorChange,
}: ColorPickerProps) {
  return (
    <div className="flex justify-center gap-2 py-1 touch-manipulation">
      {COLORS.map((color) => {
        const isSelected = selectedColor === color;

        return (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            onTouchEnd={(e) => {
              e.preventDefault();
              onColorChange(color);
            }}
            className={`
              min-w-[44px] min-h-[44px] w-8 h-8 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center select-none
              transition-all duration-200 ease-out
              shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]
              hover:scale-105 active:scale-95
              ${isSelected
                ? 'ring-2 ring-amber-300/80 ring-offset-1 ring-offset-amber-50 shadow-[0_2px_6px_rgba(251,191,36,0.3)]'
                : 'ring-1 ring-amber-200/60 hover:ring-amber-300/70'}
            `}
            style={{
              backgroundColor: color,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label={`Select color ${color}`}
          />
        );
      })}
    </div>
  );
}
