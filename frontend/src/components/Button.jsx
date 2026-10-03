export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'rounded px-4 py-2 text-sm font-medium transition disabled:opacity-50';
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
