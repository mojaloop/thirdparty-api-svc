import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import { Transactions } from '~/domain/thirdpartyRequests'
import TestData from 'test/unit/data/mockData.json'

const featurePath = path.join(__dirname, '../features/transactionRequests.feature')
const feature = loadFeature(featurePath)

const mockForwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('CreateThirdpartyTransactionRequests', ({ given, when, then }): void => {
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I get \'CreateThirdpartyTransactionRequests\' response', async (): Promise<ServerInjectResponse> => {
      mockForwardTransactionRequest.mockResolvedValueOnce()
      const reqHeaders = {
        ...mockData.transactionRequest.headers,
        date: 'Thu, 23 Jan 2020 10:22:12 GMT',
        accept: 'application/json'
      }
      const request = {
        method: 'POST',
        url: '/thirdpartyRequests/transactions',
        headers: reqHeaders,
        payload: mockData.transactionRequest.payload
      }
      response = await server.inject(request)
      return response
    })

    then('The status code should be \'202\'', (): void => {
      const expected = ['/thirdpartyRequests/transactions', expect.any(Object), 'POST', {},
        mockData.transactionRequest.payload]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })
  })
})
