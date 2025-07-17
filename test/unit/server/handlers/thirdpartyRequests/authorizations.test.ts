/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'
import { Request } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'
import * as Handler from '~/server/handlers/thirdpartyRequests/authorizations'
import { Authorizations } from '~/domain/thirdpartyRequests'
import * as TestData from 'test/unit/data/mockData'
import { mockResponseToolkit } from 'test/unit/__mocks__/responseToolkit'

const mockForwardAuthorizationRequest = jest.spyOn(Authorizations, 'forwardAuthorizationRequest')
const mockForwardAuthorizationRequestError = jest.spyOn(Authorizations, 'forwardAuthorizationRequestError')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const MockData = JSON.parse(JSON.stringify(TestData))

const request: Request = {
  headers: {
    'fspiop-source': 'dfspA',
    'fspiop-destination': 'pispA'
  },
  params: {},
  payload: {
    authorizationRequestId: '5f8ee7f9-290f-4e03-ae1c-1e81ecf398df',
    transactionRequestId: '2cf08eed-3540-489e-85fa-b2477838a8c5',
    challenge: '<base64 encoded binary - the encoded challenge>',
    transferAmount: {
      amount: '100',
      currency: 'USD'
    },
    payeeReceiveAmount: {
      amount: '99',
      currency: 'USD'
    },
    fees: {
      amount: '1',
      currency: 'USD'
    },
    payee: {
      partyIdInfo: {
        partyIdType: 'MSISDN',
        partyIdentifier: '+4412345678',
        fspId: 'dfspb'
      }
    },
    payer: {
      partyIdType: 'THIRD_PARTY_LINK',
      partyIdentifier: 'qwerty-123456',
      fspId: 'dfspa'
    },
    transactionType: {
      scenario: 'TRANSFER',
      initiator: 'PAYER',
      initiatorType: 'CONSUMER'
    },
    expiration: '2020-06-15T12:00:00.000Z'
  }
} as unknown as Request
const errorRequest: Request = MockData.genericThirdpartyError

describe('authorizations handler', (): void => {
  describe('POST /thirdpartyRequests/authorizations', (): void => {
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    it('handles a successful request', async (): Promise<void> => {
      mockForwardAuthorizationRequest.mockResolvedValueOnce()

      const expected = [
        '/thirdpartyRequests/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
        request.headers,
        'POST',
        '5f8ee7f9-290f-4e03-ae1c-1e81ecf398df',
        request.payload,
        undefined
      ]

      // Act
      const response = await Handler.post(null, request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(202)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles errors in async manner', async (): Promise<void> => {
      // Arrange
      const MockData = JSON.parse(JSON.stringify(TestData))
      const request: Request = MockData.transactionRequest
      mockForwardAuthorizationRequest.mockResolvedValueOnce()
      mockForwardAuthorizationRequest.mockRejectedValueOnce(new Error('authorizations forward Error'))
      const expected = [
        '/thirdpartyRequests/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
        request.headers,
        'POST',
        undefined,
        request.payload,
        undefined
      ]

      // Act
      const response = await Handler.post(null, request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(202)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
      // Note: no promise rejection here!
    })

    it('handles validation errors synchonously', async (): Promise<void> => {
      // Arrange
      const badSpanRequest = {
        ...request,
        // Setting to empty span dict will cause a validation error
        span: {}
      }

      // Act
      const action = async () => await Handler.post(null, badSpanRequest as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrow('span.setTags is not a function')
    })
  })

  describe('PUT /thirdpartyRequests/authorizations/{ID}', (): void => {
    const request: Request = MockData.updateTransactionRequest
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    it('handles a successful request', async (): Promise<void> => {
      mockForwardAuthorizationRequest.mockResolvedValueOnce()

      const expected = [
        '/thirdpartyRequests/authorizations/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
        request.headers,
        'PUT',
        'b37605f7-bcd9-408b-9291-6c554aa4c802',
        request.payload,
        undefined
      ]

      // Act
      const response = await Handler.put(null, request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles errors in async manner', async (): Promise<void> => {
      // Arrange
      mockForwardAuthorizationRequest.mockResolvedValueOnce()
      mockForwardAuthorizationRequest.mockRejectedValueOnce(new Error('authorizations forward Error'))
      const expected = [
        '/thirdpartyRequests/authorizations/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
        request.headers,
        'PUT',
        'b37605f7-bcd9-408b-9291-6c554aa4c802',
        request.payload,
        undefined
      ]

      // Act
      const response = await Handler.put(null, request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
      // Note: no promise rejection here!
    })

    it('handles validation errors synchonously', async (): Promise<void> => {
      // Arrange
      const badSpanRequest = {
        ...request,
        // Setting to empty span dict will cause a validation error
        span: {}
      }

      // Act
      const action = async () => await Handler.put(null, badSpanRequest as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrow('span.setTags is not a function')
    })
  })

  describe('PUT /thirdpartyRequests/authorizations/{ID}/error', (): void => {
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    it('handles a successful request', async (): Promise<void> => {
      mockForwardAuthorizationRequestError.mockResolvedValueOnce()

      const expected = [
        '/thirdpartyRequests/authorizations/{{ID}}/error',
        expect.objectContaining(errorRequest.headers),
        'a5bbfd51-d9fc-4084-961a-c2c2221a31e0',
        errorRequest.payload,
        undefined
      ]

      // Act
      const response = await Handler.putError(null, errorRequest, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(mockForwardAuthorizationRequestError).toHaveBeenCalledTimes(1)
      expect(mockForwardAuthorizationRequestError).toHaveBeenCalledWith(...expected)
    })

    it('handles validation errors synchronously', async (): Promise<void> => {
      // Arrange
      const badSpanRequest = {
        ...request,
        // Setting to empty span dict will cause a validation error
        span: {}
      }

      // Act
      const action = async () => await Handler.putError(null, badSpanRequest as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrow('span.setTags is not a function')
    })
  })
})
