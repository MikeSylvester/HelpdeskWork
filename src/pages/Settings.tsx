import React, { useState, useEffect } from 'react';
import { Save, Upload, Palette, Shield, Bell, Mail, Globe } from 'lucide-react';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { SystemSettings, Category, Priority, TicketStatus } from '../types';

export function Settings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, categoriesData, prioritiesData, statusesData] = await Promise.all([
          apiService.getSystemSettings(),
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getTicketStatuses(),
        ]);
        setSettings(settingsData);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setStatuses(statusesData);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSettingsChange = (key: keyof SystemSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await apiService.updateSystemSettings(settings);
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'categories', name: 'Categories', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'email', name: 'Email', icon: Mail },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="lg:col-span-3 h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Configure your help desk system preferences and options
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={handleSaveSettings} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                General Settings
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Allow User Registration
                    </label>
                    <select
                      value={settings?.allowUserRegistration ? 'true' : 'false'}
                      onChange={(e) => handleSettingsChange('allowUserRegistration', e.target.value === 'true')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Verification Required
                    </label>
                    <select
                      value={settings?.requireEmailVerification ? 'true' : 'false'}
                      onChange={(e) => handleSettingsChange('requireEmailVerification', e.target.value === 'true')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="true">Required</option>
                      <option value="false">Optional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Auto-assign Tickets
                    </label>
                    <select
                      value={settings?.autoAssignTickets ? 'true' : 'false'}
                      onChange={(e) => handleSettingsChange('autoAssignTickets', e.target.value === 'true')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Knowledge Base
                    </label>
                    <select
                      value={settings?.enableKnowledgeBase ? 'true' : 'false'}
                      onChange={(e) => handleSettingsChange('enableKnowledgeBase', e.target.value === 'true')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Attachments
                    </label>
                    <select
                      value={settings?.enableFileAttachments ? 'true' : 'false'}
                      onChange={(e) => handleSettingsChange('enableFileAttachments', e.target.value === 'true')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Max File Size (MB)"
                    type="number"
                    value={Math.round((settings?.maxFileSize || 0) / (1024 * 1024))}
                    onChange={(e) => handleSettingsChange('maxFileSize', parseInt(e.target.value) * 1024 * 1024)}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Branding & Appearance
              </h3>
              <div className="space-y-4">
                <Input
                  label="Brand Name"
                  value={settings?.brandName || ''}
                  onChange={(e) => handleSettingsChange('brandName', e.target.value)}
                  placeholder="Your Company Name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings?.primaryColor || '#f97316'}
                      onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={settings?.primaryColor || '#f97316'}
                      onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                      placeholder="#f97316"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload logo or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'categories' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Categories & Priorities
                </h3>
                <Button size="sm">
                  Add Category
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Ticket Categories
                  </h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priorities */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Priority Levels
                  </h4>
                  <div className="space-y-2">
                    {priorities.map((priority) => (
                      <div key={priority.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: priority.color }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {priority.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Level {priority.level}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statuses */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Ticket Statuses
                  </h4>
                  <div className="space-y-2">
                    {statuses.map((status) => (
                      <div key={status.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {status.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {status.isClosed ? 'Closed status' : 'Open status'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New Ticket Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notify agents when new tickets are created
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Ticket Assignment Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notify agents when tickets are assigned to them
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Customer Reply Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notify agents when customers reply to tickets
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Ticket Resolution Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notify customers when their tickets are resolved
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Email Configuration
              </h3>
              <div className="space-y-4">
                <Input
                  label="SMTP Server"
                  placeholder="smtp.example.com"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="SMTP Port"
                    type="number"
                    placeholder="587"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Encryption
                    </label>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    placeholder="your-email@example.com"
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <Input
                  label="From Email"
                  placeholder="support@yourcompany.com"
                />

                <Input
                  label="From Name"
                  placeholder="Your Company Support"
                />

                <div className="pt-4">
                  <Button variant="outline">
                    Test Email Configuration
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}