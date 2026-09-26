import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  FiPackage,
  FiImage,
  FiSave,
  FiArrowLeft,
  FiTrash2,
} from "react-icons/fi";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../api/product";
import { PRODUCT_UNITS } from "../../utils/productConstants";
import { useQuery } from "@tanstack/react-query";
import { getPricingRanges } from "../../api/pricing";
import PriceRangeGauge from "../../components/PriceRangeGauge";

const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  ...rest
}) => (
  <label className="flex flex-col gap-2 text-sm font-semibold">
    {label}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
      {...rest}
    />
  </label>
);

const ReadOnlyField = ({ label, value }) => (
  <div className="flex flex-col gap-2 text-sm font-semibold">
    {label}
    <div className="w-full px-4 py-3 rounded-xl border border-theme bg-base-200 text-muted">
      {value || "—"}
    </div>
  </div>
);

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    description: "",
    price: "",
    unit: "kg",
    stock: "",
    discountPercentage: "0",
    listingDuration: "30",
  });

  const { data: pricingRanges = [] } = useQuery({
    queryKey: ["pricingRanges"],
    queryFn: async () => (await getPricingRanges()).data.ranges,
    staleTime: 1000 * 60,
  });

  const matchedRange = pricingRanges.find(
    (r) => r.normalizedName === (product?.name || "").trim().toLowerCase(),
  );

  useEffect(() => {
    getProductById(id)
      .then((res) => {
        if (!res.data.success) return;
        const p = res.data.product;
        setProduct(p);
        setForm({
          description: p.description || "",
          price: p.price ?? "",
          unit: p.unit || "kg",
          stock: p.stock ?? "",
          discountPercentage: p.discountPercentage ?? 0,
          listingDuration: p.listingDuration ?? "",
        });
      })
      .catch(() => {
        alert("Could not load this product");
        navigate("/farmer/listings", { replace: true });
      });
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 4) {
      alert("You can select maximum 4 images");
      return;
    }
    setImages(selected);
  };

  const toggleRemoveImage = (publicId) => {
    setRemoveImageIds((prev) =>
      prev.includes(publicId)
        ? prev.filter((pid) => pid !== publicId)
        : [...prev, publicId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    images.forEach((img) => data.append("images", img));

    if (removeImageIds.length > 0) {
      data.append("removeImages", JSON.stringify(removeImageIds));
    }

    try {
      await updateProduct(id, data);
      alert("Product updated successfully!");
      navigate("/farmer/listings", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteProduct(id);
      alert("Product deleted");
      navigate("/farmer/listings", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
      setDeleting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/farmer/listings", { replace: true })}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-theme bg-base-200 text-muted hover:border-primary hover:text-primary"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-theme">
          <div>
            <h1 className="text-3xl font-extrabold">{product.name}</h1>
            <p className="text-sm text-muted mt-1">
              {product.farm?.name} ·{" "}
              <span className="capitalize">{product.status}</span>
            </p>
          </div>
          <FiPackage size={30} className="text-primary" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Locked product info */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Product Information</h2>
            <p className="text-xs text-muted-light mb-4">
              These fields are set when the listing was created and can't be
              changed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ReadOnlyField label="Category" value={product.category} />
              <ReadOnlyField label="Sub-category" value={product.subCategory} />
              <ReadOnlyField label="Season" value={product.season} />
              <ReadOnlyField label="Source" value={product.source} />
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary resize-y"
              />
            </label>
          </section>

          {/* Pricing + Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-theme bg-base-200 p-6">
              <h2 className="text-lg font-bold mb-4">Pricing</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <TextInput
                    label="Price *"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                  {matchedRange && (
                    <PriceRangeGauge
                      min={matchedRange.min}
                      max={matchedRange.max}
                      value={form.price}
                    />
                  )}
                </div>
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  Unit *
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                  >
                    {PRODUCT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <TextInput
                label="Discount %"
                type="number"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </section>

            <section className="rounded-2xl border border-theme bg-base-200 p-6">
              <h2 className="text-lg font-bold mb-4">Stock</h2>

              <div className="flex flex-col gap-4">
                <TextInput
                  label="Available Stock *"
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                />
                <TextInput
                  label="Listing Duration (days) *"
                  type="number"
                  name="listingDuration"
                  value={form.listingDuration}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </section>
          </div>

          {/* Images */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Product Images</h2>

            {product.images?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-light mb-2">Check to remove</p>
                <div className="flex flex-wrap gap-3">
                  {product.images.map((img) => (
                    <label
                      key={img.publicId}
                      className="flex flex-col items-center gap-1"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <input
                        type="checkbox"
                        checked={removeImageIds.includes(img.publicId)}
                        onChange={() => toggleRemoveImage(img.publicId)}
                      />
                      <span className="text-xs">Remove</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-2xl border-2 border-dashed border-theme bg-base-100 cursor-pointer text-muted hover:border-primary hover:bg-primary-soft hover:text-primary">
              <FiImage size={32} />
              <strong className="text-sm font-bold text-base-content">
                Add more images
              </strong>
              <span className="text-xs text-muted-light">
                Maximum 4 at a time, 2MB each
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="hidden"
              />
            </label>

            {images.length > 0 && (
              <p className="mt-4 px-4 py-3 rounded-xl bg-success-soft text-success text-sm font-bold text-center">
                {images.length} new image(s) selected
              </p>
            )}
          </section>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-content font-bold hover:bg-primary-hover disabled:opacity-50"
            >
              <FiSave />
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-error text-error font-bold hover:bg-error-soft disabled:opacity-50"
            >
              <FiTrash2 />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
