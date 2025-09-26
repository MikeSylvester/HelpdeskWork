import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Ticket,
  Plus,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { useAppStore } from '../../stores/app';
import { cn, hasPermission } from '../../utils';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  
  const isCollapsed = !isMobile && sidebarCollapsed;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      roles: ['user', 'agent', 'admin'],
    },
    {
      name: 'My Tickets',
      href: '/tickets',
      icon: Ticket,
      roles: ['user', 'agent', 'admin'],
    },
    {
      name: 'Submit Ticket',
      href: '/submit-ticket',
      icon: Plus,
      roles: ['user'],
    },
    {
      name: 'All Tickets',
      href: '/all-tickets',
      icon: Ticket,
      roles: ['agent', 'admin'],
    },
    {
      name: 'Knowledge Base',
      href: '/knowledge-base',
      icon: BookOpen,
      roles: ['user', 'agent', 'admin'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['admin'],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['agent', 'admin'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredNavigation = navigation.filter(item =>
    hasPermission(user?.role || 'user', item.roles)
  );

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            HelpDesk Pro
          </h1>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                isActive
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300',
                isCollapsed && 'justify-center px-2'
              )
            }
          >
            <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
            {!isCollapsed && item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform lg:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                HelpDesk Pro
              </h1>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      isActive
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            {user && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 h-screen',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {sidebarContent}
      </div>
    </div>
  );
}