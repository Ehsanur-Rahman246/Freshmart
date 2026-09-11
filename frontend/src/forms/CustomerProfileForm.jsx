import { Formik, Form } from "formik";
import { updateCustomerProfile } from "../api/customer";

export default function CustomerProfileForm({ customer, onSuccess }) {
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      if (!values.profileImage) {
        setStatus("Select an image first");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("profileImage", values.profileImage);

      const response = await updateCustomerProfile(formData);
      onSuccess?.(response.data.customer);
    } catch (error) {
      setStatus(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={{ profileImage: null }} onSubmit={handleSubmit}>
      {({ setFieldValue, isSubmitting, status }) => (
        <Form className="space-y-4">
          {status && <p className="text-red-600 text-sm">{status}</p>}

          {customer?.profileImage?.url && (
            <img src={customer.profileImage.url} alt="" className="w-24 h-24 rounded-full object-cover" />
          )}

          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={(e) => setFieldValue("profileImage", e.target.files[0])}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Update Profile Picture"}
          </button>
        </Form>
      )}
    </Formik>
  );
}