import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createFarm, updateFarm } from "../api/farm";

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

// mode: "create" | "update"
// farm: existing farm doc, required when mode === "update"
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

      // products is backend-managed (populated as individual products get
      // created under this farm), so only seed it as empty on create —
      // never send it on update, so updateFarm leaves it untouched.
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
      {({ values, isSubmitting, status }) => (
        <Form className="space-y-4">
          {status && <p className="text-red-600 text-sm">{status}</p>}

          <div>
            <label>Farm Name</label>
            <Field name="name" />
            <ErrorMessage
              name="name"
              component="p"
              className="text-red-600 text-sm"
            />
          </div>

          <div>
            <label>Description</label>
            <Field as="textarea" name="description" />
          </div>

          <div className="flex items-center gap-2">
            <Field type="checkbox" name="isActive" />
            <label>Active</label>
          </div>

          <div>
            <label>Established Year</label>
            <Field type="number" name="establishedYear" />
          </div>

          <div className="flex gap-4">
            <div>
              <label>Size</label>
              <Field type="number" name="size.value" min="0" />
              <ErrorMessage
                name="size.value"
                component="p"
                className="text-red-600 text-sm"
              />
            </div>
            <div>
              <label>Size Unit</label>
              <Field as="select" name="size.unit">
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
                className="text-red-600 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <label>District</label>
              <Field name="location.district" />
              <ErrorMessage
                name="location.district"
                component="p"
                className="text-red-600 text-sm"
              />
            </div>
            <div>
              <label>Upazila</label>
              <Field name="location.upazila" />
              <ErrorMessage
                name="location.upazila"
                component="p"
                className="text-red-600 text-sm"
              />
            </div>
            <div>
              <label>Village</label>
              <Field name="location.village" />
              <ErrorMessage
                name="location.village"
                component="p"
                className="text-red-600 text-sm"
              />
            </div>
          </div>

          <FieldArray name="farmType">
            {({ push, remove }) => (
              <div>
                <label>Farm Type</label>
                {values.farmType.map((_, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Field
                      name={`farmType.${index}`}
                      placeholder="e.g. organic"
                    />
                    <button type="button" onClick={() => remove(index)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => push("")}>
                  + Add Farm Type
                </button>
                <ErrorMessage
                  name="farmType"
                  component="p"
                  className="text-red-600 text-sm"
                />
              </div>
            )}
          </FieldArray>

          <button type="submit" disabled={isSubmitting}>
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
