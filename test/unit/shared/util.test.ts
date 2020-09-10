/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
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
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation

 * ModusBox
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 * Crosslake
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/
'use strict'

import { Request } from '@hapi/hapi'
import {
  finishChildSpan,
  getStackOrInspect,
  getSpanTags,
  mapServiceConfigToConsumerConfig,
  temporaryMockTransactionCallback
} from '~/shared/util'
import * as types from '~/interface/types'
import { FSPIOPError, ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import { EventStateMetadata, EventStatusType } from '@mojaloop/event-sdk'
import { ExternalServiceKafkaConfig } from '~/shared/config'
import { Enum } from '@mojaloop/central-services-shared'
import { NotificationMessage } from '~/eventServer/eventHandlers/notificationEvent'

const mockData = require('../data/mockData.json')

const headers = {
  'fspiop-source': 'pispA',
  'fspiop-destination': 'dfspA'
}

describe('util', (): void => {
  describe('temporaryMockTransactionCallback', (): void => {
    it('creates a mock transaction callback', async (): Promise<void> => {
      // Arrange
      const input: NotificationMessage = mockData.notificationEventCommit;
      const expected: NotificationMessage = mockData.notificationEventTransactionCommit;

      // Act
      const result = temporaryMockTransactionCallback({
        transactionRequestId: 'abcd-1234', 
        pispId: 'pispA'
      }, input)

      // Assert
      expect(result).toStrictEqual(expected)
    })
  })

  describe('finishChildSpan', (): void => {
    it('calls error and finish', async (): Promise<void> => {
      // Arrange
      const error: FSPIOPError = ReformatFSPIOPError(new Error('Test Error'))
      const mockSpan = {
        error: jest.fn(),
        finish: jest.fn(),
      }
      const expectedState = new EventStateMetadata(
        EventStatusType.failed,
        error.apiErrorCode.code,
        error.apiErrorCode.message
      )

      // Act
      await finishChildSpan(error, mockSpan)

      // Assert
      expect(mockSpan.error).toHaveBeenCalledTimes(1)
      expect(mockSpan.error).toHaveBeenCalledWith(error, expectedState)
      expect(mockSpan.finish).toHaveBeenCalledWith(error.message, expectedState)
    })
  })

  describe('getStackOrInspect', (): void => {
    it('handles an error without a stack', (): void => {
      const input = new Error('This is a normal error')
      delete input.stack
      const expected = '[Error: This is a normal error]'
      const output = getStackOrInspect(input)
      expect(output).toBe(expected)
    })
  })
  describe('getSpanTags', (): void => {
    it('create correct span tags', (): void => {
      // @ts-ignore
      const request: Request = {
        headers: headers,
        params: {},
        payload: { transactionRequestId: '1234' }
      }
      const expected = {
        source: 'pispA',
        destination: 'dfspA',
        eventType: 'transaction-request',
        eventAction: 'POST',
        transactionId: '1234',
        transactionId2: 'transactionId2'
      }
      const output = getSpanTags(request, 'transaction-request', 'POST', { transactionId: '1234', transactionId2: 'transactionId2' })
      expect(output).toStrictEqual(expected)
    })

    it('create correct span tags when headers and customTags are not set', (): void => {
      // @ts-ignore
      const request: Request = {
        headers: {},
        params: {},
        payload: {}
      }
      const eventType = 'transaction-request'
      const eventAction = 'POST'
      const expected = {
        source: undefined,
        destination: undefined,
        eventType,
        eventAction
      }
      const output = getSpanTags(request, 'transaction-request', 'POST')
      expect(output).toStrictEqual(expected)
    })
  })

  describe('mapServiceConfigToConsumerConfig', (): void => {
    it('maps from `KafkaConsumerConfig` to `ConsumerConfig`', async (): Promise<void> => {
      // Arrange
      const input: ExternalServiceKafkaConfig = {
        eventAction: Enum.Events.Event.Action.COMMIT,
        eventType: Enum.Events.Event.Type.EVENT,
        options: {
          mode: 2,
          batchSize: 1,
          pollFrequency: 10,
          recursiveTimeout: 100,
          messageCharset: "utf8",
          messageAsJSON: true,
          sync: true,
          consumeTimeout: 1000
        },
        rdkafkaConf: {
          'client.id': '3p-con-notification-event',
          'group.id': '3p-group-notification-event',
          'metadata.broker.list': 'localhost:9092',
          'socket.keepalive.enable': true
        },
        topicConf: {
          'auto.offset.reset': 'earliest'
        }
      }
      const expected = {
        eventAction: Enum.Events.Event.Action.COMMIT,
        eventType: Enum.Events.Event.Type.EVENT,
        internalConfig: {
          options: {
            mode: 2,
            batchSize: 1,
            pollFrequency: 10,
            recursiveTimeout: 100,
            messageCharset: "utf8",
            messageAsJSON: true,
            sync: true,
            consumeTimeout: 1000
          },
          rdkafkaConf: {
            'client.id': '3p-con-notification-event',
            'group.id': '3p-group-notification-event',
            'metadata.broker.list': 'localhost:9092',
            'socket.keepalive.enable': true
          },
          topicConf: {
            'auto.offset.reset': 'earliest'
          }
        }
      }

      // Act
      const result = mapServiceConfigToConsumerConfig(input)

      // Assert
      expect(result).toStrictEqual(expected)
    })
  })
})

describe('types', (): void => {
  it('common types', (): void => {
    expect(types.AmountType.RECEIVE).toEqual('RECEIVE')
    expect(types.AmountType.SEND).toEqual('SEND')
  })
})
