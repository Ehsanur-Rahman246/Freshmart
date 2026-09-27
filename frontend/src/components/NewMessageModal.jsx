import { useState } from "react";
import { FiX, FiSearch, FiUser } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getAllFarms } from "../api/farm";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import Avatar from "./Avatar";

const NewMessageModal = ({ onClose, onPickFarm, onMessageAdmin, showFarmSearch }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: farms = [], isLoading } = useQuery({
    queryKey: ["farms", "search", debouncedSearch],
    queryFn: async () => (await getAllFarms(debouncedSearch)).data.farms,
    enabled: showFarmSearch,
  });

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-overlay z-40" />
      <div
        className="
          fixed z-50 bg-base-100 shadow-2xl
          bottom-0 left-0 right-0 max-h-[85vh] rounded-t-box
          flex flex-col
          sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:bottom-auto sm:right-auto sm:w-105 sm:max-h-[70vh] sm:rounded-box
        "
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-light shrink-0">
          <h2 className="text-sm font-bold">New Message</h2>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
            <FiX />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <button
            onClick={onMessageAdmin}
            className="w-full flex items-center gap-3 border border-theme-light rounded-box p-3 hover:bg-base-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-soft flex items-center justify-center shrink-0">
              <FiUser className="text-secondary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Contact Admin</p>
              <p className="text-xs text-muted-light">Get help from FreshMart support</p>
            </div>
          </button>

          {showFarmSearch && (
            <>
              <div className="divider text-xs text-muted-light my-1">or message a farm</div>

              <label className="input input-bordered input-sm sm:input-md w-full flex items-center gap-2">
                <FiSearch className="text-muted-light" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search farms..."
                  className="grow"
                />
              </label>

              <div className="space-y-2">
                {isLoading && (
                  <div className="flex justify-center py-6">
                    <span className="loading loading-spinner loading-sm text-primary" />
                  </div>
                )}

                {!isLoading && farms.length === 0 && (
                  <p className="text-center text-xs text-muted-light py-6">No farms found.</p>
                )}

                {!isLoading &&
                  farms.map((farm) => (
                    <button
                      key={farm._id}
                      onClick={() => onPickFarm(farm)}
                      className="w-full flex items-center gap-3 border border-theme-light rounded-box p-3 hover:bg-base-200 transition-colors text-left"
                    >
                      <Avatar src={farm.farmer?.profileImage?.url} name={farm.name} size={36} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{farm.name}</p>
                        <p className="text-xs text-muted-light truncate">{farm.farmer?.user?.name}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NewMessageModal;