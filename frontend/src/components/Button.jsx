export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
    secondary: 'bg-surface-2 text-fg hover:bg-border',
    outline: 'border border-border-strong bg-surface text-fg hover:bg-surface-2',
    ghost: 'bg-transparent text-muted hover:bg-surface-2 hover:text-fg',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-[0.95rem]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
