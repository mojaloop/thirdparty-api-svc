import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import * as Consents from '~/domain/consents'
import TestData from 'test/unit/data/mockData.json'

const featurePath = path.join(__dirname, '../features/consents.feature')
const feature = loadFeature(featurePath)

const mockForwardConsentsRequest = jest.spyOn(Consents, 'forwardConsentsRequest')
const mockForwardConsentsIdRequest = jest.spyOn(Consents, 'forwardConsentsIdRequest')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('PostConsents', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentsPostRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'POST',
      url: '/consents',
      headers: reqHeaders,
      payload: mockData.consentsPostRequest.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'PostConsents\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentsRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '/consents',
        'TP_CB_URL_CONSENT_POST',
        expect.objectContaining(request.headers),
        'POST',
        mockData.consentsPostRequest.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateConsentTypeUnsigned', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentsIdPutRequestUnsigned.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/consents/40746639-1564-4e95-ad42-2fbceb3ba4a5',
      headers: reqHeaders,
      payload: mockData.consentsIdPutRequestUnsigned.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateConsent\' UpdateConsentTypeUnsigned request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '40746639-1564-4e95-ad42-2fbceb3ba4a5',
        '/consents/{{ID}}',
        'TP_CB_URL_CONSENT_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentsIdPutRequestUnsigned.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateConsentTypeSigned', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentsIdPutRequestSigned.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/consents/40746639-1564-4e95-ad42-2fbceb3ba4a5',
      headers: reqHeaders,
      payload: mockData.consentsIdPutRequestSigned.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateConsent\' UpdateConsentTypeSigned request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '40746639-1564-4e95-ad42-2fbceb3ba4a5',
        '/consents/{{ID}}',
        'TP_CB_URL_CONSENT_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentsIdPutRequestSigned.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('UpdateConsentTypeVerified', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentsIdPutRequestVerified.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'PUT',
      url: '/consents/40746639-1564-4e95-ad42-2fbceb3ba4a5',
      headers: reqHeaders,
      payload: mockData.consentsIdPutRequestVerified.payload
    }
    given('thirdparty-api-adapter server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'UpdateConsent\' UpdateConsentTypeVerified request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentsIdRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        '40746639-1564-4e95-ad42-2fbceb3ba4a5',
        '/consents/{{ID}}',
        'TP_CB_URL_CONSENT_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        mockData.consentsIdPutRequestVerified.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsIdRequest).toHaveBeenCalledWith(...expected)
    })
  })
})
