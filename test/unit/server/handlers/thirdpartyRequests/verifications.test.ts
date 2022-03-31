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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'
import { Request } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'
import * as Handler from '~/server/handlers/thirdpartyRequests/verifications'
import { Verifications } from '~/domain/thirdpartyRequests'
import * as TestData from 'test/unit/data/mockData'
import { mockResponseToolkit } from 'test/unit/__mocks__/responseToolkit'

const mockForwardVerificationRequest = jest.spyOn(Verifications, 'forwardVerificationRequest')
const mockForwardVerificationRequestError = jest.spyOn(
  Verifications,
  'forwardVerificationRequestError'
)
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
    verificationRequestId: '5f8ee7f9-290f-4e03-ae1c-1e81ecf398df',
    challenge: '<base64 encoded binary - the encoded challenge>',
    consentId: '062430f3-69ce-454a-84e3-2b73e953cb4a',
    signedPayloadType: 'FIDO',
    signedPayload: {
      id: '45c-TkfkjQovQeAWmOy-RLBHEJ_e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA',
      rawId:
        '45c+TkfkjQovQeAWmOy+RLBHEJ/e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA==',
      response: {
        authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2MBAAAACA==',
        clientDataJSON:
          'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiQUFBQUFBQUFBQUFBQUFBQUFBRUNBdyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIxODEiLCJjcm9zc09yaWdpbiI6ZmFsc2UsIm90aGVyX2tleXNfY2FuX2JlX2FkZGVkX2hlcmUiOiJkbyBub3QgY29tcGFyZSBjbGllbnREYXRhSlNPTiBhZ2FpbnN0IGEgdGVtcGxhdGUuIFNlZSBodHRwczovL2dvby5nbC95YWJQZXgifQ==',
        signature:
          'MEUCIDcJRBu5aOLJVc/sPyECmYi23w8xF35n3RNhyUNVwQ2nAiEA+Lnd8dBn06OKkEgAq00BVbmH87ybQHfXlf1Y4RJqwQ8='
      },
      type: 'public-key'
    }
  }
} as unknown as Request
const errorRequest: Request = MockData.genericThirdpartyError

describe('verifications handler', (): void => {
  describe('POST /thirdpartyRequests/verifications', (): void => {
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    it('handles a successful request', async (): Promise<void> => {
      mockForwardVerificationRequest.mockResolvedValueOnce()

      const expected = [
        '/thirdpartyRequests/verifications',
        'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST',
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
      expect(mockForwardVerificationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardVerificationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles errors in async manner', async (): Promise<void> => {
      // Arrange
      const MockData = JSON.parse(JSON.stringify(TestData))
      const request: Request = MockData.transactionRequest
      mockForwardVerificationRequest.mockResolvedValueOnce()
      mockForwardVerificationRequest.mockRejectedValueOnce(
        new Error('verifications forward Error')
      )
      const expected = [
        '/thirdpartyRequests/verifications',
        'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST',
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
      expect(mockForwardVerificationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardVerificationRequest).toHaveBeenCalledWith(...expected)
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
      const action = async () =>
        await Handler.post(null, badSpanRequest as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })

  describe('PUT /thirdpartyRequests/verifications/{ID}', (): void => {
    const request: Request = MockData.updateTransactionRequest
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    it('handles a successful request', async (): Promise<void> => {
      mockForwardVerificationRequest.mockResolvedValueOnce()

      const expected = [
        '/thirdpartyRequests/verifications/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT',
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
      expect(mockForwardVerificationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardVerificationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles errors in async manner', async (): Promise<void> => {
      // Arrange
      mockForwardVerificationRequest.mockResolvedValueOnce()
      mockForwardVerificationRequest.mockRejectedValueOnce(
        new Error('verifications forward Error')
      )
      const expected = [
        '/thirdpartyRequests/verifications/{{ID}}',
        'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT',
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
      expect(mockForwardVerificationRequest).toHaveBeenCalledTimes(1)
      expect(mockForwardVerificationRequest).toHaveBeenCalledWith(...expected)
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
      const action = async () =>
        await Handler.put(null, badSpanRequest as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })

  describe('PUT /thirdpartyRequests/verifications/{ID}/error', (): void => {
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    it('handles a successful request', async (): Promise<void> => {
      mockForwardVerificationRequestError.mockResolvedValueOnce()

      const expected = [
        '/thirdpartyRequests/verifications/{{ID}}/error',
        expect.objectContaining(errorRequest.headers),
        'a5bbfd51-d9fc-4084-961a-c2c2221a31e0',
        errorRequest.payload,
        undefined
      ]

      // Act
      const response = await Handler.putError(null, errorRequest, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(mockForwardVerificationRequestError).toHaveBeenCalledTimes(1)
      expect(mockForwardVerificationRequestError).toHaveBeenCalledWith(...expected)
    })

    it('handles validation errors synchronously', async (): Promise<void> => {
      // Arrange
      const badSpanRequest = {
        ...request,
        // Setting to empty span dict will cause a validation error
        span: {}
      }

      // Act
      const action = async () =>
        await Handler.putError(null, badSpanRequest as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })
})
