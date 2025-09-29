import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { localStorageService } from '../services/localStorage';
import { CheckCircle, XCircle, RefreshCw, Download, Upload, Trash2, RotateCcw, Wrench } from 'lucide-react';
import { mockTickets } from '../mock-data/tickets';
import { mockUsers } from '../mock-data/users';
import { mockCategories, mockPriorities, mockTicketStatuses, mockSystemSettings } from '../mock-data/system-data';

export function TestingGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<string>('');

  const testDataPersistence = () => {
    try {
      const tickets = localStorageService.getTickets();
      setStatus(`✅ Found ${tickets.length} tickets in localStorage`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  const clearAllData = () => {
    localStorageService.clearAllData();
    setStatus('🗑️ All data cleared from localStorage');
  };

  const resetToMockData = () => {
    localStorageService.resetToMockData({
      tickets: mockTickets,
      users: mockUsers,
      categories: mockCategories,
      priorities: mockPriorities,
      statuses: mockTicketStatuses,
      settings: mockSystemSettings
    });
    setStatus('🔄 Reset to mock data - refresh page to see changes');
  };

  const fixCorruptedDates = () => {
    try {
      localStorageService.fixCorruptedDates();
      setStatus('🔧 Fixed corrupted dates - refresh page to see changes');
    } catch (error) {
      setStatus(`❌ Error fixing dates: ${error}`);
    }
  };

  const exportData = () => {
    const data = localStorageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'helpdesk-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('📥 Data exported successfully');
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            localStorageService.importData(e.target?.result as string);
            setStatus('📤 Data imported successfully');
            window.location.reload();
          } catch (error) {
            setStatus(`❌ Import error: ${error}`);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          🧪 Testing Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🧪 Testing Tools
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Test the full functionality with persistent data:
          </div>

          <div className="space-y-2">
            <Button
              onClick={testDataPersistence}
              className="w-full justify-start"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Data Persistence
            </Button>

            <Button
              onClick={clearAllData}
              className="w-full justify-start text-red-600 hover:text-red-700"
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>

            <Button
              onClick={fixCorruptedDates}
              className="w-full justify-start text-orange-600 hover:text-orange-700"
              variant="outline"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Fix Corrupted Dates
            </Button>

            <Button
              onClick={resetToMockData}
              className="w-full justify-start text-blue-600 hover:text-blue-700"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Mock Data
            </Button>

            <Button
              onClick={exportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>

            <Button
              onClick={importData}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>

          {status && (
            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              {status}
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            <strong>Testing Steps:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Create a new ticket</li>
              <li>Edit the ticket details</li>
              <li>Add work log entries</li>
              <li>Change ticket status</li>
              <li>Refresh the page to verify persistence</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
