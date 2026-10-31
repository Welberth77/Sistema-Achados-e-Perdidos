-- Reivindicações: aluno informa que um item achado é dele; staff analisa e pode abrir um caso.
CREATE TABLE IF NOT EXISTS reivindicacoes (
  id              BIGSERIAL PRIMARY KEY,
  usuario_id      BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  item_achado_id  BIGINT NOT NULL REFERENCES itens_achados(id) ON DELETE CASCADE,
  relato_perda_id BIGINT REFERENCES relatos_perda(id) ON DELETE SET NULL,
  mensagem        TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
                    CHECK (status IN ('PENDENTE','APROVADA','REJEITADA')),
  caso_id         BIGINT REFERENCES casos(id) ON DELETE SET NULL,
  decidido_por    BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  decidido_em     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reivind_status  ON reivindicacoes (status);
CREATE INDEX IF NOT EXISTS idx_reivind_usuario ON reivindicacoes (usuario_id);
