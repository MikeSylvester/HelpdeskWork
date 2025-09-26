import type { 
  User, 
  Ticket, 
  Message, 
  Category, 
  Priority, 
  TicketStatus, 
  KnowledgeArticle, 
  SystemSettings, 
  DashboardMetrics 
} from '../types';
import { mockUsers } from '../mock-data/users';
import { mockTickets, mockMessages, mockDashboardMetrics } from '../mock-data/tickets';
import { mockCategories, mockPriorities, mockTicketStatuses, mockSystemSettings } from '../mock-data/system-data';
import { mockKnowledgeArticles } from '../mock-data/knowledge-base';

// Mock API service that simulates backend calls
class ApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  // Tickets
  async getTickets(filters?: { userId?: string; status?: string; category?: string }): Promise<Ticket[]> {
    await this.delay(500);
    let tickets = [...mockTickets];
    
    if (filters?.userId) {
      tickets = tickets.filter(t => t.userId === filters.userId || t.assignedToId === filters.userId);
    }
    if (filters?.status) {
      tickets = tickets.filter(t => t.statusId === filters.status);
    }
    if (filters?.category) {
      tickets = tickets.filter(t => t.categoryId === filters.category);
    }
    
    return tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    await this.delay(300);
    return mockTickets.find(t => t.id === id) || null;
  }

  async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    await this.delay(800);
    const newTicket: Ticket = {
      ...ticket,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTickets.unshift(newTicket);
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    await this.delay(500);
    const ticketIndex = mockTickets.findIndex(t => t.id === id);
    if (ticketIndex !== -1) {
      mockTickets[ticketIndex] = { ...mockTickets[ticketIndex], ...updates, updatedAt: new Date() };
      return mockTickets[ticketIndex];
    }
    throw new Error('Ticket not found');
  }

  // Messages
  async getTicketMessages(ticketId: string): Promise<Message[]> {
    await this.delay(300);
    return mockMessages
      .filter(m => m.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async addTicketMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    await this.delay(500);
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    mockMessages.push(newMessage);
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
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await this.delay(600);
    return mockDashboardMetrics;
  }
}

export const apiService = new ApiService();