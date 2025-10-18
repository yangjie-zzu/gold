FROM node:22-alpine AS builder
USER node
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm install

FROM node:22-alpine AS nextjs
USER node
WORKDIR /app
COPY . .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

FROM node:22-alpine AS task
USER node
WORKDIR /app
COPY . .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run task:build
CMD ["npm", "run", "task:run"]