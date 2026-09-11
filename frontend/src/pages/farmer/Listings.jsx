import { FiChevronRight, FiPlus } from "react-icons/fi";

const listings = [
  {
    id: "LST-1001",
    name: "Fresh Tomato",
    category: "Vegetables",
    stock: "120 kg",
    price: 62,
    unit: "kg",
    status: "Live",
  },
  {
    id: "LST-1002",
    name: "Fresh Mango",
    category: "Fruits",
    stock: "75 kg",
    price: 95,
    unit: "kg",
    status: "Live",
  },
  {
    id: "LST-1003",
    name: "Organic Spinach",
    category: "Leafy Greens",
    stock: "48 bundles",
    price: 18,
    unit: "bundle",
    status: "Live",
  },
  {
    id: "LST-1004",
    name: "Farm Potato",
    category: "Vegetables",
    stock: "200 kg",
    price: 24,
    unit: "kg",
    status: "Draft",
  },
];

const Listings = () => {
  return (
    <div className="w-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme px-6 py-5">
          <div>
          <h2 className="mt-1 text-2xl font-extrabold">Your products</h2>
          <p className="mt-1 text-sm text-muted-light">
            Manage the products currently available on FreshMart.
          </p>
          </div>

          <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-box border border-dashed border-primary bg-primary-soft px-4 py-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-content"
        >
          <FiPlus size={17} /> Add new listing
        </button>
      </div>

      {/* Listings Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-box border border-theme bg-base-100 p-5 transition hover:border-primary hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-extrabold">{listing.name}</div>
                  <div className="mt-1 text-xs text-muted-light">
                    {listing.category}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${listing.status === "Live" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}
                >
                  {listing.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-field bg-base-200 p-3">
                  <div className="text-xs text-muted-light">Stock</div>
                  <div className="mt-1 text-sm font-bold">{listing.stock}</div>
                </div>
                <div className="rounded-field bg-base-200 p-3">
                  <div className="text-xs text-muted-light">Price</div>
                  <div className="mt-1 text-sm font-bold">৳{listing.price}</div>
                </div>
                <div className="rounded-field bg-base-200 p-3">
                  <div className="text-xs text-muted-light">Unit</div>
                  <div className="mt-1 text-sm font-bold">/{listing.unit}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-light">{listing.id}</span>
                <button
                  type="button"
                  className="btn btn-sm border-0 bg-primary-soft text-primary hover:bg-primary hover:text-primary-content"
                >
                  Manage <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Listings;
