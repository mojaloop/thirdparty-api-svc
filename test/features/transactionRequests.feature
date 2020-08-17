Feature: thirdparty-api-adapter server

Scenario: CreateThirdpartyTransactionRequests
  Given thirdparty-api-adapter server
  When I send a 'CreateThirdpartyTransactionRequests' request
  Then I get a response with a status code of '202'

Scenario: CreateThirdpartyTransactionRequestAuthorization
  Given thirdparty-api-adapter server
  When I send a 'CreateThirdpartyTransactionRequestAuthorization' request
  Then I get a response with a status code of '202'

Scenario: UpdateThirdpartyAuthorization
  Given thirdparty-api-adapter server
  When I send a 'UpdateThirdpartyAuthorization' request
  Then I get a response with a status code of '202'