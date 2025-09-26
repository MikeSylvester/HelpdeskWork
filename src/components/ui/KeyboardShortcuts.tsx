import React, { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { key: '/', description: 'Focus search', category: 'Navigation' },
  { key: 'n', description: 'New ticket', category: 'Tickets' },
  { key: 'r', description: 'Refresh page', category: 'General' },
  { key: 'h', description: 'Go to dashboard', category: 'Navigation' },
  { key: 't', description: 'Go to tickets', category: 'Navigation' },
  { key: 'k', description: 'Go to knowledge base', category: 'Navigation' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
  { key: 'Escape', description: 'Close modal/dialog', category: 'General' },
];

export function KeyboardShortcuts() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Show shortcuts modal
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setShowModal(true);
        return;
      }

      // Other shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case '/':
            e.preventDefault();
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case 'n':
            e.preventDefault();
            window.location.href = '/submit-ticket';
            break;
          case 'r':
            e.preventDefault();
            window.location.reload();
            break;
          case 'h':
            e.preventDefault();
            window.location.href = '/';
            break;
          case 't':
            e.preventDefault();
            window.location.href = '/tickets';
            break;
          case 'k':
            e.preventDefault();
            window.location.href = '/knowledge-base';
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowModal(true)}
          className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </div>

      {/* Shortcuts modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Keyboard Shortcuts"
        size="md"
      >
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}