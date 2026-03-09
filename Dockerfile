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

# Variáveis para o build (essenciais para o Next.js coletar dados de página)
ARG DATABASE_URL
ARG NEXTAUTH_SECRET=fallback
ARG NEXT_PUBLIC_API_URL=https://acheifacil.com.br
ARG STRIPE_SECRET_KEY=sk_test_placeholder_for_build

ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY

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
# O caractere * no public evita travamento caso a pasta não exista no repositório
COPY --from=build /app/public* ./public
COPY --from=build /app/.next .next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

USER nextjs


EXPOSE 3000

CMD ["npm","start"]
