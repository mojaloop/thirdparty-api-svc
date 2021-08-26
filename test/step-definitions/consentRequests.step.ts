import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import * as ConsentRequests from '~/domain/consentRequests'
import TestData from 'test/unit/data/mockData.json'

const featurePath = path.join(__dirname, '../features/consentRequests.feature')
const feature = loadFeature(featurePath)

const mockForwardConsentRequestsRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsRequest')
const mockForwardConsentRequestsIdRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsIdRequest')
const mockForwardConsentRequestsIdErrorRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsIdRequestError')
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
    given('thirdparty-api-svc server', async (): Promise<Server> => {
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
    given('thirdparty-api-svc server', async (): Promise<Server> => {
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
        'b82348b9-81f6-42ea-b5c4-80667d5740fe',
        '/consentRequests/{{ID}}',
        'TP_CB_URL_CONSENT_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentRequestsPutRequestWeb.payload,
        expect.any(Object)
      ]

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
    given('thirdparty-api-svc server', async (): Promise<Server> => {
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
        'b82348b9-81f6-42ea-b5c4-80667d5740fe',
        '/consentRequests/{{ID}}',
        'TP_CB_URL_CONSENT_REQUEST_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentRequestsPutRequestOTP.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('PatchConsentRequest', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentRequestsPatch.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PATCH',
      url: '/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe',
      headers: reqHeaders,
      payload: mockData.consentRequestsPatch.payload
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'PatchConsentRequest\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        'b82348b9-81f6-42ea-b5c4-80667d5740fe',
        '/consentRequests/{{ID}}',
        'TP_CB_URL_CONSENT_REQUEST_PATCH',
        expect.objectContaining(request.headers),
        'PATCH',
        mockData.consentRequestsPatch.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('NotifyErrorConsentRequests', ({ given, when, then }): void => {

    const consentRequestsError = mockData.genericThirdpartyError
    const reqHeaders = Object.assign(consentRequestsError.headers, {
      date: 'Tue, 02 Mar 2021 10:10:10 GMT',
      accept: 'application/json'
    })
    const request = {
      method: 'PUT',
      url: '/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error',
      headers: reqHeaders,
      payload: consentRequestsError.payload
    }

    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'NotifyErrorConsentRequests\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentRequestsIdErrorRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        '/consentRequests/{{ID}}/error',
        'b82348b9-81f6-42ea-b5c4-80667d5740fe',
        expect.objectContaining(request.headers),
        request.payload,
        undefined
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardConsentRequestsIdErrorRequest).toHaveBeenCalledWith(...expected)
    })
  })
})
