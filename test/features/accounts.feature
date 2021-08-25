Feature: thirdparty-api-svc server

Scenario: GetAccounts
  Given thirdparty-api-svc server
  When I send a 'GetAccounts' request
  Then I get a response with a status code of '202'

Scenario: UpdateAccounts
  Given thirdparty-api-svc server
  When I send a 'UpdateAccounts' request
  Then I get a response with a status code of '200'

Scenario: UpdateAccountsError
  Given thirdparty-api-svc server
  When I send a 'UpdateAccountsError' request
  Then I get a response with a status code of '200'
