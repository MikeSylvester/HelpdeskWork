import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils';

interface SearchableSelectOption {
  id: string;
  name: string;
  email?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  selectedValues: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  searchFields?: string[];
}

export function SearchableSelect({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Search and select...",
  label,
  disabled = false,
  className,
  searchFields = ['name']
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    
    return searchFields.some(field => {
      const value = option[field as keyof SearchableSelectOption];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (optionId: string) => {
    const isSelected = selectedValues.includes(optionId);
    
    if (isSelected) {
      onSelectionChange(selectedValues.filter(id => id !== optionId));
    } else {
      onSelectionChange([...selectedValues, optionId]);
    }
    
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const removeSelection = (optionId: string) => {
    onSelectionChange(selectedValues.filter(id => id !== optionId));
  };

  const getSelectedOptions = () => {
    return selectedValues.map(id => options.find(option => option.id === id)).filter(Boolean) as SearchableSelectOption[];
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Input/Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 text-left border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-gray-400 dark:hover:border-gray-500"
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn(
              "truncate",
              selectedValues.length === 0 && "text-gray-500 dark:text-gray-400"
            )}>
              {selectedValues.length === 0 
                ? placeholder 
                : `${selectedValues.length} selected`
              }
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )} />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.id);
                  const isHighlighted = index === highlightedIndex;
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleOptionClick(option.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors",
                        isHighlighted && "bg-gray-50 dark:bg-gray-700",
                        isSelected && "bg-orange-50 dark:bg-orange-900/20"
                      )}
                    >
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {option.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {option.name}
                        </div>
                        {option.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {option.email}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <X className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {getSelectedOptions().map(option => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
            >
              {option.name}
              <button
                onClick={() => removeSelection(option.id)}
                className="ml-1 hover:text-purple-600 dark:hover:text-purple-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
