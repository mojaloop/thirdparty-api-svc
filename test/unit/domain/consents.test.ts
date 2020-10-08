/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
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
import TestData from 'test/unit/data/mockData.json'
import Span from 'test/unit/__mocks__/span'
import  * as Consents from '~/domain/consents'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'

const mockGetEndpointAndRender = jest.spyOn(Util.Endpoints, 'getEndpointAndRender')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockData = JSON.parse(JSON.stringify(TestData))
const mockConsentsPostRequest = mockData.consentsPostRequest
const mockConsentsPostGenerateChallengeRequest = mockData.consentsGenerateChallengeRequest

const getEndpointForwardConsentsRequestExpected = [
  'http://central-ledger.local:3001',
  mockConsentsPostRequest.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
  "/consents",
]

const getEndpointForwardConsentsRequestExpectedSecond = [
  'http://central-ledger.local:3001',
  mockConsentsPostRequest.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT_ERROR,
  "/consents/{{ID}}/error",
  {"ID": "7b24ea42-6fdd-45f5-999e-0a6981c4198b"}
]

const expectedForwardConsentsRequestErrorHeaders = {
  'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
  'fspiop-destination': mockConsentsPostRequest.headers['fspiop-source']
}

const sendRequestForwardConsentsRequestExpected = [
  'http://dfspa-sdk/consents',
  mockConsentsPostRequest.headers,
  mockConsentsPostRequest.headers['fspiop-source'],
  mockConsentsPostRequest.headers['fspiop-destination'],
  Enum.Http.RestMethods.POST,
  mockConsentsPostRequest.payload,
  Enum.Http.ResponseTypes.JSON,
  expect.objectContaining({ isFinished: false })
]

const getEndpointforwardConsentsIdGenerateChallengeRequestExpected = [
  'http://central-ledger.local:3001',
  mockConsentsPostGenerateChallengeRequest.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST,
  "/consents/{{ID}}/generateChallenge",
  {"ID": "09595320-51e5-4c4e-a910-c56917e4cdc4"}
]

const getEndpointforwardConsentsIdGenerateChallengeRequestExpectedSecond = [
  'http://central-ledger.local:3001',
  mockConsentsPostGenerateChallengeRequest.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR,
  "/consents/{{ID}}/generateChallenge/error",
  {"ID": "09595320-51e5-4c4e-a910-c56917e4cdc4"}
]

const expectedforwardConsentsIdGenerateChallengeRequestErrorHeaders = {
  'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
  'fspiop-destination': mockConsentsPostGenerateChallengeRequest.headers['fspiop-source']
}

const sendRequestforwardConsentsIdGenerateChallengeRequestExpected = [
  'http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge',
  mockConsentsPostGenerateChallengeRequest.headers,
  mockConsentsPostGenerateChallengeRequest.headers['fspiop-source'],
  mockConsentsPostGenerateChallengeRequest.headers['fspiop-destination'],
  Enum.Http.RestMethods.POST,
  mockConsentsPostGenerateChallengeRequest.payload,
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
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Consents.forwardConsentsRequest(
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
        mockConsentsPostRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostRequest.payload,
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

      const action = async () => await Consents.forwardConsentsRequest(
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
        mockConsentsPostRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostRequest.payload,
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

      const action = async () => await Consents.forwardConsentsRequest(
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
        mockConsentsPostRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostRequest.payload,
      )

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointForwardConsentsRequestExpectedSecond)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })

    it('handles `sendRequest` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      const errorPayload =
        ReformatFSPIOPError(new Error('Failed to send HTTP request')).toApiErrorObject(true, true)
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/' + mockConsentsPostRequest.payload.id + '/error',
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
        .mockResolvedValue('http://pispa-sdk/consents/' + mockConsentsPostRequest.payload.id + '/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request'))
        .mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      const action = async () => await Consents.forwardConsentsRequest(
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
        mockConsentsPostRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostRequest.payload,
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
      const errorPayload =
        ReformatFSPIOPError(new Error('Failed to send HTTP request first time')).toApiErrorObject(true, true)
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/' + mockConsentsPostRequest.payload.id + '/error',
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
        .mockResolvedValue('http://pispa-sdk/consents/' + mockConsentsPostRequest.payload.id + '/error',)
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))

      const action = async () => await Consents.forwardConsentsRequest(
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
        mockConsentsPostRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostRequest.payload,
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
        "/consents/{{ID}}/error",
        {"ID": "7b24ea42-6fdd-45f5-999e-0a6981c4198b"}
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
      await Consents.forwardConsentsIdRequestError(
        path, id, headers, payload
      )

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointErrorExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrorExpected)
    })
  })
})


describe('domain/consents/{ID}/generateChallenge', () => {
  describe('forwardConsentsIdGenerateChallengeRequest', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards POST /consents request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Consents.forwardConsentsIdGenerateChallengeRequest(
        '09595320-51e5-4c4e-a910-c56917e4cdc4',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST,
        mockConsentsPostGenerateChallengeRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostGenerateChallengeRequest.payload,
        mockSpan
      )

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestforwardConsentsIdGenerateChallengeRequestExpected )
    })


    it('handles `getEndpoint` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge/error')

      const action = async () => await Consents.forwardConsentsIdGenerateChallengeRequest(
        '09595320-51e5-4c4e-a910-c56917e4cdc4',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST,
        mockConsentsPostGenerateChallengeRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostGenerateChallengeRequest.payload,
        mockSpan
      )

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpectedSecond)
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

      const action = async () => await Consents.forwardConsentsIdGenerateChallengeRequest(
        '09595320-51e5-4c4e-a910-c56917e4cdc4',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST,
        mockConsentsPostGenerateChallengeRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostGenerateChallengeRequest.payload,
      )

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpectedSecond)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })

    it('handles `sendRequest` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      const errorPayload =
        ReformatFSPIOPError(new Error('Failed to send HTTP request')).toApiErrorObject(true, true)
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge/error',
        expectedforwardConsentsIdGenerateChallengeRequestErrorHeaders,
        expectedforwardConsentsIdGenerateChallengeRequestErrorHeaders['fspiop-source'],
        expectedforwardConsentsIdGenerateChallengeRequestErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]

      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge')
        .mockResolvedValue('http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request'))
        .mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      const action = async () => await Consents.forwardConsentsIdGenerateChallengeRequest(
        '09595320-51e5-4c4e-a910-c56917e4cdc4',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST,
        mockConsentsPostGenerateChallengeRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostGenerateChallengeRequest.payload,
        mockSpan
      )
      await expect(action).rejects.toThrow('Failed to send HTTP request')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestforwardConsentsIdGenerateChallengeRequestExpected)
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
      const errorPayload =
        ReformatFSPIOPError(new Error('Failed to send HTTP request first time')).toApiErrorObject(true, true)
      const sendRequestErrExpected = [
        'http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge/error',
        expectedforwardConsentsIdGenerateChallengeRequestErrorHeaders,
        expectedforwardConsentsIdGenerateChallengeRequestErrorHeaders['fspiop-source'],
        expectedforwardConsentsIdGenerateChallengeRequestErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge')
        .mockResolvedValue('http://pispa-sdk/consents/09595320-51e5-4c4e-a910-c56917e4cdc4/generateChallenge/error',)
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))

      const action = async () => await Consents.forwardConsentsIdGenerateChallengeRequest(
        '09595320-51e5-4c4e-a910-c56917e4cdc4',
        Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_POST,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST,
        mockConsentsPostGenerateChallengeRequest.headers,
        Enum.Http.RestMethods.POST,
        mockConsentsPostGenerateChallengeRequest.payload,
        mockSpan
      )

      await expect(action).rejects.toThrow('Failed to send HTTP request second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointforwardConsentsIdGenerateChallengeRequestExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestforwardConsentsIdGenerateChallengeRequestExpected )
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrExpected)
    })
  })
})

describe('domain/consents/{ID}/generateChallenge', () => {
  describe('forwardConsentsIdGenerateChallengeError', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_PUT_ERROR

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the PUT /consents/{ID}/generateChallenge error', async () => {
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/consents/7b24ea42-6fdd-45f5-999e-0a6981c4198b/generateChallenge/error')
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': 'switch',
        'fspiop-destination': 'pispA'
      }
      const id = '7b24ea42-6fdd-45f5-999e-0a6981c4198b'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointErrorExpected = [
        'http://central-ledger.local:3001',
        'pispA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR,
        "/consents/{{ID}}/generateChallenge/error",
        {"ID": "7b24ea42-6fdd-45f5-999e-0a6981c4198b"}
      ]
      const sendRequestErrorExpected = [
        'http://dfspa-sdk/consents/7b24ea42-6fdd-45f5-999e-0a6981c4198b/generateChallenge/error',
        headers,
        'switch',
        'pispA',
        Enum.Http.RestMethods.PUT,
        payload,
        Enum.Http.ResponseTypes.JSON,
        undefined
      ]

      // Act
      await Consents.forwardConsentsIdGenerateChallengeError(
        path, id, headers, payload
      )

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointErrorExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrorExpected)
    })
  })
})
