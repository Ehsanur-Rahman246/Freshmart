import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FaSearch } from "react-icons/fa";
import { getProducts } from "../api/product";
import { getAllFarms } from "../api/farm";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const SUGGESTION_LIMIT = 6;

// mode: "products" | "farms"
// resultsBasePath: where "see all results" / navbar Enter navigates to
//   (e.g. "/customer/marketplace" or "/marketplace", "/farms")
const SearchBar = ({ mode = "products", resultsBasePath }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const [open, setOpen] = useState(false);
  const debouncedValue = useDebouncedValue(value, 300);
  const containerRef = useRef(null);

  const isFarms = mode === "farms";
  const trimmed = debouncedValue.trim();

  const { data: productResults = [] } = useQuery({
    queryKey: ["searchProducts", trimmed],
    queryFn: async () =>
      (await getProducts(1, SUGGESTION_LIMIT, trimmed)).data.products,
    enabled: !isFarms && trimmed.length > 0,
    staleTime: 1000 * 30,
  });

  const { data: farmResults = [] } = useQuery({
    queryKey: ["searchFarms", trimmed],
    queryFn: async () => (await getAllFarms(trimmed)).data.farms,
    enabled: isFarms && trimmed.length > 0,
    staleTime: 1000 * 30,
  });

  const results = (isFarms ? farmResults : productResults).slice(
    0,
    SUGGESTION_LIMIT,
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToResults = (q) => {
    setOpen(false);
    navigate(`${resultsBasePath}?q=${encodeURIComponent(q)}`);
  };

  const handleResultClick = (item) => {
    setOpen(false);
    setValue("");
    navigate(isFarms ? `/farms/${item._id}` : `/products/${item._id}`);
  };

  return (
    <div
      ref={containerRef}
      className="dropdown w-full flex-1 min-w-0 max-w-xl mx-auto z-30"
    >
      <label className="input w-full flex items-center gap-2 bg-base-300 border-transparent focus-within:bg-base-100 focus-within:border-primary focus-within:outline-none focus-within:shadow-none">
        <FaSearch className="h-5 w-5 shrink-0 text-primary" />
        <input
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => value.trim() && setOpen(true)}
          onKeyDown={(e) =>
            e.key === "Enter" && value.trim() && goToResults(value.trim())
          }
          placeholder={isFarms ? "Search farms..." : "Search fresh products..."}
          className="grow min-w-0 bg-transparent border-none outline-none focus:border-none focus:outline-none caret-primary"
        />
      </label>

      {open && trimmed && (
        <div className="dropdown-content menu bg-base-100 rounded-box z-30 mt-2 w-full max-w-xl p-2 shadow-lg border border-theme-light">
          {results.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
              No {isFarms ? "farms" : "products"} found.
            </p>
          )}

          {results.map((item) => (
            <button
              key={item._id}
              onClick={() => handleResultClick(item)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-soft text-left"
            >
              <div className="w-10 h-10 rounded-field bg-base-200 overflow-hidden shrink-0">
                {item.images?.[0]?.url && (
                  <img
                    src={item.images[0].url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{item.name}</p>
                <p className="text-xs text-muted-light truncate">
                  {isFarms
                    ? item.location?.district
                    : `৳${item.price} / ${item.unit}`}
                </p>
              </div>
            </button>
          ))}

          {results.length > 0 && (
            <button
              onClick={() => goToResults(value.trim())}
              className="mt-1 text-center text-sm font-bold text-primary hover:underline py-2"
            >
              See all results
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
