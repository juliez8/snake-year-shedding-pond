'use client';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const COLORS = [
  '#9B1C31',
  '#C2410C',
  '#D97706',
  '#7A9C5D',
  '#3E7A5E',
  '#6B4BBE',
  '#2F3342',
];

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex justify-between items-center gap-3 w-full">
      {COLORS.map((color) => {
        const isSelected = selectedColor === color;

        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-9 h-9 rounded-full flex-shrink-0
              transition-all duration-200
              ${isSelected ? 'scale-110 ring-2 ring-black' : 'hover:scale-105'}
            `}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
