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

 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/

 import { ResponseObject, ResponseToolkit, Request } from "@hapi/hapi"

import AuthorizationsHandler from '~/server/handlers/thirdpartyRequests/transactions/{ID}/authorizations'
import { Authorizations } from '~/domain/thirdpartyRequests'
import Logger from '@mojaloop/central-services-logger'

const mockForwardPostAuthorization = jest.spyOn(Authorizations, 'forwardPostAuthorization')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')

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

describe('authorizations handler', () => {
  describe('POST /thirdpartyRequests/transactions/{ID}/authorizations', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('handles a successful request', async () => {
      // Arrange
      mockForwardPostAuthorization.mockResolvedValueOnce()
      const request = {
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
          status: 'PENDING',
        }
      }
      const expected: Array<any> = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        request.headers,
        request.params.ID,
        request.payload,
        undefined
      ]

      // Act
      const response = await AuthorizationsHandler.post(null, request as unknown as Request, h as ResponseToolkit)

      // Assert
      expect(response).toBe(202)
      expect(mockForwardPostAuthorization).toHaveBeenCalledWith(...expected)
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      mockForwardPostAuthorization.mockRejectedValueOnce(new Error('Test Error'))
      const request = {
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
          status: 'PENDING',
        }
      }
      const expected: Array<any> = [
        '/thirdpartyRequests/transactions/{{ID}}/authorizations',
        request.headers,
        request.params.ID,
        request.payload,
        undefined
      ]

      // Act
      const response = await AuthorizationsHandler.post(null, request as unknown as Request, h as ResponseToolkit)

      // Assert
      expect(response).toBe(202)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise(resolve => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(mockForwardPostAuthorization).toHaveBeenCalledWith(...expected)
    })

    it('handles validation errors synchnously', async () => {
      // Arrange
      const request = {
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
          status: 'PENDING',
        },
        // Will setting the span to null do stuff?
        span: {
        }
      }

      // Act
      const action = async () => await AuthorizationsHandler.post(null, request as unknown as Request, h as ResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })
})