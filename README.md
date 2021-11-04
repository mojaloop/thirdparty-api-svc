# thirdparty-api-svc
[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/thirdparty-api-svc.svg?style=flat)](https://github.com/mojaloop/thirdparty-api-svc/commits/master)
[![Git Releases](https://img.shields.io/github/release/mojaloop/thirdparty-api-svc.svg?style=flat)](https://github.com/mojaloop/thirdparty-api-svc/releases)
[![CircleCI](https://circleci.com/gh/mojaloop/thirdparty-api-svc.svg?style=svg)](https://circleci.com/gh/mojaloop/thirdparty-api-svc)

The thirdparty-api-svc service handles HTTP Requests from the Mojaloop Third Party API

## Overview

- [Documentation](./docs/README.md)

## Runtime Configuration

Runtime configuration is handled by `rc`, and can be specified using either Environment Variables, or a `.json` file.

See [`./config/default.json`](./config/default.json) for an example config file. 

When setting configuration using environment variables, the `THIRD_PARTY` environment variable prefix is required. See [`src/shared/config.ts`](src/shared/config.ts) to understand how these variables are configured.

### Key Config Options

> ***Note:** See [`./config/default.json`](./config/default.json) for all available config options, and their default values.*

| Name | Env Var | jsonPath | Description |
| ---- | ------- | -------- | ----------- |
| `PORT` | `THIRD_PARTY_PORT` | `.PORT` | The TCP port the Hapi server should start on |
| `HOST` | `THIRD_PARTY_HOST` | `.HOST` | The hostname the Hapi server should bind to  |
| `ENDPOINT_SERVICE_URL` | `ENDPOINT_SERVICE_URL` | `.ENDPOINT_SERVICE_URL` | The internal service used to retrieve endpoints for Mojaloop Participants. Currently this is the `central-ledger`.  |


## Setup

### Clone repo
```bash
git clone git@github.com:mojaloop/thirdparty-api-svc.git
```

### Improve local DNS resolver
Add the `127.0.0.1   thirdparty-api-svc.local` entry in your `/etc/hosts` so the _thirdparty-api-svc_ is reachable on `http://thirdparty-api-svc.local:3008`. Elsewhere use `http://localhost:3008`

### Install service dependencies
```bash
cd thirdparty-api-svc
npm ci
```

### Run local dockerized _thirdparty-api-svc_
```bash
npm run docker:build
npm run docker:run
```

To check the thirdparty-api-svc health visit [http://thirdparty-api-svc.local:3008/health](http://thirdparty-api-svc.local:3008/health)

