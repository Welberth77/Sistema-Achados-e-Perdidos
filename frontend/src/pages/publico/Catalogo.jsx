import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';

// Página pública (sem login): apresentação do sistema e chamada para entrar/criar conta.
// Os itens em custódia NÃO são exibidos sem login — ficam só na área autenticada.
const PASSOS = [
  {
    titulo: '1. Crie sua conta',
    texto: 'Leva menos de um minuto. Use seu e-mail para acessar o sistema.',
  },
  {
    titulo: '2. Veja o que foi encontrado',
    texto: 'Após entrar, consulte os itens achados que estão guardados no campus.',
  },
  {
    titulo: '3. Relate sua perda',
    texto: 'Registre o que você perdeu e seja avisado quando algo parecido aparecer.',
  },
];

export default function Catalogo() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Perdeu algo no campus?
        </h1>
        <p className="mt-3 text-muted">
          Este é o sistema de achados e perdidos da instituição. Por segurança, os itens guardados
          só podem ser consultados após entrar — assim evitamos que alguém reivindique um item que
          não é seu.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => navigate('/cadastro')}>Criar conta</Button>
          <Button variant="outline" onClick={() => navigate('/login')}>Já tenho conta</Button>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {PASSOS.map((p) => (
          <div key={p.titulo} className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-fg">{p.titulo}</h2>
            <p className="mt-1.5 text-sm text-muted">{p.texto}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-10 max-w-2xl rounded-lg border border-border bg-surface p-6 text-center">
        <p className="font-medium text-fg">Trabalha na equipe de achados e perdidos?</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Entre com sua conta institucional para cadastrar itens, acompanhar relatos e gerenciar as
          devoluções.
        </p>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => navigate('/login')}>Entrar no painel</Button>
        </div>
      </section>
    </div>
  );
}
