Feature: thirdparty-api-adapter server

Scenario: Health Check
  Given thirdparty-api-adapter server
  When I get 'Health Check' response
  Then The status should be 'OK'
