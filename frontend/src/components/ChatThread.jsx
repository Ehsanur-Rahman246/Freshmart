import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiSend, FiFlag, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  useConversationMessages,
  useSendMessage,
  useReportConversation,
  useDeleteMessage,
  useDeleteConversation,
} from "../hooks/useMessages";
import { useViewer } from "../hooks/useViewer";
import MessageBubble from "./MessageBubble";
import Avatar from "./Avatar";

const ChatThread = ({
  conversationId,
  title,
  subtitle,
  avatarSrc,
  onBack,
  blocked,
  canReport = false,
}) => {
  const { user } = useViewer();
  const { data: messages = [], isLoading } =
    useConversationMessages(conversationId);
  const sendMutation = useSendMessage(conversationId);
  const deleteMutation = useDeleteMessage(conversationId);
  const reportMutation = useReportConversation();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const deleteConversationMutation = useDeleteConversation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMutation.mutate({ text: trimmed });
    setText("");
  };

  const handleReport = () => {
    const reason = window.prompt("Why are you reporting this conversation?");
    if (!reason || !reason.trim()) return;

    reportMutation.mutate(
      { conversationId, reason: reason.trim() },
      {
        onSuccess: () => toast.success("Reported to admin"),
        onError: (e) =>
          toast.error(e?.response?.data?.message || "Could not report"),
      },
    );
  };

  const handleDeleteMessage = (messageId) => {
    if (
      !window.confirm("Delete this message for everyone? This can't be undone.")
    )
      return;
    deleteMutation.mutate(messageId);
  };

  const handleDeleteConversation = () => {
    if (
      !window.confirm(
        "Delete this entire conversation from your view? This can't be undone.",
      )
    )
      return;

    deleteConversationMutation.mutate(conversationId, {
      onSuccess: () => {
        toast.success("Conversation deleted");
        onBack?.();
      },
      onError: (e) =>
        toast.error(
          e?.response?.data?.message || "Could not delete conversation",
        ),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-theme-light shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-circle btn-sm btn-ghost lg:hidden"
          >
            <FiArrowLeft />
          </button>
        )}
        <Avatar src={avatarSrc} name={title} size={38} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-light truncate">{subtitle}</p>
          )}
        </div>
        {canReport && (
          <button
            onClick={handleReport}
            disabled={reportMutation.isPending}
            className="btn btn-ghost btn-sm btn-circle text-muted hover:text-warning shrink-0"
            title="Report conversation"
          >
            <FiFlag size={16} />
          </button>
        )}
        <button
          onClick={handleDeleteConversation}
          disabled={deleteConversationMutation.isPending}
          className="btn btn-ghost btn-sm btn-circle text-muted hover:text-error shrink-0"
          title="Delete conversation"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-base-200/40">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-light py-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender?._id === user?._id}
              onDelete={
                message.sender?._id === user?._id
                  ? handleDeleteMessage
                  : undefined
              }
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 border-t border-theme-light flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            blocked ? "This conversation is blocked" : "Type a message..."
          }
          disabled={blocked || sendMutation.isPending}
          className="input input-bordered flex-1 input-sm sm:input-md"
        />
        <button
          type="submit"
          disabled={blocked || !text.trim() || sendMutation.isPending}
          className="btn btn-primary btn-sm sm:btn-md btn-circle"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatThread;
