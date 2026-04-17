import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface NotificationContextProps {
  notifications: any[];
  notificationCount: number;
  fetchNotifications: () => Promise<void>;
  fetchNotificationCount: () => Promise<void>;
  markSingleNotificationAsRead: (id: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        'https://furnspace.onrender.com/api/v1/useractivity/list', 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    try {
      // First check if we have a count in localStorage (set by Notification.tsx)
      const localCount = localStorage.getItem('unreadNotificationCount');
      if (localCount !== null) {
        setNotificationCount(parseInt(localCount, 10));
        return;
      }

      // Otherwise fetch from API or calculate from stored notifications
      const token = localStorage.getItem('token');
      if (!token) return;

      // You could replace this with an API call that directly returns the count
      // For now, we'll fetch all notifications and calculate unread count
      const response = await axios.post(
        'https://furnspace.onrender.com/api/v1/useractivity/list', 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.data) {
        const readIds = new Set(JSON.parse(localStorage.getItem('readNotifications') || '[]'));
        const unreadCount = response.data.data.filter(
          (notification: any) => !readIds.has(notification.id.toString())
        ).length;
        
        setNotificationCount(unreadCount);
        // Store for future use
        localStorage.setItem('unreadNotificationCount', unreadCount.toString());
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, []);

  const markSingleNotificationAsRead = async (id: string): Promise<boolean> => {
    try {
      // In a real app, you might call an API to mark as read on the server
      // For now, we'll just update it in localStorage

      // Get current read notifications
      const readIds = new Set(JSON.parse(localStorage.getItem('readNotifications') || '[]'));
      
      // Add this notification ID
      readIds.add(id);
      
      // Update localStorage
      localStorage.setItem('readNotifications', JSON.stringify([...readIds]));
      
      // Update the count in localStorage (subtract 1 if it exists)
      const currentCount = localStorage.getItem('unreadNotificationCount');
      if (currentCount !== null) {
        const newCount = Math.max(0, parseInt(currentCount, 10) - 1);
        localStorage.setItem('unreadNotificationCount', newCount.toString());
        setNotificationCount(newCount);
      }
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const value = {
    notifications,
    notificationCount,
    fetchNotifications,
    fetchNotificationCount,
    markSingleNotificationAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};