FROM node:14.3.0-alpine as builder
USER root

WORKDIR /opt/thirdparty-api-svc

RUN apk add --no-cache -t build-dependencies git make gcc g++ python libtool autoconf automake \
    && cd $(npm root -g)/npm \
    && npm config set unsafe-perm true \
    && npm install -g node-gyp

COPY package.json package-lock.json* /opt/thirdparty-api-svc/
RUN npm ci

# check in .dockerignore what is skipped during copy
COPY . .

# cleanup
RUN apk del build-dependencies

FROM node:14.3.0-alpine
WORKDIR /opt/thirdparty-api-svc

# Create empty log file & link stdout to the application log file
RUN mkdir ./logs && touch ./logs/combined.log
RUN ln -sf /dev/stdout ./logs/combined.log

# Create a non-root user: ml-user
RUN adduser -D ml-user
USER ml-user

COPY --chown=ml-user --from=builder /opt/thirdparty-api-svc .

RUN npm prune --production

EXPOSE 3008
CMD ["npm", "run", "start"]
