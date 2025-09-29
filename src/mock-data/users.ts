import type { User } from '../types';

export const mockUsers: User[] = [
  {
    // Identity & Contact Info
    id: '1',
    employeeId: 'EMP001',
    firstName: 'Admin',
    lastName: 'User',
    displayName: 'Admin User',
    email: 'admin@helpdesk.com',
    phoneNumber: '+1-555-0101',
    mobileNumber: '+1-555-0102',
    department: 'IT Administration',
    jobTitle: 'IT Director',
    manager: 'CEO',
    
    // Location & Org Info
    defaultLocation: 'New York Office',
    currentLocation: 'New York Office',
    officeAddress: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    timeZone: 'America/New_York',
    
    // System / Access Info
    username: 'admin.user',
    employeeIdSystem: 'AD001',
    roles: ['admin'],
    
    // Preferences
    language: 'en-US',
    notificationPreferences: ['email', 'in-app'],
    darkModeEnabled: true,
    
    // Legacy fields
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    // Identity & Contact Info
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    email: 'agent@helpdesk.com',
    phoneNumber: '+1-555-0201',
    mobileNumber: '+1-555-0202',
    department: 'IT Support',
    jobTitle: 'Senior Support Specialist',
    manager: 'Admin User',
    
    // Location & Org Info
    defaultLocation: 'New York Office',
    currentLocation: 'New York Office',
    officeAddress: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    timeZone: 'America/New_York',
    
    // System / Access Info
    username: 'sarah.johnson',
    employeeIdSystem: 'AD002',
    roles: ['agent'],
    
    // Preferences
    language: 'en-US',
    notificationPreferences: ['email', 'in-app'],
    darkModeEnabled: false,
    
    // Legacy fields
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date('2024-01-15'),
    isActive: true,
  },
  {
    // Identity & Contact Info
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Mike',
    lastName: 'Chen',
    displayName: 'Mike Chen',
    email: 'agent2@helpdesk.com',
    phoneNumber: '+1-555-0301',
    mobileNumber: '+1-555-0302',
    department: 'IT Support',
    jobTitle: 'Support Specialist',
    manager: 'Sarah Johnson',
    
    // Location & Org Info
    defaultLocation: 'Chicago Office',
    currentLocation: 'Chicago Office',
    officeAddress: {
      street: '456 Corporate Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'USA'
    },
    timeZone: 'America/Chicago',
    
    // System / Access Info
    username: 'mike.chen',
    employeeIdSystem: 'AD003',
    roles: ['agent'],
    
    // Preferences
    language: 'en-US',
    notificationPreferences: ['in-app'],
    darkModeEnabled: true,
    
    // Legacy fields
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date('2024-01-20'),
    isActive: true,
  },
  {
    // Identity & Contact Info
    id: '4',
    employeeId: 'EMP004',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    email: 'user@example.com',
    phoneNumber: '+1-555-0401',
    mobileNumber: '+1-555-0402',
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    manager: 'Emma Wilson',
    
    // Location & Org Info
    defaultLocation: 'Remote',
    currentLocation: 'Remote',
    officeAddress: {
      street: '789 Home St',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      country: 'USA'
    },
    timeZone: 'America/Chicago',
    
    // System / Access Info
    username: 'john.doe',
    employeeIdSystem: 'AD004',
    roles: ['user'],
    
    // Preferences
    language: 'en-US',
    notificationPreferences: ['in-app'],
    darkModeEnabled: false,
    
    // Legacy fields
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date('2024-02-01'),
    isActive: true,
  },
  {
    // Identity & Contact Info
    id: '5',
    employeeId: 'EMP005',
    firstName: 'Emma',
    lastName: 'Wilson',
    displayName: 'Emma Wilson',
    email: 'user2@example.com',
    phoneNumber: '+1-555-0501',
    mobileNumber: '+1-555-0502',
    department: 'Marketing',
    jobTitle: 'Marketing Manager',
    manager: 'Admin User',
    
    // Location & Org Info
    defaultLocation: 'San Francisco Office',
    currentLocation: 'San Francisco Office',
    officeAddress: {
      street: '321 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA'
    },
    timeZone: 'America/Los_Angeles',
    
    // System / Access Info
    username: 'emma.wilson',
    employeeIdSystem: 'AD005',
    roles: ['user'],
    
    // Preferences
    language: 'en-US',
    notificationPreferences: ['email'],
    darkModeEnabled: true,
    
    // Legacy fields
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date('2024-02-05'),
    isActive: true,
  },
];