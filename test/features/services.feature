Feature: thirdparty-api-svc server

Scenario: GetServicesByServiceType
  Given thirdparty-api-svc server
  When I send a 'GetServicesByServiceType' request
  Then I get a response with a status code of '202'

Scenario: PutServicesByServiceType
  Given thirdparty-api-svc server
  When I send a 'PutServicesByServiceType' request
  Then I get a response with a status code of '200'

Scenario: PutServicesByIdAndError
  Given thirdparty-api-svc server
  When I send a 'PutServicesByIdAndError' request
  Then I get a response with a status code of '200'
