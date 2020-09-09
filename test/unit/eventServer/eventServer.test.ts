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

// import start, { create, run } from '~/eventServer'

import * as eventServer from '~/eventServer/eventServer'
import notificationEventHandler from '~/eventServer/eventHandlers/notificationEvent'
import defaultMockConfig from '../data/defaultMockConfig'
import Consumer from '~/shared/consumer'
import { mapServiceConfigToConsumerConfig } from '~/shared/util'

describe('eventServer', () => {
  beforeEach(() => jest.resetAllMocks())


  describe('create', () => {
    it.todo('creates the consumers based on config')
    it.todo('starts the consumers')
  })

  describe('start', () => {
    it.todo('starts all the consumers')
  })

  describe('run', () => {
    it('calls create and start', async () => {
      // Arrange
      const consumerConfig = mapServiceConfigToConsumerConfig(defaultMockConfig.KAFKA.CONSUMER[0])
      const consumers = [
        new Consumer(consumerConfig, defaultMockConfig.KAFKA.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE, notificationEventHandler.onEvent)
      ]
      const createMock = jest.spyOn(eventServer, 'create').mockReturnValueOnce(consumers)
      const startMock = jest.spyOn(eventServer, 'start').mockResolvedValueOnce()
      
      // Act
      await eventServer.default(defaultMockConfig)
      
      // Assert
      expect(createMock).toHaveBeenCalledWith(defaultMockConfig)
      expect(startMock).toHaveBeenCalledWith(consumers)
    })
  })
})