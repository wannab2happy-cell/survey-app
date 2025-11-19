// 커스텀 Select 컴포넌트
// 일관성 있는 드롭다운 스타일 제공

import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = '선택해주세요',
  label,
  className = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : (placeholder || '선택해주세요');

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 text-left text-sm font-medium
            border-2 rounded-lg
            bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all
            flex items-center justify-between
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
            ${isOpen 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <span className={`${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
            {selectedLabel}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                옵션이 없습니다
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm
                      transition-colors
                      first:rounded-t-lg
                      last:rounded-b-lg
                      ${isSelected
                        ? 'bg-blue-500 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

