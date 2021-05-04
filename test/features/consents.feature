Feature: thirdparty-api-adapters server

Scenario: PostConsents
  Given thirdparty-api-adapter server
  When I send a 'PostConsents' request
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

Scenario: NotifyErrorConsents
 Given thirdparty-api-adapter server
 When I send a 'NotifyErrorConsents' request
 Then I get a response with a status code of '200'
