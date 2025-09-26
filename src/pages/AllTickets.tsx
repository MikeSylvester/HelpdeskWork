import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MessageCircle, Clock, User, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { formatRelativeTime } from '../utils';
import type { Ticket, User as UserType, Category, Priority, TicketStatus } from '../types';

export function AllTickets() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData, usersData, categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getTickets(),
          apiService.getUsers(),
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getTicketStatuses(),
        ]);

        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
        setUsers(usersData);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setStatuses(statusesData);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.statusId === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.categoryId === categoryFilter);
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(ticket => !ticket.assignedToId);
      } else {
        filtered = filtered.filter(ticket => ticket.assignedToId === assigneeFilter);
      }
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, categoryFilter, assigneeFilter]);

  const handleAssignTicket = async (ticketId: string, assigneeId: string) => {
    try {
      await apiService.updateTicket(ticketId, { 
        assignedToId: assigneeId === 'unassign' ? undefined : assigneeId 
      });
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, assignedToId: assigneeId === 'unassign' ? undefined : assigneeId }
          : ticket
      ));
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getCategoryById = (id: string) => categories.find(c => c.id === id);
  const getPriorityById = (id: string) => priorities.find(p => p.id === p.id);
  const getStatusById = (id: string) => statuses.find(s => s.id === id);

  const agents = users.filter(u => u.role === 'agent' || u.role === 'admin');
  const openTickets = filteredTickets.filter(t => !getStatusById(t.statusId)?.isClosed);
  const unassignedTickets = filteredTickets.filter(t => !t.assignedToId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          All Tickets
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage and assign support tickets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tickets
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tickets.length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Open Tickets
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {openTickets.length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unassigned
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {unassignedTickets.length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                My Assigned
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tickets.filter(t => t.assignedToId === user?.id).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.firstName} {agent.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => {
            const category = getCategoryById(ticket.categoryId);
            const priority = getPriorityById(ticket.priorityId);
            const status = getStatusById(ticket.statusId);
            const ticketUser = getUserById(ticket.userId);
            const assignedAgent = ticket.assignedToId ? getUserById(ticket.assignedToId) : null;

            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                      >
                        {ticket.title}
                      </Link>
                      <div className="flex items-center space-x-2">
                        {priority && (
                          <Badge
                            variant={
                              priority.level >= 4 ? 'danger' : 
                              priority.level >= 3 ? 'warning' : 
                              'default'
                            }
                            size="sm"
                          >
                            {priority.name}
                          </Badge>
                        )}
                        {status && (
                          <Badge
                            variant={status.isClosed ? 'success' : 'secondary'}
                            size="sm"
                          >
                            {status.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatRelativeTime(ticket.createdAt)}
                      </div>
                      {ticketUser && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {ticketUser.firstName} {ticketUser.lastName}
                        </div>
                      )}
                      {category && (
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-1" />
                          {category.name}
                        </div>
                      )}
                      {assignedAgent ? (
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Assigned to {assignedAgent.firstName} {assignedAgent.lastName}
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600 dark:text-orange-400">
                          <User className="h-4 w-4 mr-1" />
                          Unassigned
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    {/* Assignment Dropdown */}
                    <select
                      value={ticket.assignedToId || 'unassigned'}
                      onChange={(e) => handleAssignTicket(ticket.id, e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="unassigned">Unassigned</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.firstName} {agent.lastName}
                        </option>
                      ))}
                    </select>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/tickets/${ticket.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tickets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}