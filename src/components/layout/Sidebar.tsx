import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Ticket,
  Plus,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  LogOut,
  User,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  Database,
  CheckCircle,
  UserX,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { useAppStore } from '../../stores/app';
import { Button } from '../ui/Button';
import { cn, hasPermission } from '../../utils';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const navigation = [
    // Dashboard at top for agents/admins
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['agent', 'admin'],
    },
    
    // Knowledge Base below dashboard
    {
      name: 'Knowledge Base',
      href: '/knowledge-base',
      icon: BookOpen,
      roles: ['user', 'agent', 'admin'],
    },
    
    // Ticket Management group
    {
      name: 'Ticket Management',
      icon: FileText,
      roles: ['user', 'agent', 'admin'],
      isGroup: true,
      children: [
        {
          name: 'My Tickets',
          href: '/tickets',
          icon: Ticket,
          roles: ['user', 'agent', 'admin'],
        },
        {
          name: 'Submit a Ticket',
          href: '/submit-ticket',
          icon: Plus,
          roles: ['user', 'agent', 'admin'],
        },
        {
          name: 'All Open',
          href: '/all-open',
          icon: Ticket,
          roles: ['agent', 'admin'],
        },
        {
          name: 'All Unassigned',
          href: '/all-unassigned',
          icon: UserX,
          roles: ['agent', 'admin'],
        },
        {
          name: 'My Resolved/Closed',
          href: '/my-resolved',
          icon: CheckCircle,
          roles: ['user', 'agent', 'admin'],
        },
        {
          name: 'All Closed',
          href: '/all-closed',
          icon: CheckCircle,
          roles: ['agent', 'admin'],
        },
        {
          name: 'All Tickets',
          href: '/all-tickets',
          icon: Ticket,
          roles: ['agent', 'admin'],
        },
      ],
    },
    
    // Reports group
    {
      name: 'Reports',
      icon: BarChart3,
      roles: ['agent', 'admin'],
      isGroup: true,
      children: [
        {
          name: 'General',
          href: '/reports/general',
          icon: BarChart3,
          roles: ['agent', 'admin'],
        },
        {
          name: 'Run Report',
          href: '/reports/builder',
          icon: FileText,
          roles: ['agent', 'admin'],
        },
      ],
    },
    
    // Settings group (admin only)
    {
      name: 'Settings',
      icon: Settings,
      roles: ['admin'],
      isGroup: true,
      children: [
        {
          name: 'Admin Dashboard',
          href: '/admin',
          icon: Shield,
          roles: ['admin'],
        },
        {
          name: 'User Management',
          href: '/users',
          icon: Users,
          roles: ['admin'],
        },
        {
          name: 'System Settings',
          href: '/settings',
          icon: Database,
          roles: ['admin'],
        },
      ],
    },
  ];

  const filteredNavigation = navigation.filter(item =>
    hasPermission(user?.roles || ['user'], item.roles)
  );

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const sidebarContent = (
    <>
      {/* Header with Collapse Toggle and User Info */}
      {!isMobile && (
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
          {/* Collapse Toggle Button - Always first */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          
          {/* User Info - Only show when not collapsed */}
          {!isCollapsed && user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors p-1"
              >
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <div className="ml-2 text-left">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.roles.join(', ')}
                  </p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Handle profile navigation
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-hidden">
        {filteredNavigation.map((item) => {
          if (item.isGroup) {
            const isExpanded = expandedMenus.includes(item.name);
            const hasVisibleChildren = item.children?.some(child => 
              hasPermission(user?.roles || ['user'], child.roles)
            );
            
            if (!hasVisibleChildren) return null;
            
            if (isCollapsed) {
              return (
                <div key={item.name} className="relative group">
                  <button
                    className="flex items-center justify-center w-full px-2 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    title={item.name}
                  >
                    <item.icon className="h-6 w-6" />
                  </button>
                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                </div>
              );
            }
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-6 space-y-1 mt-1">
                    {item.children?.filter(child => 
                      hasPermission(user?.roles || ['user'], child.roles)
                    ).map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        onClick={isMobile ? onClose : undefined}
                        title={child.name}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                            isActive
                              ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400'
                          )
                        }
                      >
                        <child.icon className="h-4 w-4 mr-3" />
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          
          if (isCollapsed) {
            return (
              <div key={item.name} className="relative group">
                <NavLink
                  to={item.href}
                  onClick={isMobile ? onClose : undefined}
                  title={item.name}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-center px-2 py-3 rounded-lg text-sm font-medium transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      isActive
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300'
                    )
                  }
                >
                  <item.icon className="h-6 w-6" />
                </NavLink>
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              </div>
            );
          }
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={isMobile ? onClose : undefined}
              title={item.name}
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
          );
        })}
      </nav>

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
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => {
                if (item.isGroup) {
                  const isExpanded = expandedMenus.includes(item.name);
                  const hasVisibleChildren = item.children?.some(child => 
                    hasPermission(user?.roles || ['user'], child.roles)
                  );
                  
                  if (!hasVisibleChildren) return null;
                  
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-6 space-y-1 mt-1">
                          {item.children?.filter(child => 
                            hasPermission(user?.roles || ['user'], child.roles)
                          ).map((child) => (
                            <NavLink
                              key={child.name}
                              to={child.href}
                              onClick={onClose}
                              title={child.name}
                              className={({ isActive }) =>
                                cn(
                                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                                  isActive
                                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                )
                              }
                            >
                              <child.icon className="h-4 w-4 mr-3" />
                              {child.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    title={item.name}
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
                );
              })}
            </nav>
            {user && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.roles.join(', ')}
                      </p>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-gray-400 transition-transform",
                      showUserMenu && "rotate-180"
                    )} />
                  </button>

                  {/* Mobile User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onClose?.();
                            // Handle profile navigation
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onClose?.();
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {sidebarContent}
    </div>
  );
}