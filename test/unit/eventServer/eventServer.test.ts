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

 * Crosslake
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/
'use strict'

import { mapServiceConfigToConsumerConfig } from "~/shared/util"
import defaultMockConfig from '../data/defaultMockConfig'
import Consumer from '~/shared/consumer'
import notificationEventHandler from '~/eventServer/eventHandlers/notificationEvent'
import { start, create, HandlerNotFoundError } from '~/eventServer/eventServer'
import { Enum } from '@mojaloop/central-services-shared'


const consumerStartMock = jest.spyOn(Consumer.prototype, 'start')

describe('eventServer', () => {
  beforeEach(() => jest.resetAllMocks())

  describe('create', () => {
    it('creates the consumers based on config', async () => {
      // Arrange
      // Act
      const consumers = create(defaultMockConfig)

      // Assert
      // Consumer is tested elsewhere, we just want to make sure `create()`
      // does what we want
      expect(consumers.length).toBe(1)
    })

    it('throws a HandlerNotFound error if a handler is specified in config but cannot be found', async () => {
      // Arrange
      const badConfig = JSON.parse(JSON.stringify(defaultMockConfig))
      // Set the event type to one that we don't have a handler for
      badConfig.KAFKA.CONSUMER[0].eventType = Enum.Events.Event.Type.PARTY
      const expected = new HandlerNotFoundError(Enum.Events.Event.Action.COMMIT, Enum.Events.Event.Type.PARTY)

      // Act
      const action = async () => create(badConfig)

      // Assert
      await expect(action).rejects.toThrowError(expected)
    })
  })

  describe('start', () => {
    it('starts all the consumers', async () => {
      // Arrange
      const consumerConfig = mapServiceConfigToConsumerConfig(defaultMockConfig.KAFKA.CONSUMER[0])
      const consumers = [
        new Consumer(consumerConfig, defaultMockConfig.KAFKA.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, notificationEventHandler)
      ]
      consumerStartMock.mockResolvedValueOnce()

      // Act
      await start(consumers)

      // Assert
      expect(consumerStartMock).toHaveBeenCalledTimes(1)
      expect(consumerStartMock).toHaveBeenCalledWith()
    })
  })
})
