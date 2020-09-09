# thirdparty-api-adapter/Docs

Documentation for the thirdparty-api-adapter service
## BDD

[jest-cucumber](https://github.com/bencompton/jest-cucumber) allows to use `jest` to execute Gherkin scenarios. Thanks to `jest` we are getting also code coverage for BDD Scenarios.

in `test/features` are Feature/Scenarios in `.feature` files which contain declarations in Gherkin language.

in `test/step-definitions` are Steps implementations in `.step.ts` files.

Execute scenarios and report code coverage:
```bash
npm run test:bdd
```

## unit testing

`Jest` setup, which allows to prepare unit tests specified in `test/**/*.(spec|test).ts` files. Coverage report is always generated. If the speed of unit tests will go very slow we will refactor configuration to generate coverage only on demand.

```bash
npm run test:unit
```

If you want to generate test report in `junit` format do:
```bash
npm run test:junit
```

There is `mojaloop` convention to use `test/unit` path to keep tests. The placement of test folder should be similar to placement of tested code in `src` folder

### Jest Tips

The [Jest CLI](https://jestjs.io/docs/en/cli) has some powerful commands for filtering, watching and running tests

```bash
# run tests on just 1 file:
npm run test:unit -- -- test/unit/index.test.ts

# run tests on file change:
npm run test:unit -- --watch

# After the tests are run, you can configure the watch settings like so:
Ran all test suites related to changed files.

Watch Usage
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

## linting

[eslint](https://eslint.org/) setup compatible with javascript [standard](https://standardjs.com/) and dedicated for TypeScript [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint).
  - it is much more flexible
  - has good support for editors to visualize linting problem during typing.

To lint all files simply run
```bash
npm run lint
```

### linting & auto fixing via pre-commit `husky` hook
Committing untested and bad formatted code to repo is bad behavior, so we use [husky](https://www.npmjs.com/package/husky) integrated with [lint-staged](https://www.npmjs.com/package/lint-staged). 

There is defined `pre-commit` hook which runs linting only for staged files, so execution time is as fast as possible - only staged files are linted and if possible automatically fixed.

Corresponding excerpt from package.json:

```json
 "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:unit",
      "post-commit": "git update-index --again"
    }
  },
  "lint-staged": {
    "*.{js,ts}": "eslint --cache --fix"
  }
```

## Conventional commits:

> __Motivation:__
> 
> Using conventional commits helps standardize the format of commit messages and allows automatic generation of [CHANGELOG.md](../CHANGELOG.md) file.

See the available commands
```bash
npm run release -- --help
```

Generate the first release
```bash
npm run release -- --first-release
```

Generate a new release
```bash
npm run release
```

Generate a new minor release
```bash
npm run release -- --release-as minor
```

Generate an unnamed pre-release
```bash
npm run release -- --prerelase
```

Generate the named "alpha" pre-release
```bash
npm run release -- --prerelase alpha
```

## Docker setup
Minimal working Docker image you can find in [Dockerfile](../Dockerfile).

To build the image
```bash
npm run docker:build
```

To run the image with attached the log output to your terminal
```bash
npm run docker:run
```

When the image is run you should be able to reach the dockerized _thirdparty-api-adapter_ exposed on `http://localhost:3008`.

If you already added the `127.0.0.1 thirdparty-api-adapter.local` entry in your `/etc/hosts` then the _thirdparty-api-adapter_ is reachable on `http://thirdparty-api-adapter.local:3008`.

## `kafkacat` notes

[`kafkacat`](https://docs.confluent.io/current/app-development/kafkacat-usage.html#) is a simple kafka utility for inspecting and debugging what kafka is doing. To get started, run the `docker-local` `central-ledger` container:

```bash
cd /path/to/pisp/repo
cd ./docker-local
docker-compose up central-ledger
```

Give this some time to start, and then we can start playing around with kafkacat


### List topics

```bash
kafkacat -C -b localhost:9092 -L

# You should see a list like the following:
#
#  topic "topic-transfer-get" with 1 partitions:
#    partition 0, leader 0, replicas: 0, isrs: 0
#  topic "topic-transfer-position" with 1 partitions:
#    partition 0, leader 0, replicas: 0, isrs: 0
#  topic "topic-transfer-fulfil" with 1 partitions:
#    partition 0, leader 0, replicas: 0, isrs: 0
#  topic "topic-admin-transfer" with 1 partitions:
#    partition 0, leader 0, replicas: 0, isrs: 0
#  topic "topic-bulk-processing" with 1 partitions:
#    partition 0, leader 0, replicas: 0, isrs: 0
#  topic "topic-transfer-prepare" with 1 partitions:
#    partition 0, leader 0, replicas: 0, isrs: 0
# ...
```

### cat the `topic-transfer-fulfil` topic:

```bash
kafkacat -C -b localhost:9092 -t topic-transfer-fulfil
```

## Running the scratch integration tests

While we haven't fully set up integration tests for this repo, we have written some to test certain functions.

As above, start the `central-ledger` from `pisp/docker-local` to get kafka up and running

then:
```
npm run test:integation
```


## External Links

- [about conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [standard-version](https://github.com/conventional-changelog/standard-version)
- [conventional-changelog-config-spec](https://github.com/conventional-changelog/conventional-changelog-config-spec/tree/master/versions/2.1.0)



## Tips + Tricks:

### 1. How do I disable the event-sdk logging in my unit tests?

You can use the `EVENT_SDK_LOG_FILTER` environment variable. This setting is for configuring the internal config of the event-sdk, which isn't currently exposed to us in the `@mojaloop/central-services-shared` library.

e.g.
```bash
export EVENT_SDK_LOG_FILTER=""
npm run test:unit -- --watch

```

