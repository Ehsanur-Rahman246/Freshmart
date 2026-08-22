import { FiPackage, FiPlus, FiChevronRight, FiX } from "react-icons/fi";

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

const Listings = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-overlay px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-box bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >

        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-theme px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <FiPackage size={19} />

              <span className="text-xs font-bold uppercase tracking-wider">
                Seller listings
              </span>
            </div>

            <h2 className="mt-1 text-2xl font-extrabold">
              Your products
            </h2>

            <p className="mt-1 text-sm text-muted-light">
              Manage the products currently available on FramFresh.
            </p>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-sm border-0 bg-base-200 hover:bg-error-soft hover:text-error"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Listings Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-box border border-theme bg-base-100 p-5 transition hover:border-primary hover:shadow-sm"
              >

                {/* Listing Top */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-extrabold">
                      {listing.name}
                    </div>

                    <div className="mt-1 text-xs text-muted-light">
                      {listing.category}
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`
                      rounded-full px-3 py-1 text-xs font-bold
                      ${
                        listing.status === "Live"
                          ? "bg-success-soft text-success"
                          : "bg-warning-soft text-warning"
                      }
                    `}
                  >
                    {listing.status}
                  </span>
                </div>

                {/* Listing Information */}
                <div className="mt-5 grid grid-cols-3 gap-3">

                  {/* Stock */}
                  <div className="rounded-field bg-base-200 p-3">
                    <div className="text-xs text-muted-light">
                      Stock
                    </div>

                    <div className="mt-1 text-sm font-bold">
                      {listing.stock}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="rounded-field bg-base-200 p-3">
                    <div className="text-xs text-muted-light">
                      Price
                    </div>

                    <div className="mt-1 text-sm font-bold">
                      ৳{listing.price}
                    </div>
                  </div>

                  {/* Unit */}
                  <div className="rounded-field bg-base-200 p-3">
                    <div className="text-xs text-muted-light">
                      Unit
                    </div>

                    <div className="mt-1 text-sm font-bold">
                      /{listing.unit}
                    </div>
                  </div>

                </div>

                {/* Listing Bottom */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-light">
                    {listing.id}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm border-0 bg-primary-soft text-primary hover:bg-primary hover:text-primary-content"
                  >
                    Manage
                    <FiChevronRight size={14} />
                  </button>
                </div>

              </div>
            ))}

          </div>

          {/* Add Listing */}
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-box border border-dashed border-primary bg-primary-soft px-4 py-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-content"
          >
            <FiPlus size={17} />
            Add new listing
          </button>
        </div>

        {/* Panel Footer */}
        <div className="flex items-center justify-between border-t border-theme bg-base-200 px-6 py-4">
          <span className="text-xs text-muted-light">
            {listings.length} demo listings
          </span>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm bg-neutral text-neutral-content hover:opacity-90"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default Listings;