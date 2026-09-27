import { FiVolume2 } from "react-icons/fi";
import {
  useAnnouncements,
  useMarkAnnouncementRead,
  useDeleteMyAnnouncement,
} from "../hooks/useAnnouncements";
import AnnouncementCard from "./AnnouncementCard";
import Loader from "./Loader";

const AnnouncementsPanel = () => {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const markReadMutation = useMarkAnnouncementRead();
  const deleteMutation = useDeleteMyAnnouncement();

  if (isLoading) return <Loader />;

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted text-center">
        <FiVolume2 className="text-4xl mb-3" />
        <h2 className="font-bold text-base-content mb-1">No announcements</h2>
        <p className="text-sm max-w-xs">
          You're all caught up — nothing here yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      {announcements.map((a) => (
        <AnnouncementCard
          key={a.statusId}
          announcement={a}
          onMarkRead={(id) => markReadMutation.mutate(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ))}
    </div>
  );
};

export default AnnouncementsPanel;
