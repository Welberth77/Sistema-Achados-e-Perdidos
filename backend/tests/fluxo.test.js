/* global fetch */
/**
 * Teste de integração — fluxo completo do Sistema de Achados e Perdidos.
 *
 * Exercita os 7 casos de uso pela API real, contra o backend rodando no Docker:
 *   login → registrador (UC-02) → item achado (UC-01) → relato de perda (UC-03)
 *        → abrir caso (UC-07) → custódia (UC-05) → devolução (UC-06) → encerrar caso (UC-07)
 * Inclui a verificação da regra de negócio "não devolve sem comprovação de propriedade".
 *
 * Pré-requisito: backend e banco no ar.
 *   docker compose up -d --build
 *
 * Rodar:
 *   cd backend && npm test
 *
 * Usa o test runner nativo do Node (node:test) e fetch — sem dependências extras.
 * Observação: o teste cria dados no banco (com identificadores únicos por execução).
 * Para zerar o banco:  docker compose down -v
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.API_URL || 'http://localhost:3000/api';
const stamp = Date.now();
const state = {};

async function api(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem corpo JSON */
  }
  return { status: res.status, data };
}

before(async () => {
  let ok = false;
  try {
    const r = await fetch(`${BASE}/health`);
    ok = r.ok;
  } catch {
    ok = false;
  }
  assert.ok(
    ok,
    `Backend não respondeu em ${BASE}. Rode "docker compose up -d --build" antes dos testes.`
  );
});

test('Fluxo completo de achados e perdidos', async (t) => {
  await t.test('login do administrador', async () => {
    const { status, data } = await api('POST', '/auth/login', {
      body: { email: 'admin@achados.local', senha: 'admin123' },
    });
    assert.equal(status, 200, 'login deveria retornar 200');
    assert.ok(data.token, 'deveria retornar um token');
    state.token = data.token;
  });

  await t.test('cadastra um registrador (UC-02)', async () => {
    const { status, data } = await api('POST', '/registradores', {
      token: state.token,
      body: { nome: 'Dono Teste', vinculo: 'ALUNO', tipo_documento: 'CPF', documento: `TST-${stamp}` },
    });
    assert.equal(status, 201);
    state.registradorId = data.id;
    assert.ok(state.registradorId, 'deveria retornar o id do registrador');
  });

  await t.test('cadastra um item achado (UC-01)', async () => {
    const hoje = new Date().toISOString().slice(0, 10);
    const { status, data } = await api('POST', '/itens', {
      token: state.token,
      body: {
        titulo: `Item teste ${stamp}`,
        data_encontrado: hoje,
        local_encontrado: 'Biblioteca',
        registrador_id: state.registradorId,
      },
    });
    assert.equal(status, 201);
    state.itemId = data.id;
    assert.ok(state.itemId, 'deveria retornar o id do item');
    assert.equal(data.status, 'RECEBIDO', 'item novo deve nascer RECEBIDO');
  });

  await t.test('registra um relato de perda (UC-03)', async () => {
    const { status, data } = await api('POST', '/relatos', {
      token: state.token,
      body: { titulo: `Perda teste ${stamp}`, local_perda: 'Quadra' },
    });
    assert.equal(status, 201);
    state.relatoId = data.relato.id;
    assert.ok(state.relatoId, 'deveria retornar o id do relato');
  });

  await t.test('abre um caso ligando item e relato (UC-07)', async () => {
    const { status, data } = await api('POST', '/casos', {
      token: state.token,
      body: {
        item_achado_id: state.itemId,
        relato_perda_id: state.relatoId,
        descricao: 'Caso de teste automatizado',
      },
    });
    assert.equal(status, 201);
    state.casoId = data.id;
    assert.ok(state.casoId, 'deveria retornar o id do caso');
    assert.equal(data.status, 'ABERTO', 'caso novo deve nascer ABERTO');
  });

  await t.test('registra custódia e o item fica EM_CUSTODIA (UC-05)', async () => {
    const reg = await api('POST', '/custodia/nova', {
      token: state.token,
      body: { item_id: state.itemId, tipo: 'ENTRADA', local_guarda: 'Acervo A-1' },
    });
    assert.equal(reg.status, 201, 'registrar custódia deveria retornar 201');

    const item = await api('GET', `/itens/${state.itemId}`, { token: state.token });
    assert.equal(item.status, 200);
    assert.equal(item.data.status, 'EM_CUSTODIA', 'item deve ficar EM_CUSTODIA');
  });

  await t.test('bloqueia devolução sem comprovação (regra UC-06)', async () => {
    const { status } = await api('POST', '/devolucoes/nova', {
      token: state.token,
      body: { item_id: state.itemId, recebedor_id: state.registradorId },
    });
    assert.equal(status, 422, 'devolução sem comprovante deve ser bloqueada (422)');
  });

  await t.test('devolve com comprovação e o item fica DEVOLVIDO (UC-06)', async () => {
    const dev = await api('POST', '/devolucoes/nova', {
      token: state.token,
      body: {
        item_id: state.itemId,
        recebedor_id: state.registradorId,
        comprovante: 'Apresentou RG e nota fiscal',
      },
    });
    assert.equal(dev.status, 200, 'devolução válida deveria retornar 200');

    const item = await api('GET', `/itens/${state.itemId}`, { token: state.token });
    assert.equal(item.data.status, 'DEVOLVIDO', 'item deve ficar DEVOLVIDO');
  });

  await t.test('encerra o caso (UC-07)', async () => {
    const enc = await api('PATCH', `/casos/${state.casoId}/encerrar`, { token: state.token });
    assert.equal(enc.status, 200, 'encerrar caso deveria retornar 200');

    const caso = await api('GET', `/casos/${state.casoId}`, { token: state.token });
    assert.equal(caso.data.status, 'ENCERRADO', 'caso deve ficar ENCERRADO');
  });
});
