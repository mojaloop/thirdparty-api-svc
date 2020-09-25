import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import * as ConsentRequests from '~/domain/consentRequests'
import { ConsentRequestsId } from '~/domain/consentRequests/'
import TestData from 'test/unit/data/mockData.json'

const featurePath = path.join(__dirname, '../features/consentRequests.feature')
const feature = loadFeature(featurePath)

const mockForwardConsentRequestsRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsRequest')
const mockForwardConsentRequestsIdRequest = jest.spyOn(ConsentRequestsId, 'forwardConsentRequestsIdRequest')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('CreateConsentRequest', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentRequestsPostRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'POST',
      url: '/consentRequests',
      headers: reqHeaders,
      payload: mockData.consentRequestsPostRequest.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'CreateConsentRequest\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentRequestsRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/consentRequests',
        'TP_CB_URL_CONSENT_REQUEST_POST',
        expect.objectContaining(request.headers),
        'POST',
        mockData.consentRequestsPostRequest.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateConsentRequestTypeWeb', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentRequestsPutRequestWeb.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe',
      headers: reqHeaders,
      payload: mockData.consentRequestsPutRequestWeb.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateConsentRequestType\' ConsentRequestsIDPutResponseWeb request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        mockData.consentRequestsPutRequestWeb.payload.id,
        '/consentRequests/{{ID}}',
        'TP_CB_URL_CONSENT_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentRequestsPutRequestWeb.payload,
        undefined
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateConsentRequestTypeWebAuth', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentRequestsPutRequestWebAuth.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe',
      headers: reqHeaders,
      payload: mockData.consentRequestsPutRequestWebAuth.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateConsentRequestType\' ConsentRequestsIDPutResponseWebAuth request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        mockData.consentRequestsPutRequestWebAuth.payload.id,
        '/consentRequests/{{ID}}',
        'TP_CB_URL_CONSENT_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentRequestsPutRequestWebAuth.payload,
        undefined
      ]
      console.log(response)
      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateConsentRequestTypeOTP', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentRequestsPutRequestOTP.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe',
      headers: reqHeaders,
      payload: mockData.consentRequestsPutRequestOTP.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateConsentRequestType\' ConsentRequestsIDPutResponseOTP request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        mockData.consentRequestsPutRequestOTP.payload.id,
        '/consentRequests/{{ID}}',
        'TP_CB_URL_CONSENT_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentRequestsPutRequestOTP.payload,
        undefined
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateConsentRequestTypeOTPAuth', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentRequestsPutRequestOTPAuth.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe',
      headers: reqHeaders,
      payload: mockData.consentRequestsPutRequestOTPAuth.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateConsentRequestType\' ConsentRequestsIDPutResponseOTPAuth request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        mockData.consentRequestsPutRequestOTPAuth.payload.id,
        '/consentRequests/{{ID}}',
        'TP_CB_URL_CONSENT_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentRequestsPutRequestOTPAuth.payload,
        undefined
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

})

