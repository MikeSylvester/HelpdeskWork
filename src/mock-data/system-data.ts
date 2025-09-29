import type { Category, Priority, TicketStatus, SystemSettings, SubCategory } from '../types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Technical Support',
    description: 'Hardware, software, and system issues',
    color: '#3b82f6',
    isActive: true,
    subCategories: [
      { id: '1-1', name: 'Hardware Issues', description: 'Computer, printer, network equipment', categoryId: '1', isActive: true },
      { id: '1-2', name: 'Software Issues', description: 'Applications, operating system, drivers', categoryId: '1', isActive: true },
      { id: '1-3', name: 'Network Problems', description: 'Internet, WiFi, VPN connectivity', categoryId: '1', isActive: true },
      { id: '1-4', name: 'Email Issues', description: 'Email client, server, configuration', categoryId: '1', isActive: true },
      { id: '1-5', name: 'Password Reset', description: 'Account access and password recovery', categoryId: '1', isActive: true },
    ],
  },
  {
    id: '2',
    name: 'Account & Billing',
    description: 'Account management and billing inquiries',
    color: '#10b981',
    isActive: true,
    subCategories: [
      { id: '2-1', name: 'Account Setup', description: 'New account creation and setup', categoryId: '2', isActive: true },
      { id: '2-2', name: 'Billing Questions', description: 'Invoices, payments, charges', categoryId: '2', isActive: true },
      { id: '2-3', name: 'Subscription Changes', description: 'Plan upgrades, downgrades, cancellations', categoryId: '2', isActive: true },
      { id: '2-4', name: 'Payment Issues', description: 'Failed payments, refunds', categoryId: '2', isActive: true },
    ],
  },
  {
    id: '3',
    name: 'Feature Request',
    description: 'Suggestions for new features or improvements',
    color: '#8b5cf6',
    isActive: true,
    subCategories: [
      { id: '3-1', name: 'New Feature', description: 'Request for completely new functionality', categoryId: '3', isActive: true },
      { id: '3-2', name: 'Enhancement', description: 'Improvement to existing features', categoryId: '3', isActive: true },
      { id: '3-3', name: 'Integration', description: 'Third-party service integration', categoryId: '3', isActive: true },
    ],
  },
  {
    id: '4',
    name: 'Bug Report',
    description: 'Report software bugs and issues',
    color: '#ef4444',
    isActive: true,
    subCategories: [
      { id: '4-1', name: 'Critical Bug', description: 'System crashes, data loss', categoryId: '4', isActive: true },
      { id: '4-2', name: 'UI/UX Issue', description: 'Interface problems, display issues', categoryId: '4', isActive: true },
      { id: '4-3', name: 'Performance Issue', description: 'Slow loading, timeouts', categoryId: '4', isActive: true },
      { id: '4-4', name: 'Data Issue', description: 'Incorrect data, missing information', categoryId: '4', isActive: true },
    ],
  },
  {
    id: '5',
    name: 'General Inquiry',
    description: 'General questions and information requests',
    color: '#6b7280',
    isActive: true,
    subCategories: [
      { id: '5-1', name: 'Information Request', description: 'General information and documentation', categoryId: '5', isActive: true },
      { id: '5-2', name: 'Training Request', description: 'User training and education', categoryId: '5', isActive: true },
      { id: '5-3', name: 'Access Request', description: 'Permissions and access rights', categoryId: '5', isActive: true },
    ],
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