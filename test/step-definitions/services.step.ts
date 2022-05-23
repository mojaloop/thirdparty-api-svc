import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import * as Services from '~/domain/services'
import * as TestData from 'test/unit/data/mockData'

const featurePath = path.join(__dirname, '../features/services.feature')
const feature = loadFeature(featurePath)

const mockForwardGetServicesServiceTypeRequestToProviderService = jest.spyOn(
  Services,
  'forwardGetServicesServiceTypeRequestToProviderService'
)
const mockForwardGetServicesServiceTypeRequestFromProviderService = jest.spyOn(
  Services,
  'forwardGetServicesServiceTypeRequestFromProviderService'
)
const mockForwardServicesServiceTypeRequestError = jest.spyOn(Services, 'forwardServicesServiceTypeRequestError')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('GetServicesByServiceType', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.getServicesByServiceTypeRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/vnd.interoperability.services+json;version=1.0',
      'content-type': 'application/vnd.interoperability.service+json;version=1.0'
    }
    const request = {
      method: 'GET',
      url: '/services/THIRD_PARTY_DFSP',
      headers: reqHeaders
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when("I send a 'GetServicesByServiceType' request", async (): Promise<ServerInjectResponse> => {
      mockForwardGetServicesServiceTypeRequestToProviderService.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then("I get a response with a status code of '202'", (): void => {
      const expected = [
        '/services/{{ServiceType}}',
        expect.objectContaining(request.headers),
        'GET',
        'THIRD_PARTY_DFSP',
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardGetServicesServiceTypeRequestToProviderService).toHaveBeenCalledWith(...expected)
    })
  })

  test('PutServicesByServiceType', ({ given, when, then }): void => {
    const request = {
      method: 'PUT',
      url: '/services/THIRD_PARTY_DFSP',
      headers: {
        'content-type': 'application/vnd.interoperability.service+json;version=1.0',
        date: new Date().toISOString(),
        ...mockData.putServicesByServiceTypeRequest.headers
      },
      payload: mockData.putServicesByServiceTypeRequest.payload
    }

    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when("I send a 'PutServicesByServiceType' request", async (): Promise<ServerInjectResponse> => {
      mockForwardGetServicesServiceTypeRequestFromProviderService.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then("I get a response with a status code of '200'", (): void => {
      const expected = [
        '/services/{{ServiceType}}',
        'TP_CB_URL_SERVICES_PUT',
        expect.objectContaining(request.headers),
        'PUT',
        'THIRD_PARTY_DFSP',
        request.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardGetServicesServiceTypeRequestFromProviderService).toHaveBeenCalledWith(...expected)
    })
  })

  test('PutServicesByIdAndError', ({ given, when, then }): void => {
    const servicesRequestError = mockData.putServicesByServiceTypeRequestError
    const reqHeaders = Object.assign(servicesRequestError.headers, {
      date: 'Tue, 02 Mar 2021 10:10:10 GMT',
      'content-type': 'application/vnd.interoperability.service+json;version=1.0'
    })
    const request = {
      method: 'PUT',
      url: '/services/THIRD_PARTY_DFSP/error',
      headers: reqHeaders,
      payload: servicesRequestError.payload
    }

    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when("I send a 'PutServicesByIdAndError' request", async (): Promise<ServerInjectResponse> => {
      mockForwardServicesServiceTypeRequestError.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then("I get a response with a status code of '200'", (): void => {
      const expected = [
        '/services/{{ServiceType}}/error',
        expect.objectContaining(request.headers),
        'THIRD_PARTY_DFSP',
        request.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardServicesServiceTypeRequestError).toHaveBeenCalledWith(...expected)
    })
  })
})
