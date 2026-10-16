import { forwardRef, useId, useState } from 'react';

function OlhoAberto() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function OlhoFechado() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const Input = forwardRef(function Input(
  { label, error, hint, required, type = 'text', className = '', id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const isSenha = type === 'password';
  const [mostrar, setMostrar] = useState(false);
  const tipoReal = isSenha ? (mostrar ? 'text' : 'password') : type;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-fg">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={tipoReal}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg placeholder:text-subtle
            outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary
            ${isSenha ? 'pr-10' : ''}
            ${error ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-border-strong'} ${className}`}
          {...props}
        />
        {isSenha && (
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={mostrar}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-md text-muted transition-colors hover:text-fg focus:outline-none focus-visible:text-fg focus-visible:ring-2 focus-visible:ring-primary"
          >
            {mostrar ? <OlhoFechado /> : <OlhoAberto />}
          </button>
        )}
      </div>
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
