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
    <div className="flex justify-center gap-3 flex-wrap">
      {COLORS.map((color) => {
        const isSelected = selectedColor === color;

        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-9 h-9 rounded-full
              border transition-all duration-200
              ${isSelected
                ? 'border-gray-900 scale-110'
                : 'border-gray-200 hover:scale-105'}
            `}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
