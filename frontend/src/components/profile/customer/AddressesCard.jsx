import { useQueryClient } from "@tanstack/react-query";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import {
  deleteAddress,
  setDefaultAddress,
} from "../../../api/customer";


const AddressesCard = ({ addresses, onAdd, onEdit }) => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["customerProfile"] });

  const handleDelete = async (addressId) => {
    try {
      await deleteAddress(addressId);
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      invalidate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-base-100 border border-theme-light rounded-box p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">Addresses</h3>
        <button
          onClick={onAdd}
          className="btn btn-sm bg-primary text-primary-content gap-1"
        >
          <FiPlus size={14} /> Add Address
        </button>
      </div>

      {addresses.length === 0 && (
        <p className="text-sm text-muted">No addresses added yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="border border-theme-light rounded-field p-4 flex justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">
                  {addr.label || "Address"}
                </span>
                {addr.isDefault && (
                  <span className="badge badge-xs bg-primary-soft text-primary border-none">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm">
                {addr.recipientName} · {addr.phone}
              </p>
              <p className="text-sm text-muted">
                {addr.village}, {addr.upazila}, {addr.district}, {addr.division}
              </p>
              <p className="text-sm text-muted">{addr.address}</p>
            </div>

            <div className="flex flex-col gap-2 items-end shrink-0">
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(addr._id)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="btn btn-ghost btn-xs btn-circle text-error"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr._id)}
                  className="btn btn-xs btn-outline gap-1"
                >
                  <FiCheck size={12} /> Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesCard;