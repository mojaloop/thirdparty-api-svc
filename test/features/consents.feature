Feature: thirdparty-api-adapters server

Scenario: CreateConsent
  Given thirdparty-api-adapter server
  When I send a 'CreateConsent' request
  Then I get a response with a status code of '202'
