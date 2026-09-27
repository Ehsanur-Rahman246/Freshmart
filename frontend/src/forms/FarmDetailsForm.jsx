import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
import { createFarm, updateFarm } from "../api/farm";
import DistrictSelect from "../components/DistrictSelect";

const SIZE_UNITS = ["acre", "hectare", "decimal"];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  size: Yup.object({
    value: Yup.number().min(0).required("Size value is required"),
    unit: Yup.string().oneOf(SIZE_UNITS).required("Size unit is required"),
  }),
  location: Yup.object({
    district: Yup.string().required("District is required"),
    upazila: Yup.string().required("Upazila is required"),
    village: Yup.string().required("Village is required"),
  }),
  farmType: Yup.array().of(Yup.string()).min(1, "Add at least one farm type"),
});

export default function FarmDetailsForm({ mode = "create", farm, onSuccess }) {
  const initialValues = {
    name: farm?.name || "",
    description: farm?.description || "",
    isActive: farm?.isActive ?? true,
    establishedYear: farm?.establishedYear || "",
    size: {
      value: farm?.size?.value ?? "",
      unit: farm?.size?.unit || "",
    },
    location: {
      district: farm?.location?.district || "",
      upazila: farm?.location?.upazila || "",
      village: farm?.location?.village || "",
    },
    farmType: farm?.farmType || [],
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const payload = { ...values };
      payload.establishedYear =
        values.establishedYear === "" ? null : Number(values.establishedYear);

      if (mode === "create") {
        payload.products = { allYear: [], winter: [], summer: [], monsoon: [] };
      }

      const response =
        mode === "update"
          ? await updateFarm(farm._id, payload)
          : await createFarm(payload);

      onSuccess?.(response.data.farm);
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
      {({ values, isSubmitting, status, setFieldValue }) => (
        <Form className="flex flex-col gap-6">
          {status && (
            <p className="px-4 py-3 rounded-xl bg-error-soft text-error text-sm font-bold">
              {status}
            </p>
          )}

          {/* Farm Info */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Farm Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Farm Name *
                <Field
                  name="name"
                  className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-error text-xs"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                Established Year
                <Field
                  type="number"
                  name="establishedYear"
                  className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold mb-4">
              Description
              <Field
                as="textarea"
                name="description"
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary resize-y"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <Field type="checkbox" name="isActive" className="w-4 h-4" />
              Farm is active
            </label>
          </section>

          {/* Size */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Farm Size</h2>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Size *
                <Field
                  type="number"
                  name="size.value"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                />
                <ErrorMessage
                  name="size.value"
                  component="p"
                  className="text-error text-xs"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                Unit *
                <Field
                  as="select"
                  name="size.unit"
                  className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                >
                  <option value="">Select unit</option>
                  {SIZE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="size.unit"
                  component="p"
                  className="text-error text-xs"
                />
              </label>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <DistrictSelect
                  label="District *"
                  name="location.district"
                  value={values.location.district}
                  onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                />
                <ErrorMessage
                  name="location.district"
                  component="p"
                  className="text-error text-xs"
                />
              </div>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                Upazila *
                <Field
                  name="location.upazila"
                  className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                />
                <ErrorMessage
                  name="location.upazila"
                  component="p"
                  className="text-error text-xs"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                Village *
                <Field
                  name="location.village"
                  className="w-full px-4 py-3 rounded-xl border border-theme bg-base-100 outline-none focus:border-primary"
                />
                <ErrorMessage
                  name="location.village"
                  component="p"
                  className="text-error text-xs"
                />
              </label>
            </div>
          </section>

          {/* Farm Type */}
          <section className="rounded-2xl border border-theme bg-base-200 p-6">
            <h2 className="text-lg font-bold mb-4">Farm Type</h2>

            <FieldArray name="farmType">
              {({ push, remove }) => (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {values.farmType.map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-theme bg-base-100"
                      >
                        <Field
                          name={`farmType.${index}`}
                          placeholder="e.g. organic"
                          className="bg-transparent outline-none text-sm w-28"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-muted hover:text-error"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => push("")}
                    className="self-start px-4 py-2 rounded-xl border border-dashed border-primary bg-primary-soft text-primary text-sm font-bold hover:bg-primary hover:text-primary-content"
                  >
                    + Add Farm Type
                  </button>

                  <ErrorMessage
                    name="farmType"
                    component="p"
                    className="text-error text-xs"
                  />
                </div>
              )}
            </FieldArray>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-primary text-primary-content font-bold hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : mode === "update"
                ? "Save Details"
                : "Create Farm"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
