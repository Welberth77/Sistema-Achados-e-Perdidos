import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, required, className = '', id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="block">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`w-full rounded border px-3 py-2 text-sm outline-none transition
          focus:ring-2 focus:ring-gray-900
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-900'}
          ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;