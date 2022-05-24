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
import * as Consents from '~/domain/consents'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'

const mockGetEndpointAndRender = jest.spyOn(Util.Endpoints, 'getEndpointAndRender')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockData = JSON.parse(JSON.stringify(TestData))
const mockConsentsPostRequestPISP = mockData.consentsPostRequestPISP
const mockConsentsIdPutRequest = mockData.consentsIdPutRequestVerified
const mockConsentIdPatchRequestVerified = mockData.patchConsentsByIdRequestVerified

const getEndpointForwardConsentsRequestExpected = [
  'http://central-ledger.local:3001',
  mockConsentsPostRequestPISP.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
  '/consents'
]

const getEndpointForwardConsentsRequestExpectedSecond = [
  'http://central-ledger.local:3001',
  mockConsentsPostRequestPISP.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT_ERROR,
  '/consents/{{ID}}/error',
  { ID: '7b24ea42-6fdd-45f5-999e-0a6981c4198b' }
]

const expectedForwardConsentsRequestErrorHeaders = {
  'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
  'fspiop-destination': mockConsentsPostRequestPISP.headers['fspiop-source']
}

const sendRequestForwardConsentsRequestExpected = [
  'http://dfspa-sdk/consents',
  mockConsentsPostRequestPISP.headers,
  mockConsentsPostRequestPISP.headers['fspiop-source'],
  mockConsentsPostRequestPISP.headers['fspiop-destination'],
  Enum.Http.RestMethods.POST,
  mockConsentsPostRequestPISP.payload,
  Enum.Http.ResponseTypes.JSON,
  expect.objectContaining({ isFinished: false })
]

const getEndpointforwardConsentsIdRequestExpected = [
  'http://central-ledger.local:3001',
  mockConsentsIdPutRequest.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
  '/consents/{{ID}}',
  { ID: '09595320-51e5-4c4e-a910-c56917e4cdc4' }
]

const getEndpointforwardConsentsIdRequestExpectedSecond = [
  'http://central-ledger.local:3001',
  mockConsentsIdPutRequest.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT_ERROR,
  '/consents/{{ID}}/error',
  { ID: '09595320-51e5-4c4e-a910-c56917e4cdc4' }
]

const expectedforwardConsentsIdRequestErrorHeaders = {
  'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
  'fspiop-destination': mockConsentsIdPutRequest.headers['fspiop-source']
}

const sendRequestforwardConsentsIdRequestExpected = [
  'http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/',
  mockConsentsIdPutRequest.headers,
  mockConsentsIdPutRequest.headers['fspiop-source'],
  mockConsentsIdPutRequest.headers['fspiop-destination'],
  Enum.Http.RestMethods.PUT,
  mockConsentsIdPutRequest.payload,
  Enum.Http.ResponseTypes.JSON,
  expect.objectContaining({ isFinished: false })
]

const getEndpointforwardConsentsIdRequestExpectedPatchRequest = [
  'http://central-ledger.local:3001',
  mockConsentIdPatchRequestVerified.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PATCH,
  '/consents/{{ID}}',
  { ID: '09595320-51e5-4c4e-a910-c56917e4cdc4' }
]

const sendRequestforwardConsentsIdRequestExpectedPatchRequest = [
  'http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/',
  mockConsentIdPatchRequestVerified.headers,
  mockConsentIdPatchRequestVerified.headers['fspiop-source'],
  mockConsentIdPatchRequestVerified.headers['fspiop-destination'],
  Enum.Http.RestMethods.PATCH,
  mockConsentIdPatchRequestVerified.payload,
  Enum.Http.ResponseTypes.JSON,
  expect.objectContaining({ isFinished: false })
]

describe('domain/consents', () => {
  describe('forwardConsentsRequest', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards POST /consents request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/consents')
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })
      await Consents.forwardConsentsRequest(
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
        mockConsentsPostRequestPISP.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostRequestPISP.payload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestForwardConsentsRequestExpected)
    })

    it('handles `getEndpoint` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk')

      const action = async () =>
        await Consents.forwardConsentsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
          mockConsentsPostRequestPISP.headers,
          Enum.Http.RestMethods.POST,
          mockConsentsPostRequestPISP.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpectedSecond)
      // Children's children in `forwardTransactionRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardTransactionRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `getEndpoint` failure twice', async (): Promise<void> => {
      mockGetEndpointAndRender
        .mockRejectedValue(new Error('Cannot find endpoint first time'))
        .mockRejectedValue(new Error('Cannot find endpoint second time'))

      const action = async () =>
        await Consents.forwardConsentsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
          mockConsentsPostRequestPISP.headers,
          Enum.Http.RestMethods.POST,
          mockConsentsPostRequestPISP.payload
        )

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpectedSecond)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })

    it('handles `sendRequest` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      const errorPayload = ReformatFSPIOPError(new Error('Failed to send HTTP request')).toApiErrorObject(true, true)
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/' + mockConsentsPostRequestPISP.payload.consentId + '/error',
        expectedForwardConsentsRequestErrorHeaders,
        expectedForwardConsentsRequestErrorHeaders['fspiop-source'],
        expectedForwardConsentsRequestErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]

      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consents')
        .mockResolvedValue('http://pispa-sdk/consents/' + mockConsentsPostRequestPISP.payload.consentId + '/error')
      mockSendRequest.mockRejectedValueOnce(new Error('Failed to send HTTP request')).mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })

      const action = async () =>
        await Consents.forwardConsentsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
          mockConsentsPostRequestPISP.headers,
          Enum.Http.RestMethods.POST,
          mockConsentsPostRequestPISP.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )
      await expect(action).rejects.toThrow('Failed to send HTTP request')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestForwardConsentsRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrExpected)
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
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/' + mockConsentsPostRequestPISP.payload.consentId + '/error',
        expectedForwardConsentsRequestErrorHeaders,
        expectedForwardConsentsRequestErrorHeaders['fspiop-source'],
        expectedForwardConsentsRequestErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consents')
        .mockResolvedValue('http://pispa-sdk/consents/' + mockConsentsPostRequestPISP.payload.consentId + '/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))

      const action = async () =>
        await Consents.forwardConsentsRequest(
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
          mockConsentsPostRequestPISP.headers,
          Enum.Http.RestMethods.POST,
          mockConsentsPostRequestPISP.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Failed to send HTTP request second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestForwardConsentsRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrExpected)
    })
  })
})

describe('domain/consents/{ID}', () => {
  describe('forwardConsentsIdRequest', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards PUT /consents/{ID} request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/')
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })
      await Consents.forwardConsentsIdRequest(
        '09595320-51e5-4c4e-a910-c56917e4cdc4',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
        mockConsentsIdPutRequest.headers,
        Enum.Http.RestMethods.PUT,
        mockConsentsIdPutRequest.payload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestforwardConsentsIdRequestExpected)
    })

    it('forwards PATCH /consents/{ID} request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/')
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'Accepted',
        payload: null
      })
      await Consents.forwardConsentsIdRequest(
        '09595320-51e5-4c4e-a910-c56917e4cdc4',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PATCH,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PATCH,
        mockConsentIdPatchRequestVerified.headers,
        Enum.Http.RestMethods.PATCH,
        mockConsentIdPatchRequestVerified.payload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpectedPatchRequest)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestforwardConsentsIdRequestExpectedPatchRequest)
    })

    it('handles `getEndpoint` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4//error')

      const action = async () =>
        await Consents.forwardConsentsIdRequest(
          '09595320-51e5-4c4e-a910-c56917e4cdc4',
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
          mockConsentsIdPutRequest.headers,
          Enum.Http.RestMethods.PUT,
          mockConsentsIdPutRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpectedSecond)
      // Children's children in `forwardTransactionRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardTransactionRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `getEndpoint` failure twice', async (): Promise<void> => {
      mockGetEndpointAndRender
        .mockRejectedValue(new Error('Cannot find endpoint first time'))
        .mockRejectedValue(new Error('Cannot find endpoint second time'))

      const action = async () =>
        await Consents.forwardConsentsIdRequest(
          '09595320-51e5-4c4e-a910-c56917e4cdc4',
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
          mockConsentsIdPutRequest.headers,
          Enum.Http.RestMethods.PUT,
          mockConsentsIdPutRequest.payload
        )

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpectedSecond)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })

    it('handles `sendRequest` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      const errorPayload = ReformatFSPIOPError(new Error('Failed to send HTTP request')).toApiErrorObject(true, true)
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4//error',
        expectedforwardConsentsIdRequestErrorHeaders,
        expectedforwardConsentsIdRequestErrorHeaders['fspiop-source'],
        expectedforwardConsentsIdRequestErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]

      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/')
        .mockResolvedValue('http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4//error')
      mockSendRequest.mockRejectedValueOnce(new Error('Failed to send HTTP request')).mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })

      const action = async () =>
        await Consents.forwardConsentsIdRequest(
          '09595320-51e5-4c4e-a910-c56917e4cdc4',
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
          mockConsentsIdPutRequest.headers,
          Enum.Http.RestMethods.PUT,
          mockConsentsIdPutRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )
      await expect(action).rejects.toThrow('Failed to send HTTP request')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestforwardConsentsIdRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrExpected)
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
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4//error',
        expectedforwardConsentsIdRequestErrorHeaders,
        expectedforwardConsentsIdRequestErrorHeaders['fspiop-source'],
        expectedforwardConsentsIdRequestErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/')
        .mockResolvedValue('http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4//error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))

      const action = async () =>
        await Consents.forwardConsentsIdRequest(
          '09595320-51e5-4c4e-a910-c56917e4cdc4',
          Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT,
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
          mockConsentsIdPutRequest.headers,
          Enum.Http.RestMethods.PUT,
          mockConsentsIdPutRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Failed to send HTTP request second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdRequestExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestforwardConsentsIdRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrExpected)
    })
  })
})

describe('domain/consents/{ID}/error', () => {
  describe('forwardConsentsIdRequestError', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT_ERROR

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the PUT /consents/{ID} error', async () => {
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/consents/7b24ea42-6fdd-45f5-999e-0a6981c4198b/error')
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': 'switch',
        'fspiop-destination': 'dfspA'
      }
      const id = '7b24ea42-6fdd-45f5-999e-0a6981c4198b'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointErrorExpected = [
        'http://central-ledger.local:3001',
        'dfspA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT_ERROR,
        '/consents/{{ID}}/error',
        { ID: '7b24ea42-6fdd-45f5-999e-0a6981c4198b' }
      ]
      const sendRequestErrorExpected = [
        'http://dfspa-sdk/consents/7b24ea42-6fdd-45f5-999e-0a6981c4198b/error',
        headers,
        'switch',
        'dfspA',
        Enum.Http.RestMethods.PUT,
        payload,
        Enum.Http.ResponseTypes.JSON,
        undefined
      ]

      // Act
      await Consents.forwardConsentsIdRequestError(path, id, headers, payload)

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointErrorExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrorExpected)
    })
  })
})
