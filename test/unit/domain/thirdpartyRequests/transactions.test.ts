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

import { ResponseObject, ResponseToolkit } from "@hapi/hapi"
import { Transactions } from '../../../../src/domain/thirdpartyRequests'
import Logger from '@mojaloop/central-services-logger'
import { Util, Enum } from '@mojaloop/central-services-shared'
import * as ErrorHandler from '@mojaloop/central-services-error-handling'
import MockData from '../../../unit/data/mockData.json'

const mock_getEndpoint = jest.spyOn(Util.Endpoints, 'getEndpoint')
const mock_sendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mock_loggerPush = jest.spyOn(Logger, 'push')
const mock_loggerError = jest.spyOn(Logger, 'error')
const api_path = '/thirdpartyRequests/transactions'
const mock_data = JSON.parse(JSON.stringify(MockData))
// @ts-ignore
let request = mock_data.transactionRequest

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

// @ts-ignore
const h: ResponseToolkit = {
  response: (): ResponseObject => {
    return {
      code: (num: number): ResponseObject => {
        return num as unknown as ResponseObject
      }
    } as unknown as ResponseObject
  }
}

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
      mock_loggerPush.mockReturnValue(null)
      mock_loggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      mock_data.transactionRequest
      jest.clearAllMocks()
      MockSpan = new Span()
    })

    it('forwards POST /thirdpartyRequests/transactions request', async (): Promise<void> => {

      mock_getEndpoint.mockResolvedValue('http://dfspa-sdk')
      mock_sendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, request.params, request.payload, MockSpan)

      expect(mock_getEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mock_sendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })

    it('handles POST /thirdpartyRequests/transactions when payload is undefined', async (): Promise<void> => {

      mock_getEndpoint.mockResolvedValue('http://dfspa-sdk')
      mock_sendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, { ID: '12345' }, undefined)

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
      expect(mock_getEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mock_sendRequest).toHaveBeenCalledWith(...sendReqParamsExpected)
    })

    it('if destination endpoint is not found, send error response to the source', async (): Promise<void> => {
      mock_getEndpoint.mockRejectedValue(new Error('Cannot find endpoint'))
      mock_getEndpoint.mockImplementationOnce((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR,
          'Endpoint not found', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      }).mockResolvedValue('http://pispa-sdk')
      mock_sendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      await expect(Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Endpoint not found'))

      expect(mock_getEndpoint).toHaveBeenCalledTimes(2)
      expect(mock_getEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mock_sendRequest).toHaveBeenCalledTimes(1)
      expect(mock_sendRequest).toHaveBeenLastCalledWith(...sendRequestErrExpected)
    })

    it('if destination endpoint is not found for both source and destiantion', async (): Promise<void> => {
      mock_getEndpoint.mockRejectedValue(new Error('Endpoint not found for both source and destiantion'))
      mock_sendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      await expect(Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Endpoint not found for both source and destiantion'))

      expect(mock_getEndpoint).toHaveBeenCalledTimes(2)
      expect(mock_getEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mock_sendRequest).not.toHaveBeenCalled()
    })

    it('if sendRequest fails, forward error response to the source', async (): Promise<void> => {
      mock_getEndpoint.mockResolvedValueOnce('http://dfspa-sdk').mockResolvedValue('http://pispa-sdk')
      mock_sendRequest.mockImplementationOnce((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR,
          'Failed to send HTTP request to host', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      }).mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      await expect(Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Failed to send HTTP request to host'))

      expect(mock_sendRequest).toHaveBeenCalledTimes(2)
      expect(mock_sendRequest).toHaveBeenLastCalledWith(...sendRequestErrExpected)
    })

    it('handles error in forwardTransactionRequestError', async (): Promise<void> => {
      mock_getEndpoint.mockResolvedValueOnce('http://dfspa-sdk').mockResolvedValue('http://pispa-sdk')
      mock_sendRequest.mockImplementation((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      })

      await expect(Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, {}, request.payload, MockSpan)).rejects.toThrowError(new RegExp('Failed to send HTTP request to host'))
    })
  })
})
