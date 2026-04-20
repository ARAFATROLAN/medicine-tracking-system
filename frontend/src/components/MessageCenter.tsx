import React, { useEffect, useState } from "react";
import { FaReply } from "react-icons/fa";
import api from "../Services/api";

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

type RecipientRole = "doctors" | "pharmacists" | "admins" | "all";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

const roleLabels: Record<RecipientRole, string> = {
  doctors: "Doctors",
  pharmacists: "Pharmacists",
  admins: "Admins",
  all: "Everyone",
};

const MessageCenter: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [replyRecipientRole, setReplyRecipientRole] = useState<RecipientRole>("doctors");
  const [replyBody, setReplyBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastList, setToastList] = useState<Toast[]>([]);
  const [lastThreadCount, setLastThreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiStickers = ['😀', '😂', '😍', '🤔', '😢', '👍', '❤️', '🔥', '✨', '🎉', '👏', '💯', '🚀', '⭐', '💪', '🤝', '😎', '🥳', '😱', '🎊'];

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedThread) {
      setReplyRecipientRole(selectedThread.recipient_role as RecipientRole || "doctors");
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      const response = await api.fetchMessages();
      const payload = response?.data?.data ? response.data.data : response.data;
      const items = payload?.data || payload || [];

      if (lastThreadCount > 0 && items.length > lastThreadCount) {
        addToast({
          id: `${Date.now()}`,
          message: "New team message received",
          type: "info",
        });
      }

      setLastThreadCount(items.length);
      setThreads(items);

      if (!selectedThread && items.length > 0) {
        setSelectedThread(items[0]);
      } else if (selectedThread) {
        const updated = items.find((item: MessageThread) => item.id === selectedThread.id);
        if (updated) {
          setSelectedThread(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load messages", err);
      setFeedback("Unable to load messages at this time.");
    }
  };

  const addToast = (toast: Toast) => {
    setToastList((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToastList((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toggleMessageList = () => {
    setShowMessages((prev) => !prev);
    if (!showMessages && threads.length > 0 && !selectedThread) {
      setSelectedThread(threads[0]);
    }
  };

  const handleReplyClick = (thread: MessageThread) => {
    setSelectedThread(thread);
    setShowMessages(true);
    setFeedback(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedThread) {
      setFeedback("Select a message first before sending a reply.");
      return;
    }

    if (!replyBody.trim()) {
      setFeedback("Please type your reply before sending.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      await api.sendMessage({
        body: replyBody.trim(),
        recipient_role: replyRecipientRole,
        parent_id: selectedThread.id,
      });

      setReplyBody("");
      setShowEmojiPicker(false);
      setFeedback("Reply sent successfully.");
      addToast({ id: `${Date.now()}`, message: "Reply delivered.", type: "success" });
      await fetchThreads();
    } catch (err: any) {
      console.error("Failed to send reply", err);
      setFeedback(err?.response?.data?.message || "Failed to send reply.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setReplyBody((prev) => prev + emoji);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>💬 Message Center</h2>
          <p style={styles.subtitle}>
            Click unread notifications to display new messages, then reply with a recipient role.
          </p>
        </div>
        <button type="button" onClick={toggleMessageList} style={styles.unreadToggle}>
          🔔 Unread notifications {threads.length > 0 ? `(${threads.length})` : ""}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.messageListPanel}>
          {showMessages ? (
            threads.length === 0 ? (
              <div style={styles.emptyState}>No new messages available right now.</div>
            ) : (
              threads.map((thread) => (
                <div key={thread.id} style={styles.messageCard}>
                  <div style={styles.messageCardHeader}>
                    <div>
                      <div style={styles.messageFrom}>{thread.sender?.name || "Unknown"}</div>
                      <div style={styles.messageMeta}>
                        {roleLabels[thread.recipient_role as RecipientRole] || thread.recipient_role}
                        {" · "}
                        {new Date(thread.created_at).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReplyClick(thread)}
                      style={styles.replyButton}
                      title="Reply to this message"
                    >
                      <FaReply />
                    </button>
                  </div>
                  <p style={styles.messageCardBody}>{thread.body}</p>
                </div>
              ))
            )
          ) : (
            <div style={styles.emptyState}>
              Click the unread notifications button to view all new messages.
            </div>
          )}
        </div>

        <div style={styles.replyPanel}>
          <div style={styles.sectionHeader}>
            <h3>Reply composer</h3>
            {selectedThread ? (
              <span style={styles.replyLabel}>
                Replying to {selectedThread.sender?.name} ({roleLabels[selectedThread.recipient_role as RecipientRole]})
              </span>
            ) : null}
          </div>

          {selectedThread ? (
            <form onSubmit={handleSendReply} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="recipient_role">
                  Recipient
                </label>
                <select
                  id="recipient_role"
                  value={replyRecipientRole}
                  onChange={(e) => setReplyRecipientRole(e.target.value as RecipientRole)}
                  style={styles.select}
                >
                  <option value="doctors">Doctors</option>
                  <option value="pharmacists">Pharmacists</option>
                  <option value="admins">Admins</option>
                  <option value="all">Everyone</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="reply_body">
                  Message
                </label>
                <textarea
                  id="reply_body"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={6}
                  style={styles.textarea}
                  placeholder="Type your reply here..."
                />
                <div style={styles.emojiButtonContainer}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={styles.emojiToggleButton}
                    title="Add emoji stickers"
                  >
                    😊 Emoji
                  </button>
                </div>
                {showEmojiPicker && (
                  <div style={styles.emojiPickerGrid}>
                    {emojiStickers.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          handleEmojiClick(emoji);
                          setShowEmojiPicker(false);
                        }}
                        style={styles.emojiButton}
                        title={`Add ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {feedback && <div style={styles.feedback}>{feedback}</div>}
              <button type="submit" disabled={loading} style={styles.sendButton}>
                {loading ? "Sending..." : "Send message"}
              </button>
            </form>
          ) : (
            <div style={styles.emptyState}>
              Use the reply icon on a message card to define the recipient and send a message.
            </div>
          )}
        </div>
      </div>

      <div style={styles.toastContainer}>
        {toastList.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              ...(toast.type === "success" ? styles.toastSuccess : toast.type === "error" ? styles.toastError : styles.toastInfo),
            }}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => removeToast(toast.id)} style={styles.toastClose}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    background: '#ffffff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    marginTop: 32,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    margin: 0,
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#475569',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    gap: 20,
  },
  unreadToggle: {
    border: 'none',
    borderRadius: 999,
    padding: '12px 18px',
    background: '#eff6ff',
    color: '#1d4ed8',
    cursor: 'pointer',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
  },
  messageListPanel: {
    display: 'grid',
    gap: 16,
    maxHeight: 680,
    overflowY: 'auto',
  },
  messageCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    padding: 18,
    background: '#f8fafc',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
  },
  messageCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageFrom: {
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  messageMeta: {
    color: '#64748b',
    fontSize: 13,
  },
  replyButton: {
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    width: 40,
    height: 40,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'background 0.2s ease',
  },
  messageCardBody: {
    color: '#334155',
    lineHeight: 1.7,
    margin: 0,
  },
  replyPanel: {
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    padding: 24,
    background: '#ffffff',
    minHeight: 320,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  replyLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
  },
  threadList: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: 640,
  },
  threadButton: {
    width: '100%',
    textAlign: 'left',
    padding: 16,
    border: 'none',
    borderBottom: '1px solid #e2e8f0',
    background: '#ffffff',
    cursor: 'pointer',
  },
  threadButtonActive: {
    background: '#eef2ff',
  },
  threadMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 14,
    color: '#334155',
  },
  threadBody: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 1.5,
  },
  replyCount: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748b',
  },
  threadDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    background: '#e0e7ff',
    color: '#3730a3',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
  },
  roleChip: {
    background: '#f1f5f9',
    color: '#0f172a',
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  messageBubble: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 20,
    background: '#f8fafc',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
    color: '#334155',
    fontSize: 14,
  },
  messageBody: {
    margin: 0,
    color: '#0f172a',
    fontSize: 15,
    lineHeight: 1.7,
  },
  repliesSection: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 18,
    background: '#ffffff',
  },
  replyCard: {
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 0',
  },
  replyBody: {
    margin: '8px 0 0',
    color: '#475569',
    whiteSpace: 'pre-wrap',
  },
  composerSection: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 20,
    background: '#ffffff',
  },
  form: {
    display: 'grid',
    gap: 14,
  },
  fieldGroup: {
    display: 'grid',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    fontWeight: 600,
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    color: '#0f172a',
    fontSize: 14,
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    padding: 14,
    borderRadius: 12,
    border: '1px solid #cbd5e1',
    color: '#0f172a',
    fontSize: 14,
    resize: 'vertical',
  },
  feedback: {
    color: '#0f172a',
    background: '#ecfdf5',
    border: '1px solid #d1fae5',
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    background: '#f3f4f6',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: 12,
    padding: '14px 18px',
    cursor: 'pointer',
    fontWeight: 700,
    minWidth: 120,
  },
  sendButton: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    padding: '14px 18px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
    minWidth: 140,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    background: '#f1f5f9',
    color: '#475569',
    textAlign: 'center',
  },
  toastContainer: {
    position: 'fixed',
    top: 24,
    right: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    zIndex: 999,
  },
  toast: {
    minWidth: 260,
    borderRadius: 14,
    padding: '14px 16px',
    color: '#1f2937',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  toastInfo: {
    background: '#dbebff',
  },
  toastSuccess: {
    background: '#d1fae5',
  },
  toastError: {
    background: '#fee2e2',
  },
  toastClose: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 16,
    color: '#475569',
  },
  emojiButtonContainer: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  },
  emojiToggleButton: {
    background: '#f0f4ff',
    color: '#2563eb',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  emojiPickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8,
    padding: 12,
    background: '#f8fafc',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    marginTop: 8,
  },
  emojiButton: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 8,
    cursor: 'pointer',
    fontSize: 20,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default MessageCenter;
