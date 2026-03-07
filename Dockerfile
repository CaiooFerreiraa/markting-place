# 1. Estágio de Build (usando imagem completa para ter todas as ferramentas de compilação)
FROM node:20 AS build
WORKDIR /app

# Desabilitar telemetria do Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar apenas os arquivos de dependências primeiro (otimiza cache do Docker)
COPY package.json package-lock.json* ./

# Instalar dependências
# --legacy-peer-deps é necessário pela versão do React 19
# Usamos loglevel warn para não poluir, mas ver o essencial
RUN npm install --legacy-peer-deps --loglevel warn

# Copiar o restante do código
COPY . .

# Gerar o Client do Prisma (essencial antes do build)
RUN npx prisma generate

# Build da aplicação Next.js
RUN npm run build

# 2. Estágio de Execução (Runner) - Imagem leve para produção
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar dependências mínimas de sistema (Prisma precisa de openssl)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Configurar usuário de sistema (segurança)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar apenas o estritamente necessário do estágio de build
COPY --from=build /app/public ./public
COPY --from=build /app/.next .next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

# Garantir permissões corretas (opcional mas recomendado)
# RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# O Next.js start roda o servidor de produção
CMD ["npm", "run", "start"]
