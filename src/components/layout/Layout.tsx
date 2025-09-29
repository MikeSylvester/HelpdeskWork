import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KeyboardShortcuts } from '../ui/KeyboardShortcuts';
import { TestingGuide } from '../TestingGuide';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Fixed at top */}
      <div className="sticky top-0 z-20">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />
      </div>

      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar */}
        <Sidebar
          isMobile
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Keyboard shortcuts */}
      <KeyboardShortcuts />
      
      {/* Testing Guide - Only show in development */}
      {import.meta.env.DEV && <TestingGuide />}
    </div>
  );
}