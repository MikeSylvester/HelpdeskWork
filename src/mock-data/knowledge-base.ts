import type { KnowledgeArticle } from '../types';

export const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'How to reset your password',
    content: `# How to reset your password

If you've forgotten your password, don't worry! You can easily reset it by following these steps:

## Step 1: Go to the login page
Navigate to the login page and click on the "Forgot Password?" link.

## Step 2: Enter your email address
Enter the email address associated with your account and click "Send Reset Link".

## Step 3: Check your email
You'll receive an email with a password reset link within a few minutes. If you don't see it, check your spam folder.

## Step 4: Create a new password
Click the link in the email and follow the instructions to create a new password.

## Password requirements
- At least 8 characters long
- Include at least one uppercase letter
- Include at least one lowercase letter
- Include at least one number
- Include at least one special character

If you continue to have issues, please contact our support team.`,
    categoryId: '1',
    authorId: '2',
    isPublished: true,
    views: 1247,
    helpful: 892,
    notHelpful: 23,
    tags: ['password', 'reset', 'login', 'account'],
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    title: 'Understanding your billing cycle',
    content: `# Understanding your billing cycle

This article explains how our billing system works and what you can expect.

## Billing periods
Our billing cycles are monthly, starting from the date you first subscribed to our service.

## Payment methods
We accept the following payment methods:
- Credit cards (Visa, MasterCard, American Express)
- PayPal
- Bank transfers (for enterprise customers)

## Invoice delivery
Invoices are sent via email 3 days before your billing date. You can also access them from your account dashboard.

## Late payments
If a payment fails, we'll retry it automatically for 7 days. After that, your account may be suspended until payment is received.

## Refunds
Refunds are processed within 5-10 business days and will appear on your original payment method.

For billing questions, please contact our billing department directly.`,
    categoryId: '2',
    authorId: '2',
    isPublished: true,
    views: 856,
    helpful: 654,
    notHelpful: 12,
    tags: ['billing', 'payment', 'invoice', 'refund'],
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-11-20'),
  },
  {
    id: '3',
    title: 'Mobile app troubleshooting guide',
    content: `# Mobile app troubleshooting guide

Having issues with our mobile app? Try these common solutions.

## App won't start or crashes
1. Force close the app completely
2. Restart your device
3. Check for app updates in your app store
4. Clear the app cache (Android) or reinstall (iOS)

## Login issues
1. Verify your internet connection
2. Check if your email/password is correct
3. Try logging in through a web browser first
4. Reset your password if needed

## Sync problems
1. Check your internet connection
2. Pull down to refresh the data
3. Log out and log back in
4. Contact support if the issue persists

## Performance issues
1. Close other apps to free up memory
2. Restart your device
3. Check available storage space
4. Update to the latest app version

## Supported devices
- iOS 12.0 or later
- Android 8.0 (API level 26) or later

If none of these solutions work, please contact our technical support team with your device information.`,
    categoryId: '1',
    authorId: '3',
    isPublished: true,
    views: 2134,
    helpful: 1876,
    notHelpful: 45,
    tags: ['mobile', 'troubleshooting', 'app', 'technical'],
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '4',
    title: 'How to submit a support ticket',
    content: `# How to submit a support ticket

Need help? Here's how to get in touch with our support team.

## Before you submit
1. Check our knowledge base for existing solutions
2. Gather relevant information about your issue
3. Take screenshots if applicable

## Submitting a ticket
1. Go to the "Submit Ticket" page
2. Choose the appropriate category
3. Set the priority level based on urgency
4. Provide a clear, descriptive title
5. Include detailed information about your issue
6. Attach any relevant files or screenshots
7. Click "Submit"

## What happens next
- You'll receive a confirmation email with your ticket number
- Our team will review your ticket within 2-4 hours
- We'll respond based on your priority level:
  - Critical: Within 1 hour
  - High: Within 4 hours
  - Normal: Within 24 hours
  - Low: Within 48 hours

## Tips for faster resolution
- Be specific about the problem
- Include steps to reproduce the issue
- Mention your browser/device information
- Provide error messages exactly as they appear

## Tracking your ticket
You can track your ticket status in the "My Tickets" section of your account.`,
    categoryId: '5',
    authorId: '2',
    isPublished: true,
    views: 543,
    helpful: 467,
    notHelpful: 8,
    tags: ['support', 'ticket', 'help', 'contact'],
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-11-15'),
  },
];