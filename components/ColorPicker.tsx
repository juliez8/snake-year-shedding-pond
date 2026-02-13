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
    <div className="flex justify-center gap-3 flex-nowrap overflow-hidden">

      {COLORS.map((color) => {
        const isSelected = selectedColor === color;

        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-9 h-9 shrink-0 rounded-full
              transition-all duration-200
              ring-2 ring-white
              ${isSelected ? 'ring-gray-900 scale-105' : 'ring-gray-200'}
`           }

            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
