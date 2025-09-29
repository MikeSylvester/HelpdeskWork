import React from 'react';
import { User, Monitor, ArrowUp } from 'lucide-react';
import { cn } from '../../utils';
import { Badge } from './Badge';
import type { Ticket, User as UserType, Category, Priority, TicketStatus } from '../../types';

interface TicketCardProps {
  ticket: Ticket;
  users: UserType[];
  categories: Category[];
  priorities: Priority[];
  statuses: TicketStatus[];
  onClick: () => void;
  className?: string;
}

export function TicketCard({ ticket, users, categories, priorities, statuses, onClick, className }: TicketCardProps) {
  const getUserById = (id: string) => users.find(u => u.id === id);
  const requester = getUserById(ticket.requesterId);
  const assignedAgent = ticket.assignedAgentId ? getUserById(ticket.assignedAgentId) : null;

  // Format date like "Dec 18, 2021, 12:03 AM"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get ticket ID color based on priority - subtle tones for dark mode
  const getTicketIdColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'New':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'in progress':
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'waiting for customer':
      case 'Waiting for Customer':
        return 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300';
      case 'resolved':
      case 'Resolved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'closed':
      case 'Closed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Get priority color for badges
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          {/* Left side - Ticket ID and Title */}
          <div className="flex-1 min-w-0">
            {/* Ticket ID Tag */}
            <div className={cn(
              'inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium mb-2',
              getTicketIdColor(ticket.priority)
            )}>
              {ticket.ticketId}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {ticket.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {ticket.description}
            </p>
          </div>

          {/* Right side - Date */}
          <div className="flex flex-col items-end ml-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(ticket.createdAt)}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex items-center">
          <div className="flex items-center space-x-6 text-sm">
            {/* Assignee */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Assignee</span>
              {assignedAgent ? (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <User className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    {assignedAgent.firstName} {assignedAgent.lastName}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">Unassigned</span>
              )}
            </div>

            {/* Requester */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Requester</span>
              {requester ? (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <User className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    {requester.firstName} {requester.lastName}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">

                  Unknown
                </span>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Status</span>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className={cn('px-2 py-1 rounded text-xs', getStatusColor(ticket.status))}>
                {ticket.status}
              </span>
            </div>

            {/* Priority */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Priority</span>
              <ArrowUp className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              <span className={cn('px-2 py-1 rounded text-xs', getPriorityBadgeColor(ticket.priority))}>
                {ticket.priority}
              </span>
            </div>

            {/* Building location (if available) */}
            {ticket.ticketLocation?.building && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Building</span>
                <Monitor className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-white">
                  {ticket.ticketLocation.building}
                </span>
              </div>
            )}

            {/* Requester location (if available) */}
            {ticket.requesterLocation && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Requester location</span>
                <Monitor className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-white">
                  {ticket.requesterLocation}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}