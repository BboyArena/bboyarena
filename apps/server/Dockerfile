FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/sdk/package.json packages/sdk/package.json

RUN npm ci

COPY apps/server apps/server
COPY packages/shared packages/shared
COPY packages/sdk packages/sdk
COPY tsconfig.json tsconfig.json

ENV NODE_ENV=development
ENV PORT=8787

EXPOSE 8787

CMD ["npm", "run", "server:dev"]
