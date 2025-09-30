import type { 
  User, 
  Ticket, 
  Message, 
  Category, 
  Priority, 
  TicketStatus, 
  KnowledgeArticle, 
  SystemSettings, 
  DashboardMetrics,
  TicketUpdate,
  WorkLogEntry
} from '../types';
import { mockUsers } from '../mock-data/users';
import { mockTickets, mockMessages, mockDashboardMetrics } from '../mock-data/tickets';
import { mockCategories, mockPriorities, mockTicketStatuses, mockSystemSettings } from '../mock-data/system-data';
import { mockKnowledgeArticles } from '../mock-data/knowledge-base';
import { localStorageService } from './localStorage';

// Mock API service that simulates backend calls
class ApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  private initialized = false;

  // Initialize with mock data if not already done
  private async initialize() {
    if (!this.initialized) {
      // Clear localStorage to ensure fresh data with correct status values
      localStorage.clear();
      localStorageService.initializeWithMockData({
        tickets: mockTickets,
        users: mockUsers,
        categories: mockCategories,
        priorities: mockPriorities,
        statuses: mockTicketStatuses,
        messages: mockMessages,
        settings: mockSystemSettings
      });
      this.initialized = true;
    }
  }

  private createUpdateRecord(
    ticketId: string,
    updatedBy: string,
    action: TicketUpdate['action'],
    field?: string,
    oldValue?: string,
    newValue?: string,
    description?: string,
    metadata?: Record<string, any>
  ): TicketUpdate {
    const user = mockUsers.find(u => u.id === updatedBy);
    return {
      id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      updatedBy,
      updatedByName: user?.displayName || `${user?.firstName} ${user?.lastName}` || 'Unknown User',
      updatedByEmail: user?.email || 'unknown@example.com',
      action,
      field,
      oldValue,
      newValue,
      description: description || this.generateUpdateDescription(action, field, oldValue, newValue),
      timestamp: new Date(),
      metadata
    };
  }

  private generateUpdateDescription(
    action: TicketUpdate['action'],
    field?: string,
    oldValue?: string,
    newValue?: string
  ): string {
    switch (action) {
      case 'created':
        return 'Ticket created';
      case 'updated':
        return `${field} updated from "${oldValue}" to "${newValue}"`;
      case 'assigned':
        return `Ticket assigned to ${newValue}`;
      case 'status_changed':
        return `Status changed from "${oldValue}" to "${newValue}"`;
      case 'resolved':
        return 'Ticket resolved';
      case 'closed':
        return 'Ticket closed';
      case 'reopened':
        return 'Ticket reopened';
      case 'commented':
        return 'Comment added';
      default:
        return 'Ticket updated';
    }
  }

  private hasMeaningfulChange(key: string, oldValue: any, newValue: any): boolean {
    // Skip derived fields that shouldn't be tracked
    if (key === 'assignedAgentNames' || key === 'assignedAgent' || key === 'workLog' || key === 'resolvedAt') return false;
    
    // Skip if both values are the same
    if (oldValue === newValue) return false;
    
    // Skip if both are null/undefined
    if ((oldValue == null || oldValue === '') && (newValue == null || newValue === '')) return false;
    
    // Skip if both are empty arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue) && oldValue.length === 0 && newValue.length === 0) return false;
    
    // Skip if both are empty strings
    if (oldValue === '' && newValue === '') return false;
    
    // Skip if new value is just an empty string and old value was undefined/null
    if ((oldValue == null || oldValue === '') && newValue === '') return false;
    
    // Skip if old value was empty string and new value is undefined/null
    if (oldValue === '' && (newValue == null || newValue === '')) return false;
    
    // For arrays, check if they contain the same elements
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (oldValue.length !== newValue.length) return true;
      
      // For additionalContacts (array of objects), compare by email/name
      if (key === 'additionalContacts') {
        const oldEmails = (oldValue as any[]).map(contact => contact.email || contact.name).sort();
        const newEmails = (newValue as any[]).map(contact => contact.email || contact.name).sort();
        
        for (let i = 0; i < oldEmails.length; i++) {
          if (oldEmails[i] !== newEmails[i]) return true;
        }
        return false; // Arrays are identical
      }
      
      // For other arrays, sort and compare
      const sortedOld = [...oldValue].sort();
      const sortedNew = [...newValue].sort();
      
      for (let i = 0; i < sortedOld.length; i++) {
        if (sortedOld[i] !== sortedNew[i]) return true;
      }
      return false; // Arrays are identical
    }
    
    // For objects, do a deep comparison
    if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
      const oldKeys = Object.keys(oldValue);
      const newKeys = Object.keys(newValue);
      
      if (oldKeys.length !== newKeys.length) return true;
      
      for (const key of oldKeys) {
        if (oldValue[key] !== newValue[key]) return true;
      }
      return false; // Objects are identical
    }
    
    return true;
  }

  private getUserNamesFromIds(userIds: string[]): string[] {
    return userIds.map(id => {
      const user = mockUsers.find(u => u.id === id);
      return user?.displayName || `${user?.firstName} ${user?.lastName}` || 'Unknown User';
    });
  }

  private getSubCategoryName(subCategoryId: string): string {
    if (!subCategoryId) return '';
    // Find subcategory by ID in mock categories
    for (const category of mockCategories) {
      const subCategory = category.subCategories?.find(sub => sub.id === subCategoryId);
      if (subCategory) return subCategory.name;
    }
    return '';
  }

  // Users
  async getUsers(): Promise<User[]> {
    await this.delay(500);
    return mockUsers;
  }

  async getUserById(id: string): Promise<User | null> {
    await this.delay(300);
    return mockUsers.find(u => u.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await this.delay(500);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return mockUsers[userIndex];
    }
    throw new Error('User not found');
  }

  // Report Filter Options
  async getReportFilterOptions(): Promise<{
    statuses: string[];
    priorities: string[];
    categories: string[];
    agents: Array<{ id: string; name: string; email: string }>;
    requesters: Array<{ id: string; name: string }>;
  }> {
    await this.initialize();
    await this.delay(300);
    
    const tickets = localStorageService.getTickets();
    const users = localStorageService.getUsers();
    
    // Get unique values from actual ticket data
    const statuses = [...new Set(tickets.map(t => t.status))].sort();
    const priorities = [...new Set(tickets.map(t => t.priority))].sort();
    const categories = [...new Set(tickets.map(t => t.category))].sort();
    
    // Get agents who have been assigned tickets
    const agentIds = [...new Set(tickets.map(t => t.assignedAgentId).filter(Boolean))];
    const agents = agentIds.map(id => {
      const user = users.find(u => u.id === id);
      return user ? { 
        id, 
        name: `${user.firstName} ${user.lastName}`,
        email: user.email 
      } : { 
        id, 
        name: 'Unknown',
        email: ''
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    // Get requesters who have created tickets
    const requesterIds = [...new Set(tickets.map(t => t.requesterId))];
    const requesters = requesterIds.map(id => {
      const user = users.find(u => u.id === id);
      return user ? { id, name: `${user.firstName} ${user.lastName}` } : { id, name: 'Unknown' };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      statuses,
      priorities,
      categories,
      agents,
      requesters
    };
  }

  // Tickets
          async getTickets(filters?: { 
            userId?: string; 
            status?: string; 
            category?: string;
            priority?: string;
            assignedAgent?: string;
            requester?: string;
            searchTerm?: string;
            searchAgent?: string;
            startDate?: string;
            endDate?: string;
            page?: number;
            limit?: number;
            // Page-specific filters
            openOnly?: boolean;
            closedOnly?: boolean;
            unassignedOnly?: boolean;
            resolvedOnly?: boolean;
          }): Promise<{
    tickets: Ticket[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
  }> {
    await this.initialize();
    await this.delay(500);
    let tickets = [...localStorageService.getTickets()];
    const users = localStorageService.getUsers();
    
    console.log('API: All tickets from localStorage:', tickets.map(t => ({ id: t.ticketId, status: t.status, priority: t.priority })));
    console.log('API: Applied filters:', filters);
    
    if (filters?.userId) {
      tickets = tickets.filter(t => 
        t.requesterId === filters.userId || 
        t.assignedAgentId === filters.userId ||
        (t.assignedAgents && t.assignedAgents.some(agent => agent.id === filters.userId))
      );
    }
    if (filters?.status) {
      const statusList = filters.status.split(',').map(s => s.trim());
      console.log('API: Filtering by status:', statusList);
      tickets = tickets.filter(t => statusList.some(status => 
        t.status.toLowerCase() === status.toLowerCase()
      ));
      console.log('API: After status filter:', tickets.length, 'tickets');
    }
    if (filters?.category) {
      const categoryList = filters.category.split(',').map(c => c.trim());
      console.log('API: Filtering by category:', categoryList);
      tickets = tickets.filter(t => categoryList.some(category => 
        t.category.toLowerCase() === category.toLowerCase()
      ));
      console.log('API: After category filter:', tickets.length, 'tickets');
    }
    if (filters?.priority) {
      const priorityList = filters.priority.split(',').map(p => p.trim());
      console.log('API: Filtering by priority:', priorityList);
      tickets = tickets.filter(t => priorityList.some(priority => 
        t.priority.toLowerCase() === priority.toLowerCase()
      ));
      console.log('API: After priority filter:', tickets.length, 'tickets');
    }
    if (filters?.assignedAgent) {
      const agentList = filters.assignedAgent.split(',').map(a => a.trim());
      console.log('API: Filtering by assigned agent:', agentList);
      tickets = tickets.filter(t => agentList.some(agentId => 
        t.assignedAgentId === agentId
      ));
      console.log('API: After assigned agent filter:', tickets.length, 'tickets');
    }
    if (filters?.requester) {
      const requesterList = filters.requester.split(',').map(r => r.trim());
      console.log('API: Filtering by requester:', requesterList);
      tickets = tickets.filter(t => requesterList.some(requesterId => 
        t.requesterId === requesterId
      ));
      console.log('API: After requester filter:', tickets.length, 'tickets');
    }
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      tickets = tickets.filter(t => 
        t.title.toLowerCase().includes(searchTerm) || 
        t.description.toLowerCase().includes(searchTerm)
      );
    }
    if (filters?.searchAgent) {
      const searchAgent = filters.searchAgent.toLowerCase();
      tickets = tickets.filter(t => {
        if (!t.assignedAgentId) return false;
        const agent = users.find(u => u.id === t.assignedAgentId);
        if (!agent) return false;
        return agent.firstName.toLowerCase().includes(searchAgent) || 
               agent.lastName.toLowerCase().includes(searchAgent) ||
               `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(searchAgent);
      });
    }
    if (filters?.startDate) {
      // Create start date in UTC to match the mock data format
      const startDate = new Date(filters.startDate + 'T00:00:00Z');
      console.log('API: Filtering by start date:', startDate);
      console.log('API: Sample ticket dates before filter:', tickets.slice(0, 3).map(t => ({ id: t.ticketId, createdAt: t.createdAt })));
      tickets = tickets.filter(t => new Date(t.createdAt) >= startDate);
      console.log('API: After start date filter:', tickets.length, 'tickets');
    }
    if (filters?.endDate) {
      // Create end date in UTC to match the mock data format
      const endDate = new Date(filters.endDate + 'T23:59:59Z');
      console.log('API: Filtering by end date:', endDate);
      console.log('API: Sample ticket dates before filter:', tickets.slice(0, 3).map(t => ({ id: t.ticketId, createdAt: t.createdAt })));
      tickets = tickets.filter(t => new Date(t.createdAt) <= endDate);
      console.log('API: After end date filter:', tickets.length, 'tickets');
    }
    
    // Page-specific filters
    if (filters?.openOnly) {
      tickets = tickets.filter(t => 
        t.status === 'New' || 
        t.status === 'In Progress' || 
        t.status === 'Waiting for Customer'
      );
    }
    if (filters?.closedOnly) {
      tickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
    }
    if (filters?.unassignedOnly) {
      tickets = tickets.filter(t => !t.assignedAgentId);
    }
    if (filters?.resolvedOnly) {
      tickets = tickets.filter(t => t.status === 'Resolved');
    }
    
    console.log('API: Filtered tickets:', tickets.map(t => ({ id: t.ticketId, status: t.status })));
    console.log('API: Applied filters:', filters);
    
    tickets = tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10; // Match UI default
    const totalItems = tickets.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    console.log('API: Pagination details:', {
      page,
      limit,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      ticketsBeforeSlice: tickets.length
    });
    
    const paginatedTickets = tickets.slice(startIndex, endIndex);
    
    console.log('API: Final paginated tickets:', paginatedTickets.length);

    return {
      tickets: paginatedTickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        pageSize: limit
      }
    };
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    await this.initialize();
    await this.delay(300);
    return localStorageService.getTickets().find(t => t.ticketId === id) || null;
  }

  async createTicket(ticket: Omit<Ticket, 'ticketId' | 'createdAt' | 'updatedAt' | 'updateHistory'>, createdBy: string): Promise<Ticket> {
    await this.initialize();
    await this.delay(800);
    const existingTickets = localStorageService.getTickets();
    const ticketId = `TKT-${Date.now()}`;
    const newTicket: Ticket = {
      ...ticket,
      ticketId,
      createdAt: new Date(),
      updatedAt: new Date(),
      updateHistory: [
        this.createUpdateRecord(
          ticketId,
          createdBy,
          'created',
          undefined,
          undefined,
          undefined,
          'Ticket created'
        )
      ]
    };
    localStorageService.saveTicket(newTicket);
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>, updatedBy: string): Promise<Ticket> {
    await this.initialize();
    await this.delay(500);
    const tickets = localStorageService.getTickets();
    const ticketIndex = tickets.findIndex(t => t.ticketId === id);
    if (ticketIndex !== -1) {
      const oldTicket = tickets[ticketIndex];
      const newUpdateHistory = [...(oldTicket.updateHistory || [])];
      
      // Track specific field changes
      for (const key of Object.keys(updates)) {
        if (key === 'updateHistory' || key === 'updatedAt' || key === 'assignedAgentNames' || key === 'assignedAgent' || key === 'workLog') {
          continue;
        }
        
        const oldValue = oldTicket[key as keyof Ticket];
        const newValue = updates[key as keyof Ticket];
        
        // Skip if values are identical (no change at all)
        if (oldValue === newValue) {
          continue;
        }
        
        // Only track if there's an actual meaningful change
        if (this.hasMeaningfulChange(key, oldValue, newValue)) {
          let action: TicketUpdate['action'] = 'updated';
          let description = `${key} updated`;
          let shouldTrack = true;
          
          if (key === 'status') {
            action = 'status_changed';
            description = `Status changed from "${oldValue || 'undefined'}" to "${newValue || 'undefined'}"`;
          } else if (key === 'assignedAgentId') {
            action = 'assigned';
            const oldUser = mockUsers.find(u => u.id === oldValue);
            const newUser = mockUsers.find(u => u.id === newValue);
            description = `Ticket assigned from "${oldUser?.displayName || oldUser?.firstName + ' ' + oldUser?.lastName || 'unassigned'}" to "${newUser?.displayName || newUser?.firstName + ' ' + newUser?.lastName || 'unassigned'}"`;
            
            // Auto-change status to "In Progress" when assigning
            if (oldTicket.status === 'New' || oldTicket.status === 'In Progress') {
              updates.status = 'In Progress';
            }
          } else if (key === 'assignedAgents') {
            action = 'assigned';
            const oldAgents = this.getUserNamesFromIds(oldValue as string[] || []);
            const newAgents = this.getUserNamesFromIds(newValue as string[] || []);
            
            // Only show the change if the actual agent lists are different
            const oldAgentIds = (oldValue as string[] || []).sort();
            const newAgentIds = (newValue as string[] || []).sort();
            const agentsActuallyChanged = oldAgentIds.length !== newAgentIds.length || 
              oldAgentIds.some((id, index) => id !== newAgentIds[index]);
            
            if (agentsActuallyChanged) {
              description = `Assigned agents changed from "${oldAgents.join(', ') || 'none'}" to "${newAgents.join(', ') || 'none'}"`;
              
              // Auto-change status to "In Progress" when assigning
              if (oldTicket.status === 'New' || oldTicket.status === 'In Progress') {
                updates.status = 'In Progress';
              }
            } else {
              // Skip this update if agents haven't actually changed
              shouldTrack = false;
            }
          } else if (key === 'priority') {
            description = `Priority changed from "${oldValue || 'undefined'}" to "${newValue || 'undefined'}"`;
          } else if (key === 'escalationLevel') {
            description = `Escalation level changed from "${oldValue || 'undefined'}" to "${newValue || 'undefined'}"`;
          } else if (key === 'title') {
            description = `Title changed from "${oldValue || 'undefined'}" to "${newValue || 'undefined'}"`;
          } else if (key === 'description') {
            description = `Description updated`;
          } else if (key === 'category') {
            description = `Category changed from "${oldValue || 'undefined'}" to "${newValue || 'undefined'}"`;
          } else if (key === 'subCategoryId') {
            const oldSub = this.getSubCategoryName(oldValue as string);
            const newSub = this.getSubCategoryName(newValue as string);
            description = `Subcategory changed from "${oldSub || 'undefined'}" to "${newSub || 'undefined'}"`;
          } else if (key === 'additionalContacts') {
            const oldContacts = (oldValue as any[] || []).map(contact => contact.name || contact.email || 'Unknown').join(', ');
            const newContacts = (newValue as any[] || []).map(contact => contact.name || contact.email || 'Unknown').join(', ');
            description = `Additional contacts changed from "${oldContacts || 'none'}" to "${newContacts || 'none'}"`;
          }
          
          if (shouldTrack) {
            newUpdateHistory.push(
              this.createUpdateRecord(
                id,
                updatedBy,
                action,
                key,
                String(oldValue || 'undefined'),
                String(newValue || 'undefined'),
                description
              )
            );
          }
        }
      }
      
      const updatedTicket = { 
        ...oldTicket, 
        ...updates, 
        updatedAt: new Date(),
        updateHistory: newUpdateHistory
      };
      localStorageService.saveTicket(updatedTicket);
      return updatedTicket;
    }
    throw new Error('Ticket not found');
  }

  // Messages
  async getTicketMessages(ticketId: string): Promise<Message[]> {
    await this.delay(300);
    const data = localStorageService.getData();
    const messages = data.messages || [];
    return messages
      .filter(m => m.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async addTicketMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    await this.delay(500);
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    // Save to localStorage
    const data = localStorageService.getData();
    data.messages = data.messages || [];
    data.messages.push(newMessage);
    localStorageService.saveData(data);
    
    return newMessage;
  }

  // System Data
  async getCategories(): Promise<Category[]> {
    await this.delay(200);
    return mockCategories.filter(c => c.isActive);
  }

  async getPriorities(): Promise<Priority[]> {
    await this.delay(200);
    return mockPriorities.filter(p => p.isActive).sort((a, b) => a.level - b.level);
  }

  async getTicketStatuses(): Promise<TicketStatus[]> {
    await this.delay(200);
    return mockTicketStatuses.filter(s => s.isActive);
  }

  async getSystemSettings(): Promise<SystemSettings> {
    await this.delay(300);
    return mockSystemSettings;
  }

  async updateSystemSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    await this.delay(500);
    Object.assign(mockSystemSettings, updates);
    return mockSystemSettings;
  }

  // Knowledge Base
  async getKnowledgeArticles(categoryId?: string, search?: string): Promise<KnowledgeArticle[]> {
    await this.delay(400);
    let articles = mockKnowledgeArticles.filter(a => a.isPublished);
    
    if (categoryId) {
      articles = articles.filter(a => a.categoryId === categoryId);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.content.toLowerCase().includes(searchLower) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return articles.sort((a, b) => b.views - a.views);
  }

  async getKnowledgeArticleById(id: string): Promise<KnowledgeArticle | null> {
    await this.delay(300);
    const article = mockKnowledgeArticles.find(a => a.id === id);
    if (article) {
      article.views += 1; // Increment view count
    }
    return article || null;
  }

  // Dashboard
  async getDashboardMetrics(dateRange?: string): Promise<DashboardMetrics> {
    await this.delay(600);
    
    // If no date range specified, return mock data
    if (!dateRange) {
      return mockDashboardMetrics;
    }
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get tickets from localStorage
    await this.initialize();
    const tickets = localStorageService.getTickets();
    
    // Filter tickets by date range
    const filteredTickets = tickets.filter(ticket => 
      new Date(ticket.createdAt) >= startDate
    );
    
    // Calculate metrics dynamically
    const totalTickets = filteredTickets.length;
    const openTickets = filteredTickets.filter(t => 
      !['Resolved', 'Closed'].includes(t.status)
    ).length;
    const pendingTickets = filteredTickets.filter(t => 
      t.status === 'Waiting for Customer'
    ).length;
    const resolvedTickets = filteredTickets.filter(t => 
      t.status === 'Resolved'
    ).length;
    
    // Calculate average resolution time
    const resolvedTicketsWithTime = filteredTickets.filter(t => 
      t.resolvedAt && t.status === 'Resolved'
    );
    const avgResolutionTime = resolvedTicketsWithTime.length > 0 
      ? resolvedTicketsWithTime.reduce((sum, ticket) => {
          const resolutionTime = new Date(ticket.resolvedAt!).getTime() - new Date(ticket.createdAt).getTime();
          return sum + (resolutionTime / (1000 * 60 * 60)); // Convert to hours
        }, 0) / resolvedTicketsWithTime.length
      : 0;
    
    // Calculate ticket trends (last 7 days)
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayTickets = filteredTickets.filter(t => 
        new Date(t.createdAt).toISOString().split('T')[0] === dateStr
      );
      const dayResolved = filteredTickets.filter(t => 
        t.resolvedAt && new Date(t.resolvedAt).toISOString().split('T')[0] === dateStr
      );
      
      trends.push({
        date: dateStr,
        opened: dayTickets.length,
        resolved: dayResolved.length
      });
    }
    
    // Calculate category distribution
    const categoryDistribution = filteredTickets.reduce((acc, ticket) => {
      const categoryId = this.getCategoryIdByName(ticket.category);
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryDistributionArray = Object.entries(categoryDistribution).map(([categoryId, count]) => ({
      categoryId,
      count
    }));
    
    return {
      totalTickets,
      openTickets,
      pendingTickets,
      resolvedTickets,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal
      ticketTrends: trends,
      categoryDistribution: categoryDistributionArray
    };
  }
  
  private getCategoryIdByName(categoryName: string): string {
    const category = mockCategories.find(c => c.name === categoryName);
    return category?.id || 'unknown';
  }

  // Work Log
  async getTicketWorkLog(ticketId: string): Promise<WorkLogEntry[]> {
    await this.initialize();
    await this.delay(200);
    const ticket = localStorageService.getTickets().find(t => t.ticketId === ticketId);
    return ticket?.workLog || [];
  }

  async addTicketWorkLog(data: {
    ticketId: string;
    userId: string;
    content: string;
    type: 'work_log' | 'note' | 'action';
  }): Promise<WorkLogEntry> {
    await this.initialize();
    await this.delay(300);
    
    const user = mockUsers.find(u => u.id === data.userId);
    const workLogEntry: WorkLogEntry = {
      id: `worklog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticketId: data.ticketId,
      userId: data.userId,
      userName: user?.displayName || `${user?.firstName} ${user?.lastName}` || 'Unknown User',
      userEmail: user?.email || 'unknown@example.com',
      content: data.content,
      timestamp: new Date(),
      type: data.type
    };

    // Add to ticket's work log
    const tickets = localStorageService.getTickets();
    const ticketIndex = tickets.findIndex(t => t.ticketId === data.ticketId);
    if (ticketIndex !== -1) {
      const ticket = tickets[ticketIndex];
      if (!ticket.workLog) {
        ticket.workLog = [];
      }
      ticket.workLog.push(workLogEntry);
      localStorageService.saveTicket(ticket);
    }

    return workLogEntry;
  }
}

export const apiService = new ApiService();