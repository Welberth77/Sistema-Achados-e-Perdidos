import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meusRelatos, minhasCorrespondencias } from '../../services/meusRelatos.js';
import Table from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import { SETOR_NOME, SETOR_LOCAL } from '../../config/setor.js';

function dataCurta(iso) {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
}

function LinhaDetalhe({ rotulo, valor }) {
  return (
    <div className="flex gap-2 border-b border-border py-1.5 text-sm last:border-0">
      <span className="w-32 shrink-0 text-muted">{rotulo}</span>
      <span className="text-fg">{valor || '—'}</span>
    </div>
  );
}

export default function MeusRelatos() {
  const navigate = useNavigate();
  const [relatos, setRelatos] = useState([]);
  const [correspondencias, setCorrespondencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState(null); // item achado selecionado para o modal

  useEffect(() => {
    meusRelatos()
      .then(setRelatos)
      .catch(() => setRelatos([]))
      .finally(() => setLoading(false));
    minhasCorrespondencias()
      .then((c) => setCorrespondencias(Array.isArray(c) ? c : []))
      .catch(() => setCorrespondencias([]));
  }, []);

  const colunas = [
    { key: 'codigo', header: 'Código', className: 'font-medium tabular-nums' },
    { key: 'titulo', header: 'Item perdido' },
    { key: 'data_perda', header: 'Data da perda', render: (r) => dataCurta(r.data_perda), className: 'tabular-nums text-muted' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Meus relatos</h1>
          <p className="mt-1 text-sm text-muted">Os relatos de perda que você registrou.</p>
        </div>
        <Button onClick={() => navigate('/relatar')}>Relatar perda</Button>
      </div>

      {correspondencias.length > 0 && (
        <section className="mb-6 rounded-lg border border-primary/40 bg-primary-soft p-4">
          <h2 className="text-sm font-semibold text-fg">Possíveis correspondências para os seus relatos</h2>
          <p className="mt-0.5 text-xs text-muted">
            Itens achados parecidos com o que você relatou. Se reconhecer algum, retire no {SETOR_NOME} ({SETOR_LOCAL}) levando um documento.
          </p>
          <div className="mt-3 space-y-3">
            {correspondencias.map((g) => (
              <div key={g.relato.id} className="rounded-md border border-border bg-surface p-3">
                <p className="text-sm">
                  <span className="font-medium text-fg">{g.relato.titulo}</span>{' '}
                  <span className="text-xs text-muted">({g.relato.codigo})</span>
                </p>
                <ul className="mt-2 space-y-1.5">
                  {g.itens.map((it) => (
                    <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-link">
                        {it.categoria?.nome || 'Sem categoria'}
                      </span>
                      <button
                        type="button"
                        className="font-medium text-fg underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
                        onClick={() => setDetalhe(it)}
                      >
                        {it.titulo}
                      </button>
                      {it.local_encontrado && <span className="text-muted">{it.local_encontrado}</span>}
                      <span className="tabular-nums text-muted">{dataCurta(it.data_encontrado)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <Table
        columns={colunas}
        data={relatos}
        loading={loading}
        emptyMessage="Você ainda não registrou nenhum relato de perda."
      />

      {/* Detalhe do item achado */}
      <Modal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title="Detalhes do item"
        footer={<Button variant="outline" onClick={() => setDetalhe(null)}>Fechar</Button>}
      >
        {detalhe && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-fg">{detalhe.titulo}</h3>
              <StatusBadge status={detalhe.status} />
            </div>
            <LinhaDetalhe rotulo="Código" valor={detalhe.codigo} />
            <LinhaDetalhe rotulo="Categoria" valor={detalhe.categoria?.nome} />
            <LinhaDetalhe rotulo="Local" valor={detalhe.local_encontrado} />
            <LinhaDetalhe rotulo="Encontrado em" valor={dataCurta(detalhe.data_encontrado)} />
            <LinhaDetalhe rotulo="Retirada" valor={`${SETOR_NOME} — ${SETOR_LOCAL}`} />
            <p className="mt-4 text-xs text-muted">
              Reconheceu o item? Procure o setor responsável levando um documento de identificação para retirá-lo.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
