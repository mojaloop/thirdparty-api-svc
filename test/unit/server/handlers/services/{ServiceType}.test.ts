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

- Kevin Leyow <kevin.leyow@modusbox.com>

--------------
******/
import { Request } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'

import * as Services from '~/domain/services'
import { mockResponseToolkit } from 'test/unit/__mocks__/responseToolkit'
import ServicesServiceTypeHandler from '~/server/handlers/services/{ServiceType}'
import * as TestData from 'test/unit/data/mockData'

jest.mock('~/shared/config', () => ({
  PARTICIPANT_LIST_SERVICE_URL: undefined,
  PARTICIPANT_LIST_LOCAL: undefined,
  HUB_PARTICIPANT: {
    NAME: 'mockHubName'
  }
}))

const mockData = JSON.parse(JSON.stringify(TestData))

const forwardGetServicesServiceTypeRequestToProviderService = jest.spyOn(
  Services,
  'forwardGetServicesServiceTypeRequestToProviderService'
)
const forwardGetServicesServiceTypeRequestFromProviderService = jest.spyOn(
  Services,
  'forwardGetServicesServiceTypeRequestFromProviderService'
)
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const getServicesByServiceTypeRequest = mockData.getServicesByServiceTypeRequest
const putServicesByServiceTypeRequest = mockData.putServicesByServiceTypeRequest

const mockForwardGetServicesServiceTypeRequestExpected = [
  '/services/{{ServiceType}}',
  getServicesByServiceTypeRequest.headers,
  'GET',
  getServicesByServiceTypeRequest.params.ServiceType,
  undefined
]

const mockForwardPutServicesServiceTypeRequestExpected = [
  '/services/{{ServiceType}}',
  'TP_CB_URL_SERVICES_PUT',
  putServicesByServiceTypeRequest.headers,
  'PUT',
  getServicesByServiceTypeRequest.params.ServiceType,
  putServicesByServiceTypeRequest.payload,
  undefined
]

describe('ServicesServiceType handler', () => {
  describe('GET /services/{{ServiceType}}', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('handles a successful request', async () => {
      // Arrange
      forwardGetServicesServiceTypeRequestToProviderService.mockResolvedValueOnce()
      // Act
      const response = await ServicesServiceTypeHandler.get(
        null,
        getServicesByServiceTypeRequest as unknown as Request,
        mockResponseToolkit
      )

      // Assert
      expect(response.statusCode).toBe(202)
      expect(forwardGetServicesServiceTypeRequestToProviderService).toHaveBeenCalledWith(
        ...mockForwardGetServicesServiceTypeRequestExpected
      )
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      forwardGetServicesServiceTypeRequestToProviderService.mockRejectedValueOnce(new Error('Test Error'))
      // Act
      const response = await ServicesServiceTypeHandler.get(
        null,
        getServicesByServiceTypeRequest as unknown as Request,
        mockResponseToolkit
      )
      // Assert
      expect(response.statusCode).toBe(202)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise((resolve) => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(forwardGetServicesServiceTypeRequestToProviderService).toHaveBeenCalledWith(
        ...mockForwardGetServicesServiceTypeRequestExpected
      )
    })

    it('handles validation errors synchronously', async () => {
      // Arrange
      const invalReq = {
        ...getServicesByServiceTypeRequest,
        span: {}
      }
      // Act
      const action = async () =>
        await ServicesServiceTypeHandler.get(null, invalReq as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })

  describe('PUT /services/{{ServiceType}}', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('handles a successful request', async () => {
      // Arrange
      forwardGetServicesServiceTypeRequestFromProviderService.mockResolvedValueOnce()
      // Act
      const response = await ServicesServiceTypeHandler.put(
        null,
        putServicesByServiceTypeRequest as unknown as Request,
        mockResponseToolkit
      )
      // Assert
      expect(response.statusCode).toBe(200)
      expect(forwardGetServicesServiceTypeRequestFromProviderService).toHaveBeenCalledWith(
        ...mockForwardPutServicesServiceTypeRequestExpected
      )
    })

    it('handles errors asynchronously', async () => {
      // Arrange
      forwardGetServicesServiceTypeRequestFromProviderService.mockRejectedValueOnce(new Error('Test Error'))
      // Act
      const response = await ServicesServiceTypeHandler.put(
        null,
        putServicesByServiceTypeRequest as unknown as Request,
        mockResponseToolkit
      )
      // Assert
      expect(response.statusCode).toBe(200)
      // wait once more for the event loop - since we can't await `runAllImmediates`
      // this helps make sure the tests don't become flaky
      await new Promise((resolve) => setImmediate(resolve))
      // The main test here is that there is no unhandledPromiseRejection!
      expect(forwardGetServicesServiceTypeRequestFromProviderService).toHaveBeenCalledWith(
        ...mockForwardPutServicesServiceTypeRequestExpected
      )
    })

    it('handles validation errors synchronously', async () => {
      // Arrange
      const invalReq = {
        ...putServicesByServiceTypeRequest,
        // Will setting the span to null do stuff?
        span: {}
      }
      // Act
      const action = async () =>
        await ServicesServiceTypeHandler.put(null, invalReq as unknown as Request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrowError('span.setTags is not a function')
    })
  })
})
