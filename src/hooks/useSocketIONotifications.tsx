/**
 * useSocketIONotifications - SuperAdmin-specific Socket.IO notifications hook
 * Handles platform-wide notifications with priority-based treatment
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { superAdminApi } from '../lib/superAdminApi';

interface Notification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  category: string;
  eventType: string;
  icon?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
  createdAt: string;
  metadata?: any;
  requiresAck?: boolean;
}

interface NotificationStats {
  total: number;
  unread: number;
  byPriority: {
    P0: number;
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
}

interface UseSocketIONotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  acknowledgeNotification: (notificationId: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  reconnect: () => void;
  refresh: () => Promise<void>;
}

const SOCKET_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_SOCKET_URL
    ? new URL(process.env.NEXT_PUBLIC_SOCKET_URL).origin
    : (process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
      : 'http://localhost:5000'))
  : 'http://localhost:5000';

export const useSocketIONotifications = (): UseSocketIONotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byPriority: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 }
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, token } = useAuthStore();

  // Calculate stats from notifications
  const calculateStats = useCallback((notifs: Notification[]) => {
    const stats: NotificationStats = {
      total: notifs.length,
      unread: 0,
      byPriority: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 }
    };

    notifs.forEach(notif => {
      const isRead = (notif as any).isRead || notif.metadata?.isRead;
      if (!isRead) {
        stats.unread++;
      }
      const priority = notif.priority || 'P3';
      stats.byPriority[priority as keyof typeof stats.byPriority]++;
    });

    return stats;
  }, []);

  // Acknowledge notification (for P0/P1)
  const acknowledgeNotification = useCallback((notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('notification_ack', {
        notificationId,
        acknowledged: true
      });
    }
  }, []);

  // Play notification sound for SuperAdmin
  const playNotificationSound = useCallback((priority: string) => {
    try {
      let soundFile = '/notification-sound.mp3';

      // Different sounds for different priorities
      if (priority === 'P0') {
        soundFile = '/critical-alert.mp3'; // Fallback to default if not found
      } else if (priority === 'P1') {
        soundFile = '/high-priority.mp3'; // Fallback to default if not found
      }

      const audio = new Audio(soundFile);
      audio.volume = priority === 'P0' ? 0.8 : 0.5;
      audio.play().catch(() => {
        // Fallback to default sound
        const fallbackAudio = new Audio('/notification-sound.mp3');
        fallbackAudio.volume = 0.5;
        fallbackAudio.play().catch(() => { });
      });
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Handle new notification with SuperAdmin-specific treatment
  const handleNewNotification = useCallback((notification: Notification) => {
    // Ensure priority exists
    if (!notification.priority) {
      notification.priority = 'P3';
    }

    // Ensure eventType and type exist and are synced
    if (!notification.eventType && (notification as any).type) {
      notification.eventType = (notification as any).type;
    }
    if (!(notification as any).type && notification.eventType) {
      (notification as any).type = notification.eventType;
    }
    if (!notification.eventType) {
      notification.eventType = 'general_alert';
    }
    if (!(notification as any).type) {
      (notification as any).type = 'general_alert';
    }

    if (!notification.category) {
      notification.category = 'system';
    }

    setNotifications(prev => {
      // DEDUPLICATION: Check if this notification already exists
      const exists = prev.some(n => (n.id === notification.id) || (n._id === notification.id));
      if (exists) {
        console.log(`♻️ Skipping duplicate SuperAdmin notification: ${notification.id}`);
        return prev;
      }

      const updated = [notification, ...prev];
      setStats(calculateStats(updated));
      return updated;
    });

    // Play sound for high priority notifications
    if (['P0', 'P1'].includes(notification.priority)) {
      playNotificationSound(notification.priority);
    }

    // SuperAdmin-specific toast notifications
    const isHighPriority = ['P0', 'P1'].includes(notification.priority);
    const isCritical = notification.priority === 'P0';

    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <div className="font-bold flex items-center gap-2">
            {isCritical && <span className="text-red-500 animate-pulse">🚨</span>}
            {isHighPriority && !isCritical && <span className="text-orange-500">⚠️</span>}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-black uppercase tracking-wider",
              isCritical ? "bg-red-100 text-red-700" :
                isHighPriority ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
            )}>
              {notification.priority} PLATFORM ALERT
            </span>
          </div>
          <div className="font-semibold">{notification.title}</div>
          <div className="text-sm opacity-90">{notification.message}</div>
          {notification.metadata?.tenantCount && (
            <div className="text-xs text-gray-600">
              Affects {notification.metadata.tenantCount} tenant(s)
            </div>
          )}
          {notification.requiresAck && (
            <button
              onClick={() => {
                acknowledgeNotification(notification.id);
                toast.dismiss(t.id);
              }}
              className="mt-2 bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 transition-colors font-bold"
            >
              🛡️ Acknowledge Critical Alert
            </button>
          )}
        </div>
      ),
      {
        duration: isCritical ? Infinity : isHighPriority ? 15000 : 8000,
        position: 'top-right',
        style: {
          borderLeft: isCritical ? '4px solid #dc2626' :
            isHighPriority ? '4px solid #ea580c' : '4px solid #2563eb',
          minWidth: '350px',
          maxWidth: '450px'
        }
      }
    );

    // Browser notification for critical alerts
    if (isCritical && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚨 CRITICAL: ${notification.title}`, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: true
      });
    }
  }, [calculateStats, acknowledgeNotification, playNotificationSound]);

  // Fetch initial notifications from SuperAdmin API
  const fetchNotifications = useCallback(async () => {
    if (!user || !token) return;

    try {
      console.log('🔄 Fetching SuperAdmin notifications...');
      const data = await superAdminApi.getNotifications() as any;
      const list = data?.data?.notifications ?? data?.notifications ?? [];

      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((n: any) => ({
          ...n,
          id: n._id || n.id,
          priority: n.priority || 'P3',
          eventType: n.eventType || n.type || 'general_alert',
          type: n.type || n.eventType || 'general_alert',
          category: n.category || 'system'
        }));
        setNotifications(mapped);
        setStats(calculateStats(mapped));
        console.log(`✅ Loaded ${mapped.length} SuperAdmin notifications`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch SuperAdmin notifications:', error);
    }
  }, [user, token, calculateStats]);

  // Connect to Socket.IO server with SuperAdmin context
  const connect = useCallback(() => {
    if (!user || !token || socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const socket = io(SOCKET_URL, {
        auth: {
          token: token,
          role: 'superadmin' // Identify as SuperAdmin
        },
        query: {
          token: token,
          role: 'superadmin'
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log(`✅ SuperAdmin Socket.IO connected: ${socket.id} for user: ${user?._id || 'unknown'}`);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);

        // Request browser notification permission for critical alerts
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }

        fetchNotifications();
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 SuperAdmin Socket.IO disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);

        if (reason !== 'io client disconnect') {
          setConnectionError(`Disconnected: ${reason}`);
          scheduleReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ SuperAdmin Socket.IO connection error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(error.message);
        scheduleReconnect();
      });

      // SuperAdmin-specific notification events
      socket.on('notification', handleNewNotification);
      socket.on('platform_alert', handleNewNotification);
      socket.on('critical_alert', handleNewNotification);
      socket.on('security_alert', handleNewNotification);
      socket.on('system_alert', handleNewNotification);

      // High priority notifications
      socket.on('high_priority_notification', (notification) => {
        handleNewNotification({
          ...notification,
          metadata: { ...notification.metadata, isHighPriority: true }
        });
      });

      // Platform-wide events
      socket.on('tenant_created', (data) => {
        handleNewNotification({
          id: `tenant_created_${Date.now()}`,
          title: 'New Tenant Registration',
          message: `Tenant "${data.tenantName}" has been created`,
          priority: 'P2',
          category: 'tenant_management',
          eventType: 'tenant_created',
          createdAt: new Date().toISOString(),
          metadata: data
        });
      });

      socket.on('payment_failure_spike', (data) => {
        handleNewNotification({
          id: `payment_failure_${Date.now()}`,
          title: 'Payment Failure Spike Detected',
          message: `${data.failureCount} payment failures in the last ${data.timeWindow}`,
          priority: 'P1',
          category: 'financial',
          eventType: 'payment_failure_spike',
          createdAt: new Date().toISOString(),
          metadata: data,
          requiresAck: true
        });
      });

      socket.on('security_breach_detected', (data) => {
        handleNewNotification({
          id: `security_breach_${Date.now()}`,
          title: '🚨 SECURITY BREACH DETECTED',
          message: data.description || 'Suspicious activity detected on the platform',
          priority: 'P0',
          category: 'security',
          eventType: 'security_breach_detected',
          createdAt: new Date().toISOString(),
          metadata: data,
          requiresAck: true
        });
      });

      // Acknowledgment confirmation
      socket.on('ack_confirmed', (data) => {
        console.log('✅ SuperAdmin acknowledgment confirmed:', data);
        toast.success('Critical alert acknowledged');
      });

      // Error handling
      socket.on('ack_error', (error) => {
        console.error('❌ SuperAdmin acknowledgment error:', error);
        toast.error('Failed to acknowledge alert');
      });

    } catch (error) {
      console.error('❌ Failed to create SuperAdmin socket connection:', error);
      setIsConnecting(false);
      setConnectionError('Failed to create connection');
      scheduleReconnect();
    }
  }, [user, token, handleNewNotification, fetchNotifications]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 SuperAdmin attempting to reconnect...');
      connect();
    }, 5000);
  }, [connect]);

  // Disconnect from Socket.IO server
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true, metadata: { ...notif.metadata, isRead: true } }
          : notif
      );
      setStats(calculateStats(updated));
      return updated;
    });

    // Notify backend
    superAdminApi.markNotificationAsRead(notificationId).catch(err => {
      console.error('Failed to sync markAsRead to backend:', err);
    });
  }, [calculateStats]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notif => ({
        ...notif,
        isRead: true,
        metadata: { ...notif.metadata, isRead: true }
      }));
      setStats(calculateStats(updated));
      return updated;
    });

    // Notify backend
    superAdminApi.markAllNotificationsAsRead().catch(err => {
      console.error('Failed to sync markAllAsRead to backend:', err);
    });
  }, [calculateStats]);

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    setStats({
      total: 0,
      unread: 0,
      byPriority: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 }
    });

    try {
      await superAdminApi.clearAllNotifications();
      toast.success('All platform alerts cleared');
    } catch (err) {
      console.error('Failed to sync clearNotifications to backend:', err);
      toast.error('Failed to clear alerts from server');
    }
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Initialize connection when user and token are available
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    notifications,
    stats,
    isConnected,
    isConnecting,
    connectionError,
    acknowledgeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    reconnect,
    refresh: fetchNotifications
  };
};

// Helper function for className utility
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}