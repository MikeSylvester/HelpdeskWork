import React, { useState, useEffect } from 'react';
import { Search, Clock, Star, User as UserIcon, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TicketCard } from '../components/ui/TicketCard';
import { TicketSorter, SortField } from '../components/ui/TicketSorter';
import { Pagination } from '../components/ui/Pagination';
import { apiService } from '../services/api';
import { formatDate, formatRelativeTime } from '../utils';
import type { Ticket, User, Category, Priority, TicketStatus } from '../types';

export function AllOpenTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setTicketStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ticketsResult, usersData, categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getTickets({ 
            page: currentPage, 
            limit: pageSize, 
            openOnly: true,
            priority: selectedPriority || undefined,
            category: selectedCategory || undefined
          }),
          apiService.getUsers(),
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getTicketStatuses(),
        ]);
        
        setTickets(ticketsResult.tickets);
        setUsers(usersData);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setTicketStatuses(statusesData);
        setPagination(ticketsResult.pagination);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, pageSize]);

  // Refetch when filters change
  useEffect(() => {
    const refetchData = async () => {
      try {
        setIsLoading(true);
        const ticketsResult = await apiService.getTickets({ 
          page: currentPage, 
          limit: pageSize, 
          openOnly: true,
          priority: selectedPriority || undefined,
          category: selectedCategory || undefined
        });
        setTickets(ticketsResult.tickets);
        setPagination(ticketsResult.pagination);
      } catch (error) {
        console.error('Failed to refetch tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedPriority || selectedCategory) {
      refetchData();
    }
  }, [selectedPriority, selectedCategory, currentPage, pageSize]);

  // Refetch when search changes (reset to page 1)
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const getUserById = (id: string) => users.find(u => u.id === id);


  // Client-side filtering only for search (API handles priority and category filtering)
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleSortChange = (field: SortField, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to page 1 when sorting changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to page 1 when changing page size
    
    // Immediately refetch with new page size
    const refetchData = async () => {
      try {
        const ticketsResult = await apiService.getTickets({ 
          page: 1, 
          limit: newPageSize, 
          openOnly: true,
          priority: selectedPriority || undefined,
          category: selectedCategory || undefined
        });
        setTickets(ticketsResult.tickets);
        setPagination(ticketsResult.pagination);
      } catch (error) {
        console.error('Failed to refetch tickets:', error);
      }
    };
    
    refetchData();
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
          All Open Tickets
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage open support tickets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {pagination.totalItems}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <Star className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                High Priority
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Assigned
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tickets.filter(t => t.assignedAgentId).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Sorting */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search open tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.id} value={priority.name.toLowerCase()}>
                  {priority.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <TicketSorter 
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              compact={true}
            />
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              users={users}
              categories={categories}
              priorities={priorities}
              statuses={statuses}
              onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
            />
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No open tickets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Pagination */}
      <Card>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          showPageSize={true}
          pageSize={pagination.pageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Card>
    </div>
  );
}
