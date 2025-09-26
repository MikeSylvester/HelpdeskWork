export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'agent' | 'admin';
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
  id: string;
  title: string;
  description: string;
  userId: string;
  assignedToId?: string;
  categoryId: string;
  priorityId: string;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  attachments: Attachment[];
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