Feature: thirdparty-api-svcs server

Scenario: PostConsents PISP
  Given thirdparty-api-svc server
  When I send a 'PostConsents PISP' request
  Then I get a response with a status code of '202'

Scenario: PostConsents AUTH
  Given thirdparty-api-svc server
  When I send a 'PostConsents AUTH' request
  Then I get a response with a status code of '202'

Scenario: UpdateConsentTypeSigned
 Given thirdparty-api-svc server
 When I send a 'UpdateConsent' UpdateConsentTypeSigned request
 Then I get a response with a status code of '202'

Scenario: UpdateConsentTypeVerified
 Given thirdparty-api-svc server
 When I send a 'UpdateConsent' UpdateConsentTypeVerified request
 Then I get a response with a status code of '202'

Scenario: NotifyErrorConsents
 Given thirdparty-api-svc server
 When I send a 'NotifyErrorConsents' request
 Then I get a response with a status code of '200'
