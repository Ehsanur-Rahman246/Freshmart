import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  addAddress,
  updateAddress,
} from "../../../api/customer";
import ModalShell from "../shared/ModalShell";
import Field from "../shared/Field";

const emptyAddress = {
  label: "",
  recipientName: "",
  phone: "",
  division: "",
  district: "",
  upazila: "",
  village: "",
  address: "",
};


const AddressModal = ({ address, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(address);
  const [form, setForm] = useState(
    address
      ? {
          label: address.label || "",
          recipientName: address.recipientName || "",
          phone: address.phone || "",
          division: address.division || "",
          district: address.district || "",
          upazila: address.upazila || "",
          village: address.village || "",
          address: address.address || "",
        }
      : emptyAddress,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      if (isEditing) {
        await updateAddress(address._id, form);
      } else {
        await addAddress(form);
      }
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title={isEditing ? "Edit Address" : "Add Address"}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        <Field
          label="Label"
          value={form.label}
          onChange={update("label")}
          placeholder="Home, Office..."
        />
        <Field
          label="Recipient Name"
          value={form.recipientName}
          onChange={update("recipientName")}
        />
        <Field label="Phone" value={form.phone} onChange={update("phone")} />
        <Field
          label="Division"
          value={form.division}
          onChange={update("division")}
        />
        <Field
          label="District"
          value={form.district}
          onChange={update("district")}
        />
        <Field
          label="Upazila"
          value={form.upazila}
          onChange={update("upazila")}
        />
        <Field
          label="Village"
          value={form.village}
          onChange={update("village")}
        />
        <Field
          label="Full Address"
          value={form.address}
          onChange={update("address")}
        />
      </div>

      {error && <p className="text-sm text-error mt-3">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn bg-primary text-primary-content w-full mt-4"
      >
        {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Address"}
      </button>
    </ModalShell>
  );
};

export default AddressModal;