# thirdparty-api-adapter (Work in Progress)
[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/thirdparty-api-adapter.svg?style=flat)](https://github.com/mojaloop/thirdparty-api-adapter/commits/master)
[![Git Releases](https://img.shields.io/github/release/mojaloop/thirdparty-api-adapter.svg?style=flat)](https://github.com/mojaloop/thirdparty-api-adapter/releases)
[![Npm Version](https://img.shields.io/npm/v/@mojaloop/thirdparty-api-adapter.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/thirdparty-api-adapter)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mojaloop/thirdparty-api-adapter.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/thirdparty-api-adapter)
[![CircleCI](https://circleci.com/gh/mojaloop/thirdparty-api-adapter.svg?style=svg)](https://circleci.com/gh/mojaloop/thirdparty-api-adapter)

The thirdparty-api-adapter service is used to handle HTTP requests from third parties.

## Overview

- [Documentation](./docs/README.md)

## Setup

### Clone repo
```bash
git clone git@github.com:mojaloop/thirdparty-api-adapter.git
```

### Improve local DNS resolver
Add the `127.0.0.1   thirdparty-api-adapter.local` entry in your `/etc/hosts` so the _thirdparty-api-adapter_ is reachable on `http://thirdparty-api-adapter.local:3008`. Elsewhere use `http://localhost:3008`

### Install service dependencies
```bash
cd thirdparty-api-adapter
npm ci
```

### Run local dockerized _thirdparty-api-adapter_
```bash
npm run docker:build
npm run docker:run
```

To check the thirdparty-api-adapter health visit [http://thirdparty-api-adapter.local:3008/health](http://thirdparty-api-adapter.local:3008/health)

