### STAGE 1: Build ###

# Debian-based image (glibc): avoids the SIGSEGV seen with node:22-alpine (musl) on the GitLab runner
FROM node:22-slim AS builder

ENV NG_CLI_ANALYTICS=false \
    NG_BUILD_MAX_WORKERS=2 \
    NODE_OPTIONS="--max-old-space-size=3072"

WORKDIR /ng-app

## Install dependencies in a separate layer so they are cached until package*.json changes
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

## Build the angular app in production mode and store the artifacts in the dist folder
COPY . .
RUN npx ng build --configuration production --output-hashing=all

### STAGE 2: Setup ###

FROM nginx:1.27-alpine

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]