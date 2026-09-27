import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { getZones } from "../api/zone";

const DistrictSelect = ({
  label = "District",
  name = "district",
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => (await getZones()).data.zones,
    staleTime: 1000 * 60 * 60,
  });

  const districts = useMemo(() => {
    const all = zones.flatMap((z) => z.districts);
    return [...new Set(all)].sort();
  }, [zones]);

  const filtered = useMemo(() => {
    if (!search.trim()) return districts;
    const q = search.trim().toLowerCase();
    return districts.filter((d) => d.toLowerCase().includes(q));
  }, [districts, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (district) => {
    onChange({ target: { name, value: district } });
    setOpen(false);
    setSearch("");
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-2 text-sm font-semibold"
    >
      {label}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-base-100 text-left ${
          open ? "border-primary" : "border-theme"
        }`}
      >
        <span className={value ? "" : "text-muted"}>
          {value || "Select district"}
        </span>
        <FiChevronDown
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-theme rounded-xl shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-theme-light">
            <FiSearch className="text-muted-light shrink-0" size={14} />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search district..."
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted">
                No matching district
              </div>
            ) : (
              filtered.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelect(d)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-soft ${
                    value === d ? "bg-primary-soft text-primary font-bold" : ""
                  }`}
                >
                  {d}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictSelect;
