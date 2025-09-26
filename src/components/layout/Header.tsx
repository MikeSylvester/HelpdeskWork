import React, { useState } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { useAppStore } from '../../stores/app';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              HelpDesk Pro
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2 h-auto"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}