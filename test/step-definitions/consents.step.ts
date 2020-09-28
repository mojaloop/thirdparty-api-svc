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
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('CreateConsent', ({ given, when, then }): void => {
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

    when('I send a \'CreateConsent\' request', async (): Promise<ServerInjectResponse> => {
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
        undefined
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsRequest).toHaveBeenCalledWith(...expected)
    })
  })
})
