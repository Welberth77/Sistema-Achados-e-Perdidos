-- Extensões necessárias. Roda automaticamente na primeira subida do contêiner.
-- pgcrypto fornece crypt()/gen_salt() usados no seed para gerar o hash da senha.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
