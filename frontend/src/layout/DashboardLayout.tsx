// src/layout/DashboardLayout.tsx
import type { FC } from "react";
import { createContext, useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "../components/LeftSidebar";
import MessageNotifications from "../components/MessageNotifications";

export interface MessagePanelContextValue {
  messagePanelOpen: boolean;
  toggleMessagePanel: () => void;
  closeMessagePanel: () => void;
}

export const MessagePanelContext = createContext<MessagePanelContextValue | null>(null);

const DashboardLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messagePanelOpen, setMessagePanelOpen] = useState(false);

  const toggleMessagePanel = () => {
    setMessagePanelOpen((prev) => !prev);
  };

  const closeMessagePanel = () => {
    setMessagePanelOpen(false);
  };

  return (
    <MessagePanelContext.Provider
      value={{ messagePanelOpen, toggleMessagePanel, closeMessagePanel }}
    >
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <LeftSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onMessagesClick={() => {
            setMessagePanelOpen(true);
            if (sidebarOpen) {
              setSidebarOpen(false);
            }
          }}
        />
        <main
          style={{
            width: "100%",
            padding: "20px",
            position: "relative",
          }}
        >
          <Outlet /> {/* This is critical to render nested routes */}
          <MessageNotifications
            open={messagePanelOpen}
            onToggle={toggleMessagePanel}
            onClose={closeMessagePanel}
          />
        </main>
      </div>
    </MessagePanelContext.Provider>
  );
};

export default DashboardLayout;