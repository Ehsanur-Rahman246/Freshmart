import { useParams, useNavigate } from "react-router";
import { FiArrowLeft } from "react-icons/fi";
import { useOrderById } from "../../hooks/useOrders";
import OrderDetailContent from "../../components/OrderDetailContent";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderById(id);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/customer/orders")}
        className="btn btn-sm btn-ghost mb-4"
      >
        <FiArrowLeft /> Back to Orders
      </button>

      {isLoading && <div className="skeleton h-96 rounded-box" />}

      {isError && <p className="text-sm text-error">Could not load this order.</p>}

      {order && <OrderDetailContent order={order} />}
    </div>
  );
};

export default OrderDetails;