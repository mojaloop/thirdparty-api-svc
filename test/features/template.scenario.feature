Feature: thirdparty-api-adapter server

Scenario: Health Check
  Given thirdparty-api-adapter server
  When I get 'Health Check' response
  Then The status should be 'OK'

Scenario: Hello
  Given thirdparty-api-adapter server
  When I get 'Hello' response
  Then I see 'Hello world'

Scenario: CreateThirdpartyTransactionRequests
  Given thirdparty-api-adapter server
  When I get 'CreateThirdpartyTransactionRequests' response
  Then The status code should be '202'