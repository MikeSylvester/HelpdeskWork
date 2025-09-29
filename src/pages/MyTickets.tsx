import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MessageCircle, Clock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { TicketCard } from '../components/ui/TicketCard';
import { Pagination } from '../components/ui/Pagination';
import { formatRelativeTime } from '../utils';
import type { Ticket, User as UserType, Category, Priority, TicketStatus } from '../types';

export function MyTickets() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [ticketsResult, categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getTickets({ userId: user.id, page: currentPage, limit: pageSize }),
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getTicketStatuses(),
        ]);
        setTickets(ticketsResult.tickets);
        setFilteredTickets(ticketsResult.tickets);
        setPagination(ticketsResult.pagination);
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
  }, [user, currentPage, pageSize]);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'open') {
        filtered = filtered.filter(ticket => 
          ticket.status === 'New' || 
          ticket.status === 'In Progress' || 
          ticket.status === 'Waiting for Customer'
        );
      } else {
        filtered = filtered.filter(ticket => ticket.statusId === statusFilter);
      }
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.categoryId === categoryFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, categoryFilter]);

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
          userId: user?.id,
          page: 1, 
          limit: newPageSize
        });
        setTickets(ticketsResult.tickets);
        setFilteredTickets(ticketsResult.tickets);
        setPagination(ticketsResult.pagination);
      } catch (error) {
        console.error('Failed to refetch tickets:', error);
      }
    };
    
    refetchData();
  };

  const getCategoryById = (id: string) => categories.find(c => c.id === id);
  const getPriorityById = (id: string) => priorities.find(p => p.id === id);
  const getStatusById = (id: string) => statuses.find(s => s.id === id);

  const openTickets = filteredTickets.filter(t => 
    t.status === 'New' || 
    t.status === 'In Progress' || 
    t.status === 'Waiting for Customer'
  );
  const closedTickets = filteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');

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

  // Debug: Show what we have
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            No user found
          </h3>
          <p className="text-red-600 dark:text-red-400">
            Please log in to view your tickets. If you just logged in, try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Tickets
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            View and manage your support tickets
          </p>
        </div>
        <Button
          onClick={() => navigate('/submit-ticket')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Closed Tickets
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
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search your tickets..."
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
              <option value="open">Open Tickets</option>
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
              users={[]}
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
                No tickets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "You haven't submitted any tickets yet"
                }
              </p>
              {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                <Button asChild>
                  <Link to="/submit-ticket">
                    Submit Your First Ticket
                  </Link>
                </Button>
              )}
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
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </Card>
    </div>
  );
}