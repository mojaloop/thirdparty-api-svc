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

//TODO: fix imports
import { post } from '../../../../../../../src/server/handlers/tpr/transactions/{ID}/authorizations'
import { Authorizations } from '../../../../../../../src/domain'
import Logger from '@mojaloop/central-services-logger'

const mock_forwardPostAuthorization = jest.spyOn(Authorizations, 'forwardPostAuthorization')
const mock_sendErrorCallback = jest.spyOn(Authorizations, 'sendErrorCallback')
const mock_loggerPush = jest.spyOn(Logger, 'push')
const mock_loggerError = jest.spyOn(Logger, 'error')

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
    beforeAll((): void => {
      mock_loggerPush.mockReturnValue(null)
      mock_loggerError.mockReturnValue(null)
      jest.useFakeTimers()
    })

    beforeEach((): void => {
      jest.clearAllTimers()
      jest.clearAllMocks()
    })

    it('handles a successful request', async () => {
      // Arrange
      mock_forwardPostAuthorization.mockResolvedValueOnce()
      const request = {
        headers: {
          'fspiop-source': 'pispA',
          'fspiop-destination': 'dfspA'
        },
        params: {
          id: '1234'
        },
        payload: {
          // TODO: find real values for these
          challenge: '12345',
          value: '12345',
          consentId: '12345',
          sourceAccountId: 'dfspa.12345.67890',
          status: 'PENDING',
        }
      }
      const expected: Array<any> = [
        request.headers,
        request.params.id,
        request.payload
      ]

      // Act
      const response = await post(request as unknown as Request, h as ResponseToolkit)

      // Assert
      expect(response).toBe(202)
      jest.runAllTimers()
      expect(setImmediate).toHaveBeenCalled()
      expect(mock_forwardPostAuthorization).toHaveBeenCalledWith(...expected)
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      mock_forwardPostAuthorization.mockRejectedValueOnce(new Error('Test Error'))
      mock_sendErrorCallback.mockResolvedValueOnce()
      const request = {
        headers: {
          'fspiop-source': 'pispA',
          'fspiop-destination': 'dfspA'
        },
        params: {
          id: '1234'
        },
        payload: {
          // TODO: find real values for these
          challenge: '12345',
          value: '12345',
          consentId: '12345',
          sourceAccountId: 'dfspa.12345.67890',
          status: 'PENDING',
        }
      }
      const expected: Array<any> = [
        request.headers,
        request.params.id,
        request.payload
      ]

      // Act
      const response = await post(request as unknown as Request, h as ResponseToolkit)

      // Assert
      expect(response).toBe(202)
      jest.runAllTimers()
      expect(setImmediate).toHaveBeenCalled()

      // wait once more for the event loop - since we can't await `runAllImmediates`
      await new Promise(resolve => setImmediate(resolve))
      expect(mock_forwardPostAuthorization).toHaveBeenCalledWith(...expected)
      expect(mock_sendErrorCallback).toHaveBeenCalledTimes(1)
    })
  })
})
