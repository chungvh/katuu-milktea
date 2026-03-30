
import React from 'react';

interface OptionSelectorProps<T> {
  title: string;
  icon: React.ReactNode;
  options: T[];
  selectedOptions: T[];
  onChange: (option: T) => void;
  isMultiSelect?: boolean;
  showQuantity?: boolean;
  quantities?: Map<string | number, number>;
  onQuantityChange?: (option: T, quantity: number) => void;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string | number;
}

const OptionSelector = <T,>({
  title,
  icon,
  options,
  selectedOptions,
  onChange,
  isMultiSelect = false,
  showQuantity = false,
  quantities,
  onQuantityChange,
  getOptionLabel = (option) => String(option),
  getOptionValue = (option) => String(option),
}: OptionSelectorProps<T>) => {
  const isSelected = (option: T) => {
    if (isMultiSelect) {
      return selectedOptions.some(
        (selected) => getOptionValue(selected) === getOptionValue(option)
      );
    }
    return selectedOptions.length > 0 && getOptionValue(selectedOptions[0]) === getOptionValue(option);
  };

  const getQuantity = (option: T): number => {
    if (!quantities) return 0;
    return quantities.get(getOptionValue(option)) || 0;
  };

  return (
    <section>
      <div className="flex items-center mb-4">
        <span className="text-amber-600 mr-3">{icon}</span>
        <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-100">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option, index) => {
          const selected = showQuantity ? getQuantity(option) > 0 : isSelected(option);
          const qty = getQuantity(option);

          if (showQuantity && onQuantityChange) {
            return (
              <div
                key={index}
                className={`flex items-center rounded-full text-sm font-semibold transition-all duration-200 border-2 ${selected
                  ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                  }`}
              >
                {/* Label - click to toggle (add 1 or remove all) */}
                <button
                  onClick={() => {
                    if (qty === 0) {
                      onQuantityChange(option, 1);
                    } else {
                      onQuantityChange(option, 0);
                    }
                  }}
                  className={`pl-4 pr-2 py-3 transition-colors duration-200 rounded-l-full ${selected
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-stone-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400'
                    }`}
                >
                  {getOptionLabel(option)}
                </button>

                {/* Quantity controls - only show when selected */}
                {selected && (
                  <div className="flex items-center gap-1 pr-2 animate-fade-in">
                    <button
                      onClick={() => onQuantityChange(option, Math.max(0, qty - 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors duration-150 text-base font-bold active:scale-90"
                      aria-label={`Giảm ${getOptionLabel(option)}`}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-amber-700 dark:text-amber-300 font-bold tabular-nums">
                      {qty}
                    </span>
                    <button
                      onClick={() => onQuantityChange(option, qty + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-150 text-base font-bold active:scale-90"
                      aria-label={`Tăng ${getOptionLabel(option)}`}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={index}
              onClick={() => onChange(option)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-colors duration-200 border-2 ${selected
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-amber-400 dark:hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
            >
              {getOptionLabel(option)}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default OptionSelector;

