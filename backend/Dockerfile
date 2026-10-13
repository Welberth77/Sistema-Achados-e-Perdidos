# Backend — Sistema de Achados e Perdidos (Node 20 + Express)
FROM node:20-alpine

WORKDIR /app

# Instala só as dependências primeiro (aproveita o cache do Docker entre builds).
# Usa o package-lock.json e ignora devDependencies (nodemon/eslint não rodam em produção).
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o restante do código-fonte.
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# Sobe o servidor (script "start": node src/server.js)
CMD ["npm", "start"]
