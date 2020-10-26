import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import { Transactions, Authorizations } from '~/domain/thirdpartyRequests'
import TestData from 'test/unit/data/mockData.json'

const featurePath = path.join(__dirname, '../features/transactionRequests.feature')
const feature = loadFeature(featurePath)

const mockForwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mockForwardTransactionRequestError = jest.spyOn(Transactions, 'forwardTransactionRequestError')
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
      accept: 'application/json'
    }
    const request = {
      method: 'POST',
      url: '/thirdpartyRequests/transactions',
      headers: reqHeaders,
      payload: mockData.transactionRequest.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'CreateThirdpartyTransactionRequests\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardTransactionRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

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

  test('CreateThirdpartyTransactionRequestAuthorization', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.transactionRequest.headers,
      date: (new Date()).toISOString(),
      'fspiop-source': 'dfspA',
      'fspiop-destination': 'dfspA',
      accept: 'application/json'
    }
    const request = {
      method: 'POST',
      url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
      headers: reqHeaders,
      payload: {
        challenge: '12345',
        value: '12345',
        consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
        sourceAccountId: 'dfspa.alice.1234',
        status: 'PENDING'
      }
    }

    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'CreateThirdpartyTransactionRequestAuthorization\' request',
      async (): Promise<ServerInjectResponse> => {
        mockForwardAuthorizationRequest.mockResolvedValueOnce()
        response = await server.inject(request)
        return response
      })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
        expect.objectContaining(request.headers),
        'POST',
        '7d34f91d-d078-4077-8263-2c047876fcf6',
        request.payload,
        expect.any(Object)
      ]

      expect(response.result).toBeNull()
      expect(response.statusCode).toBe(202)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateThirdpartyAuthorization', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.transactionRequest.headers,
      date: (new Date()).toISOString(),
      'fspiop-source': 'dfspA',
      'fspiop-destination': 'dfspA',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
      headers: reqHeaders,
      payload: {
        challenge: '12345',
        value: '12345',
        consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
        sourceAccountId: 'dfspa.alice.1234',
        status: 'VERIFIED'
      }
    }

    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateThirdpartyAuthorization\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardAuthorizationRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        '7d34f91d-d078-4077-8263-2c047876fcf6',
        request.payload,
        expect.any(Object)
      ]

      expect(response.result).toBeNull()
      expect(response.statusCode).toBe(200)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('GetThirdpartyTransactionRequests', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.transactionRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'GET',
      url: '/thirdpartyRequests/transactions/67fff06f-2380-4403-ba35-f97b6a4250a1',
      headers: reqHeaders,
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'GetThirdpartyTransactionRequests\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardTransactionRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_GET',
        expect.objectContaining(request.headers),
        'GET',
        { "ID": "67fff06f-2380-4403-ba35-f97b6a4250a1" },
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
      date: (new Date()).toISOString(),
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/thirdpartyRequests/transactions/b37605f7-bcd9-408b-9291-6c554aa4c802',
      headers: reqHeaders,
      payload: mockData.updateTransactionRequest.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateThirdPartyTransactionRequests\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardTransactionRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        { "ID": "b37605f7-bcd9-408b-9291-6c554aa4c802" },
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
      accept: 'application/json'
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
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'ThirdpartyTransactionRequestsError\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardTransactionRequestError.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

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
})
