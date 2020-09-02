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

 - Lewis Daly <lewisd@crosslaketech.com>
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/

import { Request } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'

import AuthorizationsHandler from '~/server/handlers/thirdpartyRequests/transactions/{ID}/authorizations'
import { Authorizations } from '~/domain/thirdpartyRequests'
import { mockResponseToolkit } from 'test/unit/__mocks__/responseToolkit'

const mockForwardAuthorizationRequest = jest.spyOn(Authorizations, 'forwardAuthorizationRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const postAuthRequest = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {
    ID: '1234'
  },
  payload: {
    challenge: '12345',
    value: '12345',
    consentId: '12345',
    sourceAccountId: 'dfspa.12345.67890',
    status: 'PENDING'
  }
}
const putAuthRequest = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {
    ID: '1234'
  },
  payload: {
    challenge: '12345',
    value: '12345',
    consentId: '12345',
    sourceAccountId: 'dfspa.12345.67890',
    status: 'VERIFIED'
  }
}

describe('authorizations handler', () => {
  describe('POST /thirdpartyRequests/transactions/{ID}/authorizations', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('handles a successful request', async () => {
      // Arrange
      mockForwardAuthorizationRequest.mockResolvedValueOnce()
      const request = postAuthRequest
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
        request.headers,
        'POST',
        request.params.ID,
        request.payload,
        undefined
      ]

      // Act
      const response = await AuthorizationsHandler.post(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(202)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      mockForwardAuthorizationRequest.mockRejectedValueOnce(new Error('Test Error'))
      const request = postAuthRequest
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
        request.headers,
        'POST',
        request.params.ID,
        request.payload,
        undefined
      ]

      // Act
      const response = await AuthorizationsHandler.post(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(202)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise(resolve => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles validation errors synchnously', async () => {
      // Arrange
      const request = {
        ...postAuthRequest,
        // Will setting the span to null do stuff?
        span: {
        }
      }

      // Act
      const action = async () => await AuthorizationsHandler.post(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })

  describe('PUT /thirdpartyRequests/transactions/{ID}/authorizations', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('handles a successful request', async () => {
      // Arrange
      mockForwardAuthorizationRequest.mockResolvedValueOnce()
      const request = putAuthRequest
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
        request.headers,
        'PUT',
        request.params.ID,
        request.payload,
        undefined
      ]

      // Act
      const response = await AuthorizationsHandler.put(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      mockForwardAuthorizationRequest.mockRejectedValueOnce(new Error('Test Error'))
      const request = putAuthRequest
      const expected = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
        request.headers,
        'PUT',
        request.params.ID,
        request.payload,
        undefined
      ]

      // Act
      const response = await AuthorizationsHandler.put(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise(resolve => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles validation errors synchnously', async () => {
      // Arrange
      const request = {
        ...putAuthRequest,
        // Will setting the span to null do stuff?
        span: {
        }
      }

      // Act
      const action = async () => await AuthorizationsHandler.put(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })
})
