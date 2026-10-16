-- Dados iniciais. Roda automaticamente após o schema, na primeira subida do contêiner.
--
-- SENHAS DE DESENVOLVIMENTO: os usuários abaixo nascem com senhas conhecidas.
-- É um padrão de desenvolvimento (igual à senha do banco no docker-compose) —
-- TROQUE em produção. O banco guarda só o hash (bcrypt), nunca o texto.

-- Administrador (gestão total)
INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES (
  'Administrador',
  'admin@achados.local',
  crypt('admin123', gen_salt('bf')),
  'ADMINISTRADOR'
)
ON CONFLICT (email) DO NOTHING;

-- Usuário de autoatendimento (aluno/docente/etc.): só consulta itens e relata perdas.
INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES (
  'Aluno Teste',
  'aluno@achados.local',
  crypt('aluno123', gen_salt('bf')),
  'USUARIO'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO categorias (nome) VALUES
  ('Eletrônicos'),
  ('Documentos'),
  ('Vestuário'),
  ('Acessórios'),
  ('Chaves'),
  ('Material escolar'),
  ('Outros')
ON CONFLICT (nome) DO NOTHING;
