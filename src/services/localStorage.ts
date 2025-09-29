// Local Storage Service for Testing
// This allows you to test the full functionality by persisting data to localStorage

interface StorageData {
  tickets: any[];
  users: any[];
  categories: any[];
  priorities: any[];
  statuses: any[];
  workLogs: any[];
  settings: any;
}

class LocalStorageService {
  private storageKey = 'helpdesk-data';
  private initialized = false;

  private getData(): StorageData {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      return this.convertDates(parsed);
    }
    
    // Initialize with mock data if no data exists
    return {
      tickets: [],
      users: [],
      categories: [],
      priorities: [],
      statuses: [],
      workLogs: [],
      settings: null
    };
  }

  private convertDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.convertDates(item));
    } else if (data && typeof data === 'object') {
      const converted: any = {};
      for (const key in data) {
        if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
          // Handle both Date objects and date strings
          if (data[key] instanceof Date) {
            converted[key] = data[key];
          } else if (typeof data[key] === 'string' && data[key]) {
            const date = new Date(data[key]);
            // Only use the converted date if it's valid
            converted[key] = isNaN(date.getTime()) ? new Date() : date;
          } else {
            // Fallback to current date if invalid
            converted[key] = new Date();
          }
        } else if (key === 'updateHistory' && Array.isArray(data[key])) {
          converted[key] = data[key].map((update: any) => {
            const timestamp = update.timestamp instanceof Date ? update.timestamp : new Date(update.timestamp);
            return {
              ...update,
              timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp
            };
          });
        } else if (key === 'workLog' && Array.isArray(data[key])) {
          converted[key] = data[key].map((entry: any) => {
            const timestamp = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);
            return {
              ...entry,
              timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp
            };
          });
        } else if (key === 'chatThread' && Array.isArray(data[key])) {
          converted[key] = data[key].map((message: any) => {
            const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
            return {
              ...message,
              timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp
            };
          });
        } else {
          converted[key] = this.convertDates(data[key]);
        }
      }
      return converted;
    }
    return data;
  }

  private saveData(data: StorageData): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Tickets
  getTickets(): any[] {
    return this.getData().tickets;
  }

  saveTicket(ticket: any): void {
    const data = this.getData();
    const existingIndex = data.tickets.findIndex(t => t.ticketId === ticket.ticketId);
    
    if (existingIndex >= 0) {
      data.tickets[existingIndex] = ticket;
    } else {
      data.tickets.push(ticket);
    }
    
    this.saveData(data);
  }

  deleteTicket(ticketId: string): void {
    const data = this.getData();
    data.tickets = data.tickets.filter(t => t.ticketId !== ticketId);
    this.saveData(data);
  }

  // Users
  getUsers(): any[] {
    return this.getData().users;
  }

  saveUser(user: any): void {
    const data = this.getData();
    const existingIndex = data.users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      data.users[existingIndex] = user;
    } else {
      data.users.push(user);
    }
    
    this.saveData(data);
  }

  // Categories
  getCategories(): any[] {
    return this.getData().categories;
  }

  saveCategory(category: any): void {
    const data = this.getData();
    const existingIndex = data.categories.findIndex(c => c.id === category.id);
    
    if (existingIndex >= 0) {
      data.categories[existingIndex] = category;
    } else {
      data.categories.push(category);
    }
    
    this.saveData(data);
  }

  // Work Logs
  getWorkLogs(ticketId: string): any[] {
    const data = this.getData();
    return data.workLogs.filter(wl => wl.ticketId === ticketId);
  }

  saveWorkLog(workLog: any): void {
    const data = this.getData();
    data.workLogs.push(workLog);
    this.saveData(data);
  }

  // Initialize with mock data
  initializeWithMockData(mockData: any): void {
    const data = this.getData();
    
    // Only initialize if no data exists
    if (data.tickets.length === 0) {
      data.tickets = mockData.tickets || [];
      data.users = mockData.users || [];
      data.categories = mockData.categories || [];
      data.priorities = mockData.priorities || [];
      data.statuses = mockData.statuses || [];
      data.messages = mockData.messages || [];
      
      this.saveData(data);
    }
    this.initialized = true;
  }

  // Clear all data (for testing)
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    this.initialized = false;
  }

  // Reset to mock data (for testing)
  resetToMockData(mockData: any): void {
    this.clearAllData();
    this.initializeWithMockData(mockData);
  }

  // Fix corrupted dates in existing data
  fixCorruptedDates(): void {
    const data = this.getData();
    const fixedData = this.convertDates(data);
    this.saveData(fixedData);
  }

  // Export data (for backup)
  exportData(): string {
    return JSON.stringify(this.getData(), null, 2);
  }

  // Import data (for restore)
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  }
}

export const localStorageService = new LocalStorageService();
