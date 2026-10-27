import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';

function IconeBusca() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconeConta() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}
function IconeLista() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconeSino() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

const PASSOS = [
  { Icone: IconeConta, titulo: 'Crie sua conta', texto: 'Com seu e-mail, em menos de um minuto.' },
  { Icone: IconeLista, titulo: 'Veja o que foi encontrado', texto: 'Consulte os itens guardados no campus após entrar.' },
  { Icone: IconeSino, titulo: 'Relate e seja avisado', texto: 'Registre sua perda e receba um aviso se algo parecido aparecer.' },
];

export default function Catalogo() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Herói */}
      <section className="mx-auto max-w-2xl text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-link" aria-hidden="true">
          <IconeBusca />
        </span>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Perdeu algo no campus?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted sm:text-lg">
          Pode ser que já tenham encontrado. Crie sua conta para ver os itens guardados e avisar o
          que você perdeu — a gente te avisa quando aparecer.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/cadastro')}>
            Criar conta e procurar
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/login')}>
            Já tenho conta
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted">
          Grátis para alunos · Leva 1 minuto · Acesso seguro
        </p>
      </section>

      {/* Como funciona */}
      <section className="mx-auto mt-14 max-w-4xl" aria-labelledby="como-funciona">
        <h2 id="como-funciona" className="text-center text-sm font-semibold uppercase tracking-wide text-muted">
          Como funciona
        </h2>
        <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PASSOS.map(({ Icone, titulo, texto }, i) => (
            <li key={titulo} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-link" aria-hidden="true">
                  <Icone />
                </span>
                <span className="text-xs font-semibold text-muted">Passo {i + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-fg">{titulo}</h3>
              <p className="mt-1 text-sm text-muted">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Acesso da equipe (discreto) */}
      <p className="mt-12 text-center text-sm text-muted">
        É da equipe de achados e perdidos?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-medium text-link underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
        >
          Entrar no painel
        </button>
      </p>
    </div>
  );
}
