import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { cn } from '../../utils';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

interface QuickFiltersProps {
  title?: string;
  options: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (filterId: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function QuickFilters({
  title = 'Quick Filters',
  options,
  selectedFilters,
  onFilterChange,
  onClearAll,
  className,
}: QuickFiltersProps) {
  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedFilters.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              )}
            >
              {option.color && (
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: option.color }}
                />
              )}
              {option.label}
              {option.count !== undefined && (
                <Badge
                  variant="secondary"
                  size="sm"
                  className="ml-2 text-xs"
                >
                  {option.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}