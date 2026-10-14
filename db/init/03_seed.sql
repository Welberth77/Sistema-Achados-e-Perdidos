-- Dados iniciais. Roda automaticamente após o schema, na primeira subida do contêiner.
--
-- SENHA DE DESENVOLVIMENTO: o admin abaixo nasce com a senha "admin123".
-- É um padrão de desenvolvimento (igual à senha do banco no docker-compose) —
-- TROQUE em produção. O banco guarda só o hash (bcrypt), nunca o texto.

INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES (
  'Administrador',
  'admin@achados.local',
  crypt('admin123', gen_salt('bf')),
  'ADMINISTRADOR'
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
