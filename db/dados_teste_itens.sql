-- Dados de teste: itens achados variados em diferentes situações (para testar alto fluxo).
-- Seguro reexecutar: ON CONFLICT (codigo) DO NOTHING.
-- Aplicar:  docker cp db/dados_teste_itens.sql achados_db:/tmp/t.sql
--           docker compose exec db psql -U app_achados -d achados_perdidos -f /tmp/t.sql

INSERT INTO itens_achados
  (codigo, titulo, descricao, categoria_id, cor, marca, local_encontrado, data_encontrado, registrador_id, status, criado_por)
VALUES
  ('ACH-2026-9001','Notebook Dell Inspiron','Notebook 15 polegadas com adesivos na tampa', (SELECT id FROM categorias WHERE nome='Eletrônicos'),'Prata','Dell','Biblioteca - 2º andar','2026-09-05', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9002','Celular iPhone 12','Capa transparente, tela sem trincos', (SELECT id FROM categorias WHERE nome='Eletrônicos'),'Preto','Apple','Quadra poliesportiva','2026-10-01', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9003','Fone de ouvido Bluetooth','Fone sem fio em estojo de carga', (SELECT id FROM categorias WHERE nome='Eletrônicos'),'Branco','JBL','Cantina','2026-10-10', NULL,'EM_ANALISE', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9004','Carteira de couro','Sem documentos dentro, só cartões fidelidade', (SELECT id FROM categorias WHERE nome='Acessórios'),'Marrom',NULL,'Estacionamento','2026-09-20', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9005','Óculos de grau','Armação de acetato, estojo preto', (SELECT id FROM categorias WHERE nome='Acessórios'),'Preto','Ray-Ban','Sala 203','2026-10-12', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9006','Molho de chaves','Cinco chaves com chaveiro de borracha', (SELECT id FROM categorias WHERE nome='Chaves'),'Prata',NULL,'Portaria principal','2026-10-15', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9007','Chave com controle de carro','Controle de alarme junto', (SELECT id FROM categorias WHERE nome='Chaves'),'Preto','Volkswagen','Estacionamento','2026-10-18', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9008','Mochila escolar','Mochila com cadernos e um estojo', (SELECT id FROM categorias WHERE nome='Material escolar'),'Azul','Nike','Bloco A','2026-09-28', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9009','Estojo com canetas','Estojo cheio de canetas e marcadores', (SELECT id FROM categorias WHERE nome='Material escolar'),'Rosa',NULL,'Sala 101','2026-10-05', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9010','Caderno universitário','Caderno de 10 matérias com anotações', (SELECT id FROM categorias WHERE nome='Material escolar'),'Vermelho','Tilibra','Biblioteca','2026-10-08', NULL,'EM_ANALISE', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9011','Guarda-chuva','Guarda-chuva dobrável', (SELECT id FROM categorias WHERE nome='Outros'),'Azul-marinho',NULL,'Hall de entrada','2026-10-02', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9012','Garrafa térmica inox','Garrafa de 500ml levemente amassada', (SELECT id FROM categorias WHERE nome='Outros'),'Prata','Stanley','Laboratório 2','2026-10-14', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9013','Jaqueta jeans','Jaqueta tamanho M', (SELECT id FROM categorias WHERE nome='Vestuário'),'Azul','Levi''s','Auditório','2026-09-30', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9014','Boné','Boné aba curva', (SELECT id FROM categorias WHERE nome='Vestuário'),'Preto','New Era','Quadra','2026-10-11', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9015','Cachecol','Cachecol de lã', (SELECT id FROM categorias WHERE nome='Vestuário'),'Cinza',NULL,'Corredor Bloco B','2026-10-16', NULL,'EM_ANALISE', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9016','Carteira de estudante','Documento de identificação acadêmica', (SELECT id FROM categorias WHERE nome='Documentos'),NULL,NULL,'Secretaria','2026-10-09', NULL,'EM_DEVOLUCAO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9017','Crachá de identificação','Crachá com cordão azul', (SELECT id FROM categorias WHERE nome='Documentos'),NULL,NULL,'Refeitório','2026-10-13', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9018','Pen drive 32GB','Pen drive com chaveiro', (SELECT id FROM categorias WHERE nome='Eletrônicos'),'Preto','SanDisk','Laboratório 1','2026-10-17', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9019','Relógio de pulso','Relógio analógico', (SELECT id FROM categorias WHERE nome='Acessórios'),'Dourado','Casio','Vestiário','2026-09-25', NULL,'DEVOLVIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9020','Tablet Samsung','Tablet com capa teclado', (SELECT id FROM categorias WHERE nome='Eletrônicos'),'Cinza','Samsung','Biblioteca','2026-09-18', NULL,'DEVOLVIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9021','Camiseta de time','Camiseta esportiva tamanho G', (SELECT id FROM categorias WHERE nome='Vestuário'),'Vermelho',NULL,'Quadra','2026-08-30', NULL,'DESCARTADO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9022','Squeeze plástico','Garrafa de água sem tampa', (SELECT id FROM categorias WHERE nome='Outros'),'Verde',NULL,'Jardim','2026-08-15', NULL,'DESCARTADO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9023','Calculadora científica','Calculadora para exatas', (SELECT id FROM categorias WHERE nome='Material escolar'),'Preto','Casio','Sala 305','2026-10-19', NULL,'RECEBIDO', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1)),
  ('ACH-2026-9024','Power bank','Carregador portátil 10000mAh', (SELECT id FROM categorias WHERE nome='Eletrônicos'),'Branco','Xiaomi','Cantina','2026-10-20', NULL,'EM_CUSTODIA', (SELECT id FROM usuarios WHERE papel='ADMINISTRADOR' ORDER BY id LIMIT 1))
ON CONFLICT (codigo) DO NOTHING;

-- Conferência rápida
SELECT status, COUNT(*) FROM itens_achados WHERE codigo LIKE 'ACH-2026-9%' GROUP BY status ORDER BY status;
