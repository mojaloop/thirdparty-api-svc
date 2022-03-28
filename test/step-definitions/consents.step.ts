import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import * as Consents from '~/domain/consents'
import * as TestData from 'test/unit/data/mockData'

const featurePath = path.join(__dirname, '../features/consents.feature')
const feature = loadFeature(featurePath)

const mockForwardConsentsRequest = jest.spyOn(Consents, 'forwardConsentsRequest')
const mockForwardConsentsIdRequest = jest.spyOn(Consents, 'forwardConsentsIdRequest')
const mockForwardConsentsIdRequestError = jest.spyOn(Consents, 'forwardConsentsIdRequestError')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('PostConsents PISP', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentsPostRequestPISP.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'POST',
      url: '/consents',
      headers: reqHeaders,
      payload: mockData.consentsPostRequestPISP.payload
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'PostConsents PISP\' request', async (): Promise<ServerInjectResponse> => {
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
        mockData.consentsPostRequestPISP.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsRequest).toHaveBeenCalledWith(...expected)
    })
  })

  test('PostConsents AUTH', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentsPostRequestAUTH.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'POST',
      url: '/consents',
      headers: reqHeaders,
      payload: mockData.consentsPostRequestAUTH.payload
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'PostConsents AUTH\' request', async (): Promise<ServerInjectResponse> => {
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
        mockData.consentsPostRequestAUTH.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsRequest).toHaveBeenCalledWith(...expected)
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
    given('thirdparty-api-svc server', async (): Promise<Server> => {
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
    given('thirdparty-api-svc server', async (): Promise<Server> => {
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

  test('NotifyErrorConsents', ({ given, when, then }): void => {
    const consentsError = mockData.genericThirdpartyError
    const reqHeaders = Object.assign(consentsError.headers, {
      date: 'Tue, 02 Mar 2021 10:10:10 GMT',
      accept: 'application/json'
    })
    const request = {
      method: 'PUT',
      url: '/consents/b82348b9-81f6-42ea-b5c4-80667d5740fe/error',
      headers: reqHeaders,
      payload: consentsError.payload
    }

    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'NotifyErrorConsents\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentsIdRequestError.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'200\'', (): void => {
      const expected = [
        '/consents/{{ID}}/error',
        'b82348b9-81f6-42ea-b5c4-80667d5740fe',
        expect.objectContaining(request.headers),
        request.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsIdRequestError).toHaveBeenCalledWith(...expected)
    })
  })
})
