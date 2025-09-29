import React, { useState } from 'react';
import { X, FileText, Send } from 'lucide-react';
import { Button } from './Button';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import type { WorkLogEntry } from '../../types';

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  onWorkLogAdded: (workLog: WorkLogEntry[]) => void;
  existingWorkLog: WorkLogEntry[];
}

export function WorkLogModal({ 
  isOpen, 
  onClose, 
  ticketId, 
  onWorkLogAdded, 
  existingWorkLog 
}: WorkLogModalProps) {
  const { user } = useAuthStore();
  const [newEntry, setNewEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiService.addTicketWorkLog({
        ticketId,
        userId: user?.id || '',
        content: newEntry.trim(),
        type: 'work_log',
      });

      // Refresh the work log data from the API
      const updatedWorkLog = await apiService.getTicketWorkLog(ticketId);
      onWorkLogAdded(updatedWorkLog);
      setNewEntry('');
      onClose();
    } catch (error) {
      console.error('Failed to add work log entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewEntry('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Work Log Entry
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Existing Work Log */}
          {existingWorkLog.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Previous Work Log Entries
              </h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {existingWorkLog
                  .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                  .map((entry) => (
                    <div key={entry.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {entry.userName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {entry.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* New Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="work-log-entry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Log Entry
              </label>
              <textarea
                id="work-log-entry"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Describe the work performed, actions taken, or notes..."
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white resize-none"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newEntry.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Add Work Log</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
