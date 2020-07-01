FROM node:14.3.0-alpine as builder

WORKDIR /opt/thirdparty-api-adapter

RUN apk add --no-cache -t build-dependencies git make gcc g++ python libtool autoconf automake \
    && cd $(npm root -g)/npm \
    && npm config set unsafe-perm true \
    && npm install -g node-gyp

COPY package.json package-lock.json* /opt/thirdparty-api-adapter/
RUN npm ci

# Create empty log file &
RUN mkdir ./logs && touch ./logs/combined.log

# link stdout to the application log file
RUN ln -sf /dev/stdout ./logs/combined.log

# check in .dockerignore what is skipped during copy
COPY . .

# USER node
# copy bundle
# COPY --chown=node --from=builder /opt/thirdparty-api-adapter/ .

# cleanup
RUN apk del build-dependencies

RUN npm prune --production
EXPOSE 3008
CMD ["npm", "run", "start"]
