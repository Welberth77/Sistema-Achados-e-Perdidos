import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, required, className = '', id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-fg">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg placeholder:text-subtle
          outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary
          ${error ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-border-strong'} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
