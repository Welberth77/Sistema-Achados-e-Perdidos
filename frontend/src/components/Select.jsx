import { forwardRef, useId } from 'react';

// Select estilizado e acessível. Use `options=[{value,label}]` ou passe <option> como children.
const Select = forwardRef(function Select(
  { label, options = [], error, required, className = '', id, children, ...props },
  ref
) {
  const autoId = useId();
  const selId = id || autoId;

  return (
    <div>
      {label && (
        <label htmlFor={selId} className="mb-1 block text-sm font-medium text-fg">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      <select
        id={selId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${selId}-error` : undefined}
        className={`rounded-md border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors
          focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary
          ${error ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-border-strong'} ${className}`}
        {...props}
      >
        {options.length
          ? options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          : children}
      </select>
      {error && (
        <p id={`${selId}-error`} className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
