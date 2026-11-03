-- Garante que todo SERVIDOR/ADMINISTRADOR exista também como registrador
-- (pessoal do balcão). Idempotente: só insere quem ainda não está lá.
INSERT INTO registradores (nome, vinculo, email)
SELECT u.nome, 'SERVIDOR', u.email
  FROM usuarios u
 WHERE u.papel IN ('SERVIDOR', 'ADMINISTRADOR')
   AND u.email IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM registradores r WHERE r.email = u.email
   );
