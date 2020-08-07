Feature: thirdparty-api-adapter server

Scenario: CreateThirdpartyTransactionRequests
  Given thirdparty-api-adapter server
  When I get 'CreateThirdpartyTransactionRequests' response
  Then The status code should be '202'

