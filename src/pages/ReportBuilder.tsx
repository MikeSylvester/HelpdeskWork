import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, Users, Tag, AlertCircle, CheckCircle, Clock, BarChart3, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TicketCard } from '../components/ui/TicketCard';
import { Pagination } from '../components/ui/Pagination';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { apiService } from '../services/api';
import type { Ticket, User, Category, Priority, TicketStatus } from '../types';

interface ReportFilters {
  searchTerm: string;
  searchAgent: string;
  status: string[];
  priority: string[];
  category: string[];
  assignedAgent: string[];
  requester: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export function ReportBuilder() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    statuses: string[];
    priorities: string[];
    categories: string[];
    agents: Array<{ id: string; name: string; email: string }>;
    requesters: Array<{ id: string; name: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 25
  });

  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: '',
    searchAgent: '',
    status: [],
    priority: [],
    category: [],
    assignedAgent: [],
    requester: [],
    dateRange: {
      start: '',
      end: ''
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, filterOptionsData] = await Promise.all([
          apiService.getUsers(),
          apiService.getReportFilterOptions(),
        ]);
        setUsers(usersData);
        setFilterOptions(filterOptionsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadData();
  }, []);

  const runReport = async () => {
    setIsLoading(true);
    try {
      const reportFilters: any = {
        page: currentPage,
        limit: pageSize
      };

      // Apply filters
      if (filters.searchTerm) {
        reportFilters.searchTerm = filters.searchTerm;
      }
      if (filters.searchAgent) {
        reportFilters.searchAgent = filters.searchAgent;
      }
      if (filters.status.length > 0) {
        reportFilters.status = filters.status.join(',');
      }
      if (filters.priority.length > 0) {
        reportFilters.priority = filters.priority.join(',');
      }
      if (filters.category.length > 0) {
        reportFilters.category = filters.category.join(',');
      }
      if (filters.assignedAgent.length > 0) {
        reportFilters.assignedAgent = filters.assignedAgent.join(',');
      }
      if (filters.requester.length > 0) {
        reportFilters.requester = filters.requester.join(',');
      }
      if (filters.dateRange.start) {
        reportFilters.startDate = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        reportFilters.endDate = filters.dateRange.end;
      }

      console.log('ReportBuilder: Sending filters to API:', reportFilters);

      const ticketsResult = await apiService.getTickets(reportFilters);
      setTickets(ticketsResult.tickets);
      setPagination(ticketsResult.pagination);
    } catch (error) {
      console.error('Failed to run report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterChange = (filterType: keyof ReportFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterType] as string[];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [filterType]: currentArray.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentArray, value]
        };
      }
    });
  };

  const removeFilter = (filterType: keyof ReportFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterType] as string[];
      return {
        ...prev,
        [filterType]: currentArray.filter(item => item !== value)
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      searchAgent: '',
      status: [],
      priority: [],
      category: [],
      assignedAgent: [],
      requester: [],
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const exportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report with filters:', filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ad-Hoc Report Builder
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Create custom reports with advanced filtering options
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Filters
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
              <Button onClick={runReport} disabled={isLoading}>
                {isLoading ? 'Running...' : 'Run Report'}
              </Button>
            </div>
          </div>

          {/* Search and Date Range Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="h-4 w-4 inline mr-1" />
                Search Tickets
              </label>
              <Input
                placeholder="Search titles, descriptions..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Search Agents
              </label>
              <Input
                placeholder="Search agent names..."
                value={filters.searchAgent}
                onChange={(e) => handleFilterChange('searchAgent', e.target.value)}
                leftIcon={<Users className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                End Date
              </label>
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              />
            </div>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="h-4 w-4 inline mr-1" />
                Status
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleArrayFilterChange('status', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoadingOptions}
              >
                <option value="">Add Status Filter</option>
                {filterOptions?.statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {/* Selected Status Tags */}
              {filters.status.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.status.map(status => (
                    <span
                      key={status}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {status}
                      <button
                        onClick={() => removeFilter('status', status)}
                        className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleArrayFilterChange('priority', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoadingOptions}
              >
                <option value="">Add Priority Filter</option>
                {filterOptions?.priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              {/* Selected Priority Tags */}
              {filters.priority.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.priority.map(priority => (
                    <span
                      key={priority}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                    >
                      {priority}
                      <button
                        onClick={() => removeFilter('priority', priority)}
                        className="ml-1 hover:text-orange-600 dark:hover:text-orange-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="h-4 w-4 inline mr-1" />
                Category
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleArrayFilterChange('category', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoadingOptions}
              >
                <option value="">Add Category Filter</option>
                {filterOptions?.categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {/* Selected Category Tags */}
              {filters.category.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.category.map(category => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                      {category}
                      <button
                        onClick={() => removeFilter('category', category)}
                        className="ml-1 hover:text-green-600 dark:hover:text-green-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

             {/* Assigned Agent Filter */}
             <div>
               <SearchableSelect
                 label={
                   <span className="flex items-center">
                     <Users className="h-4 w-4 inline mr-1" />
                     Assigned Agent
                   </span>
                 }
                 options={filterOptions?.agents || []}
                 selectedValues={filters.assignedAgent}
                 onSelectionChange={(selectedIds) => handleFilterChange('assignedAgent', selectedIds)}
                 placeholder="Search and select agents..."
                 disabled={isLoadingOptions}
                 searchFields={['name', 'email']}
               />
             </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.status.length > 0 || filters.priority.length > 0 || filters.category.length > 0 || filters.assignedAgent.length > 0) && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active Filters:
              </h4>
              <div className="flex flex-wrap gap-2">
                {filters.status.length > 0 && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Status: {filters.status.join(', ')}
                  </span>
                )}
                {filters.priority.length > 0 && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Priority: {filters.priority.join(', ')}
                  </span>
                )}
                {filters.category.length > 0 && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Category: {filters.category.join(', ')}
                  </span>
                )}
                {filters.assignedAgent.length > 0 && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Agents: {filters.assignedAgent.map(id => {
                      const agent = filterOptions?.agents.find(a => a.id === id);
                      return agent ? agent.name : id;
                    }).join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {tickets.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Results ({pagination.totalItems} tickets)
            </h3>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.ticketId}
                ticket={ticket}
                users={users}
                categories={filterOptions?.categories.map(cat => ({ id: cat, name: cat })) || []}
                priorities={filterOptions?.priorities.map(pri => ({ id: pri, name: pri })) || []}
                statuses={filterOptions?.statuses.map(status => ({ id: status, name: status })) || []}
                onClick={() => {
                  // Navigate to ticket details
                  window.location.href = `/tickets/${ticket.ticketId}`;
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          <Card>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              showPageSize={true}
              pageSize={pagination.pageSize}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Card>
        </>
      )}

      {tickets.length === 0 && !isLoading && (
        <Card>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Adjust your filters and run the report to see results
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
