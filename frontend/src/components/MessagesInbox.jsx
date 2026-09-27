import { useState } from "react";
import { FiPlus, FiMessageSquare } from "react-icons/fi";
import {
  useConversations,
  useOpenFarmerThread,
  useOpenAdminThread,
} from "../hooks/useMessages";
import { useViewer } from "../hooks/useViewer";
import {
  getConversationDisplay,
  formatRelativeTime,
} from "../utils/conversationDisplay";
import ConversationCard from "./ConversationCard";
import ChatThread from "./ChatThread";
import NewMessageModal from "./NewMessageModal";
import Avatar from "./Avatar";
import Loader from "./Loader";
import { useQueryClient } from "@tanstack/react-query";

const MessagesInbox = ({ showFarmSearch = false }) => {
  const { role } = useViewer();
  const { data: conversations = [], isLoading } = useConversations();
  const [selectedId, setSelectedId] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const openFarmerMutation = useOpenFarmerThread();
  const openAdminMutation = useOpenAdminThread();

  const selected = conversations.find((c) => c._id === selectedId);
  const queryClient = useQueryClient();

  const handleSelect = (id) => {
    setSelectedId(id);
    queryClient.setQueryData(["conversations"], (old) =>
      old ? old.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c)) : old,
    );
  };

  const handlePickFarm = (farm) => {
    openFarmerMutation.mutate(farm._id, {
      onSuccess: (res) => {
        setSelectedId(res.data.conversation._id);
        setShowNewMessage(false);
      },
    });
  };

  const handleMessageAdmin = () => {
    openAdminMutation.mutate(undefined, {
      onSuccess: (res) => {
        setSelectedId(res.data.conversation._id);
        setShowNewMessage(false);
      },
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex h-full min-h-0">
      {/* Conversation list */}
      <div
        className={`w-full lg:w-90 shrink-0 border-r border-theme-light flex-col min-h-0
          ${selectedId ? "hidden lg:flex" : "flex"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-light shrink-0">
          <h2 className="text-sm font-bold">Inbox</h2>
          <button
            onClick={() => setShowNewMessage(true)}
            className="btn btn-circle btn-sm bg-primary text-primary-content"
          >
            <FiPlus />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted text-center px-6">
              <FiMessageSquare className="text-3xl mb-2" />
              <p className="text-sm">No conversations yet.</p>
              <button
                onClick={() => setShowNewMessage(true)}
                className="btn btn-sm bg-primary text-primary-content mt-4"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations.map((c) => {
              const display = getConversationDisplay(c, role);
              return (
                <ConversationCard
                  key={c._id}
                  avatar={
                    <Avatar src={display.avatarSrc} name={display.title} />
                  }
                  title={display.title}
                  subtitle={display.subtitle}
                  time={formatRelativeTime(c.lastMessageAt)}
                  unreadCount={c.unreadCount}
                  isActive={c._id === selectedId}
                  onClick={() => handleSelect(c._id)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Thread */}
      <div
        className={`flex-1 min-h-0 ${selectedId ? "flex" : "hidden lg:flex"} flex-col`}
      >
        {selected ? (
          <ChatThread
            key={selected._id}
            conversationId={selected._id}
            title={getConversationDisplay(selected, role).title}
            subtitle={getConversationDisplay(selected, role).subtitle}
            avatarSrc={getConversationDisplay(selected, role).avatarSrc}
            blocked={selected.status === "blocked"}
            canReport={selected.type === "customerFarmer"}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-muted text-center">
            <FiMessageSquare className="text-4xl mb-3" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onPickFarm={handlePickFarm}
          onMessageAdmin={handleMessageAdmin}
          showFarmSearch={showFarmSearch}
        />
      )}
    </div>
  );
};

export default MessagesInbox;
