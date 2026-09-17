const Field = ({ label, ...props }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-muted">{label}</span>
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-field border border-theme bg-base-100 outline-none focus:border-primary disabled:bg-base-200 disabled:text-muted-light"
    />
  </label>
);

export default Field;