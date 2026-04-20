import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaReply } from "react-icons/fa";
import api from "../Services/api";

interface NotificationItem {
  id: number;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
  reference_id?: number;
  sender_id?: number;
}

interface MessageReply {
  id: number;
  body: string;
  sender: { id: number; name: string };
  created_at: string;
}

interface MessageThread {
  id: number;
  sender: { id: number; name: string };
  recipient_role: string;
  body: string;
  created_at: string;
  replies: MessageReply[];
}

interface ToastNotification {
  id: string;
  notificationId: number;
  message: string;
}

interface MessageNotificationsProps {
  open?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const MessageNotifications: React.FC<MessageNotificationsProps> = ({ open, onToggle, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyingToNotificationId, setReplyingToNotificationId] = useState<number | null>(null);
  const [newRecipientRole, setNewRecipientRole] = useState("doctors");
  const [newBody, setNewBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newLoading, setNewLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showUnreadSection, setShowUnreadSection] = useState(false);
  const [showNewMessageSection, setShowNewMessageSection] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewMessageEmojiPicker, setShowNewMessageEmojiPicker] = useState(false);
  const seenNotifications = useRef<Set<number>>(new Set());

  const emojiStickers = ['😀', '😂', '😍', '🤔', '😢', '👍', '❤️', '🔥', '✨', '🎉', '👏', '💯', '🚀', '⭐', '💪', '🤝', '😎', '🥳', '😱', '🎊'];

  const panelOpen = open === undefined ? isOpen : open;
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  const parsePagedResponse = (response: any) => {
    const payload = response?.data?.data ? response.data.data : response.data;
    return payload?.data || payload || [];
  };

  const loadNotifications = async () => {
    try {
      const response = await api.fetchNotifications(1);
      const items: NotificationItem[] = parsePagedResponse(response);
      setNotifications(items);

      items.forEach((notification) => {
        if (notification.type !== "message") {
          return;
        }

        if (seenNotifications.current.has(notification.id)) {
          return;
        }

        seenNotifications.current.add(notification.id);
        setToasts((prev) => [
          {
            id: `${Date.now()}-${notification.id}`,
            notificationId: notification.id,
            message: notification.message,
          },
          ...prev,
        ]);
      });
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.fetchMessages();
      const items: MessageThread[] = parsePagedResponse(response);

      if (!selectedThread && items.length > 0) {
        setSelectedThread(items[0]);
      } else if (selectedThread) {
        const matched = items.find((item) => item.id === selectedThread.id);
        if (matched) {
          setSelectedThread(matched);
        }
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadMessages();

    const interval = window.setInterval(() => {
      loadNotifications();
      loadMessages();
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(0, -1));
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [toasts]);

  const togglePanel = () => {
    if (onToggle) {
      onToggle();
      return;
    }

    setIsOpen((prev) => !prev);
  };

  const closePanel = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
    
    // Reload notifications when closing to refresh read status
    loadNotifications();
  };

  const handleReplyToNotification = (notificationId: number) => {
    setReplyingToNotificationId(notificationId);
    setReplyBody("");
    setFeedback(null);
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await api.markNotificationRead(notificationId);
      
      // Update local state to reflect read status
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setReplyBody((prev) => prev + emoji);
  };

  const handleNewMessageEmojiClick = (emoji: string) => {
    setNewBody((prev) => prev + emoji);
  };

  const handleSendNotificationReply = async (event: React.FormEvent, notificationId: number) => {
    event.preventDefault();

    if (!replyBody.trim()) {
      setFeedback("Please type a reply before sending.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // Find the notification to get reference_id (the message ID)
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification || !notification.reference_id) {
        setFeedback("Unable to reply to this notification. Message reference not found.");
        setLoading(false);
        return;
      }

      // Fetch the original message to get sender information
      const messageResponse = await api.fetchMessage(notification.reference_id);
      const originalMessage = messageResponse?.data || messageResponse;
      
      if (!originalMessage) {
        setFeedback("Unable to fetch original message.");
        setLoading(false);
        return;
      }

      // Determine recipient role based on sender's role, or use 'all' as fallback
      let recipientRole = "all";
      if (originalMessage.sender?.roles && originalMessage.sender.roles.length > 0) {
        const senderRole = originalMessage.sender.roles[0].name.toLowerCase();
        if (senderRole === "doctor") {
          recipientRole = "doctors";
        } else if (senderRole === "pharmacist") {
          recipientRole = "pharmacists";
        } else if (senderRole === "admin" || senderRole === "super_admin") {
          recipientRole = "admins";
        }
      }
      
      await api.sendMessage({
        body: replyBody.trim(),
        recipient_role: recipientRole,
        parent_id: notification.reference_id,
      });
      setReplyBody("");
      setReplyingToNotificationId(null);
      setFeedback("Reply sent successfully.");
      
      // Mark notification as read after successfully sending the reply
      await markNotificationAsRead(notificationId);
      
      await loadNotifications();
    } catch (err: any) {
      console.error("Failed to send reply", err);
      setFeedback(err?.response?.data?.message || "Failed to send reply.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newBody.trim()) {
      setNewFeedback("Please type a message before sending.");
      return;
    }

    setNewLoading(true);
    setNewFeedback(null);

    try {
      await api.sendMessage({
        body: newBody.trim(),
        recipient_role: newRecipientRole,
      });
      setNewBody("");
      setNewFeedback("Message sent successfully.");
      await loadMessages();
    } catch (err: any) {
      console.error("Failed to send message", err);
      setNewFeedback(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setNewLoading(false);
    }
  };

  const handleToastClick = async (notificationId: number) => {
    try {
      await api.markNotificationRead(notificationId);
      await loadNotifications();
    } catch (err) {
      // ignore
    }
    setToasts((current) => current.filter((toast) => toast.notificationId !== notificationId));
    if (!panelOpen) {
      togglePanel();
    }
  };

  return (
    <>
      {panelOpen && (
        <div className="fixed right-4 top-20 z-50 w-[360px] max-h-[70vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Message center</div>
              <div className="text-xs text-slate-500">Live system alerts and replies</div>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <FaTimes />
            </button>
          </div>

          <div className="max-h-[calc(70vh-80px)] overflow-y-auto px-4 py-4">
            {/* UNREAD NOTIFICATIONS SECTION */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowUnreadSection(!showUnreadSection)}
                className="w-full rounded-3xl bg-slate-50 p-4 text-left transition hover:bg-slate-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Unread notifications</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount}
                    </span>
                    <span className="text-xs text-slate-600">{showUnreadSection ? "▲" : "▼"}</span>
                  </div>
                </div>
              </button>

              {showUnreadSection && (
                <div className="mt-3 space-y-2 px-2">
                  {notifications.length === 0 ? (
                    <p className="py-3 text-sm text-slate-500">No recent notifications.</p>
                  ) : (
                    notifications
                      .filter((n) => !n.read_at || replyingToNotificationId === n.id)
                      .map((notification) => (
                        <div key={notification.id} className="rounded-2xl border border-blue-200 bg-blue-50 p-3 transition hover:border-blue-300">
                          {replyingToNotificationId === notification.id ? (
                            <form onSubmit={(e) => handleSendNotificationReply(e, notification.id)} className="space-y-2">
                              <p className="text-xs text-slate-600">{notification.message}</p>
                              <textarea
                                value={replyBody}
                                onChange={(e) => setReplyBody(e.target.value)}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-blue-500"
                                placeholder="Type your reply..."
                              />
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                  className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200 transition"
                                  title="Add emoji stickers"
                                >
                                  😊 Emoji
                                </button>
                              </div>
                              {showEmojiPicker && (
                                <div className="grid grid-cols-5 gap-1 bg-slate-50 rounded-lg p-2 border border-slate-200">
                                  {emojiStickers.map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => {
                                        handleEmojiClick(emoji);
                                        setShowEmojiPicker(false);
                                      }}
                                      className="text-lg hover:bg-white rounded p-1 transition"
                                      title={`Add ${emoji}`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {feedback && <div className="text-xs text-red-600">{feedback}</div>}
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={loading}
                                  className="flex-1 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
                                >
                                  {loading ? "Sending..." : "Send"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingToNotificationId(null);
                                    setReplyBody("");
                                    setFeedback(null);
                                    setShowEmojiPicker(false);
                                  }}
                                  className="rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</div>
                                <p className="mt-1 text-sm text-slate-800">{notification.message}</p>
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <button
                                  type="button"
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="rounded-2xl bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-300"
                                  title="Mark as read"
                                >
                                  Mark as read
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReplyToNotification(notification.id)}
                                  className="rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-700"
                                  title="Reply"
                                >
                                  <FaReply className="text-xs" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>

            {/* NEW MESSAGE SECTION */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowNewMessageSection(!showNewMessageSection)}
                className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">New message</span>
                  <span className="text-xs text-slate-600">{showNewMessageSection ? "▲" : "▼"}</span>
                </div>
              </button>

              {showNewMessageSection && (
                <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Recipient
                    </label>
                    <select
                      value={newRecipientRole}
                      onChange={(event) => setNewRecipientRole(event.target.value)}
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                    >
                      <option value="doctors">Doctors</option>
                      <option value="pharmacists">Pharmacists</option>
                      <option value="admins">Admins</option>
                      <option value="all">Everyone</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Message
                    </label>
                    <textarea
                      value={newBody}
                      onChange={(event) => setNewBody(event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                      placeholder="Type a new message..."
                    />
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setShowNewMessageEmojiPicker(!showNewMessageEmojiPicker)}
                        className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200 transition"
                        title="Add emoji stickers"
                      >
                        😊 Emoji
                      </button>
                    </div>
                    {showNewMessageEmojiPicker && (
                      <div className="mt-2 grid grid-cols-5 gap-1 bg-slate-50 rounded-lg p-2 border border-slate-200">
                        {emojiStickers.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              handleNewMessageEmojiClick(emoji);
                              setShowNewMessageEmojiPicker(false);
                            }}
                            className="text-lg hover:bg-white rounded p-1 transition"
                            title={`Add ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {newFeedback && <div className="text-sm text-red-600">{newFeedback}</div>}
                  <button
                    type="submit"
                    disabled={newLoading}
                    onClick={handleSendNewMessage}
                    className="inline-flex items-center justify-center w-full rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {newLoading ? "Sending..." : "Send message"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed right-4 top-20 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            onClick={() => handleToastClick(toast.notificationId)}
            className="w-80 rounded-2xl border border-blue-200 bg-white p-4 text-left shadow-xl transition hover:bg-blue-50"
          >
            <div className="text-sm font-semibold text-blue-700">New team message</div>
            <p className="mt-1 text-sm text-slate-700 line-clamp-2">{toast.message}</p>
            <div className="mt-2 text-xs text-slate-500">Click to open messages</div>
          </button>
        ))}
      </div>
    </>
  );
};

export default MessageNotifications;
