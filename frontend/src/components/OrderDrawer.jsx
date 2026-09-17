import OrderDetailContent from "./OrderDetailContent";

const OrderDrawer = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-overlay z-40" />

      <div
        className="
          fixed z-50 bg-base-100 shadow-2xl
          bottom-0 left-0 right-0 h-[85vh] rounded-t-box
          flex flex-col
          sm:top-0 sm:right-0 sm:left-auto sm:bottom-auto
          sm:h-screen sm:w-107.5 sm:rounded-none
        "
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-light">
          <div>
            <p className="text-xs text-muted-light">Order Details</p>
            <h2 className="text-sm font-bold">{order.orderNumber}</h2>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <OrderDetailContent order={order} />
        </div>
      </div>
    </>
  );
};

export default OrderDrawer;