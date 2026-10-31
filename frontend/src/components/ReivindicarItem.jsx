import { useEffect, useState } from 'react';
import { criarReivindicacao, minhasReivindicacoes } from '../services/reivindicacoes.js';
import Button from './Button.jsx';
import Select from './Select.jsx';
import Input from './Input.jsx';

// "Esse item é meu": o aluno abre uma solicitação, opcionalmente ligada a um relato.
export default function ReivindicarItem({ item, relatos = [] }) {
  const [checando, setChecando] = useState(true);
  const [jaPendente, setJaPendente] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [relatoId, setRelatoId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // Ao abrir o detalhe, verifica se o aluno já tem uma solicitação pendente p/ este item.
  useEffect(() => {
    let vivo = true;
    minhasReivindicacoes()
      .then((lista) => {
        if (!vivo) return;
        const pend = Array.isArray(lista)
          && lista.some((r) => r.item?.id === item.id && r.status === 'PENDENTE');
        setJaPendente(pend);
      })
      .catch(() => {})
      .finally(() => { if (vivo) setChecando(false); });
    return () => { vivo = false; };
  }, [item.id]);

  async function enviar() {
    setErro('');
    setEnviando(true);
    try {
      await criarReivindicacao({
        item_achado_id: item.id,
        relato_perda_id: relatoId || null,
        mensagem: mensagem.trim() || null,
      });
      setJaPendente(true);
      setAberto(false);
    } catch (e) {
      // 409 = já existe pendente: trata como aguardando, não como erro.
      if (e.response?.status === 409 && /pendente/i.test(e.response?.data?.error || '')) {
        setJaPendente(true);
        setAberto(false);
      } else {
        setErro(e.response?.data?.error || 'Não foi possível enviar a solicitação.');
      }
    } finally {
      setEnviando(false);
    }
  }

  if (checando) return null;

  if (jaPendente) {
    return (
      <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
        Você já solicitou este item. Aguarde a análise da equipe — não é possível abrir outra solicitação enquanto esta estiver pendente.
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {!aberto ? (
        <Button className="w-full" onClick={() => setAberto(true)}>Esse item é meu</Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-fg">Informar que o item é meu</p>
          {erro && (
            <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
              {erro}
            </div>
          )}
          <Select
            label="Vincular a um relato de perda (opcional)"
            className="w-full"
            value={relatoId}
            onChange={(e) => setRelatoId(e.target.value)}
          >
            <option value="">Nenhum</option>
            {relatos.map((r) => (
              <option key={r.id} value={r.id}>{r.codigo} — {r.titulo}</option>
            ))}
          </Select>
          <Input
            label="Mensagem (opcional)"
            placeholder="Explique por que o item é seu (marca, detalhe exclusivo…)"
            value={mensagem}
            maxLength={1000}
            onChange={(e) => setMensagem(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={enviar} loading={enviando}>Enviar solicitação</Button>
            <Button variant="ghost" onClick={() => setAberto(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
