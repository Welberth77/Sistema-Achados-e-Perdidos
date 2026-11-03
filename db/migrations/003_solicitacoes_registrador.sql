-- Solicitações de usuários que querem ser registradores/servidores (aprovação do admin).
CREATE TABLE IF NOT EXISTS solicitacoes_registrador (
  id             BIGSERIAL PRIMARY KEY,
  usuario_id     BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  status         VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
                   CHECK (status IN ('PENDENTE','APROVADA','REJEITADA')),
  vinculo        VARCHAR(20) NOT NULL,
  matricula      VARCHAR(40),
  tipo_documento VARCHAR(20) CHECK (tipo_documento IN ('CPF','RG','OUTRO')),
  documento      VARCHAR(40),
  telefone       VARCHAR(30),
  observacoes    TEXT,
  decidido_por   BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  decidido_em    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_solic_status ON solicitacoes_registrador (status);
