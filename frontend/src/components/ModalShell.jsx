import { FiX } from "react-icons/fi";

const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay">
    <div className="w-full max-w-md bg-base-100 rounded-box shadow-xl p-6 relative">
      <button
        onClick={onClose}
        className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
      >
        <FiX />
      </button>
      <h3 className="text-lg font-bold mb-5">{title}</h3>
      {children}
    </div>
  </div>
);

export default ModalShell;