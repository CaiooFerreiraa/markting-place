# Usar a imagem oficial do Node.js
FROM node:20-alpine AS base

# Instalar dependências
FROM base AS install
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build do projeto
FROM base AS build
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Variáveis de ambiente para o build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Imagem final de produção
FROM base AS release
WORKDIR /app
ENV NODE_ENV production

COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/.next .next
COPY --from=build /app/public public
COPY --from=build /app/package.json .
COPY --from=build /app/prisma ./prisma

# Expor a porta 3000
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start"]
