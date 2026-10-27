-- =========================================================
-- Migração: adiciona o papel 'USUARIO' ao enum de usuarios.papel.
-- =========================================================
-- Quando usar: em um banco JÁ EXISTENTE que você NÃO quer recriar.
-- Em banco novo (volume limpo), o db/init/02_schema.sql já cria com o valor novo —
-- não precisa rodar isto.
--
-- Como rodar (com o Docker no ar):
--   docker compose exec db psql -U app_achados -d achados_perdidos -f /caminho/dentro/do/container
--   (ou cole o conteúdo no psql / pgAdmin conectado ao banco achados_perdidos)
-- =========================================================

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_papel_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_papel_check
  CHECK (papel IN ('ADMINISTRADOR','SERVIDOR','USUARIO'));

-- (opcional) usuário de autoatendimento para teste
INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES ('Aluno Teste', 'aluno@achados.local', crypt('aluno123', gen_salt('bf')), 'USUARIO')
ON CONFLICT (email) DO NOTHING;
