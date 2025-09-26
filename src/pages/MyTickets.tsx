import React, { useState, useEffect } from 'react';
import { Plus, Eye, MessageCircle, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { QuickFilters } from '../components/ui/QuickFilters';
import { formatRelativeTime, hasPermission } from '../utils';
import type { Ticket, User as UserType, Category, Priority, TicketStatus } from '../types';

export function MyTickets() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData, usersData, categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getTickets({ userId: user?.id }),
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
  }, [user?.id]);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilters.length > 0) {
      filtered = filtered.filter(ticket => {
        return selectedFilters.some(filterId => 
          ticket.statusId === filterId || 
          ticket.categoryId === filterId ||
          ticket.priorityId === filterId
        );
      });
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, selectedFilters]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getCategoryById = (id: string) => categories.find(c => c.id === id);
  const getPriorityById = (id: string) => priorities.find(p => p.id === id);
  const getStatusById = (id: string) => statuses.find(s => s.id === id);

  const openTickets = filteredTickets.filter(t => !getStatusById(t.statusId)?.isClosed);
  const closedTickets = filteredTickets.filter(t => getStatusById(t.statusId)?.isClosed);

  // Create filter options
  const filterOptions = [
    ...statuses.map(status => ({
      id: status.id,
      label: status.name,
      color: status.color,
      count: tickets.filter(t => t.statusId === status.id).length,
    })),
    ...categories.map(category => ({
      id: category.id,
      label: category.name,
      color: category.color,
      count: tickets.filter(t => t.categoryId === category.id).length,
    })),
    ...priorities.map(priority => ({
      id: priority.id,
      label: `${priority.name} Priority`,
      color: priority.color,
      count: tickets.filter(t => t.priorityId === priority.id).length,
    })),
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Tickets
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            View and manage your support tickets
          </p>
        </div>
        {hasPermission(user?.role || '', ['user']) && (
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link to="/submit-ticket">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Ticket className="h-6 w-6 text-blue-600" />
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
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resolved
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {closedTickets.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
          />
          
          <QuickFilters
            options={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearFilters}
          />

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => {
            const category = getCategoryById(ticket.categoryId);
            const priority = getPriorityById(ticket.priorityId);
            const status = getStatusById(ticket.statusId);
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
                      {category && (
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      )}
                      {assignedAgent && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {assignedAgent.firstName} {assignedAgent.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
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
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tickets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || selectedFilters.length > 0
                  ? 'Try adjusting your search or filters'
                  : "You haven't submitted any tickets yet"}
              </p>
              {hasPermission(user?.role || '', ['user']) && (
                <Button asChild>
                  <Link to="/submit-ticket">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First Ticket
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}