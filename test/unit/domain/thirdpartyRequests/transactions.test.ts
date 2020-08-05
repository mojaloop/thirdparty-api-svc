/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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
import * as ErrorHandler from '@mojaloop/central-services-error-handling'
import TestData from 'test/unit/data/mockData.json'

const mockGetEndpoint = jest.spyOn(Util.Endpoints, 'getEndpoint')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const apiPath = '/thirdpartyRequests/transactions'
const MockData = JSON.parse(JSON.stringify(TestData))
let request = MockData.transactionRequest

/**
 * Mock Span
 */
class Span {
  isFinished: boolean
  constructor() {
    this.isFinished = false
  }
  getChild() {
    return new Span()
  }
  audit() {
    return jest.fn()
  }
  error() {
    return jest.fn()
  }
  finish() {
    return jest.fn()
  }
}
let MockSpan = new Span()

const getEndpointExpected: Array<any> = [
  'http://central-ledger.local:3001',
  request.headers['fspiop-destination'],
  Enum.EndPoints.FspEndpointTypes.THIRDPARTY_CALLBACK_URL_TRX_REQ_POST
]
const sendRequestExpected: Array<any> = [
  'http://dfspa-sdk/thirdpartyRequests/transactions',
  request.headers,
  request.headers['fspiop-source'],
  request.headers['fspiop-destination'],
  Enum.Http.RestMethods.POST,
  request.payload,
  Enum.Http.ResponseTypes.JSON,
  { "isFinished": false }
]
const expectedErrorHeaders = {
  'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
  'fspiop-destination': request.headers['fspiop-source']
}
const sendRequestErrExpected: Array<any> = [
  'http://pispa-sdk/thirdpartyRequests/transactions/' + request.payload.transactionRequestId + '/error',
  expectedErrorHeaders,
  expectedErrorHeaders['fspiop-source'],
  expectedErrorHeaders['fspiop-destination'],
  Enum.Http.RestMethods.PUT,
  expect.any(Object),
  Enum.Http.ResponseTypes.JSON,
  { "isFinished": false }
]

describe('domain /thirdpartyRequests/transactions', () => {
  describe('forwardTransactionRequests', () => {
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      MockData.transactionRequest
      jest.clearAllMocks()
      MockSpan = new Span()
    })

    it('forwards POST /thirdpartyRequests/transactions request', async (): Promise<void> => {

      mockGetEndpoint.mockResolvedValue('http://dfspa-sdk')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, request.params, request.payload, MockSpan)

      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })

    it('handles POST /thirdpartyRequests/transactions when payload is undefined', async (): Promise<void> => {

      mockGetEndpoint.mockResolvedValue('http://dfspa-sdk')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, { ID: '12345' }, undefined)

      const sendReqParamsExpected: Array<any> = [
        'http://dfspa-sdk/thirdpartyRequests/transactions',
        request.headers,
        request.headers['fspiop-source'],
        request.headers['fspiop-destination'],
        Enum.Http.RestMethods.POST,
        { "transactionRequestId": "12345" },
        Enum.Http.ResponseTypes.JSON,
        undefined
      ]
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendReqParamsExpected)
    })

    it('if destination endpoint is not found, send error response to the source', async (): Promise<void> => {
      mockGetEndpoint.mockRejectedValue(new Error('Cannot find endpoint'))
      mockGetEndpoint.mockImplementationOnce((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR,
          'Endpoint not found', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      }).mockResolvedValue('http://pispa-sdk')
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      await expect(Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Endpoint not found'))

      expect(mockGetEndpoint).toHaveBeenCalledTimes(2)
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockSendRequest).toHaveBeenCalledTimes(1)
      expect(mockSendRequest).toHaveBeenLastCalledWith(...sendRequestErrExpected)
    })

    it('if destination endpoint is not found for both source and destiantion', async (): Promise<void> => {
      mockGetEndpoint.mockRejectedValue(new Error('Endpoint not found for both source and destiantion'))
      mockSendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      await expect(Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Endpoint not found for both source and destiantion'))

      expect(mockGetEndpoint).toHaveBeenCalledTimes(2)
      expect(mockGetEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })

    it('if sendRequest fails, forward error response to the source', async (): Promise<void> => {
      mockGetEndpoint.mockResolvedValueOnce('http://dfspa-sdk').mockResolvedValue('http://pispa-sdk')
      mockSendRequest.mockImplementationOnce((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR,
          'Failed to send HTTP request to host', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      }).mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      await expect(Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Failed to send HTTP request to host'))

      expect(mockSendRequest).toHaveBeenCalledTimes(2)
      expect(mockSendRequest).toHaveBeenLastCalledWith(...sendRequestErrExpected)
    })

    it('handles error in forwardTransactionRequestError', async (): Promise<void> => {
      mockGetEndpoint.mockResolvedValueOnce('http://dfspa-sdk').mockResolvedValue('http://pispa-sdk')
      mockSendRequest.mockImplementation((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      })

      await expect(Transactions.forwardTransactionRequest(apiPath, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Failed to send HTTP request to host'))
    })
  })
})
