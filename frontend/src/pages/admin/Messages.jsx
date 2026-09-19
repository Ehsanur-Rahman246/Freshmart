import { FiMessageSquare } from "react-icons/fi";

const AdminMessages = () => (
  <div className="flex flex-col items-center justify-center py-24 text-muted text-center">
    <FiMessageSquare className="text-4xl mb-3" />
    <h2 className="font-bold text-base-content mb-1">Messages</h2>
    <p className="text-sm max-w-xs">
      Messaging isn't available yet. This section is coming soon.
    </p>
  </div>
);

export default AdminMessages;