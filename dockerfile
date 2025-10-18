FROM --platform=amd64 node:22-alpine as nextjs
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

FROM --platform=amd64 node:22-alpine AS task
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run task:build
CMD ["npm", "run", "task:run"]