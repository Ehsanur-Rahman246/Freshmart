import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiPackage, FiImage, FiPlus, FiArrowLeft, FiChevronDown } from "react-icons/fi";
import { createProduct } from "../../api/product";
import { getMyFarms } from "../../api/farm";

const categories = ["dairy", "grain", "spices", "poultry", "livestock", "fruits", "vegetables"];
const seasons = ["allYear", "winter", "summer", "monsoon"];
const sources = ["field", "greenhouse", "orchard", "dairyFarm", "poultryFarm", "livestockFarm"];
const units = ["kg", "g", "L", "pc", "dozen", "mL"];

// Reusable text input
const TextInput = ({ label, name, value, onChange, placeholder, type = "text", ...rest }) => (
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

// Reusable dropdown with button + white options box
const Dropdown = ({ label, name, value, onChange, options, placeholder = "Select" }) => {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div className="relative flex flex-col gap-2 text-sm font-semibold">
      {label}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-base-100 text-left ${
          open ? "border-primary" : hover ? "border-primary" : "border-theme"
        }`}
      >
        <span className={value ? "" : "text-muted"}>
          {value || placeholder}
        </span>
        <FiChevronDown style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-theme rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted">No options available</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange({ target: { name, value: opt } });
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-soft ${
                  value === opt ? "bg-primary-soft text-primary font-bold" : ""
                }`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function AddProduct() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    farmId: "",
    name: "",
    description: "",
    category: "",
    subCategory: "",
    season: "allYear",
    source: "field",
    price: "",
    unit: "kg",
    stock: "",
    discountPercentage: "0",
    listingDuration: "30",
  });

  useEffect(() => {
    getMyFarms()
      .then((res) => {
        if (res.data.success) setFarms(res.data.farms);
      })
      .catch(() => alert("Could not load farms"));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 4) {
      alert("You can select maximum 4 images");
      return;
    }
    setImages(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.farmId) {
      alert("Please select a farm");
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    images.forEach((img) => data.append("images", img));

    try {
      await createProduct(data);
      alert("Product added successfully!");
      navigate("/farmer/listings", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const farmOptions = farms.map((f) => ({ label: f.name, value: f._id }));

  return (
    <div className="min-h-screen bg-base-100">

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/farmer/listings", {replace:true})}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-theme bg-base-200 text-muted hover:border-primary hover:text-primary"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Title */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-theme">
          <div>
            <h1 className="text-3xl font-extrabold">Add Product</h1>
            <p className="text-sm text-muted mt-1">Add a new product to your farm</p>
          </div>
          <FiPackage size={30} className="text-primary" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Product Info */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Product Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextInput label="Product Name *" name="name" value={form.name} onChange={handleChange} placeholder="Fresh Tomato" required />

              <Dropdown
                label="Farm *"
                name="farmId"
                value={farms.find((f) => f._id === form.farmId)?.name || ""}
                onChange={handleChange}
                options={farmOptions.map((o) => o.label)}
              />

              <Dropdown label="Category *" name="category" value={form.category} onChange={handleChange} options={categories} placeholder="Select category" />

              <TextInput label="Sub Category *" name="subCategory" value={form.subCategory} onChange={handleChange} placeholder="Tomato" required />

              <Dropdown label="Season *" name="season" value={form.season} onChange={handleChange} options={seasons} />

              <Dropdown label="Source *" name="source" value={form.source} onChange={handleChange} options={sources} />
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write a short description..."
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
                <TextInput label="Price *" type="number" name="price" value={form.price} onChange={handleChange} min="0" placeholder="120" required />
                <Dropdown label="Unit *" name="unit" value={form.unit} onChange={handleChange} options={units} />
              </div>

              <TextInput label="Discount %" type="number" name="discountPercentage" value={form.discountPercentage} onChange={handleChange} min="0" max="100" />
            </section>

            <section className="rounded-2xl border border-theme bg-base-200 p-6">
              <h2 className="text-lg font-bold mb-4">Stock</h2>

              <div className="flex flex-col gap-4">
                <TextInput label="Available Stock *" type="number" name="stock" value={form.stock} onChange={handleChange} min="0" placeholder="500" required />
                <TextInput label="Listing Duration *" type="number" name="listingDuration" value={form.listingDuration} onChange={handleChange} min="1" required />
              </div>
            </section>
          </div>

          {/* Images */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Product Images</h2>

            <label className="flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-2xl border-2 border-dashed border-theme bg-base-100 cursor-pointer text-muted hover:border-primary hover:bg-primary-soft hover:text-primary">
              <FiImage size={32} />
              <strong className="text-sm font-bold text-base-content">Choose product images</strong>
              <span className="text-xs text-muted-light">Maximum 4 images, 2MB each</span>
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            </label>

            {images.length > 0 && (
              <p className="mt-4 px-4 py-3 rounded-xl bg-success-soft text-success text-sm font-bold text-center">
                {images.length} image(s) selected
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-content font-bold hover:bg-primary-hover disabled:opacity-50"
            >
              <FiPlus />
              {loading ? "Adding..." : "Add Product"}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}