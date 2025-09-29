import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Download, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatDate } from '../utils';
import type { DashboardMetrics, Category } from '../types';

export function Reports() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, categoriesData] = await Promise.all([
          apiService.getDashboardMetrics(),
          apiService.getCategories(),
        ]);
        setMetrics(metricsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const performanceMetrics = [
    {
      title: 'Total Tickets',
      value: metrics?.totalTickets || 0,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Resolution Rate',
      value: `${Math.round(((metrics?.resolvedTickets || 0) / (metrics?.totalTickets || 1)) * 100)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Avg Resolution Time',
      value: `${metrics?.avgResolutionTime || 0}h`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      change: '-8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Customer Satisfaction',
      value: '94%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: '+2%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track performance metrics and analyze support trends
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs last period
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Trends Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ticket Trends
            </h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Ticket trends chart
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Chart integration pending
              </p>
            </div>
          </div>
          {metrics?.ticketTrends && (
            <div className="mt-4">
              <div className="grid grid-cols-7 gap-2 text-xs">
                {metrics.ticketTrends.map((trend, index) => (
                  <div key={index} className="text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">
                      {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-green-600 font-medium">+{trend.opened}</div>
                    <div className="text-blue-600 font-medium">-{trend.resolved}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Category Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Distribution
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {metrics?.categoryDistribution.map((item) => {
              const category = categories.find(c => c.name === item.category);
              const percentage = Math.round((item.count / (metrics?.totalTickets || 1)) * 100);
              
              return (
                <div key={item.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color || '#6b7280' }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.count} tickets
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Response Time Analysis */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Response Time Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">First Response</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">2.3h avg</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">4.2h avg</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Customer Reply</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">1.8h avg</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </Card>

        {/* Agent Performance */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Agent Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">SJ</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">24 tickets resolved</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">98%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">MC</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Mike Chen</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">18 tickets resolved</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">95%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}