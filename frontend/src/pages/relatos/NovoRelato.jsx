import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarRelato } from '../../services/relatos.js';
import { listarCategorias } from '../../services/categorias.js';
import { listarRegistradores } from '../../services/registradores.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

function hojeNoBrasil() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

export default function NovoRelato() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    cor: '',
    marca: '',
    local_perda: '',
    data_perda: '',
    registrador_id: '',
    observacoes: '',
  });
  const [categorias, setCategorias] = useState([]);
  const [registradores, setRegistradores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erroCarga, setErroCarga] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [erros, setErros] = useState({});

  useEffect(() => {
    let ativo = true;

    Promise.all([listarCategorias(), listarRegistradores()])
      .then(([listaCategorias, listaRegistradores]) => {
        if (!ativo) return;
        setCategorias(listaCategorias);
        setRegistradores(listaRegistradores);
      })
      .catch(() => {
        if (ativo)
          setErroCarga(
            'Não foi possível carregar categorias e registradores. Atualize a página para tentar novamente.'
          );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (enviando || carregando || erroCarga) return;

    const validacao = {};

    if (!form.titulo.trim()) validacao.titulo = 'Informe o título.';
    if (!form.registrador_id) validacao.registrador_id = 'Selecione o registrador.';
    if (form.data_perda && form.data_perda > hojeNoBrasil()) {
      validacao.data_perda = 'A data não pode ser posterior a hoje.';
    }

    setErros(validacao);
    setErroGeral('');

    if (Object.keys(validacao).length) return;

    setEnviando(true);

    try {
      const relato = await criarRelato({
        ...form,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        registrador_id: Number(form.registrador_id),
      });

      navigate(`/relatos/${relato.id}`);
    } catch (falha) {
      const detalhes = falha.response?.data?.error?.details;

      if (Array.isArray(detalhes)) {
        setErros(
          Object.fromEntries(
            detalhes
              .filter((detalhe) => detalhe.campo && detalhe.message)
              .map((detalhe) => [detalhe.campo, detalhe.message])
          )
        );
      }

      setErroGeral(
        falha.response?.data?.error?.message ||
          'Não foi possível cadastrar o relato. Tente novamente.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Novo relato de perda</h1>

      {carregando && <p className="mb-4">Carregando opções...</p>}
      {(erroCarga || erroGeral) && (
        <p
          role="alert"
          className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {erroCarga || erroGeral}
        </p>
      )}

      {!carregando && !erroCarga && !registradores.length && (
        <p className="mb-4">Cadastre um registrador antes de registrar a perda.</p>
      )}

      <fieldset
        disabled={carregando || enviando || Boolean(erroCarga)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Input
            label="Título"
            required
            maxLength={160}
            value={form.titulo}
            error={erros.titulo}
            onChange={(e) => alterar('titulo', e.target.value)}
          />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Registrador *</span>
          <select
            required
            className="w-full rounded border px-3 py-2"
            value={form.registrador_id}
            onChange={(e) => alterar('registrador_id', e.target.value)}
          >
            <option value="">Selecione...</option>
            {registradores.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nome}
              </option>
            ))}
          </select>
          {erros.registrador_id && (
            <p className="mt-1 text-xs text-red-600">{erros.registrador_id}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Categoria (opcional)</span>
          <select
            className="w-full rounded border px-3 py-2"
            value={form.categoria_id}
            onChange={(e) => alterar('categoria_id', e.target.value)}
          >
            <option value="">Não informada</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
          {erros.categoria_id && <p className="mt-1 text-xs text-red-600">{erros.categoria_id}</p>}
        </label>

        <div className="sm:col-span-2">
          <Input
            label="Descrição"
            maxLength={10000}
            value={form.descricao}
            error={erros.descricao}
            onChange={(e) => alterar('descricao', e.target.value)}
          />
        </div>

        <Input
          label="Cor"
          maxLength={40}
          value={form.cor}
          error={erros.cor}
          onChange={(e) => alterar('cor', e.target.value)}
        />
        <Input
          label="Marca"
          maxLength={60}
          value={form.marca}
          error={erros.marca}
          onChange={(e) => alterar('marca', e.target.value)}
        />
        <Input
          label="Local da perda"
          maxLength={160}
          value={form.local_perda}
          error={erros.local_perda}
          onChange={(e) => alterar('local_perda', e.target.value)}
        />
        <Input
          label="Data da perda (opcional)"
          type="date"
          max={hojeNoBrasil()}
          value={form.data_perda}
          error={erros.data_perda}
          onChange={(e) => alterar('data_perda', e.target.value)}
        />

        <div className="sm:col-span-2">
          <Input
            label="Observações"
            maxLength={10000}
            value={form.observacoes}
            error={erros.observacoes}
            onChange={(e) => alterar('observacoes', e.target.value)}
          />
        </div>
      </fieldset>

      <div className="mt-6 flex gap-2">
        <Button
          type="submit"
          loading={enviando}
          disabled={carregando || Boolean(erroCarga) || !registradores.length}
        >
          Cadastrar
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/relatos')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
