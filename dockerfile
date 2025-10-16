FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
VOLUME [ "/opt/prisma" ] 
ENV PRISMA_QUERY_ENGINE_LIBRARY=/opt/prisma/libquery_engine.so.node

FROM --platform=amd64 node:22-alpine as nextjs
WORKDIR /app
COPY . .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY .env.aliyun .env.local
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

FROM --platform=amd64 node:22-alpine AS task
WORKDIR /app
COPY . .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY .env.aliyun .env.local
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run task:build
CMD ["npm", "run", "task:run"]