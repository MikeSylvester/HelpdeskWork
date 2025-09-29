import React from 'react';
import { Clock, User, CheckCircle, AlertCircle, UserPlus, MessageSquare } from 'lucide-react';
import type { TicketUpdate } from '../../types';

interface TimelineProps {
  updates: TicketUpdate[];
}

const Timeline: React.FC<TimelineProps> = ({ updates }) => {
  const getActionIcon = (action: TicketUpdate['action']) => {
    switch (action) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'status_changed':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'assigned':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-red-500" />;
      case 'reopened':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: TicketUpdate['action']) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'status_changed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'assigned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'commented':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reopened':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    
    // After 1 month, show actual date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Group and deduplicate updates
  const processUpdates = (updates: TicketUpdate[]) => {
    const sorted = updates
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const processed: TicketUpdate[] = [];
    const seen = new Set<string>();
    
    for (const update of sorted) {
      // Create a key to identify duplicate actions
      const key = `${update.action}-${update.field}-${update.updatedBy}-${update.timestamp.toDateString()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        processed.push(update);
      }
    }
    
    return processed;
  };

  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="h-8 w-8 mx-auto mb-2" />
        <p>No updates yet</p>
      </div>
    );
  }

  const processedUpdates = processUpdates(updates);

  return (
    <div className="space-y-3">
      {processedUpdates.map((update, index) => (
        <div key={update.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getActionIcon(update.action)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {update.updatedByName}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(update.action)}`}>
                  {update.action.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(update.timestamp)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {update.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;

