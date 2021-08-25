Feature: thirdparty-api-svc server

Scenario: Health Check
  Given thirdparty-api-svc server
  When I get 'Health Check' response
  Then The status should be 'OK'
