-- Corrige o vínculo dos registradores que correspondem a servidores/admins.
UPDATE registradores r
   SET vinculo = 'SERVIDOR', atualizado_em = now()
 WHERE r.email IS NOT NULL
   AND r.vinculo <> 'SERVIDOR'
   AND EXISTS (
     SELECT 1 FROM usuarios u
      WHERE u.email = r.email AND u.papel IN ('SERVIDOR', 'ADMINISTRADOR')
   );
