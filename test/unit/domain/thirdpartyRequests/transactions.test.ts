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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/

import Hapi from '@hapi/hapi'
import { Transactions } from '~/domain/thirdpartyRequests'
import Logger from '@mojaloop/central-services-logger'
import { Util, Enum } from '@mojaloop/central-services-shared'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import TestData from 'test/unit/data/mockData.json'
import Span from 'test/unit/__mocks__/span'
import { NotificationMessage } from '~/eventServer/eventHandlers/notificationEvent'

const mockGetEndpointAndRender = jest.spyOn(Util.Endpoints, 'getEndpointAndRender')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const apiPath = '/thirdpartyRequests/transactions'
const apiEndpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_POST
const mockData = JSON.parse(JSON.stringify(TestData))
const request = mockData.transactionRequest
const notificationEventCommit: NotificationMessage = mockData.notificationEventCommit

const getEndpointAndRenderExpected = [
  'http://central-ledger.local:3001',
  request.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_POST,
  "/thirdpartyRequests/transactions",
  {}
]
const getEndpointAndRenderExpectedSecond = [
  'http://central-ledger.local:3001',
  request.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR,
  "/thirdpartyRequests/transactions/{{ID}}/error",
  {"ID": "7d34f91d-d078-4077-8263-2c047876fcf6"}
]
const sendRequestExpected = [
  'http://dfspa-sdk/thirdpartyRequests/transactions',
  request.headers,
  request.headers['fspiop-source'],
  request.headers['fspiop-destination'],
  Enum.Http.RestMethods.POST,
  request.payload,
  Enum.Http.ResponseTypes.JSON,
  expect.objectContaining({ isFinished: false })
]
const expectedErrorHeaders = {
  'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
  'fspiop-destination': request.headers['fspiop-source']
}
const getEndpointAndRenderExpectedKafkaMessage = [
  'http://central-ledger.local:3001',
  notificationEventCommit.value.content.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PATCH,
  "/thirdpartyRequests/transactions/{{ID}}",
  {"ID": "bc1a9c36-4429-4205-8553-11f92de1919e"}
]
const sendRequestExpectedKafkaMessage = [
  'http://pispa-sdk/thirdpartyRequests/transactions/bc1a9c36-4429-4205-8553-11f92de1919e',
  notificationEventCommit.value.content.headers,
  notificationEventCommit.value.content.headers['fspiop-source'],
  notificationEventCommit.value.content.headers['fspiop-destination'],
  Enum.Http.RestMethods.PATCH,
  Util.StreamingProtocol.decodePayload(notificationEventCommit.value.content.payload, { asParsed: true }),
  Enum.Http.ResponseTypes.JSON,
  null
]

describe('domain /thirdpartyRequests/transactions', (): void => {
  describe('forwardTransactionRequest', (): void => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards POST /thirdpartyRequests/transactions request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/thirdpartyRequests/transactions')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(apiPath, apiEndpointType, request.headers, Enum.Http.RestMethods.POST, request.params, request.payload, mockSpan)

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })

    it('handles when payload is undefined', async (): Promise<void> => {
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/thirdpartyRequests/transactions')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(apiPath, apiEndpointType, request.headers, Enum.Http.RestMethods.POST, { ID: '12345' })

      const sendReqParamsExpected = [
        'http://dfspa-sdk/thirdpartyRequests/transactions',
        request.headers,
        request.headers['fspiop-source'],
        request.headers['fspiop-destination'],
        Enum.Http.RestMethods.POST,
        { transactionRequestId: '12345' },
        Enum.Http.ResponseTypes.JSON,
        undefined
      ]
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendReqParamsExpected)
    })

    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/error')

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, apiEndpointType, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, mockSpan)

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
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

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, apiEndpointType, request.headers, Enum.Http.RestMethods.POST, {}, request.payload)

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })

    it('handles `sendRequest` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      const errorPayload =
        ReformatFSPIOPError(new Error('Failed to send HTTP request')).toApiErrorObject(true, true)
      const sendRequestErrExpected = [
        'http://pispa-sdk/thirdpartyRequests/transactions/' + request.payload.transactionRequestId + '/error',
        expectedErrorHeaders,
        expectedErrorHeaders['fspiop-source'],
        expectedErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/thirdpartyRequests/transactions')
        .mockResolvedValueOnce('http://pispa-sdk/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request'))
        .mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, apiEndpointType, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, mockSpan)

      await expect(action).rejects.toThrow('Failed to send HTTP request')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
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
        'http://pispa-sdk/thirdpartyRequests/transactions/' + request.payload.transactionRequestId + '/error',
        expectedErrorHeaders,
        expectedErrorHeaders['fspiop-source'],
        expectedErrorHeaders['fspiop-destination'],
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://dfspa-sdk/thirdpartyRequests/transactions')
        .mockResolvedValueOnce('http://pispa-sdk/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, apiEndpointType, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, mockSpan)

      await expect(action).rejects.toThrow('Failed to send HTTP request second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrExpected)
    })
  })

  describe('forwardTransactionRequestNotification', (): void => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards PATCH /thirdpartyRequests/transactions for kafka commit message', async (): Promise<void> => {
      mockGetEndpointAndRender.mockResolvedValue('http://pispa-sdk/thirdpartyRequests/transactions/bc1a9c36-4429-4205-8553-11f92de1919e')
      mockSendRequest.mockResolvedValue({ ok: true, status: 200, statusText: 'OK', payload: null })
      await Transactions.forwardTransactionRequestNotification(
        notificationEventCommit.value.content.headers as Hapi.Util.Dictionary<string>,
        notificationEventCommit.value.id,
        notificationEventCommit.value.content.payload,
        Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PATCH,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PATCH,
        Enum.Http.RestMethods.PATCH
      )

      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedKafkaMessage)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpectedKafkaMessage)
    })


    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))

      const action = async () => await Transactions.forwardTransactionRequestNotification(
        notificationEventCommit.value.content.headers as Hapi.Util.Dictionary<string>,
        notificationEventCommit.value.id,
        notificationEventCommit.value.content.payload,
        Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PATCH,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PATCH,
        Enum.Http.RestMethods.PATCH
      )
      await expect(action).rejects.toThrow('Cannot find endpoint')
    })


    it('handles `sendRequest` failure', async (): Promise<void> => {
      mockGetEndpointAndRender
        .mockResolvedValue('http://pispa-sdk')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request'))

      const action = async () => await Transactions.forwardTransactionRequestNotification(
        notificationEventCommit.value.content.headers as Hapi.Util.Dictionary<string>,
        notificationEventCommit.value.id,
        notificationEventCommit.value.content.payload,
        Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PATCH,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PATCH,
        Enum.Http.RestMethods.PATCH
      )
      await expect(action).rejects.toThrow('Failed to send HTTP request')
    })
  })
})
