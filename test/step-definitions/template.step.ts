import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '../../src/shared/config'

import ThirdPartyAPIAdapterService from '../../src/server'
import { Transactions } from '../../src/domain/thirdpartyRequests'
import MockData from '../unit/data/mockData.json';

const featurePath = path.join(__dirname, '../features/template.scenario.feature')
const feature = loadFeature(featurePath)

const mock_forwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mock_data = JSON.parse(JSON.stringify(MockData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('Health Check', ({ given, when, then }): void => {
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I get \'Health Check\' response', async (): Promise<ServerInjectResponse> => {
      const request = {
        method: 'GET',
        url: '/health'
      }
      response = await server.inject(request)
      return response
    })

    then('The status should be \'OK\'', (): void => {
      interface HealthResponse {
        status: string;
        uptime: number;
        startTime: string;
        versionNumber: string;
      }
      const healthResponse = response.result as HealthResponse
      expect(response.statusCode).toBe(200)
      expect(healthResponse.status).toEqual('OK')
      expect(healthResponse.uptime).toBeGreaterThan(1.0)
    })
  })

  test('Hello', ({ given, when, then }): void => {
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I get \'Hello\' response', async (): Promise<ServerInjectResponse> => {
      const request = {
        method: 'GET',
        url: '/hello'
      }
      response = await server.inject(request)
      return response
    })

    then('I see \'Hello world\'', (): void => {
      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({ hello: 'world' })
    })
  })

  test('CreateThirdpartyTransactionRequests', ({ given, when, then }): void => {
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I get \'CreateThirdpartyTransactionRequests\' response', async (): Promise<ServerInjectResponse> => {

      mock_forwardTransactionRequest.mockResolvedValueOnce()
      const reqHeaders = Object.assign(mock_data.transactionRequest.headers, {
        'date': 'Thu, 23 Jan 2020 10:22:12 GMT',
        'accept': 'application/json'
      })
      const request = {
        method: 'POST',
        url: '/thirdpartyRequests/transactions',
        headers: reqHeaders,
        payload: mock_data.transactionRequest.payload
      }
      response = await server.inject(request)
      return response
    })

    then('The status code should be \'202\'', (): void => {

      const expected: Array<any> = ['/thirdpartyRequests/transactions', expect.any(Object), 'POST', {}, mock_data.transactionRequest.payload]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mock_forwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })
  })
})
