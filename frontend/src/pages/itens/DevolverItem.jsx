import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterItem } from '../../services/itens.js';
import { listarRegistradores } from '../../services/registradores.js';
import { registrarDevolucao } from '../../services/devolucoes.js';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { noMax, LIM } from '../../utils/validacao.js';

export default function DevolverItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [registradores, setRegistradores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState('');

  const [form, setForm] = useState({ recebedor_id: '', comprovante: '', observacao: '' });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    setCarregando(true);
    Promise.all([obterItem(id), listarRegistradores()])
      .then(([itemData, regs]) => {
        setItem(itemData);
        setRegistradores(Array.isArray(regs) ? regs : []);
      })
      .catch(() => setErroCarga('Não foi possível carregar o item.'))
      .finally(() => setCarregando(false));
  }, [id]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function validar() {
    const e = {};
    if (!form.recebedor_id) e.recebedor_id = 'Selecione quem está recebendo o item.';
    if (!form.comprovante.trim()) e.comprovante = 'A comprovação de propriedade é obrigatória.';
    else if (!noMax(form.comprovante, LIM.observacoes))
      e.comprovante = `Máximo de ${LIM.observacoes} caracteres.`;
    if (!noMax(form.observacao, LIM.observacoes))
      e.observacao = `Máximo de ${LIM.observacoes} caracteres.`;
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function confirmar() {
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await registrarDevolucao({
        item_id: id,
        recebedor_id: form.recebedor_id,
        comprovante: form.comprovante.trim(),
        observacao: form.observacao.trim(),
      });
      navigate(`/itens/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error;
      setErroGeral(msg || 'Não foi possível registrar a devolução. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p className="text-muted">Carregando…</p>;

  if (erroCarga)
    return (
      <div>
        <p className="mb-4 text-rose-600 dark:text-rose-400">{erroCarga}</p>
        <Button variant="outline" onClick={() => navigate('/itens')}>Voltar</Button>
      </div>
    );

  // Item já devolvido (ou descartado): não permite nova devolução.
  const indisponivel = item.status === 'DEVOLVIDO' || item.status === 'DESCARTADO';

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Devolver item</h1>
        <p className="mt-1 text-sm text-muted">
          Registre a entrega do item ao proprietário. É obrigatório comprovar a propriedade.
        </p>
      </div>

      {/* Resumo do item */}
      <section className="mb-5 rounded-lg border border-border bg-surface p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">{item.titulo}</h2>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-sm text-muted">
          {item.codigo}
          {item.categoria?.nome ? ` · ${item.categoria.nome}` : ''}
          {item.local_encontrado ? ` · ${item.local_encontrado}` : ''}
        </p>
      </section>

      {indisponivel ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted">
            Este item está <strong className="text-fg">{item.status}</strong> e não pode ser devolvido.
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(`/itens/${id}`)}>Voltar ao item</Button>
          </div>
        </div>
      ) : (
        <>
          {erroGeral && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
            >
              {erroGeral}
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4">
              <Select
                label="Recebedor"
                required
                className="w-full"
                error={erros.recebedor_id}
                value={form.recebedor_id}
                onChange={(e) => set('recebedor_id', e.target.value)}
              >
                <option value="">Selecione quem está recebendo…</option>
                {registradores.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                    {r.documento ? ` — ${r.documento}` : r.matricula ? ` — ${r.matricula}` : ''}
                  </option>
                ))}
              </Select>

              <Input
                label="Comprovação de propriedade"
                required
                value={form.comprovante}
                error={erros.comprovante}
                hint="Descreva a prova apresentada (documento, nota fiscal, característica exclusiva do item…)."
                maxLength={LIM.observacoes}
                onChange={(e) => set('comprovante', e.target.value)}
              />

              <Input
                label="Observação"
                value={form.observacao}
                error={erros.observacao}
                maxLength={LIM.observacoes}
                onChange={(e) => set('observacao', e.target.value)}
              />
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={confirmar} loading={enviando}>Confirmar devolução</Button>
              <Button variant="ghost" onClick={() => navigate(`/itens/${id}`)}>Cancelar</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
