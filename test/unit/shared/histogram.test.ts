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

 --------------
 ******/
'use strict'
import { Request } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'
import Metrics from '@mojaloop/central-services-metrics'

import * as Handler from '~/server/handlers/thirdpartyRequests/transactions'
import { Transactions } from '~/domain/thirdpartyRequests'
import * as TestData from 'test/unit/data/mockData'
import { wrapWithHistogram } from '~/shared/histogram'
import { mockResponseToolkit } from '../__mocks__/responseToolkit'

const mockForwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockMetrics = jest.spyOn(Metrics, 'getHistogram')
const MockData = JSON.parse(JSON.stringify(TestData))

const request: Request = MockData.transactionRequest

describe('histogram', (): void => {
  describe('wrapWithHistogram', () => {
    beforeAll((): void => {
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('does not call the histogram twice if an error occours', async (): Promise<void> => {
      // Arrange
      const mockHistTimerEnd = jest.fn()
      mockMetrics.mockReturnValue({
        startTimer: jest.fn().mockReturnValue(mockHistTimerEnd),
        observe: jest.fn(),
        reset: jest.fn(),
        zero: jest.fn(),
        labels: jest.fn(),
        remove: jest.fn()
      })
      mockForwardTransactionRequest.mockRejectedValueOnce(() => {
        throw new Error('Test Error')
      })
      const wrappedHandler = wrapWithHistogram(Handler.post, [
        'thirdpartyRequests_transactions_authorizations_post',
        'Post thirdpartyRequests transactions authorizations request',
        ['success']
      ])

      // Act
      const response = await wrappedHandler(null, request, mockResponseToolkit)

      // Assert
      expect(response.statusCode).toBe(202)
      expect(mockForwardTransactionRequest).toHaveBeenCalledTimes(1)
      expect(mockHistTimerEnd).toHaveBeenCalledTimes(1)
      expect(mockHistTimerEnd).toHaveBeenCalledWith({ success: 'true' })

      // wait once more for the event loop - since we can't await `forwardTransactionRequest`
      await new Promise((resolve) => setImmediate(resolve))
    })

    it('handles a handler error', async (): Promise<void> => {
      // Arrange
      const mockHistTimerEnd = jest.fn()
      mockMetrics.mockReturnValue({
        startTimer: jest.fn().mockReturnValue(mockHistTimerEnd),
        observe: jest.fn(),
        reset: jest.fn(),
        zero: jest.fn(),
        labels: jest.fn(),
        remove: jest.fn()
      })
      const mockHandler = jest.fn().mockRejectedValueOnce(new Error('Test Error'))

      const wrappedHandler = wrapWithHistogram(mockHandler, [
        'thirdpartyRequests_transactions_authorizations_post',
        'Post thirdpartyRequests transactions authorizations request',
        ['success']
      ])

      // Act
      const action = async () => await wrappedHandler(null, request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrow('Test Error')
      expect(mockHandler).toHaveBeenCalledTimes(1)
      expect(mockHistTimerEnd).toHaveBeenCalledTimes(1)
      expect(mockHistTimerEnd).toHaveBeenCalledWith({ success: 'false' })
    })

    it('throws original `Metrics.getHistogram()` error', async (): Promise<void> => {
      // Arrange
      mockMetrics.mockImplementationOnce(() => {
        throw new Error('Test Error')
      })
      const mockHandler = jest.fn()
      const wrappedHandler = wrapWithHistogram(mockHandler, [
        'thirdpartyRequests_transactions_authorizations_post',
        'Post thirdpartyRequests transactions authorizations request',
        ['success']
      ])

      // Act
      const action = async () => await wrappedHandler(null, request, mockResponseToolkit)

      // Assert
      await expect(action).rejects.toThrow('Test Error')
    })
  })
})
