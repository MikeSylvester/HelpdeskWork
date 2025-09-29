import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar, Star } from 'lucide-react';
import { cn } from '../../utils';

export type SortOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

export type SortField = 'date' | 'priority';

export interface TicketSorterProps {
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: SortField, direction: 'asc' | 'desc') => void;
  className?: string;
  compact?: boolean;
}

const sortOptions: SortOption[] = [
  {
    value: 'date',
    label: 'Date',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    value: 'priority',
    label: 'Priority', 
    icon: <Star className="h-4 w-4" />
  }
];

export function TicketSorter({ 
  sortField, 
  sortDirection, 
  onSortChange, 
  className,
  compact = false
}: TicketSorterProps) {
  const handleSortClick = (field: SortField) => {
    let newDirection: 'asc' | 'desc';
    
    if (sortField === field) {
      // If same field clicked, toggle direction
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If different field clicked, default to desc
      newDirection = 'desc';
    }
    
    onSortChange(field, newDirection);
  };

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortClick(option.value as SortField)}
            className={cn(
              'inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'focus:outline-none focus:ring-1 focus:ring-orange-500',
              sortField === option.value
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
            title={`Sort by ${option.label}`}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
            {sortField === option.value && (
              sortDirection === 'asc' ? (
                <ArrowUp className="h-2.5 w-2.5" />
              ) : (
                <ArrowDown className="h-2.5 w-2.5" />
              )
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSortClick(option.value as SortField)}
          className={cn(
            'inline-flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1',
            sortField === option.value
              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
              : 'text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          )}
        >
          {option.icon}
          <span>{option.label}</span>
          {sortField === option.value && (
            sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          )}
          {sortField !== option.value && (
            <ArrowUpDown className="h-3 w-3" />
          )}
        </button>
      ))}
    </div>
  );
}
