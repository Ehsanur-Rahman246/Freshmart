import React, { useMemo, useState } from "react";

import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiMoreHorizontal,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiX,
} from "react-icons/fi";


/* =========================================================
   DEMO ORDERS
========================================================= */

const ordersData = [
  {
    id: "ORD-2291",
    customer: "R. Ahmed",
    phone: "+880 1712-456789",
    product: "Fresh Tomato",
    quantity: "12 kg",
    price: 62,
    total: 744,
    status: "Confirmed",
    date: "04 Aug 2026",
    time: "09:42 AM",
    address: "Dhanmondi, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2289",
    customer: "S. Karim",
    phone: "+880 1812-987654",
    product: "Fresh Mango",
    quantity: "6 kg",
    price: 95,
    total: 570,
    status: "Out for delivery",
    date: "04 Aug 2026",
    time: "08:16 AM",
    address: "Uttara, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2287",
    customer: "N. Islam",
    phone: "+880 1912-345678",
    product: "Organic Spinach",
    quantity: "20 bundles",
    price: 18,
    total: 360,
    status: "Processing",
    date: "03 Aug 2026",
    time: "05:31 PM",
    address: "Mirpur, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2284",
    customer: "F. Begum",
    phone: "+880 1612-654321",
    product: "Farm Potato",
    quantity: "25 kg",
    price: 24,
    total: 600,
    status: "Delivered",
    date: "03 Aug 2026",
    time: "02:12 PM",
    address: "Mohammadpur, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2281",
    customer: "M. Hossain",
    phone: "+880 1512-111222",
    product: "Fresh Tomato",
    quantity: "18 kg",
    price: 62,
    total: 1116,
    status: "Delivered",
    date: "02 Aug 2026",
    time: "11:45 AM",
    address: "Banani, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2278",
    customer: "T. Rahman",
    phone: "+880 1711-223344",
    product: "Fresh Mango",
    quantity: "10 kg",
    price: 95,
    total: 950,
    status: "Cancelled",
    date: "01 Aug 2026",
    time: "04:20 PM",
    address: "Bashundhara, Dhaka",
    payment: "Refunded",
  },

  {
    id: "ORD-2274",
    customer: "A. Sultana",
    phone: "+880 1811-445566",
    product: "Organic Spinach",
    quantity: "15 bundles",
    price: 18,
    total: 270,
    status: "Confirmed",
    date: "01 Aug 2026",
    time: "10:18 AM",
    address: "Gulshan, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2270",
    customer: "K. Hasan",
    phone: "+880 1911-778899",
    product: "Farm Potato",
    quantity: "40 kg",
    price: 24,
    total: 960,
    status: "Processing",
    date: "31 Jul 2026",
    time: "03:44 PM",
    address: "Tejgaon, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2266",
    customer: "S. Akter",
    phone: "+880 1611-990011",
    product: "Fresh Tomato",
    quantity: "8 kg",
    price: 62,
    total: 496,
    status: "Delivered",
    date: "30 Jul 2026",
    time: "01:15 PM",
    address: "Wari, Dhaka",
    payment: "Paid",
  },

  {
    id: "ORD-2262",
    customer: "J. Chowdhury",
    phone: "+880 1511-332211",
    product: "Fresh Mango",
    quantity: "14 kg",
    price: 95,
    total: 1330,
    status: "Out for delivery",
    date: "30 Jul 2026",
    time: "09:28 AM",
    address: "Khilgaon, Dhaka",
    payment: "Paid",
  },
];

/* =========================================================
   STATUS CONFIG
========================================================= */

const statusConfig = {
  Confirmed: {
    icon: FiCheckCircle,
    className: "bg-success-soft text-success",
  },

  Processing: {
    icon: FiClock,
    className: "bg-warning-soft text-warning",
  },

  "Out for delivery": {
    icon: FiTruck,
    className: "bg-primary-soft text-primary",
  },

  Delivered: {
    icon: FiCheckCircle,
    className: "bg-purple-soft text-purple",
  },

  Cancelled: {
    icon: FiXCircle,
    className: "bg-error-soft text-error",
  },
};

/* =========================================================
   ORDER STATUS
========================================================= */

const statusFilters = [
  "All orders",
  "Confirmed",
  "Processing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Orders() {
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] =
    useState("All orders");

  const [showFilter, setShowFilter] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  /* =======================================================
     FILTER ORDERS
  ======================================================= */

  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
      const matchesSearch =
        order.id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.customer
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.product
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        activeFilter === "All orders" ||
        order.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, activeFilter]);

  /* =======================================================
     SUMMARY COUNTS
  ======================================================= */

  const totalOrders = ordersData.length;

  const activeOrders = ordersData.filter(
    (order) =>
      order.status === "Confirmed" ||
      order.status === "Processing" ||
      order.status === "Out for delivery"
  ).length;

  const deliveredOrders = ordersData.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = ordersData.filter(
    (order) => order.status === "Cancelled"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-base-100 text-base-content">

      {/* ===================================================
          NAVBAR

          Existing SellerNavbar component
      =================================================== */}
      
      {/* ===================================================
          PAGE CONTENT
      =================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          {/* LEFT */}

          <div>

            <div
              className="
                mb-2
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-muted-light
              "
            >
              Seller workspace
            </div>


            <h1
              className="
                text-3xl
                font-extrabold
                tracking-tight
                md:text-4xl
              "
            >
              Orders
            </h1>


            <p
              className="
                mt-2
                max-w-xl
                text-sm
                leading-6
                text-muted
              "
            >
              Track incoming orders, prepare products,
              and keep customers updated from one place.
            </p>

          </div>


          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-primary-soft
                px-4
                py-2
                text-sm
                font-bold
                text-primary
              "
            >

              <FiPackage size={16} />

              {activeOrders} active orders

            </div>

          </div>

        </section>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section
          className="
            mt-8
            grid
            grid-cols-2
            gap-4
            lg:grid-cols-4
          "
        >

          {/* TOTAL */}

          <div
            className="
              rounded-box
              border
              border-theme
              bg-base-200
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-muted-light
                "
              >
                Total orders
              </span>


              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-primary-soft
                  text-primary
                "
              >
                <FiPackage size={17} />
              </div>

            </div>


            <div
              className="
                mt-4
                text-2xl
                font-extrabold
              "
            >
              {totalOrders}
            </div>


            <div
              className="
                mt-1
                text-xs
                text-muted-light
              "
            >
              All time demo orders
            </div>

          </div>


          {/* ACTIVE */}

          <div
            className="
              rounded-box
              border
              border-theme
              bg-base-200
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-muted-light
                "
              >
                Active
              </span>


              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-warning-soft
                  text-warning
                "
              >
                <FiClock size={17} />
              </div>

            </div>


            <div
              className="
                mt-4
                text-2xl
                font-extrabold
              "
            >
              {activeOrders}
            </div>


            <div
              className="
                mt-1
                text-xs
                text-muted-light
              "
            >
              Need your attention
            </div>

          </div>


          {/* DELIVERED */}

          <div
            className="
              rounded-box
              border
              border-theme
              bg-base-200
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-muted-light
                "
              >
                Delivered
              </span>


              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-success-soft
                  text-success
                "
              >
                <FiCheckCircle size={17} />
              </div>

            </div>


            <div
              className="
                mt-4
                text-2xl
                font-extrabold
              "
            >
              {deliveredOrders}
            </div>


            <div
              className="
                mt-1
                text-xs
                text-muted-light
              "
            >
              Successfully completed
            </div>

          </div>


          {/* CANCELLED */}

          <div
            className="
              rounded-box
              border
              border-theme
              bg-base-200
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-muted-light
                "
              >
                Cancelled
              </span>


              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-error-soft
                  text-error
                "
              >
                <FiXCircle size={17} />
              </div>

            </div>


            <div
              className="
                mt-4
                text-2xl
                font-extrabold
              "
            >
              {cancelledOrders}
            </div>


            <div
              className="
                mt-1
                text-xs
                text-muted-light
              "
            >
              Cancelled by customers
            </div>

          </div>

        </section>


        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <section
          className="
            mt-8
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">

            <FiSearch
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-muted-light
              "
            />


            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search order, customer or product..."
              className="
                h-11
                w-full
                rounded-box
                border
                border-theme
                bg-base-200
                pl-11
                pr-4
                text-sm
                outline-none
                transition
                placeholder:text-muted-light
                focus:border-primary
                focus:ring-2
                focus:ring-primary/10
              "
            />

          </div>


          {/* FILTER BUTTON */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowFilter(!showFilter)
              }
              className="
                btn
                h-11
                border-theme
                bg-base-200
                text-base-content
                hover:border-primary
                hover:bg-primary-soft
              "
            >

              <FiFilter size={16} />

              {activeFilter}

              <FiChevronDown size={15} />

            </button>


            {/* FILTER DROPDOWN */}

            {showFilter && (

              <div
                className="
                  absolute
                  right-0
                  top-13
                  z-30
                  w-56
                  overflow-hidden
                  rounded-box
                  border
                  border-theme
                  bg-base-100
                  p-1
                  shadow-xl
                "
              >

                {statusFilters.map((filter) => (

                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter);
                      setShowFilter(false);
                    }}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-field
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      transition
                      ${
                        activeFilter === filter
                          ? "bg-primary-soft font-bold text-primary"
                          : "hover:bg-base-200"
                      }
                    `}
                  >

                    {filter}

                    {activeFilter === filter && (
                      <FiCheckCircle size={15} />
                    )}

                  </button>

                ))}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            RESULTS INFO
        ================================================= */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
          "
        >

          <div
            className="
              text-sm
              text-muted
            "
          >
            Showing{" "}
            <strong>
              {filteredOrders.length}
            </strong>{" "}
            orders
          </div>


          <div
            className="
              hidden
              text-xs
              text-muted-light
              sm:block
            "
          >
            Most recent first
          </div>

        </div>


        {/* =================================================
            ORDERS TABLE / LIST
        ================================================= */}

        <section
          className="
            mt-3
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
              grid-cols-[1.1fr_1.3fr_1.4fr_0.8fr_0.8fr_40px]
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
              lg:grid
            "
          >

            <span>
              Order
            </span>

            <span>
              Customer
            </span>

            <span>
              Product
            </span>

            <span>
              Total
            </span>

            <span>
              Status
            </span>

            <span />

          </div>


          {/* ORDERS */}

          {filteredOrders.length > 0 ? (

            filteredOrders.map((order) => {

              const StatusIcon =
                statusConfig[order.status]?.icon ||
                FiPackage;

              const statusClass =
                statusConfig[order.status]?.className ||
                "bg-base-300 text-muted";

              return (

                <div
                  key={order.id}
                  className="
                    border-b
                    border-theme-light
                    last:border-b-0
                  "
                >

                  {/* DESKTOP */}

                  <div
                    className="
                      hidden
                      grid-cols-[1.1fr_1.3fr_1.4fr_0.8fr_0.8fr_40px]
                      items-center
                      gap-4
                      px-5
                      py-4
                      transition
                      hover:bg-base-100
                      lg:grid
                    "
                  >

                    {/* ORDER */}

                    <div>

                      <div
                        className="
                          text-sm
                          font-extrabold
                        "
                      >
                        {order.id}
                      </div>

                      <div
                        className="
                          mt-1
                          text-xs
                          text-muted-light
                        "
                      >
                        {order.date}
                      </div>

                    </div>


                    {/* CUSTOMER */}

                    <div>

                      <div
                        className="
                          text-sm
                          font-bold
                        "
                      >
                        {order.customer}
                      </div>

                      <div
                        className="
                          mt-1
                          text-xs
                          text-muted-light
                        "
                      >
                        {order.phone}
                      </div>

                    </div>


                    {/* PRODUCT */}

                    <div>

                      <div
                        className="
                          text-sm
                          font-bold
                        "
                      >
                        {order.product}
                      </div>

                      <div
                        className="
                          mt-1
                          text-xs
                          text-muted-light
                        "
                      >
                        {order.quantity}
                      </div>

                    </div>


                    {/* TOTAL */}

                    <div>

                      <div
                        className="
                          text-sm
                          font-extrabold
                        "
                      >
                        ৳{order.total}
                      </div>

                      <div
                        className="
                          mt-1
                          text-xs
                          text-muted-light
                        "
                      >
                        {order.payment}
                      </div>

                    </div>


                    {/* STATUS */}

                    <div>

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-2.5
                          py-1.5
                          text-xs
                          font-bold
                          ${statusClass}
                        `}
                      >

                        <StatusIcon size={13} />

                        {order.status}

                      </span>

                    </div>


                    {/* MORE */}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOrder(order)
                      }
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        text-muted-light
                        transition
                        hover:bg-primary-soft
                        hover:text-primary
                      "
                    >

                      <FiMoreHorizontal size={18} />

                    </button>

                  </div>


                  {/* MOBILE */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrder(order)
                    }
                    className="
                      block
                      w-full
                      p-4
                      text-left
                      transition
                      hover:bg-base-100
                      lg:hidden
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                    >

                      <div>

                        <div
                          className="
                            text-sm
                            font-extrabold
                          "
                        >
                          {order.id}
                        </div>

                        <div
                          className="
                            mt-1
                            text-xs
                            text-muted-light
                          "
                        >
                          {order.date} · {order.time}
                        </div>

                      </div>


                      <span
                        className={`
                          inline-flex
                          shrink-0
                          items-center
                          gap-1
                          rounded-full
                          px-2.5
                          py-1.5
                          text-xs
                          font-bold
                          ${statusClass}
                        `}
                      >

                        <StatusIcon size={12} />

                        {order.status}

                      </span>

                    </div>


                    <div
                      className="
                        mt-4
                        flex
                        items-end
                        justify-between
                      "
                    >

                      <div>

                        <div
                          className="
                            text-sm
                            font-bold
                          "
                        >
                          {order.customer}
                        </div>

                        <div
                          className="
                            mt-1
                            text-xs
                            text-muted-light
                          "
                        >
                          {order.product} · {order.quantity}
                        </div>

                      </div>


                      <div
                        className="
                          text-sm
                          font-extrabold
                        "
                      >
                        ৳{order.total}
                      </div>

                    </div>

                  </button>

                </div>

              );
            })

          ) : (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div
              className="
                flex
                min-h-72
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-base-300
                  text-muted-light
                "
              >

                <FiPackage size={24} />

              </div>


              <h3
                className="
                  mt-4
                  text-base
                  font-extrabold
                "
              >
                No orders found
              </h3>


              <p
                className="
                  mt-1
                  max-w-sm
                  text-sm
                  text-muted-light
                "
              >
                Try changing the search term or selecting
                another order status.
              </p>


              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All orders");
                }}
                className="
                  btn
                  btn-sm
                  mt-5
                  bg-primary
                  text-primary-content
                "
              >
                Clear filters
              </button>

            </div>

          )}

        </section>


        {/* =================================================
            BOTTOM NOTE
        ================================================= */}

        <div
          className="
            mt-5
            flex
            items-center
            gap-2
            text-xs
            text-muted-light
          "
        >

          <FiClock size={13} />

          Orders are updated automatically when delivery
          status changes.

        </div>

      </main>


      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (

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
          onClick={() => setSelectedOrder(null)}
        >

          <div
            className="
              w-full
              max-w-2xl
              rounded-box
              bg-base-100
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              className="
                flex
                items-start
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

                  <FiPackage size={18} />

                  <span
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                    "
                  >
                    Order details
                  </span>

                </div>


                <h2
                  className="
                    mt-1
                    text-2xl
                    font-extrabold
                  "
                >
                  {selectedOrder.id}
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
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


            {/* =================================================
                MODAL CONTENT
            ================================================= */}

            <div className="p-6">

              {/* STATUS */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  rounded-box
                  border
                  border-theme
                  bg-base-200
                  p-4
                "
              >

                <div>

                  <div
                    className="
                      text-xs
                      text-muted-light
                    "
                  >
                    Current status
                  </div>


                  <div
                    className="
                      mt-1
                      text-sm
                      font-bold
                    "
                  >
                    {selectedOrder.status}
                  </div>

                </div>


                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    ${
                      statusConfig[
                        selectedOrder.status
                      ]?.className ||
                      "bg-base-300 text-muted"
                    }
                  `}
                >

                  {React.createElement(
                    statusConfig[
                      selectedOrder.status
                    ]?.icon || FiPackage,
                    {
                      size: 18,
                    }
                  )}

                </div>

              </div>


              {/* ORDER INFORMATION */}

              <div
                className="
                  mt-5
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >

                {/* CUSTOMER */}

                <div
                  className="
                    rounded-box
                    border
                    border-theme
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-muted-light
                    "
                  >

                    <FiUser size={14} />

                    Customer

                  </div>


                  <div
                    className="
                      mt-3
                      text-sm
                      font-extrabold
                    "
                  >
                    {selectedOrder.customer}
                  </div>


                  <div
                    className="
                      mt-1
                      text-xs
                      text-muted-light
                    "
                  >
                    {selectedOrder.phone}
                  </div>

                </div>


                {/* DELIVERY */}

                <div
                  className="
                    rounded-box
                    border
                    border-theme
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-muted-light
                    "
                  >

                    <FiMapPin size={14} />

                    Delivery

                  </div>


                  <div
                    className="
                      mt-3
                      text-sm
                      font-extrabold
                    "
                  >
                    {selectedOrder.address}
                  </div>


                  <div
                    className="
                      mt-1
                      text-xs
                      text-muted-light
                    "
                  >
                    Standard delivery
                  </div>

                </div>

              </div>


              {/* PRODUCT */}

              <div
                className="
                  mt-4
                  rounded-box
                  border
                  border-theme
                  p-4
                "
              >

                <div
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-muted-light
                  "
                >
                  Product
                </div>


                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div>

                    <div
                      className="
                        text-sm
                        font-extrabold
                      "
                    >
                      {selectedOrder.product}
                    </div>


                    <div
                      className="
                        mt-1
                        text-xs
                        text-muted-light
                      "
                    >
                      {selectedOrder.quantity}
                    </div>

                  </div>


                  <div
                    className="
                      text-right
                    "
                  >

                    <div
                      className="
                        text-sm
                        font-extrabold
                      "
                    >
                      ৳{selectedOrder.total}
                    </div>


                    <div
                      className="
                        mt-1
                        text-xs
                        text-muted-light
                      "
                    >
                      ৳{selectedOrder.price} / unit
                    </div>

                  </div>

                </div>

              </div>


              {/* DATE */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  rounded-box
                  bg-base-200
                  px-4
                  py-3
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    text-muted-light
                  "
                >

                  <FiCalendar size={14} />

                  Placed on

                </div>


                <span
                  className="
                    text-xs
                    font-bold
                  "
                >
                  {selectedOrder.date} ·{" "}
                  {selectedOrder.time}
                </span>

              </div>

            </div>


            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-2
                border-t
                border-theme
                bg-base-200
                px-6
                py-4
              "
            >

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="
                  btn
                  btn-sm
                  border-theme
                  bg-base-100
                "
              >
                Close
              </button>


              {/* DEMO ACTION */}

              {selectedOrder.status !==
                "Delivered" &&
                selectedOrder.status !==
                  "Cancelled" && (

                  <button
                    type="button"
                    className="
                      btn
                      btn-sm
                      bg-primary
                      text-primary-content
                    "
                  >
                    Update order
                    <FiChevronRight size={14} />
                  </button>

                )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}