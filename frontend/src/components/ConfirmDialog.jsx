import Modal from './Modal.jsx';
import Button from './Button.jsx';

// Modal de confirmação reutilizável (ação destrutiva por padrão).
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar',
  mensagem,
  confirmLabel = 'Excluir',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{mensagem}</p>
    </Modal>
  );
}
