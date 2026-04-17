import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface NotificationContextProps {
  notificationCount: number;
  fetchNotificationCount: () => void;
  markNotificationsAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotificationCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("https://furnspace.onrender.com/api/v1/banned/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const notificationsData = response.data.data;
      setNotifications(notificationsData);
      const unreadCount = notificationsData.filter((notification: any) => !notification.read).length;
      setNotificationCount(unreadCount);
      localStorage.setItem("notifications", JSON.stringify(notificationsData));
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    setNotificationCount(0);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications);
      setNotifications(parsedNotifications);
      const unreadCount = parsedNotifications.filter((notification: any) => !notification.read).length;
      setNotificationCount(unreadCount);
    } else {
      fetchNotificationCount();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notificationCount, fetchNotificationCount, markNotificationsAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};