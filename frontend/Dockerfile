ARG BUILD_ENV=production
ARG NODE=node:22-alpine

FROM ${NODE} AS builder

ARG BUILD_ENV
ARG NEXT_PUBLIC_ENV=production
ARG NEXT_PUBLIC_CORE_API_URL

ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
ENV NEXT_PUBLIC_CORE_API_URL=$NEXT_PUBLIC_CORE_API_URL

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install -g npm@latest && npm ci

COPY . .

RUN echo "Building for environment: $BUILD_ENV" >&2

RUN if [ "$BUILD_ENV" = "sandbox" ]; then \
        npm run build:sandbox; \
    elif [ "$BUILD_ENV" = "staging" ]; then \
        npm run build:staging; \
    else \
        npm run build:production; \
    fi

FROM ${NODE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
