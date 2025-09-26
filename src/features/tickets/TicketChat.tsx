import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { formatRelativeTime, getInitials } from '../../utils';
import type { Message, User } from '../../types';

interface TicketChatProps {
  ticketId: string;
  ticketUserId: string;
}

export function TicketChat({ ticketId, ticketUserId }: TicketChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showInternal, setShowInternal] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesData, usersData] = await Promise.all([
          apiService.getTicketMessages(ticketId),
          apiService.getUsers(),
        ]);
        setMessages(messagesData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserById = (id: string) => users.find(u => u.id === id);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const message = await apiService.addTicketMessage({
        ticketId,
        userId: user.id,
        content: newMessage.trim(),
        isInternal: isInternal && (user.role === 'agent' || user.role === 'admin'),
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = showInternal 
    ? messages 
    : messages.filter(m => !m.isInternal);

  const canSendInternal = user?.role === 'agent' || user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Conversation
        </h3>
        {canSendInternal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInternal(!showInternal)}
            className="flex items-center space-x-2"
          >
            {showInternal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{showInternal ? 'Hide Internal' : 'Show Internal'}</span>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => {
            const messageUser = getUserById(message.userId);
            const isOwnMessage = message.userId === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {messageUser ? getInitials(messageUser.firstName, messageUser.lastName) : '?'}
                      </span>
                    </div>
                  </div>
                  <div className={`${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.isInternal
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                          : isOwnMessage
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {message.isInternal && (
                        <div className="text-xs font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                          Internal Note
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {messageUser && (
                        <span className="font-medium">
                          {messageUser.firstName} {messageUser.lastName}
                        </span>
                      )}
                      <span className="ml-1">
                        {formatRelativeTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {canSendInternal && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="internal-note"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="internal-note" className="text-sm text-gray-700 dark:text-gray-300">
                Internal note (not visible to customer)
              </label>
            </div>
          )}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="p-2 h-auto"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!newMessage.trim() || isSending}
                isLoading={isSending}
                className="p-2 h-auto"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}