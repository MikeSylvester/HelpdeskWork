import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, User, Tag, Paperclip } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { apiService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TicketChat } from './TicketChat';
import { formatDate, formatRelativeTime, hasPermission } from '../../utils';
import type { Ticket, User as UserType, Category, Priority, TicketStatus } from '../../types';

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [ticketData, usersData, categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getTicketById(id),
          apiService.getUsers(),
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getTicketStatuses(),
        ]);

        if (!ticketData) {
          navigate('/tickets');
          return;
        }

        setTicket(ticketData);
        setUsers(usersData);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setStatuses(statusesData);
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        navigate('/tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleStatusChange = async (statusId: string) => {
    if (!ticket) return;
    
    try {
      const updatedTicket = await apiService.updateTicket(ticket.id, { statusId });
      setTicket(updatedTicket);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleAssignmentChange = async (assignedToId: string) => {
    if (!ticket) return;
    
    try {
      const updatedTicket = await apiService.updateTicket(ticket.id, { 
        assignedToId: assignedToId === 'unassign' ? undefined : assignedToId 
      });
      setTicket(updatedTicket);
    } catch (error) {
      console.error('Failed to update ticket assignment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Ticket not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The ticket you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/tickets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
      </div>
    );
  }

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getCategoryById = (id: string) => categories.find(c => c.id === id);
  const getPriorityById = (id: string) => priorities.find(p => p.id === id);
  const getStatusById = (id: string) => statuses.find(s => s.id === id);

  const ticketUser = getUserById(ticket.userId);
  const assignedAgent = ticket.assignedToId ? getUserById(ticket.assignedToId) : null;
  const category = getCategoryById(ticket.categoryId);
  const priority = getPriorityById(ticket.priorityId);
  const status = getStatusById(ticket.statusId);

  const canEdit = hasPermission(user?.role || '', ['agent', 'admin']) || ticket.userId === user?.id;
  const canAssign = hasPermission(user?.role || '', ['agent', 'admin']);
  const agents = users.filter(u => u.role === 'agent' || u.role === 'admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {ticket.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ticket #{ticket.id} • Created {formatRelativeTime(ticket.createdAt)}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {priority && (
                  <Badge
                    variant={
                      priority.level >= 4 ? 'danger' : 
                      priority.level >= 3 ? 'warning' : 
                      'default'
                    }
                  >
                    {priority.name}
                  </Badge>
                )}
                {status && (
                  <Badge variant={status.isClosed ? 'success' : 'secondary'}>
                    {status.name}
                  </Badge>
                )}
                {category && (
                  <Badge variant="default">
                    {category.name}
                  </Badge>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              </div>

              {ticket.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {ticket.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Attachments
                  </h4>
                  <div className="space-y-2">
                    {ticket.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {attachment.fileName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({Math.round(attachment.fileSize / 1024)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Chat */}
          <Card>
            <TicketChat ticketId={ticket.id} ticketUserId={ticket.userId} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ticket Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Submitted by
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {ticketUser ? `${ticketUser.firstName} ${ticketUser.lastName}` : 'Unknown User'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Created
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(ticket.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          {canAssign && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={ticket.statusId}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assigned to
                  </label>
                  <select
                    value={ticket.assignedToId || 'unassign'}
                    onChange={(e) => handleAssignmentChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="unassign">Unassigned</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Assignment Info */}
          {assignedAgent && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Assigned Agent
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {assignedAgent.firstName.charAt(0)}{assignedAgent.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {assignedAgent.firstName} {assignedAgent.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {assignedAgent.role}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}