FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
RUN npm run build

FROM node:22-alpine as nextjs
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY .env.aliyun .env.local
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
