import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard as Edit, Clock, User, Paperclip, XCircle, CheckCircle, UserCheck, MessageSquare, FileText, X, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { apiService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import Timeline from '../../components/ui/Timeline';
import { TicketChat } from './TicketChat';
import { WorkLogModal } from '../../components/ui/WorkLogModal';
import { formatDate, formatRelativeTime, hasPermission } from '../../utils';
import type { Ticket, User as UserType, Category, Priority, TicketStatus, WorkLogEntry } from '../../types';

interface TicketDetailsProps {
  ticketId: string;
}

export function TicketDetails({ ticketId }: TicketDetailsProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    subCategoryId: '',
    priority: '',
    status: '',
    assignedAgentId: '',
    assignedAgents: [] as Array<{ id: string; firstName: string; lastName: string; email: string }>,
    escalationLevel: 'tier 1' as 'tier 1' | 'tier 2' | 'tier 3',
    ticketLocation: {
      building: '',
      floor: '',
      room: '',
      desk: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    } as {
      building?: string;
      floor?: string;
      room?: string;
      desk?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    },
  });

  const [assignedAgents, setAssignedAgents] = useState<string[]>([]);

  const [editAdditionalContacts, setEditAdditionalContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [showAssignmentDropdown, setShowAssignmentDropdown] = useState(false);
  const assignmentRef = useRef<HTMLDivElement>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: string;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const assignRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'conversation' | 'worklog' | 'timeline'>('conversation');

  useEffect(() => {
    const fetchData = async () => {
      if (!ticketId) return;
      
      try {
        const [ticketData, usersData, categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getTicketById(ticketId),
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
  }, [ticketId, navigate]);

  // Handle click outside assignment dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignmentRef.current && !assignmentRef.current.contains(event.target as Node)) {
        setShowAssignmentDropdown(false);
      }
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setShowContactDropdown(false);
      }
      if (assignRef.current && !assignRef.current.contains(event.target as Node)) {
        setShowAssignDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Populate edit form when ticket data is loaded
  useEffect(() => {
    if (ticket) {
      setEditForm({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        subCategoryId: ticket.subCategoryId || '',
        priority: ticket.priority,
        status: ticket.status,
        assignedAgentId: ticket.assignedAgentId || '',
        assignedAgents: ticket.assignedAgents ? ticket.assignedAgents.map(id => {
          const user = users.find(u => u.id === id);
          return user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null;
        }).filter(Boolean) as Array<{ id: string; firstName: string; lastName: string; email: string }> : [],
        escalationLevel: ticket.escalationLevel,
        ticketLocation: ticket.ticketLocation || {
          building: '',
          floor: '',
          room: '',
          desk: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        } as {
          building?: string;
          floor?: string;
          room?: string;
          desk?: string;
          address?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          country?: string;
        }
      });
      setEditAdditionalContacts(ticket.additionalContacts?.map(contact => {
        const user = users.find(u => u.email === contact.email);
        return user?.id || '';
      }).filter(Boolean) || []);
      // Initialize assignedAgents from assignedAgentId if no assignedAgents array exists
      setAssignedAgents(ticket.assignedAgents || (ticket.assignedAgentId ? [ticket.assignedAgentId] : []));
    }
  }, [ticket, users]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (editForm.category) {
      const selectedCategory = categories.find(c => c.name === editForm.category);
      const hasSubCategory = selectedCategory?.subCategories?.find(sc => sc.id === editForm.subCategoryId);
      if (!hasSubCategory) {
        setEditForm(prev => ({ ...prev, subCategoryId: '' }));
      }
    }
  }, [editForm.category, categories]);



  const handleSaveEdit = async () => {
    if (!ticket) return;
    
    try {
      const updatedTicket = await apiService.updateTicket(ticket.ticketId, { 
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        subCategoryId: editForm.subCategoryId,
        subCategory: categories.find(c => c.name === editForm.category)?.subCategories?.find(sc => sc.id === editForm.subCategoryId)?.name,
        priority: editForm.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: editForm.status as 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Waiting for Customer',
        assignedAgentId: editForm.assignedAgentId || undefined,
        assignedAgents: assignedAgents.length > 0 ? assignedAgents : undefined,
        assignedAgentNames: assignedAgents.length > 0 ? assignedAgents.map(id => {
          const user = users.find(u => u.id === id);
          return user?.displayName || `${user?.firstName} ${user?.lastName}`;
        }).filter(Boolean) : undefined,
        escalationLevel: editForm.escalationLevel,
        ticketLocation: Object.values(editForm.ticketLocation).some(value => value.trim()) ? editForm.ticketLocation : undefined,
        additionalContacts: editAdditionalContacts.length > 0 ? editAdditionalContacts.map(userId => {
          const contactUser = users.find(u => u.id === userId);
          return {
            name: contactUser?.displayName || `${contactUser?.firstName} ${contactUser?.lastName}`,
            email: contactUser?.email || '',
            phone: contactUser?.phoneNumber,
            role: 'Additional Contact'
          };
        }) : undefined
      }, user?.id || '');
      setTicket(updatedTicket);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const handleCancelEdit = () => {
    if (ticket) {
      setEditForm({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        subCategoryId: ticket.subCategoryId || '',
        priority: ticket.priority,
        status: ticket.status,
        assignedAgentId: ticket.assignedAgentId || '',
        assignedAgents: ticket.assignedAgents ? ticket.assignedAgents.map(id => {
          const user = users.find(u => u.id === id);
          return user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null;
        }).filter(Boolean) as Array<{ id: string; firstName: string; lastName: string; email: string }> : [],
        escalationLevel: ticket.escalationLevel,
        ticketLocation: ticket.ticketLocation || {
          building: '',
          floor: '',
          room: '',
          desk: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        } as {
          building?: string;
          floor?: string;
          room?: string;
          desk?: string;
          address?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          country?: string;
        }
      });
      setEditAdditionalContacts(ticket.additionalContacts?.map(contact => {
        const user = users.find(u => u.email === contact.email);
        return user?.id || '';
      }).filter(Boolean) || []);
      // Initialize assignedAgents from assignedAgentId if no assignedAgents array exists
      setAssignedAgents(ticket.assignedAgents || (ticket.assignedAgentId ? [ticket.assignedAgentId] : []));
    }
    setIsEditing(false);
    setAssignmentSearch('');
    setShowAssignmentDropdown(false);
  };

  const handleAssignUser = (userId: string) => {
    if (!assignedAgents.includes(userId)) {
      setAssignedAgents(prev => [...prev, userId]);
      // Update the primary assigned agent to the first one in the list
      const selectedUser = users.find(u => u.id === userId);
      setEditForm(prev => ({ 
        ...prev, 
        assignedAgentId: userId,
        assignedAgent: selectedUser?.displayName || `${selectedUser?.firstName} ${selectedUser?.lastName}`
      }));
    }
    setAssignmentSearch('');
    setShowAssignmentDropdown(false);
  };

  const handleUnassign = (userId?: string) => {
    if (userId) {
      setAssignedAgents(prev => prev.filter(id => id !== userId));
      // If removing the primary agent, set a new primary from remaining agents
      if (editForm.assignedAgentId === userId) {
        const remainingAgents = assignedAgents.filter(id => id !== userId);
        if (remainingAgents.length > 0) {
          const newPrimaryUser = users.find(u => u.id === remainingAgents[0]);
      setEditForm(prev => ({ 
        ...prev, 
            assignedAgentId: remainingAgents[0],
            assignedAgent: newPrimaryUser?.displayName || `${newPrimaryUser?.firstName} ${newPrimaryUser?.lastName}`
          }));
        } else {
          setEditForm(prev => ({ 
            ...prev, 
            assignedAgentId: '',
            assignedAgent: undefined
          }));
        }
      }
    } else {
      // Remove all assignments
      setAssignedAgents([]);
      setEditForm(prev => ({ 
        ...prev, 
        assignedAgentId: '',
        assignedAgent: undefined
      }));
    }
    setAssignmentSearch('');
    setShowAssignmentDropdown(false);
  };

  const handleAddContact = (userId: string) => {
    if (!editAdditionalContacts.includes(userId)) {
      setEditAdditionalContacts(prev => [...prev, userId]);
    }
    setContactSearch('');
    setShowContactDropdown(false);
  };

  const handleRemoveContact = (userId: string) => {
    setEditAdditionalContacts(prev => prev.filter(id => id !== userId));
  };



  // Quick action handlers
  const handleQuickAction = async (action: string) => {
    if (!ticket) return;

    const actionConfigs = {
      'waiting-customer': {
        title: 'Set to Waiting for Customer',
        message: 'Are you sure you want to set this ticket to "Waiting for Customer" status?',
        onConfirm: async () => {
          try {
            const updatedTicket = await apiService.updateTicket(ticket.ticketId, { status: 'In Progress' }, user?.id || '');
            setTicket(updatedTicket);
          } catch (error) {
            console.error('Failed to update ticket status:', error);
          }
        }
      },
      'complete': {
        title: 'Complete Ticket',
        message: 'Are you sure you want to complete this ticket? You will need to provide resolution details.',
        onConfirm: () => {
          setPendingStatusId('resolved');
          setResolutionNotes(ticket.resolution || '');
          setShowResolutionModal(true);
        }
      },
      'assign-me': {
        title: 'Assign to Me',
        message: `Are you sure you want to assign this ticket to yourself (${user?.displayName})?`,
        onConfirm: async () => {
          try {
            const updatedTicket = await apiService.updateTicket(ticket.ticketId, { 
              assignedAgentId: user?.id, 
              assignedAgent: user?.displayName 
            }, user?.id || '');
        setTicket(updatedTicket);
          } catch (error) {
            console.error('Failed to assign ticket:', error);
          }
        }
      },
      'in-progress': {
        title: 'Set to In Progress',
        message: 'Are you sure you want to set this ticket to "In Progress" status?',
        onConfirm: async () => {
          try {
            const updatedTicket = await apiService.updateTicket(ticket.ticketId, { status: 'open' }, user?.id || '');
            setTicket(updatedTicket);
    } catch (error) {
            console.error('Failed to update ticket status:', error);
          }
        }
      },
      'assign-other': {
        title: 'Assign to Someone Else',
        message: 'Select a user to assign this ticket to.',
        onConfirm: () => {
          setShowAssignModal(true);
        }
      },
      'escalate': {
        title: 'Escalate Ticket',
        message: 'Are you sure you want to escalate this ticket?',
        onConfirm: () => {
          setShowEscalateModal(true);
        }
      }
    };

    const config = actionConfigs[action as keyof typeof actionConfigs];
    if (config) {
      setConfirmAction({
        action,
        title: config.title,
        message: config.message,
        onConfirm: config.onConfirm
      });
      setShowConfirmModal(true);
    }
  };

  const handleCompleteWithResolution = async () => {
    if (!ticket || !pendingStatusId) return;

    try {
      const updatedTicket = await apiService.updateTicket(ticket.ticketId, {
        status: pendingStatusId as 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Waiting for Customer',
        resolution: resolutionNotes,
        resolvedAt: new Date()
      }, user?.id || '');
      setTicket(updatedTicket);
      
      // Update edit form if we're in edit mode
      if (isEditing) {
        setEditForm(prev => ({ ...prev, status: pendingStatusId }));
      }
      
      setShowResolutionModal(false);
      setResolutionNotes('');
      setPendingStatusId(null);
    } catch (error) {
      console.error('Failed to complete ticket:', error);
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
  const assignedAgentsList = ticket.assignedAgents?.map(id => getUserById(id)).filter(Boolean) || 
    (ticket.assignedAgentId ? [getUserById(ticket.assignedAgentId)].filter(Boolean) : []);
  const category = categories.find(c => c.name === ticket.category);
  const priority = priorities.find(p => p.name.toLowerCase() === ticket.priority);
  const status = statuses.find(s => s.name.toLowerCase() === ticket.status);

  const canEdit = hasPermission(user?.roles || [], ['agent', 'admin']);
  const canAssign = hasPermission(user?.roles || [], ['agent', 'admin']);
  const agents = users.filter(u => u.roles.includes('agent') || u.roles.includes('admin'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {ticket.title}
            </h1>
              <div className="flex items-center space-x-2">
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
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Ticket #{ticket.ticketId} • Created {formatRelativeTime(ticket.createdAt)}
            </p>
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  {/* Edit Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sub Category
                      </label>
                      <select
                        value={editForm.subCategoryId}
                        onChange={(e) => setEditForm(prev => ({ ...prev, subCategoryId: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={!editForm.category}
                      >
                        <option value="">Select a sub category...</option>
                        {editForm.category && categories.find(c => c.name === editForm.category)?.subCategories?.map(subCategory => (
                          <option key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </option>
                        ))}
                      </select>
                    </div>

                  {canEdit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {priorities.map(priority => (
                          <option key={priority.id} value={priority.name.toLowerCase()}>
                            {priority.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {canEdit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          
                          if (newStatus === 'resolved' || newStatus === 'closed') {
                            // If changing to closed status, show resolution modal
                            setPendingStatusId(newStatus);
                            setResolutionNotes(ticket?.resolution || '');
                            setShowResolutionModal(true);
                          } else {
                            // If not closed, update form normally
                            setEditForm(prev => ({ ...prev, status: newStatus as 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Waiting for Customer' }));
                          }
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {statuses.map(status => (
                          <option key={status.id} value={status.name.toLowerCase()}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  </div>

                  {canAssign && (
                    <div className="relative" ref={assignmentRef}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assign to
                      </label>
                      
                      {/* Current Assignment Display */}
                      {assignedAgents.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {assignedAgents.map((agentId) => {
                            const agent = users.find(u => u.id === agentId);
                            return (
                              <div key={agentId} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                      {agent?.firstName.charAt(0)}{agent?.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {agent?.firstName} {agent?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {agent?.email}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                  onClick={() => handleUnassign(agentId)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Assignment Search Input */}
                      <div className="relative" ref={assignmentRef}>
                          <input
                            type="text"
                            placeholder="Search agents to assign..."
                            value={assignmentSearch}
                            onChange={(e) => {
                              setAssignmentSearch(e.target.value);
                              setShowAssignmentDropdown(true);
                            }}
                            onFocus={() => setShowAssignmentDropdown(true)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          
                          {/* Assignment Dropdown */}
                          {showAssignmentDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {agents
                              .filter(agent => 
                                !assignedAgents.includes(agent.id) &&
                                (agent.firstName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                                 agent.lastName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                                 agent.email.toLowerCase().includes(assignmentSearch.toLowerCase()))
                              )
                              .map(agent => (
                                  <button
                                    key={agent.id}
                                    type="button"
                                    onClick={() => handleAssignUser(agent.id)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                                  >
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-sm font-medium">
                                        {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {agent.firstName} {agent.lastName}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {agent.email} • {agent.roles.join(', ')}
                                      </p>
                                    </div>
                                  </button>
                              ))}
                            {agents.filter(agent => 
                              !assignedAgents.includes(agent.id) &&
                              (agent.firstName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                               agent.lastName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                               agent.email.toLowerCase().includes(assignmentSearch.toLowerCase()))
                            ).length === 0 && (
                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                No available agents found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                    </div>
                  )}

                  {/* Tags Section */}

                  {/* Ticket Location */}
                  {canEdit && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ticket Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Building</label>
                        <input
                          type="text"
                          value={editForm.ticketLocation.building}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            ticketLocation: { ...prev.ticketLocation, building: e.target.value }
                          }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Building name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Floor</label>
                        <input
                          type="text"
                          value={editForm.ticketLocation.floor}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            ticketLocation: { ...prev.ticketLocation, floor: e.target.value }
                          }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Floor number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Room</label>
                        <input
                          type="text"
                          value={editForm.ticketLocation.room}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            ticketLocation: { ...prev.ticketLocation, room: e.target.value }
                          }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Room number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Desk/Workstation</label>
                        <input
                          type="text"
                          value={editForm.ticketLocation.desk}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            ticketLocation: { ...prev.ticketLocation, desk: e.target.value }
                          }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Desk number"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Escalation Level - Admin Only */}
                  {hasPermission(user?.roles || [], ['admin']) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Escalation Level
                    </label>
                      <select
                        value={editForm.escalationLevel}
                        onChange={(e) => setEditForm(prev => ({ ...prev, escalationLevel: e.target.value as 'tier 1' | 'tier 2' | 'tier 3' }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="tier 1">Tier 1 - Basic Support</option>
                        <option value="tier 2">Tier 2 - Advanced Support</option>
                        <option value="tier 3">Tier 3 - Expert Support</option>
                      </select>
                    </div>
                  )}


                  {/* Additional Contacts */}
                  {canEdit && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Contacts
                    </label>
                    <div className="space-y-3">
                      {editAdditionalContacts.map((userId) => {
                        const contactUser = users.find(u => u.id === userId);
                        return (
                          <div key={userId} className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {contactUser?.firstName.charAt(0)}{contactUser?.lastName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {contactUser?.displayName || `${contactUser?.firstName} ${contactUser?.lastName}`}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {contactUser?.email}
                                </p>
                              </div>
                            </div>
                              <button
                                type="button"
                              onClick={() => handleRemoveContact(userId)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                              <X className="h-4 w-4" />
                              </button>
                        </div>
                        );
                      })}
                      
                      {/* Add Contact Search */}
                      <div className="relative" ref={contactRef}>
                        <input
                          type="text"
                          placeholder="Search users to add as additional contacts..."
                          value={contactSearch}
                          onChange={(e) => {
                            setContactSearch(e.target.value);
                            setShowContactDropdown(true);
                          }}
                          onFocus={() => setShowContactDropdown(true)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        
                        {showContactDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {users
                              .filter(u => 
                                u.id !== user?.id && 
                                !editAdditionalContacts.includes(u.id) &&
                                (u.displayName?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                                 u.firstName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                                 u.lastName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                                 u.email.toLowerCase().includes(contactSearch.toLowerCase()))
                              )
                              .map(userOption => (
                                <button
                                  key={userOption.id}
                          type="button"
                                  onClick={() => handleAddContact(userOption.id)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                                >
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                      {userOption.firstName.charAt(0)}{userOption.lastName.charAt(0)}
                                    </span>
                      </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {userOption.displayName || `${userOption.firstName} ${userOption.lastName}`}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {userOption.email}
                                    </p>
                    </div>
                                </button>
                              ))}
                            {users.filter(u => 
                              u.id !== user?.id && 
                              !editAdditionalContacts.includes(u.id) &&
                              (u.displayName?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                               u.firstName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                               u.lastName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                               u.email.toLowerCase().includes(contactSearch.toLowerCase()))
                            ).length === 0 && (
                              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                No users found
                  </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}
                </>
              ) : (
                <>
                  {/* View Mode */}
                  {!canEdit && ticket.requesterId === user?.id && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> You can view your ticket details, but only support agents and administrators can modify the status, priority, or assignment of tickets.
                      </p>
                    </div>
                  )}
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

                  {/* Ticket Details - Improved Layout */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Ticket Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</span>
                          <Badge variant="default" className="text-xs">{ticket.category}</Badge>
                        </div>
                        {ticket.subCategory && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sub Category</span>
                            <Badge variant="secondary" className="text-xs">{ticket.subCategory}</Badge>
                          </div>
                        )}
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority</span>
                          <Badge 
                            variant={ticket.priority === 'urgent' ? 'danger' : ticket.priority === 'high' ? 'warning' : 'default'}
                            className="text-xs capitalize"
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                          <Badge 
                            variant={status?.isClosed ? 'success' : 'secondary'}
                            className="text-xs capitalize"
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Escalation</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{ticket.escalationLevel}</span>
                        </div>
                        {ticket.ticketLocation && Object.values(ticket.ticketLocation).some(value => value?.trim()) && (
                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Ticket Location</span>
                            <div className="space-y-1">
                              {ticket.ticketLocation.building && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Building:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{ticket.ticketLocation.building}</span>
                        </div>
                        )}
                              {ticket.ticketLocation.floor && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Floor:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{ticket.ticketLocation.floor}</span>
                          </div>
                        )}
                              {ticket.ticketLocation.room && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Room:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{ticket.ticketLocation.room}</span>
                                </div>
                              )}
                              {ticket.ticketLocation.desk && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Desk:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{ticket.ticketLocation.desk}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {ticket.resolvedAt && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</span>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{formatDate(ticket.resolvedAt)}</span>
                          </div>
                        )}
                        {ticket.closedAt && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed</span>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{formatDate(ticket.closedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </>
              )}

              {/* Tags functionality removed - using subCategory instead */}

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

          {/* Tabbed Interface */}
          <Card>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'conversation'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Conversation
                </button>
                <button
                  onClick={() => setActiveTab('worklog')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'worklog'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Work Log
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'timeline'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Clock className="h-4 w-4 inline mr-2" />
                  Timeline
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'conversation' && (
                <div className="h-96">
                  <TicketChat 
                    ticketId={ticket.ticketId} 
                    ticketUserId={ticket.requesterId}
                  />
                </div>
              )}
              
              {activeTab === 'worklog' && (
                <div className="h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Work Log
                    </h3>
                    {hasPermission(user?.roles || [], ['agent', 'admin']) && (
                      <Button
                        onClick={() => setShowWorkLogModal(true)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {ticket.workLog && ticket.workLog.length > 0 ? (
                      <div className="space-y-3">
                        {ticket.workLog
                          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                          .map((entry) => (
                            <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {entry.userName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatRelativeTime(entry.timestamp)}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {entry.content}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        <p>No work log entries yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'timeline' && (
                <div className="h-96 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex-shrink-0">
                    Timeline
                  </h3>
                  <div className="flex-1 overflow-y-auto">
                    <Timeline updates={ticket.updateHistory || []} />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions & Edit */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h3>
            <div className="space-y-4">
              {/* Quick Actions */}
              {canAssign && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('in-progress')}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Clock className="h-4 w-4" />
                      <span>In Progress</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('waiting')}
                      className="flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Waiting</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('assign-me')}
                      className="flex items-center justify-center space-x-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Assign to Me</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('complete')}
                      className="flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('assign-other')}
                      className="flex items-center justify-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Assign Other</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('escalate')}
                      className="flex items-center justify-center space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Escalate</span>
                    </Button>
                  </div>
                  
                </div>
              )}
              
              {/* Edit Button */}
              {canEdit && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Edit Ticket
                  </h4>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Button onClick={handleSaveEdit} className="w-full">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="w-full">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Ticket
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
          
          {/* Assigned Agents */}
          {assignedAgentsList.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Assigned Agent{assignedAgentsList.length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-3">
                {assignedAgentsList.map((agent) => (
                  <div key={agent?.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {agent?.firstName.charAt(0)}{agent?.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent?.firstName} {agent?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {agent?.roles.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Requester Information
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterName}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterEmail}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterPhone}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterDepartment}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Job Title</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterJobTitle}</span>
                  </div>
                  {ticket.requesterManager && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Manager</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterManager}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>


          {/* Resolution Info */}
          {ticket.resolution && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resolution
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resolution Notes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {ticket.resolution}
                  </p>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Resolved {formatRelativeTime(ticket.resolvedAt)}</span>
                </div>
                )}
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {pendingStatusId === '4' ? 'Complete Ticket' : 'Close Ticket'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe how the issue was resolved..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleCompleteWithResolution}
                  className="flex-1"
                >
                  {pendingStatusId === '4' ? 'Complete Ticket' : 'Close Ticket'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResolutionModal(false);
                    setResolutionNotes('');
                    setPendingStatusId(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {confirmAction.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {confirmAction.message}
            </p>
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  confirmAction.onConfirm();
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Work Log Modal */}
      {showWorkLogModal && ticket && (
        <WorkLogModal
          isOpen={showWorkLogModal}
          onClose={() => setShowWorkLogModal(false)}
          ticketId={ticket.ticketId}
          onWorkLogAdded={(workLog: WorkLogEntry[]) => {
            setTicket(prev => prev ? { ...prev, workLog } : null);
          }}
          existingWorkLog={ticket.workLog || []}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && ticket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assign Ticket to Users
            </h3>
            
            <div className="space-y-4">
              {/* Current Assigned Users */}
              {assignedAgentsList.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Currently Assigned:</p>
                  <div className="space-y-2">
                        {assignedAgentsList.map((agent) => (
                          <div key={agent?.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {agent?.firstName?.[0]}{agent?.lastName?.[0]}
                                </span>
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {agent?.firstName} {agent?.lastName}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedAgents = assignedAgentsList
                                  .filter(a => a?.id !== agent?.id)
                                  .filter(Boolean)
                                  .map(user => ({ id: user!.id, firstName: user!.firstName, lastName: user!.lastName, email: user!.email }));
                                setEditForm(prev => ({ ...prev, assignedAgents: updatedAgents }));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                  </div>
                </div>
              )}

              {/* Add New Users */}
              <div className="relative" ref={assignRef}>
                <Input
                  type="text"
                  placeholder="Search users to assign..."
                  value={assignSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAssignSearch(e.target.value);
                    setShowAssignDropdown(true);
                  }}
                  onFocus={() => setShowAssignDropdown(true)}
                  className="w-full"
                />
                {showAssignDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {users
                          .filter(u => 
                            !assignedAgentsList.some(a => a?.id === u.id) &&
                            (u.displayName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                             u.email.toLowerCase().includes(assignSearch.toLowerCase()))
                          )
                      .map(user => (
                        <div
                          key={user.id}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-3"
                          onClick={() => {
                            const newAgent = { 
                              id: user.id, 
                              firstName: user.firstName, 
                              lastName: user.lastName, 
                              email: user.email 
                            };
                            setEditForm(prev => ({ 
                              ...prev, 
                              assignedAgents: [...(prev.assignedAgents || []), newAgent] 
                            }));
                            setAssignSearch('');
                            setShowAssignDropdown(false);
                          }}
                        >
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    {users.filter(u => 
                      !assignedAgentsList.some(a => a?.id === u.id) &&
                      (u.displayName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                       u.email.toLowerCase().includes(assignSearch.toLowerCase()))
                    ).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No users found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignSearch('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const updatedTicket = await apiService.updateTicket(ticket.ticketId, {
                      assignedAgents: editForm.assignedAgents.map(agent => agent.id)
                    }, user?.id || '');
                    setTicket(updatedTicket);
                    setShowAssignModal(false);
                    setAssignSearch('');
                  } catch (error) {
                    console.error('Failed to assign ticket:', error);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && ticket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Escalate Ticket
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Current escalation level: <span className="font-medium capitalize">{ticket.escalationLevel}</span>
            </p>
            
            <div className="space-y-6">
              {/* Escalation Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Escalation Level
                </label>
                <select
                  value={editForm.escalationLevel}
                  onChange={(e) => setEditForm(prev => ({ ...prev, escalationLevel: e.target.value as 'tier 1' | 'tier 2' | 'tier 3' }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="tier 1">Tier 1</option>
                  <option value="tier 2">Tier 2</option>
                  <option value="tier 3">Tier 3</option>
                </select>
              </div>

              {/* Agent Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign Agents
                </label>
                <div className="space-y-3">
                  {/* Current Assigned Agents */}
                  {editForm.assignedAgents.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Currently Assigned:</p>
                      <div className="space-y-2">
                        {editForm.assignedAgents.map((agent) => (
                          <div key={agent?.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {agent?.firstName?.[0]}{agent?.lastName?.[0]}
                                </span>
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {agent?.firstName} {agent?.lastName}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedAgents = editForm.assignedAgents.filter(a => a?.id !== agent?.id);
                                setEditForm(prev => ({ ...prev, assignedAgents: updatedAgents }));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Agent */}
                  <div className="relative" ref={assignRef}>
                    <input
                      type="text"
                      placeholder="Search agents to assign..."
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                      onFocus={() => setShowAssignDropdown(true)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                    {showAssignDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {users
                          .filter(u => 
                            (u.roles.includes('agent') || u.roles.includes('admin')) &&
                            !editForm.assignedAgents.some(a => a?.id === u.id) &&
                            (u.firstName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                             u.lastName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                             u.email.toLowerCase().includes(assignSearch.toLowerCase()))
                          )
                          .map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                const newAgent = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email };
                                setEditForm(prev => ({ 
                                  ...prev, 
                                  assignedAgents: [...(prev.assignedAgents || []), newAgent] 
                                }));
                                setAssignSearch('');
                                setShowAssignDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                              </div>
                            </button>
                          ))}
                        {users.filter(u => 
                          (u.roles.includes('agent') || u.roles.includes('admin')) &&
                          !assignedAgentsList.some(a => a?.id === u.id) &&
                          (u.firstName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                           u.lastName.toLowerCase().includes(assignSearch.toLowerCase()) ||
                           u.email.toLowerCase().includes(assignSearch.toLowerCase()))
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No agents found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const updatedTicket = await apiService.updateTicket(ticket.ticketId, {
                      escalationLevel: editForm.escalationLevel,
                      assignedAgents: editForm.assignedAgents.map(agent => agent.id)
                    }, user?.id || '');
                    setTicket(updatedTicket);
                    setShowEscalateModal(false);
                  } catch (error) {
                    console.error('Failed to escalate ticket:', error);
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Update Escalation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}