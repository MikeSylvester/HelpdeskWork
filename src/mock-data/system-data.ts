import type { Category, Priority, TicketStatus, SystemSettings } from '../types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Technical Support',
    description: 'Hardware, software, and system issues',
    color: '#3b82f6',
    isActive: true,
  },
  {
    id: '2',
    name: 'Account & Billing',
    description: 'Account management and billing inquiries',
    color: '#10b981',
    isActive: true,
  },
  {
    id: '3',
    name: 'Feature Request',
    description: 'Suggestions for new features or improvements',
    color: '#8b5cf6',
    isActive: true,
  },
  {
    id: '4',
    name: 'Bug Report',
    description: 'Report software bugs and issues',
    color: '#ef4444',
    isActive: true,
  },
  {
    id: '5',
    name: 'General Inquiry',
    description: 'General questions and information requests',
    color: '#6b7280',
    isActive: true,
  },
];

export const mockPriorities: Priority[] = [
  {
    id: '1',
    name: 'Low',
    level: 1,
    color: '#10b981',
    isActive: true,
  },
  {
    id: '2',
    name: 'Normal',
    level: 2,
    color: '#3b82f6',
    isActive: true,
  },
  {
    id: '3',
    name: 'High',
    level: 3,
    color: '#f59e0b',
    isActive: true,
  },
  {
    id: '4',
    name: 'Urgent',
    level: 4,
    color: '#ef4444',
    isActive: true,
  },
  {
    id: '5',
    name: 'Critical',
    level: 5,
    color: '#dc2626',
    isActive: true,
  },
];

export const mockTicketStatuses: TicketStatus[] = [
  {
    id: '1',
    name: 'New',
    color: '#3b82f6',
    isActive: true,
    isClosed: false,
  },
  {
    id: '2',
    name: 'In Progress',
    color: '#f59e0b',
    isActive: true,
    isClosed: false,
  },
  {
    id: '3',
    name: 'Waiting for Customer',
    color: '#8b5cf6',
    isActive: true,
    isClosed: false,
  },
  {
    id: '4',
    name: 'Resolved',
    color: '#10b981',
    isActive: true,
    isClosed: true,
  },
  {
    id: '5',
    name: 'Closed',
    color: '#6b7280',
    isActive: true,
    isClosed: true,
  },
];

export const mockSystemSettings: SystemSettings = {
  brandName: 'HelpDesk Pro',
  primaryColor: '#f97316',
  logoUrl: undefined,
  allowUserRegistration: true,
  requireEmailVerification: false,
  defaultTicketStatus: '1',
  autoAssignTickets: false,
  enableKnowledgeBase: true,
  enableFileAttachments: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
};