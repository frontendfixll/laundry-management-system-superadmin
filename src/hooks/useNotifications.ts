import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  data?: {
    tenancyId?: string;
    link?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('superadmin-storage');
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return parsed.state?.token || parsed.token;
  } catch {
    return null;
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const getHeaders = useCallback(() => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    const token = getAuthToken();
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/notifications?page=${page}&limit=${limit}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/superadmin/notifications/unread-count`, {
        headers: getHeaders()
      });
      const data = await res.json();
      
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [getHeaders]);

  // Mark as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/superadmin/notifications/read`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ notificationIds })
      });
      
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [getHeaders]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/superadmin/notifications/read-all`, {
        method: 'PUT',
        headers: getHeaders()
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [getHeaders]);

  // Setup polling for real-time updates
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Poll every 30 seconds
    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };
}
