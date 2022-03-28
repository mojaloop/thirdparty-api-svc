import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import * as Accounts from '~/domain/accounts'
import * as TestData from 'test/unit/data/mockData'

const featurePath = path.join(__dirname, '../features/accounts.feature')
const feature = loadFeature(featurePath)

const mockForwardAccountsIdRequest = jest.spyOn(Accounts, 'forwardAccountsIdRequest')
const mockForwardAccountsIdRequestError = jest.spyOn(Accounts, 'forwardAccountsIdRequestError')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('GetAccounts', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.accountsRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
      'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
    }
    const request = {
      method: 'GET',
      url: '/accounts/username1234',
      headers: reqHeaders
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'GetAccounts\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardAccountsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/accounts/{{ID}}',
        'TP_CB_URL_ACCOUNTS_GET',
        expect.objectContaining(request.headers),
        'GET',
        'username1234',
        undefined,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateAccounts', ({ given, when, then }): void => {
    const request = {
      method: 'PUT',
      url: '/accounts/username1234',
      headers: {
        'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
        date: (new Date()).toISOString(),
        ...mockData.accountsRequest.headers
      },
      payload: {
        ...mockData.accountsRequest.payload
      }
    }

    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateAccounts\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardAccountsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        '/accounts/{{ID}}',
        'TP_CB_URL_ACCOUNTS_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        'username1234',
        request.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateAccountsError', ({ given, when, then }): void => {
    const acctRequestError = mockData.accountsRequestError
    const reqHeaders = Object.assign(acctRequestError.headers, {
      date: 'Tue, 02 Mar 2021 10:10:10 GMT',
      'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
    })
    const request = {
      method: 'PUT',
      url: '/accounts/username1234/error',
      headers: reqHeaders,
      payload: acctRequestError.payload
    }

    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateAccountsError\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardAccountsIdRequestError.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        '/accounts/{{ID}}/error',
        expect.objectContaining(request.headers),
        'username1234',
        request.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardAccountsIdRequestError).toHaveBeenCalledWith(...expected)
    })
  })
})
