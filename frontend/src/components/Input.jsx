export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        className={`w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 ${className}`}
        {...props}
      />
    </label>
  );
}
