import { FiVolume2 } from "react-icons/fi";

const AdminAnnouncements = () => (
  <div className="flex flex-col items-center justify-center py-24 text-muted text-center">
    <FiVolume2 className="text-4xl mb-3" />
    <h2 className="font-bold text-base-content mb-1">Announcements</h2>
    <p className="text-sm max-w-xs">
      Announcements aren't available yet. This section is coming soon.
    </p>
  </div>
);

export default AdminAnnouncements;