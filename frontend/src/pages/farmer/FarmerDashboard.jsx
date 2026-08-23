import { useState } from "react";

import {
  FiTrendingUp,
  FiTrendingDown,
  FiCheckSquare,
  FiPlus,
  FiArrowUpRight,
  FiStar,
  FiChevronRight,
  FiX,
  FiPackage,
  FiCreditCard,
} from "react-icons/fi";

/* =========================================================
   DEMO DATA
========================================================= */

const crops = [
  {
    name: "Tomato",
    unit: "kg",
    price: 62,
    delta: 8.4,
    up: true,
  },
  {
    name: "Spinach",
    unit: "bundle",
    price: 18,
    delta: 3.1,
    up: true,
  },
  {
    name: "Potato",
    unit: "kg",
    price: 24,
    delta: -2.5,
    up: false,
  },
  {
    name: "Mango",
    unit: "kg",
    price: 95,
    delta: 11.2,
    up: true,
  },
  {
    name: "Onion",
    unit: "kg",
    price: 31,
    delta: -1.1,
    up: false,
  },
];

const orders = [
  {
    id: "ORD-2291",
    customer: "R. Ahmed",
    item: "Tomato · 12kg",
    status: "Confirmed",
  },
  {
    id: "ORD-2289",
    customer: "S. Karim",
    item: "Mango · 6kg",
    status: "Out for delivery",
  },
  {
    id: "ORD-2284",
    customer: "N. Islam",
    item: "Spinach · 20 bundles",
    status: "Delivered",
  },
];

const reviews = [
  {
    customer: "R. Ahmed",
    stars: 5,
    note: "Tomatoes arrived firm and fresh, two days running.",
  },
  {
    customer: "F. Begum",
    stars: 5,
    note: "Consistent quality, always packed carefully.",
  },
  {
    customer: "M. Hossain",
    stars: 4,
    note: "Good produce, delivery ran a little late.",
  },
];

/* =========================================================
   HARD-CODED SELLER LISTINGS
========================================================= */

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

/* =========================================================
   STATUS COLORS
========================================================= */

const statusColor = {
  Confirmed: "var(--color-success)",
  "Out for delivery": "var(--color-orange)",
  Delivered: "var(--color-purple)",
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FarmerDashboard() {
  const [showListings, setShowListings] = useState(false);

  const handleOrders = () => {
    window.location.href = "/seller/orders";
  };

  const handlePayout = () => {
    window.location.href = "/seller/payout";
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">

      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <div
        className={`
          transition-all duration-200
          ${
            showListings
              ? "scale-[0.995] blur-sm"
              : ""
          }
        `}
      >

        {/* ===================================================
            HERO SECTION
        =================================================== */}

        <section
          className="
            mx-auto
            grid
            max-w-7xl
            grid-cols-1
            gap-10
            px-6
            py-14
            lg:grid-cols-[1.1fr_0.9fr]
          "
        >

          {/* =================================================
              HERO LEFT
          ================================================= */}

          <div className="flex flex-col justify-center">

            <div
              className="
                mb-4
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-muted-light
              "
            >
              Today's baseline · Updated 6:00 AM
            </div>

            <h2
              className="
                max-w-2xl
                text-4xl
                font-extrabold
                leading-tight
                tracking-tight
                md:text-5xl
              "
            >
              Priced by demand.
              <br />
              Picked by you.
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-base
                leading-7
                text-muted
              "
            >
              Green Fields Farm · Savar. Baseline prices move
              with stock and orders across FramFresh. Your listings
              track it automatically, and you can request changes
              whenever conditions call for it.
            </p>

            {/* HERO ACTIONS */}

            <div className="mt-7 flex flex-wrap gap-3">

              {/* LIST PRODUCT */}

              <button
                type="button"
                onClick={() => setShowListings(true)}
                className="
                  btn
                  border-0
                  bg-primary
                  text-primary-content
                  hover:bg-primary-hover
                "
              >
                <FiPlus size={17} />

                List a product
              </button>

              {/* PRICE SHEET */}

              <button
                type="button"
                className="
                  btn
                  btn-ghost
                  text-base-content
                  hover:bg-primary-soft
                "
              >
                View full price sheet

                <FiChevronRight size={16} />
              </button>

            </div>

          </div>

          {/* =================================================
              PRICE LEDGER
          ================================================= */}

          <div
            className="
              rounded-box
              border
              border-theme
              bg-base-200
              p-6
              shadow-sm
            "
          >

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-extrabold">
                Price Ledger
              </h3>

              <span
                className="
                  text-xs
                  font-bold
                  tracking-wider
                  text-muted-light
                "
              >
                04 AUG
              </span>

            </div>

            <div className="my-4 border-t border-theme" />

            {/* CROPS */}

            {crops.map((crop) => (

              <div
                key={crop.name}
                className="
                  grid
                  grid-cols-[1.3fr_0.8fr_0.9fr_1fr]
                  items-center
                  border-b
                  border-theme-light
                  py-3
                  last:border-b-0
                "
              >

                <strong className="text-sm">
                  {crop.name}
                </strong>

                <span
                  className="
                    text-xs
                    text-muted-light
                  "
                >
                  /{crop.unit}
                </span>

                <strong className="text-right text-sm">
                  ৳{crop.price}
                </strong>

                <span
                  className={`
                    flex
                    items-center
                    justify-end
                    gap-1
                    text-xs
                    font-bold
                    ${
                      crop.up
                        ? "text-success"
                        : "text-error"
                    }
                  `}
                >
                  {crop.up ? (
                    <FiTrendingUp size={13} />
                  ) : (
                    <FiTrendingDown size={13} />
                  )}

                  {crop.up ? "+" : ""}
                  {crop.delta}%
                </span>

              </div>

            ))}

          </div>

        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-6
            py-8
          "
        >

          <div className="mb-5">

            <h2
              className="
                text-2xl
                font-extrabold
              "
            >
              Run the farm
            </h2>

          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            {/* ACTION 1 */}

            <button
              type="button"
              onClick={() => setShowListings(true)}
              className="
                group
                rounded-box
                border
                border-theme
                bg-base-200
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-primary
                hover:shadow-md
              "
            >

              <FiPlus
                size={21}
                className="
                  text-primary
                  transition
                  group-hover:scale-110
                "
              />

              <div
                className="
                  mt-4
                  text-base
                  font-bold
                "
              >
                List a product
              </div>

              <div
                className="
                  mt-1
                  text-sm
                  text-muted-light
                "
              >
                Add stock, set your baseline-linked price
              </div>

            </button>

            {/* ACTION 2 */}

            <button
              type="button"
              onClick={handlePayout}
              className="
                group
                rounded-box
                border
                border-theme
                bg-base-200
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-primary
                hover:shadow-md
              "
            >

              <FiCreditCard
                size={21}
                className="text-primary"
              />

              <div
                className="
                  mt-4
                  text-base
                  font-bold
                "
              >
                Request payout
              </div>

              <div
                className="
                  mt-1
                  text-sm
                  text-muted-light
                "
              >
                ৳18,240 available to withdraw
              </div>

            </button>

            {/* ACTION 3 */}

            <button
              type="button"
              className="
                group
                rounded-box
                border
                border-theme
                bg-base-200
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-primary
                hover:shadow-md
              "
            >

              <FiArrowUpRight
                size={21}
                className="text-primary"
              />

              <div
                className="
                  mt-4
                  text-base
                  font-bold
                "
              >
                Request price increase
              </div>

              <div
                className="
                  mt-1
                  text-sm
                  text-muted-light
                "
              >
                Flag weather or yield conditions
              </div>

            </button>

            {/* ACTION 4 */}

            <button
              type="button"
              className="
                group
                rounded-box
                border
                border-theme
                bg-base-200
                p-5
                text-left
                transition
                hover:-translate-y-1
                hover:border-primary
                hover:shadow-md
              "
            >

              <FiCheckSquare
                size={21}
                className="text-primary"
              />

              <div
                className="
                  mt-4
                  text-base
                  font-bold
                "
              >
                Verification status
              </div>

              <div
                className="
                  mt-1
                  text-sm
                  text-muted-light
                "
              >
                Documents approved · listing live
              </div>

            </button>

          </div>

        </section>

        {/* ===================================================
            RECENT ORDERS
        =================================================== */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-6
            py-8
          "
        >

          <div
            className="
              mb-5
              flex
              items-center
              justify-between
            "
          >

            <h2
              className="
                text-2xl
                font-extrabold
              "
            >
              Recent orders
            </h2>

            <button
              type="button"
              onClick={handleOrders}
              className="
                flex
                items-center
                gap-1
                text-sm
                font-bold
                text-primary
                hover:text-primary-hover
              "
            >
              View all

              <FiChevronRight size={15} />
            </button>

          </div>

          <div
            className="
              overflow-hidden
              rounded-box
              border
              border-theme
              bg-base-200
            "
          >

            {/* TABLE HEADER */}

            <div
              className="
                hidden
                grid-cols-[1fr_1.2fr_1.6fr_1fr]
                gap-4
                border-b
                border-theme
                bg-base-300
                px-5
                py-3
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-muted-light
                md:grid
              "
            >

              <span>Order</span>

              <span>Customer</span>

              <span>Item</span>

              <span className="text-right">
                Status
              </span>

            </div>

            {/* ORDERS */}

            {orders.map((order) => (

              <div
                key={order.id}
                className="
                  grid
                  grid-cols-1
                  gap-2
                  border-b
                  border-theme-light
                  px-5
                  py-4
                  last:border-b-0
                  md:grid-cols-[1fr_1.2fr_1.6fr_1fr]
                  md:items-center
                  md:gap-4
                "
              >

                <span
                  className="
                    text-xs
                    font-bold
                    text-muted
                  "
                >
                  {order.id}
                </span>

                <span className="text-sm">
                  {order.customer}
                </span>

                <span className="text-sm">
                  {order.item}
                </span>

                <span
                  className="
                    w-fit
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-bold
                    md:ml-auto
                  "
                  style={{
                    color: statusColor[order.status],
                    background: `${statusColor[order.status]}18`,
                  }}
                >
                  {order.status}
                </span>

              </div>

            ))}

          </div>

        </section>

        {/* ===================================================
            REVIEWS
        =================================================== */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-6
            py-8
          "
        >

          <div
            className="
              mb-5
              flex
              items-center
              justify-between
            "
          >

            <h2
              className="
                text-2xl
                font-extrabold
              "
            >
              What customers are saying
            </h2>

            <span
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-primary-soft
                px-3
                py-1.5
                text-sm
                font-bold
                text-primary
              "
            >

              <FiCheckSquare size={14} />

              4.8 aggregate

            </span>

          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            "
          >

            {reviews.map((review) => (

              <div
                key={review.customer}
                className="
                  rounded-box
                  border
                  border-theme
                  bg-base-200
                  p-5
                  transition
                  hover:-translate-y-1
                  hover:shadow-md
                "
              >

                {/* STARS */}

                <div
                  className="
                    mb-3
                    flex
                    gap-1
                    text-secondary
                  "
                >

                  {Array.from({
                    length: 5,
                  }).map((_, index) => (

                    <FiStar
                      key={index}
                      size={14}
                      fill={
                        index < review.stars
                          ? "currentColor"
                          : "none"
                      }
                    />

                  ))}

                </div>

                {/* REVIEW */}

                <p
                  className="
                    text-sm
                    italic
                    leading-6
                    text-muted
                  "
                >
                  "{review.note}"
                </p>

                {/* CUSTOMER */}

                <div
                  className="
                    mt-4
                    text-xs
                    font-bold
                    text-muted-light
                  "
                >
                  — {review.customer}
                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

      {/* =====================================================
          LISTINGS OVERLAY
      ===================================================== */}

      {showListings && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-start
            justify-center
            overflow-y-auto
            bg-overlay
            px-4
            py-8
          "
          onClick={() => setShowListings(false)}
        >

          {/* LISTINGS WHITE PANEL */}

          <div
            className="
              w-full
              max-w-5xl
              rounded-box
              bg-white
              shadow-2xl
            "
            onClick={(event) => {
              event.stopPropagation();
            }}
          >

            {/* PANEL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-theme
                px-6
                py-5
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-primary
                  "
                >

                  <FiPackage size={19} />

                  <span
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                    "
                  >
                    Seller listings
                  </span>

                </div>

                <h2
                  className="
                    mt-1
                    text-2xl
                    font-extrabold
                  "
                >
                  Your products
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-light
                  "
                >
                  Manage the products currently available on
                  FramFresh.
                </p>

              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={() => setShowListings(false)}
                className="
                  btn
                  btn-circle
                  btn-sm
                  border-0
                  bg-base-200
                  hover:bg-error-soft
                  hover:text-error
                "
              >
                <FiX size={18} />
              </button>

            </div>

            {/* LISTINGS CONTENT */}

            <div className="p-6">

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >

                {listings.map((listing) => (

                  <div
                    key={listing.id}
                    className="
                      rounded-box
                      border
                      border-theme
                      bg-base-100
                      p-5
                      transition
                      hover:border-primary
                      hover:shadow-sm
                    "
                  >

                    {/* LISTING TOP */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                      "
                    >

                      <div>

                        <div
                          className="
                            text-lg
                            font-extrabold
                          "
                        >
                          {listing.name}
                        </div>

                        <div
                          className="
                            mt-1
                            text-xs
                            text-muted-light
                          "
                        >
                          {listing.category}
                        </div>

                      </div>

                      {/* STATUS */}

                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-bold
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

                    {/* LISTING INFORMATION */}

                    <div
                      className="
                        mt-5
                        grid
                        grid-cols-3
                        gap-3
                      "
                    >

                      {/* STOCK */}

                      <div
                        className="
                          rounded-field
                          bg-base-200
                          p-3
                        "
                      >

                        <div
                          className="
                            text-xs
                            text-muted-light
                          "
                        >
                          Stock
                        </div>

                        <div
                          className="
                            mt-1
                            text-sm
                            font-bold
                          "
                        >
                          {listing.stock}
                        </div>

                      </div>

                      {/* PRICE */}

                      <div
                        className="
                          rounded-field
                          bg-base-200
                          p-3
                        "
                      >

                        <div
                          className="
                            text-xs
                            text-muted-light
                          "
                        >
                          Price
                        </div>

                        <div
                          className="
                            mt-1
                            text-sm
                            font-bold
                          "
                        >
                          ৳{listing.price}
                        </div>

                      </div>

                      {/* UNIT */}

                      <div
                        className="
                          rounded-field
                          bg-base-200
                          p-3
                        "
                      >

                        <div
                          className="
                            text-xs
                            text-muted-light
                          "
                        >
                          Unit
                        </div>

                        <div
                          className="
                            mt-1
                            text-sm
                            font-bold
                          "
                        >
                          /{listing.unit}
                        </div>

                      </div>

                    </div>

                    {/* LISTING BOTTOM */}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-xs
                          text-muted-light
                        "
                      >
                        {listing.id}
                      </span>

                      <button
                        type="button"
                        className="
                          btn
                          btn-sm
                          border-0
                          bg-primary-soft
                          text-primary
                          hover:bg-primary
                          hover:text-primary-content
                        "
                      >
                        Manage

                        <FiChevronRight size={14} />
                      </button>

                    </div>

                  </div>

                ))}

              </div>

              {/* ADD LISTING BUTTON */}

              <button
                type="button"
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-box
                  border
                  border-dashed
                  border-primary
                  bg-primary-soft
                  px-4
                  py-4
                  text-sm
                  font-bold
                  text-primary
                  transition
                  hover:bg-primary
                  hover:text-primary-content
                "
              >

                <FiPlus size={17} />

                Add new listing

              </button>

            </div>

            {/* PANEL FOOTER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-t
                border-theme
                bg-base-200
                px-6
                py-4
              "
            >

              <span
                className="
                  text-xs
                  text-muted-light
                "
              >
                {listings.length} demo listings
              </span>

              <button
                type="button"
                onClick={() => setShowListings(false)}
                className="
                  btn
                  btn-sm
                  bg-neutral
                  text-neutral-content
                  hover:opacity-90
                "
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}