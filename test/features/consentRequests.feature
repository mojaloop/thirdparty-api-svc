Feature: thirdparty-api-svcs server

Scenario: CreateConsentRequest
  Given thirdparty-api-svc server
  When I send a 'CreateConsentRequest' request
  Then I get a response with a status code of '202'

Scenario: UpdateConsentRequestTypeWeb
  Given thirdparty-api-svc server
  When I send a 'UpdateConsentRequestType' ConsentRequestsIDPutResponseWeb request
  Then I get a response with a status code of '202'

Scenario: UpdateConsentRequestTypeOTP
 Given thirdparty-api-svc server
 When I send a 'UpdateConsentRequestType' ConsentRequestsIDPutResponseOTP request
 Then I get a response with a status code of '202'

Scenario: PatchConsentRequest
 Given thirdparty-api-svc server
 When I send a 'PatchConsentRequest' request
 Then I get a response with a status code of '202'

Scenario: NotifyErrorConsentRequests
 Given thirdparty-api-svc server
 When I send a 'NotifyErrorConsentRequests' request
 Then I get a response with a status code of '200'
