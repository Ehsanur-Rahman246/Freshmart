import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createProduct, updateProduct } from "../api/product";

const CATEGORIES = ["dairy", "grain", "spices", "poultry", "livestock", "fruits", "vegetables"];
const SEASONS = ["allYear", "winter", "summer", "monsoon"];
const SOURCES = ["field", "greenhouse", "orchard", "dairyFarm", "poultryFarm", "livestockFarm"];
const UNITS = ["kg", "g", "L", "pc", "dozen", "mL"];

const validationSchema = Yup.object({
  farmId: Yup.string().required("Farm is required"),
  name: Yup.string().required("Name is required"),
  category: Yup.string().oneOf(CATEGORIES).required("Category is required"),
  subCategory: Yup.string().required("Sub-category is required"),
  season: Yup.string().oneOf(SEASONS).required("Season is required"),
  source: Yup.string().oneOf(SOURCES).required("Source is required"),
  price: Yup.number().min(0).required("Price is required"),
  unit: Yup.string().oneOf(UNITS).required("Unit is required"),
  stock: Yup.number().min(0).required("Stock is required"),
  discountPercentage: Yup.number().min(0).max(100),
  listingDuration: Yup.number().min(1).required("Listing duration is required"),
});

// mode: "create" | "update"
// farms: [{ _id, name }] for the farm <select>
// product: existing product doc, required when mode === "update"
export default function ProductForm({ mode = "create", farms = [], product, onSuccess }) {
  const [removeImageIds, setRemoveImageIds] = useState([]);

  const initialValues = {
    farmId: product?.farm?._id || product?.farm || "",
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "",
    subCategory: product?.subCategory || "",
    season: product?.season || "",
    source: product?.source || "",
    price: product?.price ?? "",
    unit: product?.unit || "",
    stock: product?.stock ?? "",
    discountPercentage: product?.discountPercentage ?? 0,
    listingDuration: product?.listingDuration ?? "",
    images: [], // newly added File objects
  };

  const toggleRemoveImage = (publicId) => {
    setRemoveImageIds((prev) =>
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId],
    );
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const formData = new FormData();

      formData.append("farmId", values.farmId);
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("subCategory", values.subCategory);
      formData.append("season", values.season);
      formData.append("source", values.source);
      formData.append("price", values.price);
      formData.append("unit", values.unit);
      formData.append("stock", values.stock);
      formData.append("discountPercentage", values.discountPercentage);
      formData.append("listingDuration", values.listingDuration);

      values.images.forEach((file) => formData.append("images", file));

      if (mode === "update" && removeImageIds.length > 0) {
        formData.append("removeImages", JSON.stringify(removeImageIds));
      }

      const response =
        mode === "update"
          ? await updateProduct(product._id, formData)
          : await createProduct(formData);

      onSuccess?.(response.data.product);
    } catch (error) {
      setStatus(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ setFieldValue, isSubmitting, status }) => (
        <Form className="space-y-4">
          {status && <p className="text-red-600 text-sm">{status}</p>}

          <div>
            <label>Farm</label>
            <Field as="select" name="farmId">
              <option value="">Select a farm</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name}
                </option>
              ))}
            </Field>
            <ErrorMessage name="farmId" component="p" className="text-red-600 text-sm" />
          </div>

          <div>
            <label>Name</label>
            <Field name="name" />
            <ErrorMessage name="name" component="p" className="text-red-600 text-sm" />
          </div>

          <div>
            <label>Description</label>
            <Field as="textarea" name="description" />
          </div>

          <div>
            <label>Category</label>
            <Field as="select" name="category">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Field>
            <ErrorMessage name="category" component="p" className="text-red-600 text-sm" />
          </div>

          <div>
            <label>Sub-category</label>
            <Field name="subCategory" />
            <ErrorMessage name="subCategory" component="p" className="text-red-600 text-sm" />
          </div>

          <div>
            <label>Season</label>
            <Field as="select" name="season">
              <option value="">Select season</option>
              {SEASONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Field>
            <ErrorMessage name="season" component="p" className="text-red-600 text-sm" />
          </div>

          <div>
            <label>Source</label>
            <Field as="select" name="source">
              <option value="">Select source</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Field>
            <ErrorMessage name="source" component="p" className="text-red-600 text-sm" />
          </div>

          <div className="flex gap-4">
            <div>
              <label>Price</label>
              <Field type="number" name="price" min="0" step="0.01" />
              <ErrorMessage name="price" component="p" className="text-red-600 text-sm" />
            </div>
            <div>
              <label>Unit</label>
              <Field as="select" name="unit">
                <option value="">Select unit</option>
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </Field>
              <ErrorMessage name="unit" component="p" className="text-red-600 text-sm" />
            </div>
            <div>
              <label>Stock</label>
              <Field type="number" name="stock" min="0" />
              <ErrorMessage name="stock" component="p" className="text-red-600 text-sm" />
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <label>Discount %</label>
              <Field type="number" name="discountPercentage" min="0" max="100" />
            </div>
            <div>
              <label>Listing Duration (days)</label>
              <Field type="number" name="listingDuration" min="1" />
              <ErrorMessage name="listingDuration" component="p" className="text-red-600 text-sm" />
            </div>
          </div>

          {mode === "update" && product?.images?.length > 0 && (
            <div>
              <label>Existing Images (check to remove)</label>
              <div className="flex flex-wrap gap-3">
                {product.images.map((img) => (
                  <label key={img.publicId} className="flex flex-col items-center gap-1">
                    <img src={img.url} alt="" className="w-20 h-20 object-cover rounded" />
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

          <div>
            <label>{mode === "update" ? "Add More Images" : "Images (up to 6)"}</label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={(e) => setFieldValue("images", Array.from(e.target.files))}
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "update" ? "Update Product" : "Create Product"}
          </button>
        </Form>
      )}
    </Formik>
  );
}