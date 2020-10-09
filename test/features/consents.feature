Feature: thirdparty-api-adapters server

Scenario: CreateConsent
  Given thirdparty-api-adapter server
  When I send a 'CreateConsent' request
  Then I get a response with a status code of '202'

Scenario: UpdateConsentTypeUnsigned
  Given thirdparty-api-adapter server
  When I send a 'UpdateConsent' UpdateConsentTypeUnsigned request
  Then I get a response with a status code of '202'

Scenario: UpdateConsentTypeSigned
 Given thirdparty-api-adapter server
 When I send a 'UpdateConsent' UpdateConsentTypeSigned request
 Then I get a response with a status code of '202'

Scenario: UpdateConsentTypeVerified
 Given thirdparty-api-adapter server
 When I send a 'UpdateConsent' UpdateConsentTypeVerified request
 Then I get a response with a status code of '202'
