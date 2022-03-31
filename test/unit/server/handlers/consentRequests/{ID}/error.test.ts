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

 - Kevin Leyow <kevin.leyow@modusbox.com>
 --------------
 ******/
'use strict'
import { Request } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'
import ConsentRequestsIdErrorHandler from '~/server/handlers/consentRequests/{ID}/error'
import * as ConsentRequests from '~/domain/consentRequests'
import * as TestData from 'test/unit/data/mockData'
import { mockResponseToolkit } from 'test/unit/__mocks__/responseToolkit'

const mockForwardConsentRequestsIdRequestError = jest.spyOn(
  ConsentRequests,
  'forwardConsentRequestsIdRequestError'
)
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const MockData = JSON.parse(JSON.stringify(TestData))

const request: Request = MockData.genericThirdpartyError

describe('consent requests error handler', (): void => {
  describe('PUT /consentRequests/{ID}/error', (): void => {
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    const expected = [
      '/consentRequests/{{ID}}/error',
      request.params.ID,
      expect.objectContaining(request.headers),
      request.payload,
      undefined
    ]

    it('handles a successful request', async (): Promise<void> => {
      mockForwardConsentRequestsIdRequestError.mockResolvedValueOnce()

      // Act
      const response = await ConsentRequestsIdErrorHandler.put(null, request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      expect(mockForwardConsentRequestsIdRequestError).toHaveBeenCalledTimes(1)
      expect(mockForwardConsentRequestsIdRequestError).toHaveBeenCalledWith(...expected)
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      mockForwardConsentRequestsIdRequestError.mockRejectedValueOnce(new Error('Test Error'))
      // Act
      const response = await ConsentRequestsIdErrorHandler.put(null, request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise((resolve) => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(mockForwardConsentRequestsIdRequestError).toHaveBeenCalledWith(...expected)
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
        await ConsentRequestsIdErrorHandler.put(
          null,
          badSpanRequest as unknown as Request,
          mockResponseToolkit
        )

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })
})
