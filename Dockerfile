# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /usr/src/app


FROM base AS deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM base AS build
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build


FROM base AS final
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json ./
COPY --from=deps  /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next         ./.next
COPY --from=build /usr/src/app/public        ./public
COPY --from=build /usr/src/app/next.config.* ./  
COPY --from=build /usr/src/app/.env*         ./  

RUN chown -R node:node /usr/src/app \
 && chmod -R a+rX /usr/src/app/public

USER node

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["npm", "run", "start"]
