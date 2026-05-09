import { createContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

export type NotificationType = "success" | "error" | "info";

export interface NotificationPayload {
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

export interface NotificationContextValue {
  notify: (payload: NotificationPayload) => void;
  clearNotification: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

const DEFAULT_DURATION = 3200;

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  const notify = useCallback((payload: NotificationPayload) => {
    setNotification({
      ...payload,
      duration: payload.duration ?? DEFAULT_DURATION,
    });
  }, []);

  const clearNotification = useCallback(() => setNotification(null), []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, notification.duration ?? DEFAULT_DURATION);

    return () => window.clearTimeout(timer);
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ notify, clearNotification }}>
      {children}
      {notification && (
        <div
          className="centered-notification-overlay"
          onClick={clearNotification}
          role="alert"
          aria-live="assertive"
        >
          <div
            className={`centered-notification ${notification.type}`}
            onClick={(event) => event.stopPropagation()}
          >
            {notification.title && (
              <div className="notification-title">{notification.title}</div>
            )}
            <div className="notification-message">{notification.message}</div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
