# Usar imagem Node.js baseada em Debian Slim para melhor compatibilidade com binários (sharp, prisma)
FROM node:20-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Estágio de dependências
FROM base AS deps
# Instalar ferramentas de build caso alguma dependência precise compilar
RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# Usamos install com legacy-peer-deps para evitar erros com React 19/Next 16
RUN npm install --legacy-peer-deps

# Estágio de build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis para o build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Gera o client do Prisma e faz o build
RUN npx prisma generate
RUN npm run build

# Estágio final de produção
FROM base AS runner
ENV NODE_ENV=production

# Criar usuário do sistema para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build /app/.next .next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
