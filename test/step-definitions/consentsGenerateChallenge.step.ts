import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/shared/config'

import ThirdPartyAPIAdapterService from '~/server'
import * as Consents from '~/domain/consents'
import TestData from 'test/unit/data/mockData.json'

const featurePath = path.join(__dirname, '../features/consentsGenerateChallenge.feature')
const feature = loadFeature(featurePath)

const mockForwardConsentsIdGenerateChallengeRequest = jest.spyOn(Consents, 'forwardConsentsIdGenerateChallengeRequest')
const mockData = JSON.parse(JSON.stringify(TestData))

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('GenerateChallengeRequest', ({ given, when, then }): void => {
    const reqHeaders = {
      ...mockData.consentsGenerateChallengeRequest.headers,
      date: 'Thu, 23 Jan 2020 10:22:12 GMT',
      accept: 'application/json'
    }
    const request = {
      method: 'POST',
      url: '/consents/d5f5383f-ec4a-429a-aa10-4e4901701fd9/generateChallenge',
      headers: reqHeaders,
      payload: mockData.consentsGenerateChallengeRequest.payload
    }
    given('thirdparty-api-svc server', async (): Promise<Server> => {
      server = await ThirdPartyAPIAdapterService.run(Config)
      return server
    })

    when('I send a \'GenerateChallengeRequest\' request', async (): Promise<ServerInjectResponse> => {
      mockForwardConsentsIdGenerateChallengeRequest.mockResolvedValueOnce()
      response = await server.inject(request)
      return response
    })

    then('I get a response with a status code of \'202\'', (): void => {
      const expected = [
        'd5f5383f-ec4a-429a-aa10-4e4901701fd9',
        '/consents/{{ID}}/generateChallenge',
        'TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST',
        expect.objectContaining(request.headers),
        'POST',
        mockData.consentsGenerateChallengeRequest.payload,
        expect.any(Object)
      ]

      expect(response.statusCode).toBe(202)
      expect(response.result).toBeNull()
      expect(mockForwardConsentsIdGenerateChallengeRequest).toHaveBeenCalledWith(...expected)
    })
  })
})
