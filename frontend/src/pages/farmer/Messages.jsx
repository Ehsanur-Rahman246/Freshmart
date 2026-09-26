import { useState } from "react";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { useConversations } from "../../hooks/useMessages";
import MessagesInbox from "../../components/MessagesInbox";
import AnnouncementsPanel from "../../components/AnnouncementsPanel";

const FarmerMessages = () => {
  const [activeTab, setActiveTab] = useState("inbox");

  const { data: conversations = [] } = useConversations();
  const { data: announcements = [] } = useAnnouncements();

  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const unreadAnnouncements = announcements.filter((a) => !a.isRead).length;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div role="tablist" className="tabs tabs-box w-fit mb-4 shrink-0">
        <button
          role="tab"
          className={`tab ${activeTab === "inbox" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("inbox")}
        >
          Inbox
          {unreadMessages > 0 && (
            <span className="badge badge-sm bg-primary text-primary-content border-none ml-2">
              {unreadMessages}
            </span>
          )}
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "announcements" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          Announcements
          {unreadAnnouncements > 0 && (
            <span className="badge badge-sm bg-secondary text-secondary-content border-none ml-2">
              {unreadAnnouncements}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-base-100 rounded-box border border-theme-light overflow-hidden">
        {activeTab === "inbox" ? (
          <MessagesInbox showFarmSearch={false} />
        ) : (
          <AnnouncementsPanel />
        )}
      </div>
    </div>
  );
};

export default FarmerMessages;