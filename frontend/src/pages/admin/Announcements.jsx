import { useState } from "react";
import { FiVolume2, FiMail, FiTag } from "react-icons/fi";
import PromoCodesPanel from "../../components/PromoCodesPanel";
import {
  useAnnouncementHistory,
  useEmailLog,
} from "../../hooks/useAnnouncements";
import CreateAnnouncementForm from "../../components/CreateAnnouncementForm";
import AnnouncementHistoryCard from "../../components/AnnouncementHistoryCard";
import SendEmailForm from "../../components/SendEmailForm";
import EmailLogCard from "../../components/EmailLogCard";
import Loader from "../../components/Loader";

const AdminAnnouncements = () => {
  const [activeTab, setActiveTab] = useState("broadcast");

  const { data: history = [], isLoading: historyLoading } =
    useAnnouncementHistory();
  const { data: emailLog = [], isLoading: logLoading } = useEmailLog();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Announcements</h1>
        <p className="text-sm text-muted-light mt-1">
          Broadcast in-app announcements or send direct emails
        </p>
      </div>

      <div role="tablist" className="tabs tabs-box w-fit">
        <button
          role="tab"
          className={`tab ${activeTab === "broadcast" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("broadcast")}
        >
          <FiVolume2 className="mr-1.5" /> Broadcast
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "email" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("email")}
        >
          <FiMail className="mr-1.5" /> Email Log
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "promoCodes" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("promoCodes")}
        >
          <FiTag className="mr-1.5" /> Promo Codes
        </button>
      </div>

      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <CreateAnnouncementForm />

          <div className="space-y-3">
            <h2 className="text-sm font-bold px-1">History</h2>
            {historyLoading ? (
              <Loader />
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-light text-center py-8">
                No announcements sent yet.
              </p>
            ) : (
              history.map((a) => (
                <AnnouncementHistoryCard key={a._id} announcement={a} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "email" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <SendEmailForm />

          <div className="space-y-3">
            <h2 className="text-sm font-bold px-1">Email Log</h2>
            {logLoading ? (
              <Loader />
            ) : emailLog.length === 0 ? (
              <p className="text-sm text-muted-light text-center py-8">
                No emails sent yet.
              </p>
            ) : (
              emailLog.map((log) => <EmailLogCard key={log._id} log={log} />)
            )}
          </div>
        </div>
      )}
      {activeTab === "promoCodes" && (
        <div className="max-w-2xl">
          <PromoCodesPanel />
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
