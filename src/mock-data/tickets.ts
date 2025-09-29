import type { Ticket, Message, DashboardMetrics } from '../types';

export const mockTickets: Ticket[] = [
  {
    // Core Info
    ticketId: 'TKT-001',
    title: 'Cannot login to my account',
    description: 'I am unable to login to my account. I keep getting an error message saying my password is incorrect, but I am sure it is correct.',
    category: 'Technical Support',
    subCategoryId: '1-5',
    subCategory: 'Password Reset',
    priority: 'high',
    status: 'Resolved',
    
    // Requester Info
    requesterId: '4',
    requesterName: 'John Doe',
    requesterEmail: 'user@example.com',
    requesterPhone: '+1-555-0401',
    requesterDepartment: 'Marketing',
    requesterJobTitle: 'Marketing Specialist',
    requesterManager: 'Emma Wilson',
    requesterLocation: 'Remote',
    
    // Additional Contacts
    additionalContacts: [
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com',
        phone: '+1-555-0501',
        role: 'Manager'
      }
    ],
    
    // Assignment & Ownership
    assignedAgent: 'Sarah Johnson',
    assignedAgentId: '2',
    escalationLevel: 'tier 1',
    
    // Ticket Location
    ticketLocation: {
      address: 'Remote',
      city: 'Remote',
      state: 'Remote',
      country: 'Remote'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-001',
        ticketId: 'TKT-001',
        userId: '2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@example.com',
        content: 'User had forgotten password. Reset and enabled 2FA as security measure.',
        timestamp: new Date('2024-12-15T10:30:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: 'Password reset completed successfully and two-factor authentication enabled for enhanced security.',
    resolutionSteps: [
      'Verified user identity through email confirmation',
      'Reset password using secure password reset process',
      'Enabled two-factor authentication on user account',
      'Provided user with new login credentials and 2FA setup instructions',
      'Confirmed user can successfully login with new credentials'
    ],
    
    // Timestamps
    createdAt: new Date('2024-12-15T08:00:00Z'),
    updatedAt: new Date('2024-12-15T10:30:00Z'),
    resolvedAt: new Date('2024-12-15T10:30:00Z'),
    closedAt: new Date('2024-12-15T10:30:00Z'),
    
    // Update History
    updateHistory: [
      {
        id: 'update-001',
        ticketId: 'TKT-001',
        updatedBy: '4',
        updatedByName: 'John Doe',
        updatedByEmail: 'user@example.com',
        action: 'created',
        description: 'Ticket created',
        timestamp: new Date('2024-12-15T08:00:00Z')
      },
      {
        id: 'update-002',
        ticketId: 'TKT-001',
        updatedBy: '2',
        updatedByName: 'Sarah Johnson',
        updatedByEmail: 'sarah.johnson@example.com',
        action: 'assigned',
        field: 'assignedAgent',
        oldValue: '',
        newValue: 'Sarah Johnson',
        description: 'Ticket assigned to Sarah Johnson',
        timestamp: new Date('2024-12-15T08:15:00Z')
      },
      {
        id: 'update-003',
        ticketId: 'TKT-001',
        updatedBy: '2',
        updatedByName: 'Sarah Johnson',
        updatedByEmail: 'sarah.johnson@example.com',
        action: 'status_changed',
        field: 'status',
        oldValue: 'open',
        newValue: 'resolved',
        description: 'Status changed from "open" to "resolved"',
        timestamp: new Date('2024-12-15T10:30:00Z')
      }
    ],
  },
  {
    // Core Info
    ticketId: 'TKT-007',
    title: 'System performance issues',
    description: 'The system has been running slowly for the past few days. Response times are significantly higher than usual.',
    category: 'Technical Support',
    subCategoryId: '1-3',
    subCategory: 'Network Problems',
    priority: 'urgent',
    status: 'New',
    
    // Requester Info
    requesterId: '1',
    requesterName: 'Admin User',
    requesterEmail: 'admin@helpdesk.com',
    requesterPhone: '+1-555-0101',
    requesterDepartment: 'IT Administration',
    requesterJobTitle: 'IT Director',
    requesterManager: 'CEO',
    requesterLocation: 'New York Office',
    
    // Additional Contacts
    additionalContacts: [
      {
        name: 'Sarah Johnson',
        email: 'agent@helpdesk.com',
        phone: '+1-555-0201',
        role: 'Senior Support Specialist'
      }
    ],
    
    // Assignment & Ownership
    assignedAgent: 'Admin User',
    assignedAgentId: '1',
    escalationLevel: 'tier 3',
    
    // Ticket Location
    ticketLocation: {
      building: 'Data Center A',
      floor: '1',
      room: 'Server Room 1',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-002',
        ticketId: 'TKT-002',
        userId: '3',
        userName: 'Mike Chen',
        userEmail: 'mike.chen@example.com',
        content: 'Performance monitoring shows CPU usage at 95%. Investigating potential memory leaks.',
        timestamp: new Date('2024-12-15T14:20:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: undefined,
    resolutionSteps: undefined,
    
    // Timestamps
    createdAt: new Date('2024-12-15T12:00:00Z'),
    updatedAt: new Date('2024-12-15T12:00:00Z'),
  },
  {
    // Core Info
    ticketId: 'TKT-008',
    title: 'Database backup verification',
    description: 'Need to verify that the automated database backups are working correctly and can be restored if needed.',
    category: 'Technical Support',
    subCategoryId: '1-2',
    subCategory: 'Software Issues',
    priority: 'medium',
    status: 'In Progress',
    
    // Requester Info
    requesterId: '1',
    requesterName: 'Admin User',
    requesterEmail: 'admin@helpdesk.com',
    requesterPhone: '+1-555-0101',
    requesterDepartment: 'IT Administration',
    requesterJobTitle: 'IT Director',
    requesterManager: 'CEO',
    requesterLocation: 'New York Office',
    
    // Additional Contacts
    additionalContacts: [],
    
    // Assignment & Ownership
    assignedAgent: 'Admin User',
    assignedAgentId: '1',
    escalationLevel: 'tier 2',
    
    // Ticket Location
    ticketLocation: {
      address: '456 Storage Ave',
      city: 'Oakland',
      state: 'CA',
      country: 'USA'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-003',
        ticketId: 'TKT-003',
        userId: '2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@example.com',
        content: 'Backup verification completed successfully. All restore tests passed.',
        timestamp: new Date('2024-12-15T16:45:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: 'Database backup verification completed successfully. All restore tests passed and backup integrity confirmed.',
    resolutionSteps: [
      'Verified automated backup schedule is running correctly',
      'Tested backup file integrity and completeness',
      'Performed test restore to isolated environment',
      'Validated data consistency after restore',
      'Updated backup monitoring alerts'
    ],
    
    // Timestamps
    createdAt: new Date('2024-12-14T16:00:00Z'),
    updatedAt: new Date('2024-12-15T09:00:00Z'),
    resolvedAt: new Date('2024-12-15T09:00:00Z'),
  },
  {
    // Core Info
    ticketId: 'TKT-002',
    title: 'Feature request: Dark mode',
    description: 'It would be great if the application had a dark mode option for better usability in low-light conditions.',
    category: 'Feature Request',
    subCategoryId: '3-1',
    subCategory: 'New Feature',
    priority: 'medium',
    status: 'New',
    
    // Requester Info
    requesterId: '3',
    requesterName: 'Mike Chen',
    requesterEmail: 'agent2@helpdesk.com',
    requesterPhone: '+1-555-0301',
    requesterDepartment: 'IT Support',
    requesterJobTitle: 'Support Specialist',
    requesterManager: 'Sarah Johnson',
    requesterLocation: 'Chicago Office',
    
    // Additional Contacts
    additionalContacts: [
      {
        name: 'Sarah Johnson',
        email: 'agent@helpdesk.com',
        phone: '+1-555-0201',
        role: 'Manager'
      }
    ],
    
    // Assignment & Ownership
    assignedAgent: 'Mike Chen',
    assignedAgentId: '3',
    escalationLevel: 'tier 1',
    
    // Ticket Location
    ticketLocation: {
      building: 'Chicago Office',
      floor: '3',
      room: 'IT Support',
      address: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      country: 'USA'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-004',
        ticketId: 'TKT-004',
        userId: '3',
        userName: 'Mike Chen',
        userEmail: 'mike.chen@example.com',
        content: 'Good feature request. Adding to product backlog for next sprint planning.',
        timestamp: new Date('2024-12-15T11:15:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: undefined,
    resolutionSteps: undefined,
    
    // Timestamps
    createdAt: new Date('2024-12-14T14:20:00Z'),
    updatedAt: new Date('2024-12-14T14:20:00Z'),
  },
  {
    // Core Info
    ticketId: 'TKT-003',
    title: 'Billing discrepancy',
    description: 'There seems to be an error in my last invoice. I was charged twice for the same service.',
    category: 'Account & Billing',
    subCategoryId: '2-4',
    subCategory: 'Payment Issues',
    priority: 'high',
    status: 'Closed',
    
    // Requester Info
    requesterId: '4',
    requesterName: 'John Doe',
    requesterEmail: 'user@example.com',
    requesterPhone: '+1-555-0401',
    requesterDepartment: 'Marketing',
    requesterJobTitle: 'Marketing Specialist',
    requesterManager: 'Emma Wilson',
    requesterLocation: 'Remote',
    
    // Additional Contacts
    additionalContacts: [
      {
        name: 'Emma Wilson',
        email: 'user2@example.com',
        phone: '+1-555-0501',
        role: 'Manager'
      }
    ],
    
    // Assignment & Ownership
    assignedAgent: 'Sarah Johnson',
    assignedAgentId: '2',
    escalationLevel: 'tier 1',
    
    // Ticket Location
    ticketLocation: {
      address: 'Remote',
      city: 'Remote',
      state: 'Remote',
      country: 'Remote'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-005',
        ticketId: 'TKT-005',
        userId: '2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@example.com',
        content: 'Duplicate charge confirmed. Refund processed and customer notified.',
        timestamp: new Date('2024-12-15T13:30:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: 'Duplicate charge identified and refund processed. Customer notified of resolution.',
    resolutionSteps: [
      'Reviewed billing records and confirmed duplicate charge',
      'Processed refund for duplicate amount',
      'Updated customer account to prevent future duplicate charges',
      'Notified customer via email of resolution and refund',
      'Updated internal billing procedures'
    ],
    
    // Timestamps
    createdAt: new Date('2024-12-13T16:45:00Z'),
    updatedAt: new Date('2024-12-14T09:15:00Z'),
    resolvedAt: new Date('2024-12-14T09:15:00Z'),
    closedAt: new Date('2024-12-14T09:15:00Z'),
  },
  {
    // Core Info
    ticketId: 'TKT-004',
    title: 'App crashes on startup',
    description: 'The mobile app crashes immediately when I try to open it. This started happening after the latest update.',
    category: 'Bug Report',
    subCategoryId: '4-1',
    subCategory: 'Critical Bug',
    priority: 'urgent',
    status: 'New',
    
    // Requester Info
    requesterId: '3',
    requesterName: 'Mike Chen',
    requesterEmail: 'agent2@helpdesk.com',
    requesterPhone: '+1-555-0301',
    requesterDepartment: 'IT Support',
    requesterJobTitle: 'Support Specialist',
    requesterManager: 'Sarah Johnson',
    requesterLocation: 'Chicago Office',
    
    // Additional Contacts
    additionalContacts: [
      {
        name: 'Sarah Johnson',
        email: 'agent@helpdesk.com',
        phone: '+1-555-0201',
        role: 'Manager'
      }
    ],
    
    // Assignment & Ownership
    assignedAgent: 'Mike Chen',
    assignedAgentId: '3',
    escalationLevel: 'tier 2',
    
    // Ticket Location
    ticketLocation: {
      address: 'Mobile Device',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-006',
        ticketId: 'TKT-006',
        userId: '3',
        userName: 'Mike Chen',
        userEmail: 'mike.chen@example.com',
        content: 'Critical bug affecting mobile users. Investigating crash logs and working on hotfix.',
        timestamp: new Date('2024-12-15T15:00:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: undefined,
    resolutionSteps: undefined,
    
    // Timestamps
    createdAt: new Date('2024-12-15T11:30:00Z'),
    updatedAt: new Date('2024-12-15T11:30:00Z'),
  },
  {
    // Core Info
    ticketId: 'TKT-005',
    title: 'Password reset not working',
    description: 'I tried to reset my password multiple times but I never receive the reset email. I checked my spam folder as well.',
    category: 'Technical Support',
    subCategoryId: '1-4',
    subCategory: 'Email Issues',
    priority: 'medium',
    status: 'New',
    
    // Requester Info
    requesterId: '4',
    requesterName: 'John Doe',
    requesterEmail: 'user@example.com',
    requesterPhone: '+1-555-0401',
    requesterDepartment: 'Marketing',
    requesterJobTitle: 'Marketing Specialist',
    requesterManager: 'Emma Wilson',
    requesterLocation: 'Remote',
    
    // Additional Contacts
    additionalContacts: [
      {
        name: 'Emma Wilson',
        email: 'user2@example.com',
        phone: '+1-555-0501',
        role: 'Manager'
      }
    ],
    
    // Assignment & Ownership
    assignedAgent: undefined,
    assignedAgentId: undefined,
    escalationLevel: 'tier 1',
    
    // Ticket Location
    ticketLocation: {
      address: 'Remote',
      city: 'Remote',
      state: 'Remote',
      country: 'Remote'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-007',
        ticketId: 'TKT-007',
        userId: '2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@example.com',
        content: 'Email delivery issue identified. SMTP server configuration needs adjustment.',
        timestamp: new Date('2024-12-15T12:00:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: undefined,
    resolutionSteps: undefined,
    
    // Timestamps
    createdAt: new Date('2024-12-14T09:15:00Z'),
    updatedAt: new Date('2024-12-14T09:15:00Z'),
  },
  {
    // Core Info
    ticketId: 'TKT-006',
    title: 'Request for API documentation',
    description: 'Could you please provide detailed API documentation? I need to integrate with our internal systems.',
    category: 'General Inquiry',
    subCategoryId: '5-1',
    subCategory: 'Information Request',
    priority: 'medium',
    status: 'In Progress',
    
    // Requester Info
    requesterId: '3',
    requesterName: 'Mike Chen',
    requesterEmail: 'agent2@helpdesk.com',
    requesterPhone: '+1-555-0301',
    requesterDepartment: 'IT Support',
    requesterJobTitle: 'Support Specialist',
    requesterManager: 'Sarah Johnson',
    requesterLocation: 'Chicago Office',
    
    // Additional Contacts
    additionalContacts: [
      {
        name: 'Sarah Johnson',
        email: 'agent@helpdesk.com',
        phone: '+1-555-0201',
        role: 'Manager'
      }
    ],
    
    // Assignment & Ownership
    assignedAgent: 'Sarah Johnson',
    assignedAgentId: '2',
    escalationLevel: 'tier 1',
    
    // Ticket Location
    ticketLocation: {
      building: 'Chicago Office',
      floor: '3',
      room: 'IT Support',
      address: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      country: 'USA'
    },
    
    // Collaboration
    chatThread: [],
    attachments: [],
    workLog: [
      {
        id: 'wl-008',
        ticketId: 'TKT-008',
        userId: '3',
        userName: 'Mike Chen',
        userEmail: 'mike.chen@example.com',
        content: 'API documentation updated and shared with customer. Integration guide provided.',
        timestamp: new Date('2024-12-15T17:30:00Z'),
        type: 'work_log'
      }
    ],
    
    // Resolution
    resolution: 'API documentation provided and integration guide shared with requester.',
    resolutionSteps: [
      'Compiled comprehensive API documentation',
      'Created integration guide with examples',
      'Shared documentation via secure file sharing',
      'Provided contact information for technical questions',
      'Scheduled follow-up meeting for integration support'
    ],
    
    // Timestamps
    createdAt: new Date('2024-12-13T14:20:00Z'),
    updatedAt: new Date('2024-12-14T10:30:00Z'),
    resolvedAt: new Date('2024-12-14T10:30:00Z'),
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    ticketId: '1',
    userId: '4',
    content: 'I have tried resetting my password multiple times but the issue persists.',
    isInternal: false,
    createdAt: new Date('2024-12-15T08:15:00Z'),
  },
  {
    id: '2',
    ticketId: '1',
    userId: '2',
    content: 'Hi John, I can see your account is locked due to multiple failed login attempts. Let me unlock it for you.',
    isInternal: false,
    createdAt: new Date('2024-12-15T09:00:00Z'),
  },
  {
    id: '3',
    ticketId: '1',
    userId: '2',
    content: 'Account has been unlocked. Customer should be able to login now.',
    isInternal: true,
    createdAt: new Date('2024-12-15T09:05:00Z'),
  },
  {
    id: '4',
    ticketId: '1',
    userId: '4',
    content: 'Thank you! I can login now.',
    isInternal: false,
    createdAt: new Date('2024-12-15T10:30:00Z'),
  },
  {
    id: '5',
    ticketId: '3',
    userId: '2',
    content: 'I have reviewed your invoice and confirmed the duplicate charge. A refund has been processed and should appear in your account within 3-5 business days.',
    isInternal: false,
    createdAt: new Date('2024-12-14T09:15:00Z'),
  },
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalTickets: 156,
  openTickets: 23,
  pendingTickets: 8,
  resolvedTickets: 125,
  avgResolutionTime: 4.2, // hours
  ticketTrends: [
    { date: '2024-12-09', opened: 12, resolved: 8 },
    { date: '2024-12-10', opened: 15, resolved: 11 },
    { date: '2024-12-11', opened: 8, resolved: 14 },
    { date: '2024-12-12', opened: 18, resolved: 12 },
    { date: '2024-12-13', opened: 14, resolved: 16 },
    { date: '2024-12-14', opened: 11, resolved: 9 },
    { date: '2024-12-15', opened: 7, resolved: 13 },
  ],
  categoryDistribution: [
    { categoryId: '1', count: 45 },
    { categoryId: '2', count: 28 },
    { categoryId: '3', count: 22 },
    { categoryId: '4', count: 38 },
    { categoryId: '5', count: 23 },
  ],
};