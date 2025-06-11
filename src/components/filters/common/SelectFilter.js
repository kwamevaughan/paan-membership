import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";

export default function SelectFilter({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  mode = "light",
  id,
  loading = false,
  isMulti = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hasValue = isMulti ? (Array.isArray(value) && value.length > 0) : (value && value !== "");

  const getOptionValue = (option) => {
    if (typeof option === 'object' && option !== null) {
      return option.value;
    }
    return option;
  };

  const getOptionLabel = (option) => {
    if (typeof option === 'object' && option !== null) {
      return option.label;
    }
    return option;
  };

  const handleSelect = (optionValue) => {
    if (isMulti) {
      const newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(optionValue)) {
        onChange(newValue.filter(v => v !== optionValue));
      } else {
        onChange([...newValue, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removeTag = (tagToRemove) => {
    if (Array.isArray(value)) {
      onChange(value.filter(tag => tag !== tagToRemove));
    }
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      document.documentElement.style.setProperty('--select-top', `${rect.bottom}px`);
      document.documentElement.style.setProperty('--select-left', `${rect.left}px`);
      document.documentElement.style.setProperty('--select-width', `${rect.width}px`);
    }
  }, [isOpen]);

  return (
    <div className="w-full group relative" ref={containerRef}>
      <div className="relative">
        {/* Main select button */}
        <button
          type="button"
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          className={`w-full px-4 pt-6 pb-2 text-sm border rounded-xl appearance-none transition-all duration-200 ${
            mode === "dark"
              ? "bg-gray-800/50 text-white border-gray-700/50 hover:border-gray-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              : "bg-white/50 text-gray-900 border-gray-200/50 hover:border-gray-300/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg`}
          disabled={disabled || loading}
        >
          <div className="flex flex-wrap gap-2 min-h-[24px]">
            {isMulti && Array.isArray(value) && value.length > 0 ? (
              value.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    mode === "dark"
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {getOptionLabel(options.find(opt => getOptionValue(opt) === tag) || tag)}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    className="hover:text-red-500"
                  >
                    <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">
                {isMulti ? "Select tags..." : getOptionLabel(options.find(opt => getOptionValue(opt) === value) || value)}
              </span>
            )}
          </div>
        </button>
        
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            hasValue || isFocused
              ? "text-xs -translate-y-2 text-blue-500 font-medium"
              : "text-sm translate-y-2"
          } ${
            mode === "dark"
              ? "text-gray-400 group-hover:text-gray-300"
              : "text-gray-500 group-hover:text-gray-600"
          }`}
        >
          {label}
          {isMulti && hasValue && (
            <span className="ml-1 text-xs">
              ({Array.isArray(value) ? value.length : 0} selected)
            </span>
          )}
        </label>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <div className={`h-4 w-4 transition-all duration-200 ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            <Icon
              icon="heroicons:chevron-down"
              className={`h-full w-full transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className={`fixed z-[9999] w-[var(--select-width)] py-1 rounded-lg shadow-lg ${
            mode === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`} style={{ 
            top: 'var(--select-top)',
            left: 'var(--select-left)',
            width: 'var(--select-width)'
          }}>
            {options.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              const isSelected = isMulti
                ? Array.isArray(value) && value.includes(optionValue)
                : value === optionValue;

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => handleSelect(optionValue)}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                    mode === "dark" ? "text-gray-200" : "text-gray-700"
                  } ${isSelected ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
                >
                  {isSelected && (
                    <Icon
                      icon="heroicons:check"
                      className={`w-4 h-4 ${
                        mode === "dark" ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  )}
                  {optionLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* Focus ring effect */}
        <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-200 ${
          isFocused 
            ? "ring-2 ring-blue-500/20" 
            : "ring-0"
        }`} />
      </div>
    </div>
  );
} 