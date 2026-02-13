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
    <div className="flex justify-center gap-2 px-2">
      {COLORS.map((color) => {
        const isSelected = selectedColor === color;

        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-9 h-9 rounded-full flex-shrink-0
              border-2 transition-all duration-200
              ${isSelected
                ? 'border-gray-900 scale-110 ring-2 ring-gray-300'
                : 'border-gray-300 hover:scale-105 hover:border-gray-400'}
            `}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        );
      })}
    </div>
  );
}
