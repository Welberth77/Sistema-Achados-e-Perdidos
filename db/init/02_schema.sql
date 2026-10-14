-- =========================================================
-- Schema — Sistema de Achados e Perdidos (PostgreSQL)
-- Roda automaticamente na primeira subida do contêiner do banco.
-- O usuário/banco (app_achados / achados_perdidos) é criado pela imagem do Postgres.
-- =========================================================

BEGIN;

CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE usuarios (
  id            BIGSERIAL PRIMARY KEY,
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  senha_hash    VARCHAR(255) NOT NULL,
  papel         VARCHAR(20)  NOT NULL DEFAULT 'SERVIDOR'
                CHECK (papel IN ('ADMINISTRADOR','SERVIDOR')),
  ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE categorias (
  id            BIGSERIAL PRIMARY KEY,
  nome          VARCHAR(80) NOT NULL UNIQUE,
  descricao     TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE registradores (
  id             BIGSERIAL PRIMARY KEY,
  nome           VARCHAR(120) NOT NULL,
  vinculo        VARCHAR(20)  NOT NULL
                 CHECK (vinculo IN ('ALUNO','DOCENTE','TERCEIRIZADO','SERVIDOR','OUTRO')),
  matricula      VARCHAR(40),
  tipo_documento VARCHAR(20) CHECK (tipo_documento IN ('CPF','RG','OUTRO')),
  documento      VARCHAR(40),
  telefone       VARCHAR(30),
  email          VARCHAR(160),
  observacoes    TEXT,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tipo_documento, documento)
);

CREATE TABLE itens_achados (
  id               BIGSERIAL PRIMARY KEY,
  codigo           VARCHAR(20) NOT NULL UNIQUE,
  titulo           VARCHAR(160) NOT NULL,
  descricao        TEXT,
  categoria_id     BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
  cor              VARCHAR(40),
  marca            VARCHAR(60),
  local_encontrado VARCHAR(160),
  data_encontrado  DATE NOT NULL,
  registrador_id   BIGINT REFERENCES registradores(id) ON DELETE RESTRICT,
  status           VARCHAR(20) NOT NULL DEFAULT 'RECEBIDO'
                   CHECK (status IN ('RECEBIDO','EM_CUSTODIA','EM_ANALISE',
                                     'EM_DEVOLUCAO','DEVOLVIDO','DESCARTADO')),
  foto_url         VARCHAR(255),
  observacoes      TEXT,
  criado_por       BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE relatos_perda (
  id              BIGSERIAL PRIMARY KEY,
  codigo          VARCHAR(20) NOT NULL UNIQUE,
  titulo          VARCHAR(160) NOT NULL,
  descricao       TEXT,
  categoria_id    BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
  cor             VARCHAR(40),
  marca           VARCHAR(60),
  local_perda     VARCHAR(160),
  data_perda      DATE,
  registrador_id  BIGINT REFERENCES registradores(id) ON DELETE RESTRICT,
  status          VARCHAR(20) NOT NULL DEFAULT 'ABERTO'
                  CHECK (status IN ('ABERTO','EM_ANALISE','CORRESPONDENCIA',
                                    'ENCERRADO','CANCELADO')),
  observacoes     TEXT,
  criado_por      BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE correspondencias (
  id              BIGSERIAL PRIMARY KEY,
  item_achado_id  BIGINT NOT NULL REFERENCES itens_achados(id) ON DELETE CASCADE,
  relato_perda_id BIGINT NOT NULL REFERENCES relatos_perda(id) ON DELETE CASCADE,
  pontuacao       NUMERIC(5,2),
  status          VARCHAR(20) NOT NULL DEFAULT 'SUGERIDA'
                  CHECK (status IN ('SUGERIDA','CONFIRMADA','DESCARTADA')),
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_achado_id, relato_perda_id)
);

CREATE TABLE custodias (
  id              BIGSERIAL PRIMARY KEY,
  item_achado_id  BIGINT NOT NULL REFERENCES itens_achados(id) ON DELETE CASCADE,
  tipo            VARCHAR(20) NOT NULL
                  CHECK (tipo IN ('ENTRADA','TRANSFERENCIA','SAIDA')),
  usuario_id      BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  local_guarda    VARCHAR(160),
  data_evento     TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacoes     TEXT,
  criado_por      BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE casos (
  id                BIGSERIAL PRIMARY KEY,
  codigo            VARCHAR(20) NOT NULL UNIQUE,
  item_achado_id    BIGINT NOT NULL REFERENCES itens_achados(id) ON DELETE RESTRICT,
  relato_perda_id   BIGINT REFERENCES relatos_perda(id) ON DELETE SET NULL,
  responsavel_id    BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  status            VARCHAR(25) NOT NULL DEFAULT 'ABERTO'
                    CHECK (status IN ('ABERTO','AGUARDANDO_COMPROVACAO','AUTORIZADO',
                                      'DEVOLVIDO','ENCERRADO','CANCELADO')),
  descricao         TEXT,
  data_abertura     TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_encerramento TIMESTAMPTZ,
  criado_por        BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE devolucoes (
  id                    BIGSERIAL PRIMARY KEY,
  item_achado_id        BIGINT NOT NULL REFERENCES itens_achados(id) ON DELETE RESTRICT,
  caso_id               BIGINT REFERENCES casos(id) ON DELETE SET NULL,
  recebedor_id          BIGINT NOT NULL REFERENCES registradores(id) ON DELETE RESTRICT,
  comprovado            BOOLEAN NOT NULL DEFAULT FALSE,
  comprovacao_descricao TEXT,
  comprovacao_url       VARCHAR(255),
  autorizado_por        BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  status                VARCHAR(25) NOT NULL DEFAULT 'INICIADA'
                        CHECK (status IN ('INICIADA','PROPRIEDADE_COMPROVADA',
                                          'AUTORIZADA','CONCLUIDA','CANCELADA')),
  data_devolucao        TIMESTAMPTZ,
  criado_por            BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_devolucao_propriedade
    CHECK (status IN ('INICIADA','CANCELADA') OR comprovado = TRUE),
  CONSTRAINT chk_devolucao_conclusao
    CHECK (status <> 'CONCLUIDA' OR data_devolucao IS NOT NULL)
);

CREATE TRIGGER trg_usuarios_upd      BEFORE UPDATE ON usuarios      FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_categorias_upd    BEFORE UPDATE ON categorias    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_registradores_upd BEFORE UPDATE ON registradores FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_itens_upd         BEFORE UPDATE ON itens_achados FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_relatos_upd       BEFORE UPDATE ON relatos_perda FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_casos_upd         BEFORE UPDATE ON casos         FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_devolucoes_upd    BEFORE UPDATE ON devolucoes    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE INDEX idx_registradores_vinculo ON registradores (vinculo);
CREATE INDEX idx_itens_status          ON itens_achados (status);
CREATE INDEX idx_itens_categoria       ON itens_achados (categoria_id);
CREATE INDEX idx_itens_data            ON itens_achados (data_encontrado);
CREATE INDEX idx_relatos_status        ON relatos_perda (status);
CREATE INDEX idx_relatos_categoria     ON relatos_perda (categoria_id);
CREATE INDEX idx_corresp_item          ON correspondencias (item_achado_id);
CREATE INDEX idx_corresp_relato        ON correspondencias (relato_perda_id);
CREATE INDEX idx_custodias_item        ON custodias (item_achado_id, data_evento DESC);
CREATE INDEX idx_casos_status          ON casos (status);
CREATE INDEX idx_devolucoes_item       ON devolucoes (item_achado_id);

COMMIT;
