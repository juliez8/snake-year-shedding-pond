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
    <div className="flex justify-center gap-3 px-4">
      {COLORS.map((color) => {
        const isSelected = selectedColor === color;

        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              relative w-10 h-10 rounded-full flex-shrink-0
              transition-all duration-200
              ${isSelected
                ? 'ring-2 ring-offset-2 ring-gray-900'
                : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-400'}
            `}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        );
      })}
    </div>
  );
}
