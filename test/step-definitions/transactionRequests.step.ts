import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import { Transactions, Authorizations } from '~/domain/thirdpartyRequests'
import * as TestData from 'test/unit/data/mockData'

const featurePath = path.join(__dirname, '../features/transactionRequests.feature')
const feature = loadFeature(featurePath)

const mockForwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mockForwardTransactionRequestError = jest.spyOn(
  Transactions,
  'forwardTransactionRequestError'
)
const mockForwardAuthorizationRequest = jest.spyOn(Authorizations, 'forwardAuthorizationRequest')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('CreateThirdpartyTransactionRequests', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.transactionRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
      'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
    }
    const request = {
      method: 'POST',
      url: '/thirdpartyRequests/transactions',
      headers: reqHeaders,
      payload: mockData.transactionRequest.payload
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when(
      'I send a \'CreateThirdpartyTransactionRequests\' request',
      async (): Promise<ServerInjectResponse> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        response = await server.inject(request)
        return response
      }
    )

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions',
        'TP_CB_URL_TRANSACTION_REQUEST_POST',
        expect.objectContaining(request.headers),
        'POST',
        {},
        mockData.transactionRequest.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('GetThirdpartyTransactionRequests', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.transactionRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
      'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
    }
    const request = {
      method: 'GET',
      url: '/thirdpartyRequests/transactions/67fff06f-2380-4403-ba35-f97b6a4250a1',
      headers: reqHeaders
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when(
      'I send a \'GetThirdpartyTransactionRequests\' request',
      async (): Promise<ServerInjectResponse> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        response = await server.inject(request)
        return response
      }
    )

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_GET',
        expect.objectContaining(request.headers),
        'GET',
        { ID: '67fff06f-2380-4403-ba35-f97b6a4250a1' },
        undefined,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateThirdPartyTransactionRequests', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.updateTransactionRequest.headers,
      date: new Date().toISOString(),
      'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
    }
    const request = {
      method: 'PUT',
      url: '/thirdpartyRequests/transactions/b37605f7-bcd9-408b-9291-6c554aa4c802',
      headers: reqHeaders,
      payload: mockData.updateTransactionRequest.payload
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when(
      'I send a \'UpdateThirdPartyTransactionRequests\' request',
      async (): Promise<ServerInjectResponse> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        response = await server.inject(request)
        return response
      }
    )

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        { ID: 'b37605f7-bcd9-408b-9291-6c554aa4c802' },
        request.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('ThirdpartyTransactionRequestsError', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.transactionRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
    }
    const request = {
      method: 'PUT',
      url: '/thirdpartyRequests/transactions/67fff06f-2380-4403-ba35-f97b6a4250a1/error',
      headers: reqHeaders,
      payload: {
        errorInformation: {
          errorCode: '6000',
          errorDescription: 'Generic third party error',
          extensionList: {
            extension: [
              {
                key: 'test',
                value: 'test'
              }
            ]
          }
        }
      }
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when(
      'I send a \'ThirdpartyTransactionRequestsError\' request',
      async (): Promise<ServerInjectResponse> => {
        mockForwardTransactionRequestError.mockResolvedValueOnce()
        response = await server.inject(request)
        return response
      }
    )

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        expect.objectContaining(request.headers),
        '/thirdpartyRequests/transactions/{{ID}}/error',
        'PUT',
        '67fff06f-2380-4403-ba35-f97b6a4250a1',
        request.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardTransactionRequestError).toHaveBeenCalledWith(...expected)
    })
  })

  test('NotifyThirdpartyTransactionRequests', ({ given, when, then }): void => {
    const patchTPTransactionIdRequest = mockData.patchThirdpartyTransactionIdRequest
    const reqHeaders = Object.assign(patchTPTransactionIdRequest.headers, {
      date: 'Tue, 02 Mar 2021 10:10:10 GMT',
      accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
      'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
    })
    const request = {
      method: 'PATCH',
      url: '/thirdpartyRequests/transactions/b82348b9-81f6-42ea-b5c4-80667d5740fe',
      headers: reqHeaders,
      payload: patchTPTransactionIdRequest.payload
    }

    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when(
      'I send a \'NotifyThirdpartyTransactionRequests\' request',
      async (): Promise<ServerInjectResponse> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        response = await server.inject(request)
        return response
      }
    )

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_PATCH',
        expect.objectContaining(request.headers),
        'PATCH',
        { ID: 'b82348b9-81f6-42ea-b5c4-80667d5740fe' },
        request.payload,
        undefined
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })
  })
})
