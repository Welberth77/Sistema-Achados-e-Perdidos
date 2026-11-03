import { useState, useEffect } from 'react';

function IconeContraste() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" />
    </svg>
  );
}

// Controles de acessibilidade (aumentar/diminuir fonte + alto contraste).
// Aplica no <html>, então vale para a página inteira. Compacto e responsivo.
export default function AcessibilidadeControles({ className = '' }) {
  const [tamanhoFonte, setTamanhoFonte] = useState(100);
  const [altoContraste, setAltoContraste] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${tamanhoFonte}%`;
  }, [tamanhoFonte]);

  useEffect(() => {
    const el = document.documentElement;
    if (altoContraste) el.classList.add('contrast-125', 'grayscale');
    else el.classList.remove('contrast-125', 'grayscale');
  }, [altoContraste]);

  const aumentar = () => setTamanhoFonte((p) => Math.min(150, p + 10));
  const diminuir = () => setTamanhoFonte((p) => Math.max(80, p - 10));
  const resetar = () => setTamanhoFonte(100);

  const btn =
    'flex h-9 min-w-[34px] items-center justify-center rounded-lg px-2 text-sm font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button onClick={aumentar} className={btn} title="Aumentar letra" aria-label="Aumentar letra">A+</button>
      <button onClick={diminuir} className={btn} title="Diminuir letra" aria-label="Diminuir letra">A-</button>
      <button onClick={resetar} className={`${btn} hidden sm:flex`} title="Tamanho normal" aria-label="Tamanho normal da letra">A</button>
      <button
        onClick={() => setAltoContraste((v) => !v)}
        className={`${btn} ${altoContraste ? 'bg-white/20 ring-2 ring-white/50' : ''}`}
        title="Alternar alto contraste"
        aria-pressed={altoContraste}
        aria-label="Alternar alto contraste"
      >
        <IconeContraste />
      </button>
    </div>
  );
}
