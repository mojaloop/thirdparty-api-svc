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
import { Request } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'

import * as Accounts from '~/domain/accounts'
import { mockResponseToolkit } from 'test/unit/__mocks__/responseToolkit'
import AccountsIdHandler from '~/server/handlers/accounts/{ID}'
import * as TestData from 'test/unit/data/mockData'
const MockData = JSON.parse(JSON.stringify(TestData))

const mockForwardAccountsIdRequest = jest.spyOn(Accounts, 'forwardAccountsIdRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const request: Request = MockData.accountsRequest

const mockForwardPutAccountsIdRequestExpected = [
  '/accounts/{{ID}}',
  'TP_CB_URL_ACCOUNTS_PUT',
  request.headers,
  'PUT',
  request.params.ID,
  request.payload,
  undefined
]

const mockForwardGetAccountsIdRequestExpected = [
  '/accounts/{{ID}}',
  'TP_CB_URL_ACCOUNTS_GET',
  request.headers,
  'GET',
  request.params.ID,
  undefined,
  undefined
]

describe('accountsId handler', () => {
  describe('GET /accounts/{ID}', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('handles a successful request', async () => {
      // Arrange
      mockForwardAccountsIdRequest.mockResolvedValueOnce()
      // Act
      const response = await AccountsIdHandler.get(null, request as unknown as Request, mockResponseToolkit)
      // Assert
      expect(response.statusCode).toBe(202)
      expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...mockForwardGetAccountsIdRequestExpected)
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      mockForwardAccountsIdRequest.mockRejectedValueOnce(new Error('Test Error'))
      // Act
      const response = await AccountsIdHandler.get(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(202)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise((resolve) => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...mockForwardGetAccountsIdRequestExpected)
    })

    it('handles validation errors synchronously', async () => {
      // Arrange
      const invalReq = {
        ...request,
        // Will setting the span to null do stuff?
        span: {}
      }
      // Act
      const action = async () => await AccountsIdHandler.get(null, invalReq as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })

  describe('PUT /accounts/{ID}', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('handles a successful request', async () => {
      // Arrange
      mockForwardAccountsIdRequest.mockResolvedValueOnce()
      // Act
      const response = await AccountsIdHandler.put(null, request as unknown as Request, mockResponseToolkit)
      // Assert
      expect(response.statusCode).toBe(200)
      expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...mockForwardPutAccountsIdRequestExpected)
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      mockForwardAccountsIdRequest.mockRejectedValueOnce(new Error('Test Error'))
      // Act
      const response = await AccountsIdHandler.put(null, request as unknown as Request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(200)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise((resolve) => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...mockForwardPutAccountsIdRequestExpected)
    })

    it('handles validation errors synchronously', async () => {
      // Arrange
      const invalReq = {
        ...request,
        // Will setting the span to null do stuff?
        span: {}
      }
      // Act
      const action = async () => await AccountsIdHandler.put(null, invalReq as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })
})
