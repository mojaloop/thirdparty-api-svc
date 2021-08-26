Feature: thirdparty-api-svc server

Scenario: CreateThirdpartyTransactionRequests
  Given thirdparty-api-svc server
  When I send a 'CreateThirdpartyTransactionRequests' request
  Then I get a response with a status code of '202'

Scenario: GetThirdpartyTransactionRequests
  Given thirdparty-api-svc server
  When I send a 'GetThirdpartyTransactionRequests' request
  Then I get a response with a status code of '202'

Scenario: UpdateThirdPartyTransactionRequests
  Given thirdparty-api-svc server
  When I send a 'UpdateThirdPartyTransactionRequests' request
  Then I get a response with a status code of '200'

Scenario: ThirdpartyTransactionRequestsError
  Given thirdparty-api-svc server
  When I send a 'ThirdpartyTransactionRequestsError' request
  Then I get a response with a status code of '200'

Scenario: NotifyThirdpartyTransactionRequests
 Given thirdparty-api-svc server
 When I send a 'NotifyThirdpartyTransactionRequests' request
 Then I get a response with a status code of '202'
