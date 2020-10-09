# Changelog: [mojaloop/thirdparty-api-adapter](https://github.com/mojaloop/thirdparty-api-adapter)
## [11.9.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.8.4...v11.9.0) (2020-10-09)


### Features

* add put consents/{ID} handler ([#38](https://github.com/mojaloop/thirdparty-api-adapter/issues/38)) ([38b6c23](https://github.com/mojaloop/thirdparty-api-adapter/commit/38b6c2392454c1359194412ba393b5979da42ddd))

### [11.8.4](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.8.3...v11.8.4) (2020-10-08)

### [11.8.3](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.8.2...v11.8.3) (2020-10-05)


### Code Refactor

* refactor getEndpoint and render ([#36](https://github.com/mojaloop/thirdparty-api-adapter/issues/36)) ([64a810c](https://github.com/mojaloop/thirdparty-api-adapter/commit/64a810c1b2fbf84c73128527e876fc4aea965f31))

### [11.8.2](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.8.1...v11.8.2) (2020-10-01)


### Bug Fixes

* **ci:** publish step missing image cache ([#35](https://github.com/mojaloop/thirdparty-api-adapter/issues/35)) ([7e687a0](https://github.com/mojaloop/thirdparty-api-adapter/commit/7e687a0b236c07eb1619c86a168f0f372d4b2029))

### [11.8.1](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.8.0...v11.8.1) (2020-10-01)


### Bug Fixes

* **ci:** remove license scan and image scan since we can't prune the devDepencencies ([#34](https://github.com/mojaloop/thirdparty-api-adapter/issues/34)) ([666a6f9](https://github.com/mojaloop/thirdparty-api-adapter/commit/666a6f9ffaffb0ba8965cbfa38418db24eea8b3c))
* **dockerfile:** remove npm prune step ([#33](https://github.com/mojaloop/thirdparty-api-adapter/issues/33)) ([d281ae0](https://github.com/mojaloop/thirdparty-api-adapter/commit/d281ae022f5d2f2936082cf7daf4266c1cb21339))

## [11.8.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.7.0...v11.8.0) (2020-09-30)


### Features

* add post consents handler ([#32](https://github.com/mojaloop/thirdparty-api-adapter/issues/32)) ([fca9418](https://github.com/mojaloop/thirdparty-api-adapter/commit/fca94181437c129c91cdf5a4cff44ca091c7db81))

## [11.7.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.6.4...v11.7.0) (2020-09-28)


### Features

* add post consentRequests and put consentsRequests/{ID} handler ([#31](https://github.com/mojaloop/thirdparty-api-adapter/issues/31)) ([fde0076](https://github.com/mojaloop/thirdparty-api-adapter/commit/fde00768fadb7e00a483d4db58ef0382e502cb97))

### [11.6.4](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.6.3...v11.6.4) (2020-09-18)


### Code Refactor

* change event notification to use patch endpoint and template ([#30](https://github.com/mojaloop/thirdparty-api-adapter/issues/30)) ([1cda15e](https://github.com/mojaloop/thirdparty-api-adapter/commit/1cda15e62be71fa9861c8e70d3c5a401daf001c3))

### [11.6.3](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.6.2...v11.6.3) (2020-09-18)


### Maintenance

* add thirdparty request patch endpoint ([#29](https://github.com/mojaloop/thirdparty-api-adapter/issues/29)) ([609f930](https://github.com/mojaloop/thirdparty-api-adapter/commit/609f930e549a0a46e278c6250117c4b1332198d8))

### [11.6.2](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.6.1...v11.6.2) (2020-09-14)


### Code Refactor

* decode notification payload ([#28](https://github.com/mojaloop/thirdparty-api-adapter/issues/28)) ([e9d8035](https://github.com/mojaloop/thirdparty-api-adapter/commit/e9d80353c448949747615d06bc01bc0f0a737cee))

### [11.6.1](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.6.0...v11.6.1) (2020-09-14)


### Bug Fixes

* **types:** clean up `canonical-json` types in ambient.d.ts ([#27](https://github.com/mojaloop/thirdparty-api-adapter/issues/27)) ([71100e2](https://github.com/mojaloop/thirdparty-api-adapter/commit/71100e29328cf5cf7bbb453a1565f71301f1c1a8))

## [11.6.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.5.0...v11.6.0) (2020-09-14)


### Features

* add notification patch forwarding ([#26](https://github.com/mojaloop/thirdparty-api-adapter/issues/26)) ([82cf72e](https://github.com/mojaloop/thirdparty-api-adapter/commit/82cf72e5d3e2951ef6d9fdbc44f76eab33d9c35d))

## [11.5.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.4.0...v11.5.0) (2020-09-10)


### Features

* **event_server:** add an event server to handle kafka events ([#25](https://github.com/mojaloop/thirdparty-api-adapter/issues/25)) ([f83dfc8](https://github.com/mojaloop/thirdparty-api-adapter/commit/f83dfc8c351af541faae432b0048e5f4cecd8309))

## [11.4.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.3.0...v11.4.0) (2020-09-09)


### Features

* **consumer:** scratch integration tests to verify everything is working ([#23](https://github.com/mojaloop/thirdparty-api-adapter/issues/23)) ([7965c36](https://github.com/mojaloop/thirdparty-api-adapter/commit/7965c3691c522d8471e4b6554a2a0f69b31777fc))

## [11.3.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.2.1...v11.3.0) (2020-09-09)


### Features

* **consumer:** kafka consumer wrapper class ([#22](https://github.com/mojaloop/thirdparty-api-adapter/issues/22)) ([408ca1c](https://github.com/mojaloop/thirdparty-api-adapter/commit/408ca1c5df89208a7be3d1b9a745d3cd391632ca))

### [11.2.1](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.2.0...v11.2.1) (2020-09-02)


### Code Refactor

* change endpoint names ([#20](https://github.com/mojaloop/thirdparty-api-adapter/issues/20)) ([e053fa9](https://github.com/mojaloop/thirdparty-api-adapter/commit/e053fa911eb0b7f5a2029a15c0a2ed13599b2372))

## [11.2.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.1.1...v11.2.0) (2020-08-20)


### Features

* **endpoints:** Inbound PUT authorizations handler  ([#19](https://github.com/mojaloop/thirdparty-api-adapter/issues/19)) ([5ad72be](https://github.com/mojaloop/thirdparty-api-adapter/commit/5ad72be095b18f9fa385eae49d960e079d9d3dbd))

### [11.1.1](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.1.0...v11.1.1) (2020-08-13)


### Maintenance

* **circleci:** change scans to be release prerequisite ([#18](https://github.com/mojaloop/thirdparty-api-adapter/issues/18)) ([65f210f](https://github.com/mojaloop/thirdparty-api-adapter/commit/65f210f355af14e28bf5b303eae6e37c443c2be9))

## [11.1.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v11.0.0...v11.1.0) (2020-08-13)


### Features

* **endpoints:** Inbound authorizations handler ([#16](https://github.com/mojaloop/thirdparty-api-adapter/issues/16)) ([b47f4ba](https://github.com/mojaloop/thirdparty-api-adapter/commit/b47f4ba92212bf34881ddf5a4bc11749cf606c5b))

## [11.0.0](https://github.com/mojaloop/thirdparty-api-adapter/compare/v10.4.2...v11.0.0) (2020-08-13)


### ⚠ BREAKING CHANGES

* **circleci:** change release step machine (#17)

### Features

* **circleci:** add steps to circleci to automate github release ([#15](https://github.com/mojaloop/thirdparty-api-adapter/issues/15)) ([87da307](https://github.com/mojaloop/thirdparty-api-adapter/commit/87da307f973c523c4eb38e8572362209fa8c8e33))
* **commits:** added linter to enforce conventional commit messages ([#13](https://github.com/mojaloop/thirdparty-api-adapter/issues/13)) ([2c3ad43](https://github.com/mojaloop/thirdparty-api-adapter/commit/2c3ad43607f8c2d7698e7f7107574bb00c47e517))


### Bug Fixes

* **circleci:** change release step machine ([#17](https://github.com/mojaloop/thirdparty-api-adapter/issues/17)) ([52f4835](https://github.com/mojaloop/thirdparty-api-adapter/commit/52f4835611f5d760a3a7faf0a12fa6729503fcbc))

### 10.4.1 (2020-06-22)


### Features

* **thirdparty-api.yaml:**  OpenAPI specification for thirdparty-api-adapter ([ab274c1](https://github.com/mojaloop/thirdparty-api-adapter/commit/ab274c16ec20f32538425b6e53d4fe727eba1475))

## 10.4.0 (2020-06-15)
