FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .

RUN yarn build
FROM node:22-alpine as app
WORKDIR /app
RUN chown -R node:node /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000

CMD ["yarn", "start:dev"]