
import React from 'react';

interface OptionSelectorProps<T> {
  title: string;
  icon: React.ReactNode;
  options: T[];
  selectedOptions: T[];
  onChange: (option: T) => void;
  isMultiSelect?: boolean;
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

  return (
    <section>
      <div className="flex items-center mb-4">
        <span className="text-amber-600 mr-3">{icon}</span>
        <h2 className="text-2xl font-bold text-stone-700">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option, index) => {
          const selected = isSelected(option);
          return (
            <button
              key={index}
              onClick={() => onChange(option)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-colors duration-200 border-2 ${
                selected
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-600'
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
