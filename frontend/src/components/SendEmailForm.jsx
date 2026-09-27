import { useState } from "react";
import toast from "react-hot-toast";
import { FiSend, FiSearch } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getAllCustomers } from "../api/admin";
import { getAllFarmers } from "../api/admin";
import { useSendAdminEmail } from "../hooks/useAnnouncements";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import Avatar from "./Avatar";

const SCOPES = [
  { value: "all", label: "Everyone" },
  { value: "allCustomers", label: "All Customers" },
  { value: "allFarmers", label: "All Farmers" },
  { value: "single", label: "Single User" },
];

const SendEmailForm = () => {
  const [scope, setScope] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const sendMutation = useSendAdminEmail();

  const { data: customers = [] } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => (await getAllCustomers()).data.customers,
    enabled: scope === "single",
  });

  const { data: farmers = [] } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: async () => (await getAllFarmers()).data.farmers,
    enabled: scope === "single",
  });

  const candidates =
    scope === "single"
      ? [
          ...customers.map((c) => ({
            id: c.user._id,
            name: c.user.name,
            role: "Customer",
            avatar: c.profileImage?.url,
          })),
          ...farmers.map((f) => ({
            id: f.user._id,
            name: f.user.name,
            role: "Farmer",
            avatar: f.profileImage?.url,
          })),
        ].filter((u) =>
          u.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
        )
      : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    if (scope === "single" && !selectedUser) {
      toast.error("Pick a recipient first");
      return;
    }

    sendMutation.mutate(
      {
        recipientScope: scope,
        recipientUserId: scope === "single" ? selectedUser.id : undefined,
        subject: subject.trim(),
        message: message.trim(),
      },
      {
        onSuccess: (res) => {
          toast.success(res.data.message || "Email sent");
          setSubject("");
          setMessage("");
          setSelectedUser(null);
          setSearch("");
        },
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Could not send email"),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-base-100 rounded-box border border-theme-light p-4 space-y-4"
    >
      <h2 className="text-sm font-bold">Send an ad-hoc email</h2>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs text-muted">Recipients</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {SCOPES.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                setScope(opt.value);
                setSelectedUser(null);
              }}
              className={`btn btn-sm ${
                scope === opt.value
                  ? "bg-primary text-primary-content border-none"
                  : "btn-outline"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {scope === "single" && (
        <div className="space-y-2">
          {selectedUser ? (
            <div className="flex items-center gap-2 border border-theme-light rounded-box p-2">
              <Avatar
                src={selectedUser.avatar}
                name={selectedUser.name}
                size={32}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {selectedUser.name}
                </p>
                <p className="text-[11px] text-muted-light">
                  {selectedUser.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="btn btn-xs btn-ghost"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <label className="input input-bordered input-sm w-full flex items-center gap-2">
                <FiSearch className="text-muted-light" size={14} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search a customer or farmer..."
                  className="grow"
                />
              </label>

              {search && (
                <div className="border border-theme-light rounded-box max-h-40 overflow-y-auto">
                  {candidates.length === 0 ? (
                    <p className="p-3 text-xs text-muted-light text-center">
                      No matches.
                    </p>
                  ) : (
                    candidates.slice(0, 8).map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className="w-full flex items-center gap-2 p-2 hover:bg-base-200 text-left border-b border-theme-light last:border-b-0"
                      >
                        <Avatar src={u.avatar} name={u.name} size={28} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-muted-light">
                            {u.role}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs text-muted">Subject</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="input input-bordered input-sm sm:input-md w-full"
        />
      </div>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs text-muted">Message</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write the email..."
          className="textarea textarea-bordered w-full text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={sendMutation.isPending || !subject.trim() || !message.trim()}
        className="btn bg-secondary text-secondary-content btn-sm sm:btn-md w-full sm:w-auto"
      >
        <FiSend /> Send Email
      </button>
    </form>
  );
};

export default SendEmailForm;
