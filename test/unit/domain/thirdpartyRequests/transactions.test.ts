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

import { Transactions } from '~/domain/thirdpartyRequests'
import Logger from '@mojaloop/central-services-logger'
import { Util, Enum } from '@mojaloop/central-services-shared'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import TestData from 'test/unit/data/mockData.json'
import Span from 'test/unit/__mocks__/span'

const mockGetEndpoint = jest.spyOn(Util.Endpoints, 'getEndpoint')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const apiPath = '/thirdpartyRequests/transactions'
const mockData = JSON.parse(JSON.stringify(TestData))
const request = mockData.transactionRequest

const getEndpointExpected = [
  'http://central-ledger.local:3001',
  request.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.THIRDPARTY_CALLBACK_URL_TRANSACTION_REQUEST_POST
]
const getEndpointExpectedSecond = [
  'http://central-ledger.local:3001',
  request.headers['fspiop-source'],
  Enum.EndPoints.FspEndpointTypes.THIRDPARTY_CALLBACK_URL_TRANSACTION_REQUEST_POST
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

describe('domain /thirdpartyRequests/transactions', (): void => {
  describe('forwardTransactionRequest', (): void => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards POST /thirdpartyRequests/transactions request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpoint.mockResolvedValue('http://dfspa-sdk')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, request.params, request.payload, mockSpan)

      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })

    it('handles when payload is undefined', async (): Promise<void> => {
      mockGetEndpoint.mockResolvedValue('http://dfspa-sdk')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, { ID: '12345' })

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
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendReqParamsExpected)
    })

    it('handles `getEndpoint` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpoint
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk')

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, mockSpan)

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpectedSecond)
      // Children's children in `forwardTransactionRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardTransactionRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `getEndpoint` failure twice', async (): Promise<void> => {
      mockGetEndpoint
        .mockRejectedValue(new Error('Cannot find endpoint first time'))
        .mockRejectedValue(new Error('Cannot find endpoint second time'))

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload)

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpectedSecond)
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
      mockGetEndpoint
        .mockResolvedValueOnce('http://dfspa-sdk')
        .mockResolvedValue('http://pispa-sdk')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request'))
        .mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, mockSpan)

      await expect(action).rejects.toThrow('Failed to send HTTP request')
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpectedSecond)
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
      mockGetEndpoint
        .mockResolvedValueOnce('http://dfspa-sdk')
        .mockResolvedValue('http://pispa-sdk')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))

      const action = async () => await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, mockSpan)

      await expect(action).rejects.toThrow('Failed to send HTTP request second time')
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestErrExpected)
    })
  })
})
