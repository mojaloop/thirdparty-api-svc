Feature: thirdparty-api-svcs server

Scenario: GenerateChallengeRequest
  Given thirdparty-api-svc server
  When I send a 'GenerateChallengeRequest' request
  Then I get a response with a status code of '202'
