// src/components/AdminNotifications.tsx
import React, { useState, useEffect } from "react";
import api from "../Services/api";
import "./AdminNotifications.css";

interface Notification {
  id: number;
  message: string;
  type: "info" | "warning" | "danger" | "success";
  read_at: string | null;
  created_at: string;
  user_id: number;
}

interface AdminNotificationsProps {
  onClose?: () => void;
  maxHeight?: string;
}

/**
 * Admin Notifications Panel
 * Displays real-time notifications and system alerts
 */
const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  onClose,
  maxHeight = "500px",
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.fetchNotifications(1);
      const notificationList = data.data || data;
      setNotifications(notificationList);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read_at)
          .map((n) => api.markNotificationRead(n.id))
      );
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") {
      return !n.read_at;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="admin-notifications">
      <div className="notification-header">
        <h3>
          🔔 Notifications
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="notification-controls">
        <button
          className={`filter-btn ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notification-list" style={{ maxHeight }}>
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item type-${notification.type} ${
                !notification.read_at ? "unread" : ""
              }`}
            >
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.read_at && (
                <button
                  className="mark-read-btn"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Mark as read"
                >
                  ●
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="no-notifications">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;

/**
 * Notification Toast Component
 * For temporary notification popups
 */
export interface ToastNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
}

interface NotificationToastProps {
  notifications: ToastNotification[];
  onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  );
};

interface ToastProps {
  notification: ToastNotification;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(onClose, notification.duration || 5000);
    return () => clearTimeout(timeout);
  }, [notification, onClose]);

  return (
    <div className={`toast-notification type-${notification.type}`}>
      <p>{notification.message}</p>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};
