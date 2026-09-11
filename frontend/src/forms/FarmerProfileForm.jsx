import { Formik, Form } from "formik";
import { updateFarmerProfile } from "../api/farmer";

export default function FarmerProfileForm({ farmer, onSuccess }) {
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      if (!values.profileImage) {
        setStatus("Select an image first");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("profileImage", values.profileImage);

      const response = await updateFarmerProfile(formData);
      onSuccess?.(response.data.farmer);
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

          {farmer?.profileImage?.url && (
            <img src={farmer.profileImage.url} alt="" className="w-24 h-24 rounded-full object-cover" />
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