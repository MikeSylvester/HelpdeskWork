import { useState, useEffect } from 'react';
import { Ticket, TrendingUp, Clock, Users, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime, hasPermission } from '../utils';
import type { DashboardMetrics, Ticket as TicketType, User, Priority, TicketStatus } from '../types';

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, ticketsData, usersData, prioritiesData, statusesData] = await Promise.all([
          apiService.getDashboardMetrics(),
          apiService.getTickets(user?.roles.includes('user') ? { userId: user.id } : {}),
          apiService.getUsers(),
          apiService.getPriorities(),
          apiService.getTicketStatuses(),
        ]);

        setMetrics(metricsData);
        setRecentTickets(ticketsData.slice(0, 5));
        setUsers(usersData);
        setPriorities(prioritiesData);
        setStatuses(statusesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getUserById = (id: string) => users.find(u => u.id === id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tickets',
      value: metrics?.totalTickets || 0,
      icon: Ticket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Open Tickets',
      value: metrics?.openTickets || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Avg Resolution',
      value: `${metrics?.avgResolutionTime || 0}h`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      show: hasPermission(user?.roles || [], ['admin', 'agent']),
    },
  ].filter(card => card.show !== false);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Here's what's happening with your support desk today.
          </p>
        </div>
        {hasPermission(user?.roles || [], ['user']) && (
          <div className="mt-4 sm:mt-0">
            <Link 
              to="/submit-ticket"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500 px-4 py-2 text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Tickets
            </h2>
            <Link 
              to={user?.roles.includes('user') ? '/tickets' : '/all-tickets'}
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 focus:ring-gray-500 px-3 py-1.5 text-sm"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => {
                const priority = priorities.find(p => p.name.toLowerCase() === ticket.priority);
                const status = statuses.find(s => s.name.toLowerCase() === ticket.status);
                const ticketUser = getUserById(ticket.requesterId);

                return (
                  <div
                    key={ticket.ticketId}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      // Check if user has rights to edit this ticket
                      const canEdit = user?.id === ticket.requesterId || user?.roles.includes('admin') || user?.roles.includes('agent');
                      if (canEdit) {
                        navigate(`/tickets/${ticket.ticketId}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                          {ticket.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {ticketUser && (
                            <span>by {ticketUser.firstName} {ticketUser.lastName}</span>
                          )}
                          <span>•</span>
                          <span>{formatRelativeTime(ticket.createdAt)}</span>
                          {/* Show edit hint if user has rights */}
                          {(user?.id === ticket.requesterId || user?.roles.includes('admin') || user?.roles.includes('agent')) && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 dark:text-orange-400">Click to edit</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
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
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tickets found
              </div>
            )}
          </div>
        </Card>

        {/* All Open and Unassigned Tickets */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Open & Unassigned Tickets
            </h2>
            <Link 
              to="/all-unassigned"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 focus:ring-gray-500 px-3 py-1.5 text-sm"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {(() => {
              // Get open and unassigned tickets
              const openUnassignedTickets = recentTickets.filter(ticket => 
                (ticket.status === 'New' || ticket.status === 'In Progress') &&
                (!ticket.assignedAgentId && (!ticket.assignedAgents || ticket.assignedAgents.length === 0))
              ).slice(0, 5);

              return openUnassignedTickets.length > 0 ? (
                openUnassignedTickets.map((ticket) => {
                  const priority = priorities.find(p => p.name.toLowerCase() === ticket.priority);
                  const status = statuses.find(s => s.name.toLowerCase() === ticket.status);
                  const ticketUser = getUserById(ticket.requesterId);

                  return (
                    <div
                      key={ticket.ticketId}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                            {ticket.title}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {ticketUser && (
                              <span>by {ticketUser.firstName} {ticketUser.lastName}</span>
                            )}
                            <span>•</span>
                            <span>{formatRelativeTime(ticket.createdAt)}</span>
                            <span>•</span>
                            <span className="text-orange-600 dark:text-orange-400">Unassigned</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
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
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Ticket className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No unassigned tickets</p>
                  <p className="text-sm">All tickets have been assigned</p>
                </div>
              );
            })()}
          </div>
        </Card>
      </div>

      {/* Ticket Trends Chart (Placeholder) */}
      {hasPermission(user?.roles || [], ['agent', 'admin']) && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ticket Trends
          </h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Chart component would go here
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Integration with charting library pending
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}