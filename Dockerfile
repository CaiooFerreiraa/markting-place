# 1. Estágio de Build
FROM node:20 AS build
WORKDIR /app

# Desabilitar telemetria e definir ambiente de CI
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

# Copiar arquivos de definição de pacotes E a pasta prisma
# Isso é vital porque o npm install dispara o 'prisma generate' (postinstall)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependências
# --legacy-peer-deps: Necessário para compatibilidade com React 19/Next 16
# --no-audit --no-fund: Acelera o processo e evita travamentos por rede
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Agora copiamos o restante do código fonte
COPY . .

# Build da aplicação Next.js
RUN npm run build

# 2. Estágio de Execução (Runner)
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar dependências mínimas de sistema (OpenSSL é obrigatório para o Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Configurar usuário de sistema
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar artefatos do build
COPY --from=build /app/public ./public
COPY --from=build /app/.next .next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
