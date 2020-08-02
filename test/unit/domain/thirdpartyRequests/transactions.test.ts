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

const mock_getEndpoint = jest.spyOn(Util.Endpoints, 'getEndpoint')
const mock_sendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mock_loggerPush = jest.spyOn(Logger, 'push')
const mock_loggerError = jest.spyOn(Logger, 'error')
const api_path = '/thirdpartyRequests/transactions'

const request = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {},
  payload: {
    transactionRequestId: '7d34f91d-d078-4077-8263-2c047876fcf6',
    sourceAccountId: 'dfspa.alice.1234',
    consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
    payee: {
      partyIdInfo: {
        partyIdType: 'MSISDN',
        partyIdentifier: '+44 1234 5678',
        fspId: 'dfspB'
      }
    },
    payer: {
      personalInfo: {
        complexName: {
          firstName: 'Alice',
          lastName: 'K'
        }
      },
      partyIdInfo: {
        partyIdType: 'MSISDN',
        partyIdentifier: '+44 8765 4321',
        fspId: 'dfspA'
      }
    },
    amountType: 'SEND',
    amount: {
      amount: '100',
      currency: 'USD'
    },
    transactionType: {
      scenario: 'TRANSFER',
      initiator: 'PAYER',
      initiatorType: 'CONSUMER'
    },
    expiration: '2020-07-15T22:17:28.985-01:00'
  },

}

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
  undefined
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
  undefined
]

describe('domain /thirdpartyRequests/transactions', () => {
  describe('forwardTransactionRequests', () => {
    beforeAll((): void => {
      mock_loggerPush.mockReturnValue(null)
      mock_loggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllTimers()
      jest.clearAllMocks()
    })

    it('forwards POST /thirdpartyRequests/transactions request', async (): Promise<void> => {

      mock_getEndpoint.mockResolvedValue('http://dfspa-sdk')
      mock_sendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })
      await Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, request.params, request.payload)

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
      mock_getEndpoint.mockResolvedValueOnce("").mockResolvedValueOnce('http://pispa-sdk')
      mock_sendRequest.mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      const errorMsg = 'No THIRDPARTY_CALLBACK_URL_TRX_REQ_POST endpoint found for transactionRequest ' + request.payload.transactionRequestId + ' for ' + request.headers[Enum.Http.Headers.FSPIOP.DESTINATION]

      await expect(Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, {}, request.payload)).rejects.toThrowError(new RegExp(errorMsg))

      expect(mock_getEndpoint).toHaveBeenCalledTimes(2)
      expect(mock_getEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mock_sendRequest).toHaveBeenCalledTimes(1)
      expect(mock_sendRequest).toHaveBeenLastCalledWith(...sendRequestErrExpected)
    })

    it('if sendRequest fails, forward error response to the source', async (): Promise<void> => {
      mock_getEndpoint.mockResolvedValueOnce('http://dfspa-sdk').mockResolvedValue('http://pispa-sdk')
      mock_sendRequest.mockImplementationOnce((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR,
          'Failed to send HTTP request to host', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      }).mockResolvedValue({ ok: true, status: 202, statusText: 'Accepted', payload: null })

      await expect(Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, {}, request.payload)).rejects.toThrowError(new RegExp('Failed to send HTTP request to host'))

      expect(mock_sendRequest).toHaveBeenCalledTimes(2)
      expect(mock_sendRequest).toHaveBeenLastCalledWith(...sendRequestErrExpected)
    })

    it('handles error in forwardTransactionRequestError', async (): Promise<void> => {
      mock_getEndpoint.mockResolvedValueOnce('http://dfspa-sdk').mockResolvedValue('http://pispa-sdk')
      mock_sendRequest.mockImplementation((): any => {
        throw ErrorHandler.CreateFSPIOPError(ErrorHandler.Enums.FSPIOPErrorCodes.DESTINATION_COMMUNICATION_ERROR, 'Failed to send HTTP request to host', new Error(), request.headers['fspiop-source'], [{ key: 'cause', value: {} }])
      })

      await expect(Transactions.forwardTransactionRequest(api_path, request.headers, Enum.Http.RestMethods.POST, {}, request.payload)).rejects.toThrowError(new RegExp('Failed to send HTTP request to host'))
    })
  })
})
