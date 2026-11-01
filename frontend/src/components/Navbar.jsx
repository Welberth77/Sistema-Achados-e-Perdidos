import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import LogoutButton from './LogoutButton.jsx';

function IconeSol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// Ícone SVG mais limpo para Contraste (Círculo sólido/vazado)
function IconeContraste() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const { usuario } = useAuth();
  const { escuro, alternar } = useTheme();
  const inicial = (usuario?.nome || 'U').charAt(0).toUpperCase();

  const [tamanhoFonte, setTamanhoFonte] = useState(100);
  const [altoContraste, setAltoContraste] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${tamanhoFonte}%`;
  }, [tamanhoFonte]);

  useEffect(() => {
    if (altoContraste) {
      document.documentElement.classList.add('contrast-125', 'grayscale');
    } else {
      document.documentElement.classList.remove('contrast-125', 'grayscale');
    }
  }, [altoContraste]);

  const aumentarFonte = () => { if (tamanhoFonte < 150) setTamanhoFonte((p) => p + 10); };
  const diminuirFonte = () => { if (tamanhoFonte > 80) setTamanhoFonte((p) => p - 10); };
  const resetarFonte = () => { setTamanhoFonte(100); };

  const estiloCaixaBotao = "flex h-10 min-w-[40px] items-center justify-center rounded-lg px-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#4e84bc]";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-2 border-b border-black/10 bg-primary px-4 text-primary-fg dark:border-white/10 sm:px-6">
      
      {/* Grupo de Acessibilidade */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={aumentarFonte}
          className={estiloCaixaBotao}
          title="Aumentar Letra"
        >
          A+
        </button>

        <button
          onClick={diminuirFonte}
          className={estiloCaixaBotao}
          title="Diminuir Letra"
        >
          A-
        </button>

        <button
          onClick={resetarFonte}
          className={estiloCaixaBotao}
          title="Tamanho Normal"
        >
          A
        </button>

        <button
          onClick={() => setAltoContraste(!altoContraste)}
          className={`${estiloCaixaBotao} ${altoContraste ? 'bg-[#4e84bc] ring-2 ring-white/50' : ''}`}
          title="Alternar Alto Contraste"
        >
          <IconeContraste />
        </button>
      </div>

      <div className="mx-1 h-6 w-px bg-white/20" aria-hidden="true" />

      {/* Botão de Tema */}
      <button
        onClick={alternar}
        aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
        aria-pressed={escuro}
        className={estiloCaixaBotao}
      >
        {escuro ? <IconeSol /> : <IconeLua />}
      </button>

      <div className="mx-1.5 h-6 w-px bg-white/20" aria-hidden="true" />

      {/* Perfil do Utilizador */}
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-xs font-bold text-white">
          {inicial}
        </span>
        <span className="hidden text-sm font-medium text-white sm:inline">{usuario?.nome || 'Usuário'}</span>
      </div>

      <LogoutButton className="ml-1" />
    </header>
  );
}