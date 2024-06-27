/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in
 writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS
 OF ANY KIND, either express or implied. See the License for the specific language governing
 permissions and limitations under the License.
Contributors Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/

import Logger from '@mojaloop/central-services-logger'
import { Util, Enum } from '@mojaloop/central-services-shared'
import * as TestData from 'test/unit/data/mockData'
import Span from 'test/unit/__mocks__/span'
import * as ConsentRequests from '~/domain/consentRequests'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Config from '~/shared/config'

const mockGetEndpointAndRender = jest.spyOn(Util.Endpoints, 'getEndpointAndRender')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockData = JSON.parse(JSON.stringify(TestData))
const consentRequestsPostRequest = mockData.consentRequestsPostRequest
const consentRequestsIdPutRequest = mockData.consentRequestsPutRequestWeb
const hubNameRegex = Util.HeaderValidation.getHubNameRegex(Config.HUB_PARTICIPANT.NAME)

const getEndpointAndRenderConsentRequestsExpected = [
  'http://central-ledger.local:3001',
  consentRequestsPostRequest.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_POST,
  '/consentRequests',
  {}
]

const getEndpointAndRenderConsentRequestsExpectedSecond = [
  'http://central-ledger.local:3001',
  consentRequestsPostRequest.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT_ERROR,
  '/consentRequests/{{ID}}/error',
  { ID: 'b82348b9-81f6-42ea-b5c4-80667d5740fe' }
]

const expectedConsentRequestErrorHeaders = {
  'fspiop-source': Config.HUB_PARTICIPANT.NAME,
  'fspiop-destination': consentRequestsPostRequest.headers['fspiop-source']
}

const sendRequestConsentRequestsExpected = {
  url: 'http://dfspa-sdk/consentRequests',
  headers: consentRequestsPostRequest.headers,
  source: consentRequestsPostRequest.headers['fspiop-source'],
  destination: consentRequestsPostRequest.headers['fspiop-destination'],
  method: Enum.Http.RestMethods.POST,
  payload: consentRequestsPostRequest.payload,
  responseType: Enum.Http.ResponseTypes.JSON,
  span: expect.objectContaining({ isFinished: false }),
  hubNameRegex
}

describe('domain/consentRequests', () => {
  describe('forwardConsentRequestsRequest', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards POST /consentRequests request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/consentRequests')
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })
      await ConsentRequests.forwardConsentRequestsRequest(
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_POST,
        consentRequestsPostRequest.headers,
        Enum.Http.RestMethods.POST,
        consentRequestsPostRequest.payload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestConsentRequestsExpected)
    })

    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error')

      const action = async () =>
        await ConsentRequests.forwardConsentRequestsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_POST,
          consentRequestsPostRequest.headers,
          Enum.Http.RestMethods.POST,
          consentRequestsPostRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpectedSecond)
      // Children's children in `forwardTransactionRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardTransactionRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `getEndpointAndRender` failure twice', async (): Promise<void> => {
      mockGetEndpointAndRender
        .mockRejectedValue(new Error('Cannot find endpoint first time'))
        .mockRejectedValue(new Error('Cannot find endpoint second time'))

      const action = async () =>
        await ConsentRequests.forwardConsentRequestsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_POST,
          consentRequestsPostRequest.headers,
          Enum.Http.RestMethods.POST,
          consentRequestsPostRequest.payload
        )

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpectedSecond)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })

    it('handles `sendRequest` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      const errorPayload = ReformatFSPIOPError(new Error('Failed to send HTTP request')).toApiErrorObject(true, true)
      const sendRequestErrExpected = {
        url: 'http://pispa-sdk/consentRequests/' + consentRequestsPostRequest.payload.consentRequestId + '/error',
        headers: expectedConsentRequestErrorHeaders,
        source: expectedConsentRequestErrorHeaders['fspiop-source'],
        destination: expectedConsentRequestErrorHeaders['fspiop-destination'],
        method: Enum.Http.RestMethods.PUT,
        payload: errorPayload,
        responseType: Enum.Http.ResponseTypes.JSON,
        span: expect.objectContaining({ isFinished: false }),
        hubNameRegex
      }

      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consentRequests')
        .mockResolvedValue('http://pispa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error')
      mockSendRequest.mockRejectedValueOnce(new Error('Failed to send HTTP request')).mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })

      const action = async () =>
        await ConsentRequests.forwardConsentRequestsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_POST,
          consentRequestsPostRequest.headers,
          Enum.Http.RestMethods.POST,
          consentRequestsPostRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )
      await expect(action).rejects.toThrow('Failed to send HTTP request')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestConsentRequestsExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestErrExpected)
      // Children's children in `forwardTransactionRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardTransactionRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `sendRequest` failure twice', async (): Promise<void> => {
      const mockSpan = new Span()
      const errorPayload = ReformatFSPIOPError(new Error('Failed to send HTTP request first time')).toApiErrorObject(
        true,
        true
      )
      const sendRequestErrExpected = {
        url: 'http://pispa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error',
        headers: expectedConsentRequestErrorHeaders,
        source: expectedConsentRequestErrorHeaders['fspiop-source'],
        destination: expectedConsentRequestErrorHeaders['fspiop-destination'],
        method: Enum.Http.RestMethods.PUT,
        payload: errorPayload,
        responseType: Enum.Http.ResponseTypes.JSON,
        span: expect.objectContaining({ isFinished: false }),
        hubNameRegex
      }
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consentRequests')
        .mockResolvedValue('http://pispa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))

      const action = async () =>
        await ConsentRequests.forwardConsentRequestsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_POST,
          consentRequestsPostRequest.headers,
          Enum.Http.RestMethods.POST,
          consentRequestsPostRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Failed to send HTTP request second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestConsentRequestsExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestErrExpected)
    })
  })
})

const getEndpointAndRenderConsentRequestsIdExpected = [
  'http://central-ledger.local:3001',
  'pispA',
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT,
  '/consentRequests/{{ID}}',
  { ID: 'b82348b9-81f6-42ea-b5c4-80667d5740fe' }
]

const getEndpointAndRenderConsentRequestsIdExpectedSecond = [
  'http://central-ledger.local:3001',
  consentRequestsIdPutRequest.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT_ERROR,
  '/consentRequests/{{ID}}/error',
  { ID: 'b82348b9-81f6-42ea-b5c4-80667d5740fe' }
]

const sendRequestConsentRequestsIdExpected = {
  url: 'http://pispa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe',
  headers: consentRequestsIdPutRequest.headers,
  source: 'dfspA',
  destination: 'pispA',
  method: Enum.Http.RestMethods.PUT,
  payload: consentRequestsIdPutRequest.payload,
  responseType: Enum.Http.ResponseTypes.JSON,
  span: expect.objectContaining({ isFinished: false }),
  hubNameRegex
}

describe('domain/consentRequests/{ID}', () => {
  describe('forwardConsentRequestsIdRequest', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards PUT /consentRequests request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue(
        'http://pispa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe'
      )
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })
      await ConsentRequests.forwardConsentRequestsIdRequest(
        'b82348b9-81f6-42ea-b5c4-80667d5740fe',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT,
        consentRequestsIdPutRequest.headers,
        Enum.Http.RestMethods.PUT,
        consentRequestsIdPutRequest.payload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsIdExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestConsentRequestsIdExpected)
    })

    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://dfspa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error')

      const action = async () =>
        await ConsentRequests.forwardConsentRequestsIdRequest(
          'b82348b9-81f6-42ea-b5c4-80667d5740fe',
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT,
          consentRequestsIdPutRequest.headers,
          Enum.Http.RestMethods.PUT,
          consentRequestsIdPutRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsIdExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderConsentRequestsIdExpectedSecond)
      // Children's children in `forwardTransactionRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardTransactionRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('forwardConsentRequestsIdRequestError', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT_ERROR

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the PUT /consentRequests/{ID} error', async () => {
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue(
        'http://dfspa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error'
      )
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': Config.HUB_PARTICIPANT.NAME,
        'fspiop-destination': 'dfspA'
      }
      const id = 'b82348b9-81f6-42ea-b5c4-80667d5740fe'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointAndRenderErrorExpected = [
        'http://central-ledger.local:3001',
        'dfspA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT_ERROR,
        '/consentRequests/{{ID}}/error',
        { ID: 'b82348b9-81f6-42ea-b5c4-80667d5740fe' }
      ]
      const sendRequestErrorExpected = {
        destination: 'dfspA',
        headers,
        hubNameRegex,
        method: Enum.Http.RestMethods.PUT,
        payload: payload,
        responseType: Enum.Http.ResponseTypes.JSON,
        source: Config.HUB_PARTICIPANT.NAME,
        span: undefined,
        url: 'http://dfspa-sdk/consentRequests/b82348b9-81f6-42ea-b5c4-80667d5740fe/error'
      }

      // Act
      await ConsentRequests.forwardConsentRequestsIdRequestError(path, id, headers, payload)

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderErrorExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestErrorExpected)
    })
  })
})
