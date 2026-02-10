import { useState, useCallback } from 'react';

interface PainScaleInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const quickTapValues = [0, 2, 4, 5, 6, 8, 10];

export const PainScaleInput = ({ value, onChange, disabled = false }: PainScaleInputProps) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());

  const getPainColor = (pain: number) => {
    if (pain <= 3) return 'text-green-600';
    if (pain <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleNumericInput = useCallback((inputValue: string) => {
    setLocalValue(inputValue);
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      onChange(numValue);
    }
  }, [onChange]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue.toString());
    onChange(newValue);
  }, [onChange]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Escala de Dolor (0-10)</label>
      
      {/* Quick-tap buttons */}
      <div className="flex gap-2 flex-wrap">
        {quickTapValues.map(val => (
          <button
            key={val}
            type="button"
            onClick={() => {
              setLocalValue(val.toString());
              onChange(val);
            }}
            disabled={disabled}
            className={`
              w-10 h-10 rounded-full border-2 font-bold transition-colors
              ${value === val 
                ? 'bg-primary-500 border-primary-500 text-white' 
                : 'border-gray-600 hover:border-primary-500'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {val}
          </button>
        ))}
      </div>
      
      {/* Slider */}
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={handleSliderChange}
        disabled={disabled}
        className="w-full"
      />
      
      {/* Numeric display with color coding */}
      <div className="flex items-center gap-2">
        <span className={`text-3xl font-bold ${getPainColor(value)}`}>
          {value}
        </span>
        <span className="text-gray-400">/10</span>
      </div>

      {/* Numeric input for precise entry */}
      <input
        type="number"
        min="0"
        max="10"
        value={localValue}
        onChange={(e) => handleNumericInput(e.target.value)}
        onBlur={() => {
          const numValue = parseInt(localValue, 10);
          if (isNaN(numValue) || numValue < 0 || numValue > 10) {
            setLocalValue(value.toString());
          }
        }}
        disabled={disabled}
        className="w-20 px-2 py-1 border rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        placeholder="0-10"
      />
    </div>
  );
};

export default PainScaleInput;