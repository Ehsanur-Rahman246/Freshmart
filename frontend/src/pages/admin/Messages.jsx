import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FiMessageSquare,
  FiFlag,
  FiShield,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { useConversations } from "../../hooks/useMessages";
import {
  getConversationDisplay,
  formatRelativeTime,
} from "../../utils/conversationDisplay";
import {
  getReportedConversations,
  setConversationBlock,
  clearConversationReport,
  getMessages,
} from "../../api/message";
import ConversationCard from "../../components/ConversationCard";
import ChatThread from "../../components/ChatThread";
import MessageBubble from "../../components/MessageBubble";
import Avatar from "../../components/Avatar";
import Loader from "../../components/Loader";

const ReportedThread = ({ conversation, onBack }) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", "reported", conversation._id],
    queryFn: async () => (await getMessages(conversation._id)).data.messages,
  });

  const blockMutation = useMutation({
    mutationFn: (blocked) => setConversationBlock(conversation._id, blocked),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({
        queryKey: ["conversations", "reported"],
      });
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message || "Could not update conversation",
      ),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearConversationReport(conversation._id),
    onSuccess: () => {
      toast.success("Report cleared");
      queryClient.invalidateQueries({
        queryKey: ["conversations", "reported"],
      });
      onBack();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not clear report"),
  });

  const isBlocked = conversation.status === "blocked";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-theme-light shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="btn btn-circle btn-sm btn-ghost lg:hidden"
          >
            <FiX />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">
              {conversation.customer?.user?.name || "Customer"} &amp;{" "}
              {conversation.farmer?.user?.name || "Farmer"}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`badge badge-xs border-none ${
                  isBlocked
                    ? "bg-error-soft text-error"
                    : "bg-success-soft text-success"
                }`}
              >
                {isBlocked ? "Blocked" : "Open"}
              </span>
              {conversation.reported && (
                <span className="badge badge-xs bg-warning-soft text-warning border-none">
                  Reported
                </span>
              )}
            </div>
          </div>
        </div>

        {conversation.reported && conversation.reportReason && (
          <div className="px-4 py-3 border-b border-theme-light bg-warning-soft/40 shrink-0">
            <p className="text-xs font-bold text-warning mb-0.5">
              Reported by {conversation.reportedBy?.name || "a user"}
              {conversation.reportedBy?.role
                ? ` (${conversation.reportedBy.role})`
                : ""}
            </p>
            <p className="text-sm text-base-content">
              {conversation.reportReason}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => blockMutation.mutate(!isBlocked)}
            disabled={blockMutation.isPending}
            className={`btn btn-xs gap-1 ${isBlocked ? "btn-outline" : "bg-error text-error-content"}`}
          >
            <FiShield size={12} /> {isBlocked ? "Unblock" : "Block"}
          </button>
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
            className="btn btn-xs btn-outline gap-1"
          >
            <FiCheckCircle size={12} /> Clear Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-base-200/40">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-light py-8">
            No messages.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message._id} message={message} isOwn={false} />
          ))
        )}
      </div>

      <div className="p-3 border-t border-theme-light text-center text-xs text-muted-light shrink-0">
        Admin cannot send messages here — this is a read-only report view.
      </div>
    </div>
  );
};

const ReportedConversationsPanel = () => {
  const [selectedId, setSelectedId] = useState(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", "reported"],
    queryFn: async () => (await getReportedConversations()).data.conversations,
    staleTime: 1000 * 30,
  });

  const selected = conversations.find((c) => c._id === selectedId);

  if (isLoading) return <Loader />;

  return (
    <div className="flex-1 min-h-0 bg-base-100 rounded-box border border-theme-light overflow-hidden flex">
      <div
        className={`w-full lg:w-90 shrink-0 border-r border-theme-light flex-col min-h-0
          ${selectedId ? "hidden lg:flex" : "flex"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-light shrink-0">
          <h2 className="text-sm font-bold">Reported & Blocked</h2>
          {conversations.length > 0 && (
            <span className="badge badge-sm bg-error-soft text-error border-none">
              {conversations.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted text-center px-6">
              <FiFlag className="text-3xl mb-2" />
              <p className="text-sm">No reported or blocked conversations.</p>
            </div>
          ) : (
            conversations.map((c) => (
              <ConversationCard
                key={c._id}
                avatar={<Avatar name={c.customer?.user?.name} />}
                title={`${c.customer?.user?.name || "Customer"} & ${c.farmer?.user?.name || "Farmer"}`}
                subtitle={c.status === "blocked" ? "Blocked" : "Open"}
                isActive={c._id === selectedId}
                onClick={() => setSelectedId(c._id)}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`flex-1 min-h-0 ${selectedId ? "flex" : "hidden lg:flex"} flex-col`}
      >
        {selected ? (
          <ReportedThread
            key={selected._id}
            conversation={selected}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-muted text-center">
            <FiFlag className="text-4xl mb-3" />
            <p className="text-sm">Select a reported conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminMessages = () => {
  const [tab, setTab] = useState("inbox");
  const { data: conversations = [], isLoading } = useConversations();
  const [selectedId, setSelectedId] = useState(null);

  const selected = conversations.find((c) => c._id === selectedId);
  const queryClient = useQueryClient();

  const handleSelect = (id) => {
    setSelectedId(id);
    queryClient.setQueryData(["conversations"], (old) =>
      old ? old.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c)) : old,
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 shrink-0 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold">Messages</h1>
          <p className="text-sm text-muted-light mt-1">
            Conversations from customers and farmers
          </p>
        </div>

        <div role="tablist" className="tabs tabs-box w-fit">
          <button
            role="tab"
            className={`tab ${tab === "inbox" ? "tab-active" : ""}`}
            onClick={() => setTab("inbox")}
          >
            <FiMessageSquare className="mr-1.5" /> Inbox
          </button>
          <button
            role="tab"
            className={`tab ${tab === "reported" ? "tab-active" : ""}`}
            onClick={() => setTab("reported")}
          >
            <FiFlag className="mr-1.5" /> Reported
          </button>
        </div>
      </div>

      {tab === "inbox" &&
        (isLoading ? (
          <Loader />
        ) : (
          <div className="flex-1 min-h-0 bg-base-100 rounded-box border border-theme-light overflow-hidden flex">
            <div
              className={`w-full lg:w-90 shrink-0 border-r border-theme-light flex-col min-h-0
                ${selectedId ? "hidden lg:flex" : "flex"}`}
            >
              <div className="flex items-center justify-between p-4 border-b border-theme-light shrink-0">
                <h2 className="text-sm font-bold">Inbox</h2>
                {conversations.length > 0 && (
                  <span className="text-xs text-muted-light">
                    {conversations.length}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted text-center px-6">
                    <FiMessageSquare className="text-3xl mb-2" />
                    <p className="text-sm">No conversations yet.</p>
                  </div>
                ) : (
                  conversations.map((c) => {
                    const display = getConversationDisplay(c, "admin");
                    return (
                      <ConversationCard
                        key={c._id}
                        avatar={
                          <Avatar
                            src={display.avatarSrc}
                            name={display.title}
                          />
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

            <div
              className={`flex-1 min-h-0 ${selectedId ? "flex" : "hidden lg:flex"} flex-col`}
            >
              {selected ? (
                <ChatThread
                  key={selected._id}
                  conversationId={selected._id}
                  title={getConversationDisplay(selected, "admin").title}
                  subtitle={getConversationDisplay(selected, "admin").subtitle}
                  avatarSrc={
                    getConversationDisplay(selected, "admin").avatarSrc
                  }
                  onBack={() => setSelectedId(null)}
                />
              ) : (
                <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-muted text-center">
                  <FiMessageSquare className="text-4xl mb-3" />
                  <p className="text-sm">
                    Select a conversation to start chatting
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

      {tab === "reported" && <ReportedConversationsPanel />}
    </div>
  );
};

export default AdminMessages;
