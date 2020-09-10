

import * as eventServer from '~/eventServer/eventServer'
// jest.mock('~/eventServer/eventServer')
import run from '~/eventServer/run'

import notificationEventHandler from '~/eventServer/eventHandlers/notificationEvent'
import defaultMockConfig from '../data/defaultMockConfig'
import Consumer from '~/shared/consumer'
import { mapServiceConfigToConsumerConfig } from '~/shared/util'

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
    await run(defaultMockConfig)

    // Assert
    expect(createMock).toHaveBeenCalledWith(defaultMockConfig)
    expect(startMock).toHaveBeenCalledWith(consumers)
  })
})
