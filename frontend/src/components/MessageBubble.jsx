import { BsCheck2, BsCheck2All } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";

const DeleteButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-light hover:text-error shrink-0"
    aria-label="Delete message"
  >
    <FiTrash2 size={13} />
  </button>
);

const MessageBubble = ({ message, isOwn, onDelete }) => (
  <div
    className={`group flex items-center gap-1.5 ${isOwn ? "justify-end" : "justify-start"}`}
  >
    {isOwn && onDelete && (
      <DeleteButton onClick={() => onDelete(message._id)} />
    )}

    <div
      className={`max-w-[75%] rounded-box px-3.5 py-2 text-sm
        ${isOwn ? "bg-primary text-primary-content rounded-br-sm" : "bg-base-100 text-base-content rounded-bl-sm border border-theme-light"}`}
    >
      <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
      <p
        className={`text-[10px] mt-1 flex items-center gap-1 ${
          isOwn ? "text-primary-content/70 justify-end" : "text-muted-light"
        }`}
      >
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {isOwn ? (
          message.readAt ? (
            <BsCheck2All size={13} />
          ) : (
            <BsCheck2 size={13} />
          )
        ) : null}
      </p>
    </div>
  </div>
);

export default MessageBubble;
