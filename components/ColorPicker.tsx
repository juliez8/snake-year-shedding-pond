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
              w-10 h-10 rounded-full flex-shrink-0
              transition-all duration-150
              ${isSelected
                ? 'border-[3px] border-gray-900'
                : 'border-2 border-gray-300 hover:border-gray-500'}
            `}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        );
      })}
    </div>
  );
}
