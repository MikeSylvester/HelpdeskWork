export interface User {
  // Identity & Contact Info
  id: string;
  employeeId: string; // Unique ID
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string; // work phone
  mobileNumber?: string; // optional
  department: string;
  jobTitle: string;
  manager?: string; // name or ID of their manager
  
  // Location & Org Info
  defaultLocation: string; // auto-filled from M365
  currentLocation?: string; // editable if different from default
  officeAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  timeZone: string;
  
  // System / Access Info
  username: string; // AD/M365 login
  employeeIdSystem?: string; // if applicable
  roles: ('user' | 'agent' | 'admin')[]; // for the help desk system
  
  // Preferences
  language: string;
  notificationPreferences: ('email' | 'in-app' | 'both')[];
  darkModeEnabled: boolean;
  
  // Legacy fields for compatibility
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  isActive: boolean;
}

export interface Priority {
  id: string;
  name: string;
  level: number;
  color: string;
  isActive: boolean;
}

export interface TicketStatus {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  isClosed: boolean;
}

export interface Ticket {
  // Core Info
  ticketId: string; // unique identifier
  title: string; // Title of Issue
  description: string;
  category: string; // hardware, software, network, access, HR, facilities, etc.
  subCategoryId?: string; // more specific categorization ID
  subCategory?: string; // subcategory name for display
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Waiting for Customer';
  
  // Requester Info (from User Profile at creation)
  requesterId: string; // links to userId
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requesterDepartment: string;
  requesterJobTitle: string;
  requesterManager?: string;
  requesterLocation: string; // defaults from profile, editable if needed
  
  // Additional Contacts
  additionalContacts?: {
    name: string;
    email: string;
    phone?: string;
    role: string; // e.g., "Manager", "Team Lead", "Technical Contact"
  }[];
  
  // Assignment & Ownership
  assignedAgent?: string; // primary assigned agent name
  assignedAgentId?: string; // primary assigned agent ID
  assignedAgents?: string[]; // array of assigned agent IDs
  assignedAgentNames?: string[]; // array of assigned agent names
  escalationLevel: 'tier 1' | 'tier 2' | 'tier 3';
  
  // Ticket Location (where the issue is occurring)
  ticketLocation?: {
    building?: string;
    floor?: string;
    room?: string;
    desk?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Collaboration
  chatThread: Message[]; // messages between requester & agents
  attachments: Attachment[]; // files, screenshots, logs
  workLog: WorkLogEntry[]; // sequential work log entries by agents/admins
  
  // Resolution
  resolution?: string; // resolution details
  resolutionSteps?: string[]; // step-by-step resolution process
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Update History
  updateHistory?: TicketUpdate[];
}

export interface TicketUpdate {
  id: string;
  ticketId: string;
  updatedBy: string; // user ID who made the update
  updatedByName: string; // user name for display
  updatedByEmail: string; // user email for display
  action: 'created' | 'updated' | 'assigned' | 'status_changed' | 'resolved' | 'closed' | 'reopened' | 'commented';
  field?: string; // specific field that was updated
  oldValue?: string; // previous value
  newValue?: string; // new value
  description: string; // human-readable description of the change
  timestamp: Date;
  metadata?: Record<string, any>; // additional data about the update
}

export interface WorkLogEntry {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  timestamp: Date;
  type: 'work_log' | 'note' | 'action';
}

export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface Message {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  attachments?: Attachment[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  isPublished: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSettings {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  defaultTicketStatus: string;
  autoAssignTickets: boolean;
  enableKnowledgeBase: boolean;
  enableFileAttachments: boolean;
  maxFileSize: number;
}

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  ticketTrends: {
    date: string;
    opened: number;
    resolved: number;
  }[];
  categoryDistribution: {
    categoryId: string;
    count: number;
  }[];
}