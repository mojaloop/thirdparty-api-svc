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

 - Lewis Daly <lewisd@crosslaketech.com>
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum, Util } from '@mojaloop/central-services-shared'
import Span from 'test/unit/__mocks__/span'
import { Verifications } from '~/domain/thirdpartyRequests'

const mockGetEndpointAndRender = jest.spyOn(Util.Endpoints, 'getEndpointAndRender')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')

const validPostPayload: tpAPI.Schemas.ThirdpartyRequestsVerificationsPostRequest = {
  verificationRequestId: '5f8ee7f9-290f-4e03-ae1c-1e81ecf398df',
  challenge: '<base64 encoded binary - the encoded challenge>',
  consentId: '062430f3-69ce-454a-84e3-2b73e953cb4a',
  signedPayloadType: 'FIDO',
  fidoSignedPayload: {
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

const validPutPayload: tpAPI.Schemas.ThirdpartyRequestsVerificationsIDPutResponse = {
  authenticationResponse: 'VERIFIED'
}

describe('domain/verifications', () => {
  describe('forwardVerificationRequest', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_VERIFICATIONS_POST
    const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST
    const errorEndpointType =
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR
    const method = Enum.Http.RestMethods.POST

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the POST `thirdpartyRequests/verifications request', async () => {
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue(
        'http://auth-service.local/thirdpartyRequests/verifications'
      )
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = '123456'

      const getEndpointAndRenderExpected = [
        'http://central-ledger.local:3001',
        'dfspA',
        endpointType,
        '/thirdpartyRequests/verifications',
        { ID: '123456' }
      ]
      const sendRequestExpected = [
        'http://auth-service.local/thirdpartyRequests/verifications',
        headers,
        'pispA',
        'dfspA',
        Enum.Http.RestMethods.POST,
        validPostPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      const mockSpan = new Span()

      // Act
      await Verifications.forwardVerificationRequest(
        path,
        endpointType,
        headers,
        method,
        id,
        validPostPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })

    it('handles `getEndpointAndRender` failure', async () => {
      // Arrange
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispA.local')
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = '123456'
      const mockSpan = new Span()

      const getEndpointAndRenderExpectedFirst = [
        'http://central-ledger.local:3001',
        'dfspA',
        endpointType,
        '/thirdpartyRequests/verifications',
        { ID: '123456' }
      ]
      const getEndpointAndRenderExpectedSecond = [
        'http://central-ledger.local:3001',
        'pispA',
        errorEndpointType,
        '/thirdpartyRequests/verifications/{{ID}}/error',
        { ID: '123456' }
      ]

      // Act
      const action = async () =>
        await Verifications.forwardVerificationRequest(
          path,
          endpointType,
          headers,
          method,
          id,
          validPostPayload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
        )

      // Assert
      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedFirst)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
      // Children's children in `forwardVerificationRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardVerificationRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `getEndpointAndRender` failure twice', async () => {
      // Arrange
      mockGetEndpointAndRender
        .mockRejectedValue(new Error('Cannot find endpoint first time'))
        .mockRejectedValue(new Error('Cannot find endpoint second time'))
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = '123456'
      const getEndpointAndRenderExpectedFirst = [
        'http://central-ledger.local:3001',
        'dfspA',
        endpointType,
        '/thirdpartyRequests/verifications',
        { ID: '123456' }
      ]
      const getEndpointAndRenderExpectedSecond = [
        'http://central-ledger.local:3001',
        'pispA',
        errorEndpointType,
        '/thirdpartyRequests/verifications/{{ID}}/error',
        { ID: '123456' }
      ]

      // Act
      const action = async () =>
        await Verifications.forwardVerificationRequest(
          path,
          endpointType,
          headers,
          method,
          id,
          validPostPayload
        )

      // Assert
      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedFirst)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
    })

    it('handles `sendRequest` failure', async () => {
      // Arrange
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://auth-service.local/thirdpartyRequests/verifications')
        .mockResolvedValueOnce('http://pispA.local/thirdpartyRequests/verifications/123456/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request'))
        .mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = '123456'
      const mockSpan = new Span()
      const errorPayload = ReformatFSPIOPError(
        new Error('Failed to send HTTP request')
      ).toApiErrorObject(true, true)

      const getEndpointAndRenderExpectedFirst = [
        'http://central-ledger.local:3001',
        'dfspA',
        endpointType,
        '/thirdpartyRequests/verifications',
        { ID: '123456' }
      ]
      const getEndpointAndRenderExpectedSecond = [
        'http://central-ledger.local:3001',
        'pispA',
        errorEndpointType,
        '/thirdpartyRequests/verifications/{{ID}}/error',
        { ID: '123456' }
      ]
      const sendRequestExpectedFirst = [
        'http://auth-service.local/thirdpartyRequests/verifications',
        headers,
        'pispA',
        'dfspA',
        Enum.Http.RestMethods.POST,
        validPostPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      const sendRequestExpectedSecond = [
        'http://pispA.local/thirdpartyRequests/verifications/123456/error',
        { 'fspiop-source': 'switch', 'fspiop-destination': 'pispA' },
        'switch',
        'pispA',
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]

      // Act
      const action = async () =>
        await Verifications.forwardVerificationRequest(
          path,
          endpointType,
          headers,
          method,
          id,
          validPostPayload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
        )

      // Assert
      await expect(action).rejects.toThrow('Failed to send HTTP request')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedFirst)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpectedFirst)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpectedSecond)
      // Children's children in `forwardAuthorizationRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardAuthorizationRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `sendRequest` failure twice', async (): Promise<void> => {
      // Arrange
      mockGetEndpointAndRender
        .mockResolvedValueOnce('http://auth-service.local/thirdpartyRequests/verifications')
        .mockResolvedValueOnce('http://pispA.local/thirdpartyRequests/verifications/123456/error')
      mockSendRequest
        .mockRejectedValueOnce(new Error('Failed to send HTTP request first time'))
        .mockRejectedValueOnce(new Error('Failed to send HTTP request second time'))
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = '123456'
      const errorPayload = ReformatFSPIOPError(
        new Error('Failed to send HTTP request first time')
      ).toApiErrorObject(true, true)
      const getEndpointAndRenderExpectedFirst = [
        'http://central-ledger.local:3001',
        'dfspA',
        endpointType,
        '/thirdpartyRequests/verifications',
        { ID: '123456' }
      ]
      const getEndpointAndRenderExpectedSecond = [
        'http://central-ledger.local:3001',
        'pispA',
        errorEndpointType,
        '/thirdpartyRequests/verifications/{{ID}}/error',
        { ID: '123456' }
      ]
      const sendRequestExpectedFirst = [
        'http://auth-service.local/thirdpartyRequests/verifications',
        headers,
        'pispA',
        'dfspA',
        Enum.Http.RestMethods.POST,
        validPostPayload,
        Enum.Http.ResponseTypes.JSON,
        undefined
      ]
      const sendRequestExpectedSecond = [
        'http://pispA.local/thirdpartyRequests/verifications/123456/error',
        { 'fspiop-source': 'switch', 'fspiop-destination': 'pispA' },
        'switch',
        'pispA',
        Enum.Http.RestMethods.PUT,
        errorPayload,
        Enum.Http.ResponseTypes.JSON,
        undefined
      ]

      // Act
      const action = async () =>
        await Verifications.forwardVerificationRequest(
          path,
          endpointType,
          headers,
          method,
          id,
          validPostPayload
        )

      // Assert
      await expect(action).rejects.toThrow('Failed to send HTTP request second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedFirst)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpectedSecond)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpectedFirst)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpectedSecond)
    })
  })

  describe('forwardAuthorizationRequestError', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_VERIFICATIONS_PUT_ERROR

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the POST /../authorization error', async () => {
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue(
        'http://pisp.local/thirdpartyRequests/verifications/123456/error'
      )
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': 'switch',
        'fspiop-destination': 'pispA'
      }
      const id = '123456'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointAndRenderExpected = [
        'http://central-ledger.local:3001',
        'pispA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR,
        '/thirdpartyRequests/verifications/{{ID}}/error',
        { ID: '123456' }
      ]
      const sendRequestExpected = [
        'http://pisp.local/thirdpartyRequests/verifications/123456/error',
        headers,
        'switch',
        'pispA',
        Enum.Http.RestMethods.PUT,
        payload,
        Enum.Http.ResponseTypes.JSON,
        undefined
      ]

      // Act
      await Verifications.forwardVerificationRequestError(path, headers, id, payload)

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })
  })

  describe('PUT : forwardVerificationRequest', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_VERIFICATIONS_PUT
    const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT
    const method = Enum.Http.RestMethods.PUT

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the PUT `thirdpartyRequests/verifications/{id} request', async () => {
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = '123456'
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue(
        'http://auth-service.local/thirdpartyRequests/verifications/123456'
      )
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })

      const getEndpointAndRenderExpected = [
        'http://central-ledger.local:3001',
        'dfspA',
        endpointType,
        '/thirdpartyRequests/verifications/{{ID}}',
        { ID: '123456' }
      ]
      const sendRequestExpected = [
        'http://auth-service.local/thirdpartyRequests/verifications/123456',
        headers,
        'pispA',
        'dfspA',
        Enum.Http.RestMethods.PUT,
        validPutPayload,
        Enum.Http.ResponseTypes.JSON,
        expect.objectContaining({ isFinished: false })
      ]
      const mockSpan = new Span()

      // Act
      await Verifications.forwardVerificationRequest(
        path,
        endpointType,
        headers,
        method,
        id,
        validPutPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })
  })
})
