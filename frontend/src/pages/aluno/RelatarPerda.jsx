import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarRelato } from '../../services/meusRelatos.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

export default function RelatarPerda() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ titulo: '', descricao: '', local_perda: '', data_perda: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function validar() {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Diga o que você perdeu.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroGeral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await criarRelato({
        titulo: form.titulo.trim(),
        descricao: form.descricao || null,
        local_perda: form.local_perda || null,
        data_perda: form.data_perda || null,
      });
      navigate('/inicio');
    } catch {
      setErroGeral('Não foi possível registrar o relato. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Relatar perda</h1>
        <p className="mt-1 text-sm text-muted">Descreva o item perdido. Avisaremos se algo parecido for encontrado.</p>
      </div>

      {erroGeral && (
        <div role="alert" className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          {erroGeral}
        </div>
      )}

      <form onSubmit={enviar} className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="O que você perdeu?" required placeholder="Ex.: Mochila preta" value={form.titulo} error={erros.titulo} onChange={(e) => set('titulo', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Descrição" placeholder="Cor, marca, detalhes que ajudem a identificar" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
          </div>
          <Input label="Onde perdeu" placeholder="Ex.: Biblioteca" value={form.local_perda} onChange={(e) => set('local_perda', e.target.value)} />
          <Input label="Quando" type="date" value={form.data_perda} onChange={(e) => set('data_perda', e.target.value)} />
        </div>

        <div className="mt-6 flex gap-2">
          <Button type="submit" loading={enviando}>Registrar relato</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/inicio')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
