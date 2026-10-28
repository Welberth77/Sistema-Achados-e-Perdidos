--
-- PostgreSQL database dump
--

\restrict zNJ24hUylatb0vG2gW3Q6Gx5O5LWS6xrh0530gyKzZKy7HRPGaADdWHAbDTHNWE

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.relatos_perda DROP CONSTRAINT IF EXISTS relatos_perda_registrador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.relatos_perda DROP CONSTRAINT IF EXISTS relatos_perda_criado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.relatos_perda DROP CONSTRAINT IF EXISTS relatos_perda_categoria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.itens_achados DROP CONSTRAINT IF EXISTS itens_achados_registrador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.itens_achados DROP CONSTRAINT IF EXISTS itens_achados_criado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.itens_achados DROP CONSTRAINT IF EXISTS itens_achados_categoria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.devolucoes DROP CONSTRAINT IF EXISTS devolucoes_recebedor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.devolucoes DROP CONSTRAINT IF EXISTS devolucoes_item_achado_id_fkey;
ALTER TABLE IF EXISTS ONLY public.devolucoes DROP CONSTRAINT IF EXISTS devolucoes_criado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.devolucoes DROP CONSTRAINT IF EXISTS devolucoes_caso_id_fkey;
ALTER TABLE IF EXISTS ONLY public.devolucoes DROP CONSTRAINT IF EXISTS devolucoes_autorizado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.custodias DROP CONSTRAINT IF EXISTS custodias_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custodias DROP CONSTRAINT IF EXISTS custodias_item_achado_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custodias DROP CONSTRAINT IF EXISTS custodias_criado_por_fkey;
ALTER TABLE IF EXISTS ONLY public.correspondencias DROP CONSTRAINT IF EXISTS correspondencias_relato_perda_id_fkey;
ALTER TABLE IF EXISTS ONLY public.correspondencias DROP CONSTRAINT IF EXISTS correspondencias_item_achado_id_fkey;
ALTER TABLE IF EXISTS ONLY public.casos DROP CONSTRAINT IF EXISTS casos_responsavel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.casos DROP CONSTRAINT IF EXISTS casos_relato_perda_id_fkey;
ALTER TABLE IF EXISTS ONLY public.casos DROP CONSTRAINT IF EXISTS casos_item_achado_id_fkey;
ALTER TABLE IF EXISTS ONLY public.casos DROP CONSTRAINT IF EXISTS casos_criado_por_fkey;
DROP TRIGGER IF EXISTS trg_usuarios_upd ON public.usuarios;
DROP TRIGGER IF EXISTS trg_relatos_upd ON public.relatos_perda;
DROP TRIGGER IF EXISTS trg_registradores_upd ON public.registradores;
DROP TRIGGER IF EXISTS trg_itens_upd ON public.itens_achados;
DROP TRIGGER IF EXISTS trg_devolucoes_upd ON public.devolucoes;
DROP TRIGGER IF EXISTS trg_categorias_upd ON public.categorias;
DROP TRIGGER IF EXISTS trg_casos_upd ON public.casos;
DROP INDEX IF EXISTS public.idx_relatos_status;
DROP INDEX IF EXISTS public.idx_relatos_categoria;
DROP INDEX IF EXISTS public.idx_registradores_vinculo;
DROP INDEX IF EXISTS public.idx_itens_status;
DROP INDEX IF EXISTS public.idx_itens_data;
DROP INDEX IF EXISTS public.idx_itens_categoria;
DROP INDEX IF EXISTS public.idx_devolucoes_item;
DROP INDEX IF EXISTS public.idx_custodias_item;
DROP INDEX IF EXISTS public.idx_corresp_relato;
DROP INDEX IF EXISTS public.idx_corresp_item;
DROP INDEX IF EXISTS public.idx_casos_status;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.relatos_perda DROP CONSTRAINT IF EXISTS relatos_perda_pkey;
ALTER TABLE IF EXISTS ONLY public.relatos_perda DROP CONSTRAINT IF EXISTS relatos_perda_codigo_key;
ALTER TABLE IF EXISTS ONLY public.registradores DROP CONSTRAINT IF EXISTS registradores_tipo_documento_documento_key;
ALTER TABLE IF EXISTS ONLY public.registradores DROP CONSTRAINT IF EXISTS registradores_pkey;
ALTER TABLE IF EXISTS ONLY public.itens_achados DROP CONSTRAINT IF EXISTS itens_achados_pkey;
ALTER TABLE IF EXISTS ONLY public.itens_achados DROP CONSTRAINT IF EXISTS itens_achados_codigo_key;
ALTER TABLE IF EXISTS ONLY public.devolucoes DROP CONSTRAINT IF EXISTS devolucoes_pkey;
ALTER TABLE IF EXISTS ONLY public.custodias DROP CONSTRAINT IF EXISTS custodias_pkey;
ALTER TABLE IF EXISTS ONLY public.correspondencias DROP CONSTRAINT IF EXISTS correspondencias_pkey;
ALTER TABLE IF EXISTS ONLY public.correspondencias DROP CONSTRAINT IF EXISTS correspondencias_item_achado_id_relato_perda_id_key;
ALTER TABLE IF EXISTS ONLY public.categorias DROP CONSTRAINT IF EXISTS categorias_pkey;
ALTER TABLE IF EXISTS ONLY public.categorias DROP CONSTRAINT IF EXISTS categorias_nome_key;
ALTER TABLE IF EXISTS ONLY public.casos DROP CONSTRAINT IF EXISTS casos_pkey;
ALTER TABLE IF EXISTS ONLY public.casos DROP CONSTRAINT IF EXISTS casos_codigo_key;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.relatos_perda ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.registradores ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.itens_achados ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.devolucoes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.custodias ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.correspondencias ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categorias ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.casos ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.usuarios_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.relatos_perda_id_seq;
DROP TABLE IF EXISTS public.relatos_perda;
DROP SEQUENCE IF EXISTS public.registradores_id_seq;
DROP TABLE IF EXISTS public.registradores;
DROP SEQUENCE IF EXISTS public.itens_achados_id_seq;
DROP TABLE IF EXISTS public.itens_achados;
DROP SEQUENCE IF EXISTS public.devolucoes_id_seq;
DROP TABLE IF EXISTS public.devolucoes;
DROP SEQUENCE IF EXISTS public.custodias_id_seq;
DROP TABLE IF EXISTS public.custodias;
DROP SEQUENCE IF EXISTS public.correspondencias_id_seq;
DROP TABLE IF EXISTS public.correspondencias;
DROP SEQUENCE IF EXISTS public.categorias_id_seq;
DROP TABLE IF EXISTS public.categorias;
DROP SEQUENCE IF EXISTS public.casos_id_seq;
DROP TABLE IF EXISTS public.casos;
DROP FUNCTION IF EXISTS public.set_atualizado_em();
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: set_atualizado_em(); Type: FUNCTION; Schema: public; Owner: app_achados
--

CREATE FUNCTION public.set_atualizado_em() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_atualizado_em() OWNER TO app_achados;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: casos; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.casos (
    id bigint NOT NULL,
    codigo character varying(20) NOT NULL,
    item_achado_id bigint NOT NULL,
    relato_perda_id bigint,
    responsavel_id bigint,
    status character varying(25) DEFAULT 'ABERTO'::character varying NOT NULL,
    descricao text,
    data_abertura timestamp with time zone DEFAULT now() NOT NULL,
    data_encerramento timestamp with time zone,
    criado_por bigint,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT casos_status_check CHECK (((status)::text = ANY ((ARRAY['ABERTO'::character varying, 'AGUARDANDO_COMPROVACAO'::character varying, 'AUTORIZADO'::character varying, 'DEVOLVIDO'::character varying, 'ENCERRADO'::character varying, 'CANCELADO'::character varying])::text[])))
);


ALTER TABLE public.casos OWNER TO app_achados;

--
-- Name: casos_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.casos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.casos_id_seq OWNER TO app_achados;

--
-- Name: casos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.casos_id_seq OWNED BY public.casos.id;


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.categorias (
    id bigint NOT NULL,
    nome character varying(80) NOT NULL,
    descricao text,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categorias OWNER TO app_achados;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.categorias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO app_achados;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: correspondencias; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.correspondencias (
    id bigint NOT NULL,
    item_achado_id bigint NOT NULL,
    relato_perda_id bigint NOT NULL,
    pontuacao numeric(5,2),
    status character varying(20) DEFAULT 'SUGERIDA'::character varying NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT correspondencias_status_check CHECK (((status)::text = ANY ((ARRAY['SUGERIDA'::character varying, 'CONFIRMADA'::character varying, 'DESCARTADA'::character varying])::text[])))
);


ALTER TABLE public.correspondencias OWNER TO app_achados;

--
-- Name: correspondencias_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.correspondencias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.correspondencias_id_seq OWNER TO app_achados;

--
-- Name: correspondencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.correspondencias_id_seq OWNED BY public.correspondencias.id;


--
-- Name: custodias; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.custodias (
    id bigint NOT NULL,
    item_achado_id bigint NOT NULL,
    tipo character varying(20) NOT NULL,
    usuario_id bigint,
    local_guarda character varying(160),
    data_evento timestamp with time zone DEFAULT now() NOT NULL,
    observacoes text,
    criado_por bigint,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custodias_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ENTRADA'::character varying, 'TRANSFERENCIA'::character varying, 'SAIDA'::character varying])::text[])))
);


ALTER TABLE public.custodias OWNER TO app_achados;

--
-- Name: custodias_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.custodias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custodias_id_seq OWNER TO app_achados;

--
-- Name: custodias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.custodias_id_seq OWNED BY public.custodias.id;


--
-- Name: devolucoes; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.devolucoes (
    id bigint NOT NULL,
    item_achado_id bigint NOT NULL,
    caso_id bigint,
    recebedor_id bigint NOT NULL,
    comprovado boolean DEFAULT false NOT NULL,
    comprovacao_descricao text,
    comprovacao_url character varying(255),
    autorizado_por bigint,
    status character varying(25) DEFAULT 'INICIADA'::character varying NOT NULL,
    data_devolucao timestamp with time zone,
    criado_por bigint,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_devolucao_conclusao CHECK ((((status)::text <> 'CONCLUIDA'::text) OR (data_devolucao IS NOT NULL))),
    CONSTRAINT chk_devolucao_propriedade CHECK ((((status)::text = ANY ((ARRAY['INICIADA'::character varying, 'CANCELADA'::character varying])::text[])) OR (comprovado = true))),
    CONSTRAINT devolucoes_status_check CHECK (((status)::text = ANY ((ARRAY['INICIADA'::character varying, 'PROPRIEDADE_COMPROVADA'::character varying, 'AUTORIZADA'::character varying, 'CONCLUIDA'::character varying, 'CANCELADA'::character varying])::text[])))
);


ALTER TABLE public.devolucoes OWNER TO app_achados;

--
-- Name: devolucoes_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.devolucoes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devolucoes_id_seq OWNER TO app_achados;

--
-- Name: devolucoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.devolucoes_id_seq OWNED BY public.devolucoes.id;


--
-- Name: itens_achados; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.itens_achados (
    id bigint NOT NULL,
    codigo character varying(20) NOT NULL,
    titulo character varying(160) NOT NULL,
    descricao text,
    categoria_id bigint,
    cor character varying(40),
    marca character varying(60),
    local_encontrado character varying(160),
    data_encontrado date NOT NULL,
    registrador_id bigint,
    status character varying(20) DEFAULT 'RECEBIDO'::character varying NOT NULL,
    foto_url character varying(255),
    observacoes text,
    criado_por bigint,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT itens_achados_status_check CHECK (((status)::text = ANY ((ARRAY['RECEBIDO'::character varying, 'EM_CUSTODIA'::character varying, 'EM_ANALISE'::character varying, 'EM_DEVOLUCAO'::character varying, 'DEVOLVIDO'::character varying, 'DESCARTADO'::character varying])::text[])))
);


ALTER TABLE public.itens_achados OWNER TO app_achados;

--
-- Name: itens_achados_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.itens_achados_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.itens_achados_id_seq OWNER TO app_achados;

--
-- Name: itens_achados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.itens_achados_id_seq OWNED BY public.itens_achados.id;


--
-- Name: registradores; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.registradores (
    id bigint NOT NULL,
    nome character varying(120) NOT NULL,
    vinculo character varying(20) NOT NULL,
    matricula character varying(40),
    tipo_documento character varying(20),
    documento character varying(40),
    telefone character varying(30),
    email character varying(160),
    observacoes text,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT registradores_tipo_documento_check CHECK (((tipo_documento)::text = ANY ((ARRAY['CPF'::character varying, 'RG'::character varying, 'OUTRO'::character varying])::text[]))),
    CONSTRAINT registradores_vinculo_check CHECK (((vinculo)::text = ANY ((ARRAY['ALUNO'::character varying, 'DOCENTE'::character varying, 'TERCEIRIZADO'::character varying, 'SERVIDOR'::character varying, 'OUTRO'::character varying])::text[])))
);


ALTER TABLE public.registradores OWNER TO app_achados;

--
-- Name: registradores_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.registradores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registradores_id_seq OWNER TO app_achados;

--
-- Name: registradores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.registradores_id_seq OWNED BY public.registradores.id;


--
-- Name: relatos_perda; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.relatos_perda (
    id bigint NOT NULL,
    codigo character varying(20) NOT NULL,
    titulo character varying(160) NOT NULL,
    descricao text,
    categoria_id bigint,
    cor character varying(40),
    marca character varying(60),
    local_perda character varying(160),
    data_perda date,
    registrador_id bigint,
    status character varying(20) DEFAULT 'ABERTO'::character varying NOT NULL,
    observacoes text,
    criado_por bigint,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT relatos_perda_status_check CHECK (((status)::text = ANY ((ARRAY['ABERTO'::character varying, 'EM_ANALISE'::character varying, 'CORRESPONDENCIA'::character varying, 'ENCERRADO'::character varying, 'CANCELADO'::character varying])::text[])))
);


ALTER TABLE public.relatos_perda OWNER TO app_achados;

--
-- Name: relatos_perda_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.relatos_perda_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relatos_perda_id_seq OWNER TO app_achados;

--
-- Name: relatos_perda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.relatos_perda_id_seq OWNED BY public.relatos_perda.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: app_achados
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    nome character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    papel character varying(20) DEFAULT 'SERVIDOR'::character varying NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT usuarios_papel_check CHECK (((papel)::text = ANY ((ARRAY['ADMINISTRADOR'::character varying, 'SERVIDOR'::character varying, 'USUARIO'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO app_achados;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: app_achados
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO app_achados;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_achados
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: casos id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.casos ALTER COLUMN id SET DEFAULT nextval('public.casos_id_seq'::regclass);


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: correspondencias id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.correspondencias ALTER COLUMN id SET DEFAULT nextval('public.correspondencias_id_seq'::regclass);


--
-- Name: custodias id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.custodias ALTER COLUMN id SET DEFAULT nextval('public.custodias_id_seq'::regclass);


--
-- Name: devolucoes id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.devolucoes ALTER COLUMN id SET DEFAULT nextval('public.devolucoes_id_seq'::regclass);


--
-- Name: itens_achados id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.itens_achados ALTER COLUMN id SET DEFAULT nextval('public.itens_achados_id_seq'::regclass);


--
-- Name: registradores id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.registradores ALTER COLUMN id SET DEFAULT nextval('public.registradores_id_seq'::regclass);


--
-- Name: relatos_perda id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.relatos_perda ALTER COLUMN id SET DEFAULT nextval('public.relatos_perda_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: casos; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.casos (id, codigo, item_achado_id, relato_perda_id, responsavel_id, status, descricao, data_abertura, data_encerramento, criado_por, criado_em, atualizado_em) FROM stdin;
1	CASO-2026-0001	5	1	\N	ENCERRADO	\N	2026-10-23 20:28:50.02149+00	2026-10-23 20:30:27.21148+00	\N	2026-10-23 20:28:50.02149+00	2026-10-23 20:30:27.21148+00
2	CASO-2026-0002	6	2	\N	ENCERRADO	Caso de teste automatizado	2026-10-23 20:51:46.137562+00	2026-10-23 20:51:46.225152+00	\N	2026-10-23 20:51:46.137562+00	2026-10-23 20:51:46.225152+00
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.categorias (id, nome, descricao, criado_em, atualizado_em) FROM stdin;
1	Eletr├┤nicos	\N	2026-10-16 11:16:51.347403+00	2026-10-16 11:16:51.347403+00
2	Documentos	\N	2026-10-16 11:16:51.347403+00	2026-10-16 11:16:51.347403+00
3	Vestu├írio	\N	2026-10-16 11:16:51.347403+00	2026-10-16 11:16:51.347403+00
4	Acess├│rios	\N	2026-10-16 11:16:51.347403+00	2026-10-16 11:16:51.347403+00
5	Chaves	\N	2026-10-16 11:16:51.347403+00	2026-10-16 11:16:51.347403+00
6	Material escolar	\N	2026-10-16 11:16:51.347403+00	2026-10-16 11:16:51.347403+00
7	Outros	\N	2026-10-16 11:16:51.347403+00	2026-10-16 11:16:51.347403+00
\.


--
-- Data for Name: correspondencias; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.correspondencias (id, item_achado_id, relato_perda_id, pontuacao, status, criado_em) FROM stdin;
\.


--
-- Data for Name: custodias; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.custodias (id, item_achado_id, tipo, usuario_id, local_guarda, data_evento, observacoes, criado_por, criado_em) FROM stdin;
1	4	ENTRADA	\N	Biblioteca	2026-10-23 19:53:02.802491+00	\N	\N	2026-10-23 19:53:02.802491+00
2	6	ENTRADA	\N	Acervo A-1	2026-10-23 20:51:46.155577+00	\N	\N	2026-10-23 20:51:46.155577+00
\.


--
-- Data for Name: devolucoes; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.devolucoes (id, item_achado_id, caso_id, recebedor_id, comprovado, comprovacao_descricao, comprovacao_url, autorizado_por, status, data_devolucao, criado_por, criado_em, atualizado_em) FROM stdin;
1	1	\N	1	t	Apresentou RG e nota fiscal	\N	\N	CONCLUIDA	2026-10-23 16:54:41.791284+00	\N	2026-10-23 16:54:41.791284+00	2026-10-23 16:54:41.791284+00
2	2	\N	1	t	Nota fiscal	\N	\N	CONCLUIDA	2026-10-23 17:30:23.105602+00	\N	2026-10-23 17:30:23.105602+00	2026-10-23 17:30:23.105602+00
3	3	\N	1	t	Nota fiscal	\N	\N	CONCLUIDA	2026-10-23 17:32:54.145212+00	\N	2026-10-23 17:32:54.145212+00	2026-10-23 17:32:54.145212+00
4	6	\N	2	t	Apresentou RG e nota fiscal	\N	\N	CONCLUIDA	2026-10-23 20:51:46.205603+00	\N	2026-10-23 20:51:46.205603+00	2026-10-23 20:51:46.205603+00
\.


--
-- Data for Name: itens_achados; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.itens_achados (id, codigo, titulo, descricao, categoria_id, cor, marca, local_encontrado, data_encontrado, registrador_id, status, foto_url, observacoes, criado_por, criado_em, atualizado_em) FROM stdin;
1	ACH-TESTE-1	Mochila de teste	\N	\N	\N	\N	\N	2026-10-23	\N	DEVOLVIDO	\N	\N	\N	2026-10-23 16:53:04.536254+00	2026-10-23 16:54:41.791284+00
2	ACH-2026-0001	Capa de Notebook	Capa de Notebook "C3TECH" na cor preta, com z├¡per cinza	4	Preta	C3TECH	Sala A12	2026-10-23	1	DEVOLVIDO	\N	\N	1	2026-10-23 17:29:24.785803+00	2026-10-23 17:30:23.105602+00
3	ACH-2026-0002	Garrafa t├®rmica	Garrafa t├®rmica preta da marca PACCO	7	Preta	PACCO	Sala de descanso	2026-10-23	1	DEVOLVIDO	\N	\N	1	2026-10-23 17:31:58.088794+00	2026-10-23 17:32:54.145212+00
4	ACH-2026-0003	Mochila	Mochila da marca Starrett	6	Preto com amarelo	Starrett	Minishopping	2026-10-23	1	EM_CUSTODIA	\N	\N	1	2026-10-23 19:52:20.819494+00	2026-10-23 19:53:02.802491+00
5	ACH-2026-0004	Notebook	Notebook cinza da marca ACER	1	Cinza	Acer	Sala A9	2026-10-23	1	RECEBIDO	\N	\N	1	2026-10-23 20:25:46.296977+00	2026-10-23 20:25:46.296977+00
6	ACH-2026-0005	Item teste 1792788705552	\N	\N	\N	\N	Biblioteca	2026-10-23	2	DEVOLVIDO	\N	\N	1	2026-10-23 20:51:46.094316+00	2026-10-23 20:51:46.205603+00
\.


--
-- Data for Name: registradores; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.registradores (id, nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes, criado_em, atualizado_em) FROM stdin;
1	Dono Teste	ALUNO	\N	\N	\N	\N	\N	\N	2026-10-23 16:53:03.46687+00	2026-10-23 16:53:03.46687+00
2	Dono Teste	ALUNO	\N	CPF	TST-1792788705552	\N	\N	\N	2026-10-23 20:51:46.044765+00	2026-10-23 20:51:46.044765+00
\.


--
-- Data for Name: relatos_perda; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.relatos_perda (id, codigo, titulo, descricao, categoria_id, cor, marca, local_perda, data_perda, registrador_id, status, observacoes, criado_por, criado_em, atualizado_em) FROM stdin;
1	REL-261023-9998	Notebook	Cinza, marca "Acer"	\N	\N	\N	Sala A9	2026-10-23	\N	ABERTO	\N	2	2026-10-23 20:27:38.834972+00	2026-10-23 20:27:38.834972+00
2	REL-261023-0616	Perda teste 1792788705552	\N	\N	\N	\N	Quadra	\N	\N	ABERTO	\N	1	2026-10-23 20:51:46.1206+00	2026-10-23 20:51:46.1206+00
3	REL-261026-1065	Copo verde de caf├®	Copo verde de caf├®	\N	\N	\N	N├úo sei	2016-11-26	\N	ABERTO	\N	\N	2026-10-26 10:41:57.108512+00	2026-10-26 11:19:10.85443+00
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: app_achados
--

COPY public.usuarios (id, nome, email, senha_hash, papel, ativo, criado_em, atualizado_em) FROM stdin;
1	Administrador	admin@achados.local	$2a$06$iwBhJsXoQqMvJPKJzHCshu4Cra/Q92HV89qkdoRtsylPOcsrVWcwu	ADMINISTRADOR	t	2026-10-16 11:16:51.337328+00	2026-10-16 11:16:51.337328+00
2	Aluno Teste	aluno@achados.local	$2a$06$AIbY6iTNtmKrRCXT6eBAlutUpuASvdBysdU18/2jRIcK4vo1/buqC	USUARIO	t	2026-10-16 11:16:51.34303+00	2026-10-16 11:16:51.34303+00
4	Ant├┤nio	antonio@alunos.afya.com.br	$2a$10$Ziqg4FlPkhDQPdnvjV8FletGWiQyG5s1OMhNs8un7sqIqVYzHa43G	SERVIDOR	t	2026-10-26 11:12:05.114378+00	2026-10-26 11:27:01.722243+00
\.


--
-- Name: casos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.casos_id_seq', 2, true);


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.categorias_id_seq', 7, true);


--
-- Name: correspondencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.correspondencias_id_seq', 1, false);


--
-- Name: custodias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.custodias_id_seq', 2, true);


--
-- Name: devolucoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.devolucoes_id_seq', 4, true);


--
-- Name: itens_achados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.itens_achados_id_seq', 6, true);


--
-- Name: registradores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.registradores_id_seq', 2, true);


--
-- Name: relatos_perda_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.relatos_perda_id_seq', 3, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_achados
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 4, true);


--
-- Name: casos casos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_codigo_key UNIQUE (codigo);


--
-- Name: casos casos_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_nome_key; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nome_key UNIQUE (nome);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: correspondencias correspondencias_item_achado_id_relato_perda_id_key; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.correspondencias
    ADD CONSTRAINT correspondencias_item_achado_id_relato_perda_id_key UNIQUE (item_achado_id, relato_perda_id);


--
-- Name: correspondencias correspondencias_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.correspondencias
    ADD CONSTRAINT correspondencias_pkey PRIMARY KEY (id);


--
-- Name: custodias custodias_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.custodias
    ADD CONSTRAINT custodias_pkey PRIMARY KEY (id);


--
-- Name: devolucoes devolucoes_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.devolucoes
    ADD CONSTRAINT devolucoes_pkey PRIMARY KEY (id);


--
-- Name: itens_achados itens_achados_codigo_key; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.itens_achados
    ADD CONSTRAINT itens_achados_codigo_key UNIQUE (codigo);


--
-- Name: itens_achados itens_achados_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.itens_achados
    ADD CONSTRAINT itens_achados_pkey PRIMARY KEY (id);


--
-- Name: registradores registradores_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.registradores
    ADD CONSTRAINT registradores_pkey PRIMARY KEY (id);


--
-- Name: registradores registradores_tipo_documento_documento_key; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.registradores
    ADD CONSTRAINT registradores_tipo_documento_documento_key UNIQUE (tipo_documento, documento);


--
-- Name: relatos_perda relatos_perda_codigo_key; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.relatos_perda
    ADD CONSTRAINT relatos_perda_codigo_key UNIQUE (codigo);


--
-- Name: relatos_perda relatos_perda_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.relatos_perda
    ADD CONSTRAINT relatos_perda_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_casos_status; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_casos_status ON public.casos USING btree (status);


--
-- Name: idx_corresp_item; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_corresp_item ON public.correspondencias USING btree (item_achado_id);


--
-- Name: idx_corresp_relato; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_corresp_relato ON public.correspondencias USING btree (relato_perda_id);


--
-- Name: idx_custodias_item; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_custodias_item ON public.custodias USING btree (item_achado_id, data_evento DESC);


--
-- Name: idx_devolucoes_item; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_devolucoes_item ON public.devolucoes USING btree (item_achado_id);


--
-- Name: idx_itens_categoria; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_itens_categoria ON public.itens_achados USING btree (categoria_id);


--
-- Name: idx_itens_data; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_itens_data ON public.itens_achados USING btree (data_encontrado);


--
-- Name: idx_itens_status; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_itens_status ON public.itens_achados USING btree (status);


--
-- Name: idx_registradores_vinculo; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_registradores_vinculo ON public.registradores USING btree (vinculo);


--
-- Name: idx_relatos_categoria; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_relatos_categoria ON public.relatos_perda USING btree (categoria_id);


--
-- Name: idx_relatos_status; Type: INDEX; Schema: public; Owner: app_achados
--

CREATE INDEX idx_relatos_status ON public.relatos_perda USING btree (status);


--
-- Name: casos trg_casos_upd; Type: TRIGGER; Schema: public; Owner: app_achados
--

CREATE TRIGGER trg_casos_upd BEFORE UPDATE ON public.casos FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: categorias trg_categorias_upd; Type: TRIGGER; Schema: public; Owner: app_achados
--

CREATE TRIGGER trg_categorias_upd BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: devolucoes trg_devolucoes_upd; Type: TRIGGER; Schema: public; Owner: app_achados
--

CREATE TRIGGER trg_devolucoes_upd BEFORE UPDATE ON public.devolucoes FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: itens_achados trg_itens_upd; Type: TRIGGER; Schema: public; Owner: app_achados
--

CREATE TRIGGER trg_itens_upd BEFORE UPDATE ON public.itens_achados FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: registradores trg_registradores_upd; Type: TRIGGER; Schema: public; Owner: app_achados
--

CREATE TRIGGER trg_registradores_upd BEFORE UPDATE ON public.registradores FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: relatos_perda trg_relatos_upd; Type: TRIGGER; Schema: public; Owner: app_achados
--

CREATE TRIGGER trg_relatos_upd BEFORE UPDATE ON public.relatos_perda FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: usuarios trg_usuarios_upd; Type: TRIGGER; Schema: public; Owner: app_achados
--

CREATE TRIGGER trg_usuarios_upd BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: casos casos_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: casos casos_item_achado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_item_achado_id_fkey FOREIGN KEY (item_achado_id) REFERENCES public.itens_achados(id) ON DELETE RESTRICT;


--
-- Name: casos casos_relato_perda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_relato_perda_id_fkey FOREIGN KEY (relato_perda_id) REFERENCES public.relatos_perda(id) ON DELETE SET NULL;


--
-- Name: casos casos_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: correspondencias correspondencias_item_achado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.correspondencias
    ADD CONSTRAINT correspondencias_item_achado_id_fkey FOREIGN KEY (item_achado_id) REFERENCES public.itens_achados(id) ON DELETE CASCADE;


--
-- Name: correspondencias correspondencias_relato_perda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.correspondencias
    ADD CONSTRAINT correspondencias_relato_perda_id_fkey FOREIGN KEY (relato_perda_id) REFERENCES public.relatos_perda(id) ON DELETE CASCADE;


--
-- Name: custodias custodias_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.custodias
    ADD CONSTRAINT custodias_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: custodias custodias_item_achado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.custodias
    ADD CONSTRAINT custodias_item_achado_id_fkey FOREIGN KEY (item_achado_id) REFERENCES public.itens_achados(id) ON DELETE CASCADE;


--
-- Name: custodias custodias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.custodias
    ADD CONSTRAINT custodias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: devolucoes devolucoes_autorizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.devolucoes
    ADD CONSTRAINT devolucoes_autorizado_por_fkey FOREIGN KEY (autorizado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: devolucoes devolucoes_caso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.devolucoes
    ADD CONSTRAINT devolucoes_caso_id_fkey FOREIGN KEY (caso_id) REFERENCES public.casos(id) ON DELETE SET NULL;


--
-- Name: devolucoes devolucoes_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.devolucoes
    ADD CONSTRAINT devolucoes_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: devolucoes devolucoes_item_achado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.devolucoes
    ADD CONSTRAINT devolucoes_item_achado_id_fkey FOREIGN KEY (item_achado_id) REFERENCES public.itens_achados(id) ON DELETE RESTRICT;


--
-- Name: devolucoes devolucoes_recebedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.devolucoes
    ADD CONSTRAINT devolucoes_recebedor_id_fkey FOREIGN KEY (recebedor_id) REFERENCES public.registradores(id) ON DELETE RESTRICT;


--
-- Name: itens_achados itens_achados_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.itens_achados
    ADD CONSTRAINT itens_achados_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- Name: itens_achados itens_achados_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.itens_achados
    ADD CONSTRAINT itens_achados_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: itens_achados itens_achados_registrador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.itens_achados
    ADD CONSTRAINT itens_achados_registrador_id_fkey FOREIGN KEY (registrador_id) REFERENCES public.registradores(id) ON DELETE RESTRICT;


--
-- Name: relatos_perda relatos_perda_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.relatos_perda
    ADD CONSTRAINT relatos_perda_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- Name: relatos_perda relatos_perda_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.relatos_perda
    ADD CONSTRAINT relatos_perda_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: relatos_perda relatos_perda_registrador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_achados
--

ALTER TABLE ONLY public.relatos_perda
    ADD CONSTRAINT relatos_perda_registrador_id_fkey FOREIGN KEY (registrador_id) REFERENCES public.registradores(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict zNJ24hUylatb0vG2gW3Q6Gx5O5LWS6xrh0530gyKzZKy7HRPGaADdWHAbDTHNWE

