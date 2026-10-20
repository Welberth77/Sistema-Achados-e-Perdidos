import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

// Botão "Sair" (vermelho) com confirmação em modal.
export default function LogoutButton({ className = '' }) {
  const { logout } = useAuth();
  const [confirmando, setConfirmando] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className={`rounded-md px-2.5 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-rose-400 dark:hover:bg-rose-400/10 ${className}`}
      >
        Sair
      </button>

      <Modal
        open={confirmando}
        onClose={() => setConfirmando(false)}
        title="Sair da conta"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={logout}>
              Sair
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">Tem certeza que deseja sair da sua conta?</p>
      </Modal>
    </>
  );
}
