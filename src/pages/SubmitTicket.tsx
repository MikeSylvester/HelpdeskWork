import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Paperclip, X, User } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { hasPermission } from '../utils';
import type { Category, Priority, User as UserType } from '../types';

export function SubmitTicket() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategoryId: '',
    priority: '',
    requesterId: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterDepartment: '',
    requesterJobTitle: '',
    requesterManager: '',
    requesterLocation: '',
    ticketLocation: {
      building: '',
      floor: '',
      room: '',
      desk: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    escalationLevel: 'tier 1' as 'tier 1' | 'tier 2' | 'tier 3',
    internalNotes: '',
  });

  const [additionalContacts, setAdditionalContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // Separate state for requester search
  const [requesterSearch, setRequesterSearch] = useState('');
  const [showRequesterDropdown, setShowRequesterDropdown] = useState(false);
  const requesterRef = useRef<HTMLDivElement>(null);
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, prioritiesData, usersData] = await Promise.all([
          apiService.getCategories(),
          apiService.getPriorities(),
          apiService.getUsers(),
        ]);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setUsers(usersData);
        
        // Set default values
        if (categoriesData.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
        }
        if (prioritiesData.length > 0) {
          const normalPriority = prioritiesData.find(p => p.name.toLowerCase() === 'normal');
          setFormData(prev => ({ 
            ...prev, 
            priorityId: normalPriority?.id || prioritiesData[0].id 
          }));
        }
        
        // Populate requester information with current user's data
        if (user) {
          setFormData(prev => ({
            ...prev,
            requesterId: user.id,
            requesterName: `${user.firstName} ${user.lastName}`,
            requesterEmail: user.email,
            requesterPhone: user.phoneNumber,
            requesterDepartment: user.department,
            requesterJobTitle: user.jobTitle,
            requesterManager: user.manager || '',
            requesterLocation: user.defaultLocation,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch form data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle click outside for contact dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setShowContactDropdown(false);
      }
      if (requesterRef.current && !requesterRef.current.contains(event.target as Node)) {
        setShowRequesterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddContact = (userId: string) => {
    if (!additionalContacts.includes(userId)) {
      setAdditionalContacts(prev => [...prev, userId]);
    }
    setContactSearch('');
    setShowContactDropdown(false);
  };

  const handleRemoveContact = (userId: string) => {
    setAdditionalContacts(prev => prev.filter(id => id !== userId));
  };

  const handleRequesterSelect = (selectedUser: UserType) => {
    setFormData(prev => ({
      ...prev,
      requesterId: selectedUser.id,
      requesterName: `${selectedUser.firstName} ${selectedUser.lastName}`,
      requesterEmail: selectedUser.email,
      requesterPhone: selectedUser.phoneNumber,
      requesterDepartment: selectedUser.department,
      requesterJobTitle: selectedUser.jobTitle,
      requesterManager: selectedUser.manager || '',
      requesterLocation: selectedUser.defaultLocation,
    }));
  };

  const canCreateForOthers = hasPermission(user?.roles || [], ['agent', 'admin']);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.subCategoryId) {
      newErrors.subCategory = 'Sub Category is required';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Get subcategory name for display
      const selectedCategory = categories.find(c => c.name === formData.category);
      const selectedSubCategory = selectedCategory?.subCategories?.find(sc => sc.id === formData.subCategoryId);

      const newTicket = await apiService.createTicket({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategoryId: formData.subCategoryId,
        subCategory: selectedSubCategory?.name,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: 'New', // Default to 'New' status
        requesterId: formData.requesterId || user.id,
        requesterName: formData.requesterName || user.displayName,
        requesterEmail: formData.requesterEmail || user.email,
        requesterPhone: formData.requesterPhone || user.phoneNumber,
        requesterDepartment: formData.requesterDepartment || user.department,
        requesterJobTitle: formData.requesterJobTitle || user.jobTitle,
        requesterManager: formData.requesterManager || user.manager,
        requesterLocation: formData.requesterLocation || user.defaultLocation,
        additionalContacts: additionalContacts.length > 0 ? additionalContacts.map(id => {
          const contactUser = users.find(u => u.id === id);
          return {
            name: contactUser?.displayName || `${contactUser?.firstName} ${contactUser?.lastName}`,
            email: contactUser?.email || '',
            phone: contactUser?.phoneNumber,
            role: 'Additional Contact'
          };
        }) : undefined,
        ticketLocation: Object.values(formData.ticketLocation).some(value => value.trim()) ? formData.ticketLocation : undefined,
        escalationLevel: formData.escalationLevel,
        chatThread: [],
        attachments: [],
        internalNotes: formData.internalNotes,
      }, user.id);

      navigate(`/tickets/${newTicket.ticketId}`);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      setErrors({ submit: 'Failed to submit ticket. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <Card>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Submit New Ticket
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Describe your issue and we'll help you resolve it quickly
        </p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief description of your issue"
            error={errors.title}
            required
          />

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select priority</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.name.toLowerCase()}>
                    {priority.name}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priority}</p>
              )}
            </div>
          </div>

          {/* Sub Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, subCategoryId: e.target.value }));
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={!formData.category}
            >
              <option value="">Select a sub category...</option>
              {formData.category && categories.find(c => c.name === formData.category)?.subCategories?.map(subCategory => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
            {errors.subCategory && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subCategory}</p>
            )}
          </div>

          {/* Requester Selection (for agents/admins) */}
          {canCreateForOthers && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Create ticket for
              </label>
              <div className="space-y-3">
                {/* Current Requester Display */}
                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {formData.requesterName.split(' ').map(n => n.charAt(0)).join('')}
                      </span>
                    </div>
                <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.requesterName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.requesterEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Search */}
                <div className="relative" ref={requesterRef}>
                  <input
                    type="text"
                    placeholder="Search users to change requester..."
                    value={requesterSearch}
                    onChange={(e) => {
                      setRequesterSearch(e.target.value);
                      setShowRequesterDropdown(true);
                    }}
                    onFocus={() => setShowRequesterDropdown(true)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  
                  {showRequesterDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {users
                        .filter(u => 
                          u.id !== user?.id && 
                          (u.displayName?.toLowerCase().includes(requesterSearch.toLowerCase()) ||
                           u.firstName.toLowerCase().includes(requesterSearch.toLowerCase()) ||
                           u.lastName.toLowerCase().includes(requesterSearch.toLowerCase()) ||
                           u.email.toLowerCase().includes(requesterSearch.toLowerCase()))
                        )
                        .map(userOption => (
                          <button
                            key={userOption.id}
                            type="button"
                            onClick={() => {
                              handleRequesterSelect(userOption);
                              setRequesterSearch('');
                              setShowRequesterDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {userOption.firstName.charAt(0)}{userOption.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {userOption.displayName || `${userOption.firstName} ${userOption.lastName}`}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {userOption.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      {users.filter(u => 
                        u.id !== user?.id && 
                        (u.displayName?.toLowerCase().includes(requesterSearch.toLowerCase()) ||
                         u.firstName.toLowerCase().includes(requesterSearch.toLowerCase()) ||
                         u.lastName.toLowerCase().includes(requesterSearch.toLowerCase()) ||
                         u.email.toLowerCase().includes(requesterSearch.toLowerCase()))
                      ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Please provide detailed information about your issue..."
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Ticket Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ticket Location (optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Building</label>
                <input
                  type="text"
                  value={formData.ticketLocation.building}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ticketLocation: { ...prev.ticketLocation, building: e.target.value }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Building name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Floor</label>
                <input
                  type="text"
                  value={formData.ticketLocation.floor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ticketLocation: { ...prev.ticketLocation, floor: e.target.value }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Floor number"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Room</label>
                <input
                  type="text"
                  value={formData.ticketLocation.room}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ticketLocation: { ...prev.ticketLocation, room: e.target.value }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Room number"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Desk/Workstation</label>
                <input
                  type="text"
                  value={formData.ticketLocation.desk}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ticketLocation: { ...prev.ticketLocation, desk: e.target.value }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Desk number"
                />
              </div>
            </div>
          </div>

          {/* Escalation Level - Admin Only */}
          {canCreateForOthers && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Escalation Level
              </label>
              <select
                name="escalationLevel"
                value={formData.escalationLevel}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="tier 1">Tier 1 - Basic Support</option>
                <option value="tier 2">Tier 2 - Advanced Support</option>
                <option value="tier 3">Tier 3 - Expert Support</option>
              </select>
            </div>
          )}

          {/* Internal Notes (for agents/admins) */}
          {canCreateForOthers && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Internal Notes (optional)
              </label>
              <textarea
                name="internalNotes"
                value={formData.internalNotes}
            onChange={handleInputChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Internal notes visible only to agents and admins..."
              />
            </div>
          )}

          {/* Additional Contacts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Contacts (optional)
            </label>
            <div className="space-y-3">
              {additionalContacts.map((userId) => {
                const contactUser = users.find(u => u.id === userId);
                return (
                  <div key={userId} className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {contactUser?.firstName.charAt(0)}{contactUser?.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {contactUser?.displayName || `${contactUser?.firstName} ${contactUser?.lastName}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {contactUser?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(userId)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              
              {/* Add Contact Search */}
              <div className="relative" ref={contactRef}>
                <input
                  type="text"
                  placeholder="Search users to add as additional contacts..."
                  value={contactSearch}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                    setShowContactDropdown(true);
                  }}
                  onFocus={() => setShowContactDropdown(true)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                
                {showContactDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {users
                      .filter(u => 
                        u.id !== user?.id && 
                        !additionalContacts.includes(u.id) &&
                        (u.displayName?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                         u.firstName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                         u.lastName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                         u.email.toLowerCase().includes(contactSearch.toLowerCase()))
                      )
                      .map(userOption => (
                        <button
                          key={userOption.id}
                          type="button"
                          onClick={() => handleAddContact(userOption.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {userOption.firstName.charAt(0)}{userOption.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {userOption.displayName || `${userOption.firstName} ${userOption.lastName}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {userOption.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    {users.filter(u => 
                      u.id !== user?.id && 
                      !additionalContacts.includes(u.id) &&
                      (u.displayName?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                       u.firstName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                       u.lastName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                       u.email.toLowerCase().includes(contactSearch.toLowerCase()))
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        No users found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachments (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <Paperclip className="h-5 w-5" />
                <span>Click to upload files or drag and drop</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                PNG, JPG, PDF, DOC up to 10MB each
              </p>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}