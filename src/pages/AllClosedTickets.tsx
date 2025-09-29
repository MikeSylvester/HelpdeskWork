import { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, UserIcon, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TicketCard } from '../components/ui/TicketCard';
import { TicketSorter, SortField } from '../components/ui/TicketSorter';
import { Pagination } from '../components/ui/Pagination';
import { apiService } from '../services/api';
import type { Ticket, User, Category, Priority, TicketStatus } from '../types';

export function AllClosedTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setTicketStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
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
          apiService.getTickets({ page: currentPage, limit: pageSize, closedOnly: true }),
          apiService.getUsers(),
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getTicketStatuses(),
        ]);
        
        setTickets(ticketsResult.tickets);
        setPagination(ticketsResult.pagination);
        setUsers(usersData);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setTicketStatuses(statusesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, pageSize]);

  // Filter for closed tickets only
  const closedTickets = tickets.filter(ticket => 
    ticket.status === 'Resolved' || ticket.status === 'Closed'
  );

  const filteredTickets = closedTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || ticket.status === selectedStatus;
    const matchesPriority = !selectedPriority || ticket.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    if (sortField === 'date') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else if (sortField === 'priority') {
      const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
      aValue = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 5;
      bValue = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 5;
    }
    
    if (aValue === bValue) return 0;
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
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
          closedOnly: true 
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
          All Closed Tickets
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage resolved and closed support tickets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resolved
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {closedTickets.filter(t => t.status === 'Resolved').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                High Priority Closed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {closedTickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
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
              placeholder="Search closed tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

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
                No closed tickets found
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