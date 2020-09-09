import Consumer, { ConsumerConfig } from "~/shared/consumer"
import { Enum } from '@mojaloop/central-services-shared'

const { internalConfig } = require('../data/mockData.json')

describe('consumer', () => {
  it('connects to kafka topic', async () => {
    const config: ConsumerConfig = {
      eventAction: Enum.Events.Event.Action.EVENT,
      eventType: Enum.Events.Event.Type.NOTIFICATION,
      internalConfig
    }
    const topicTemplate = 'topic-{{functionality}}-{{action}}'
    const handlerFunc = jest.fn()
    const consumer = new Consumer(config, topicTemplate, handlerFunc)

    // Act
    await consumer.start()
    const isConnected = await consumer.isConnected()

    // Assert
    expect(isConnected).toBe(true)

    await consumer.disconnect() // we need to disconnect, otherwise jest will complain
  }, 1000 * 30)

  it('fails to connect to a non-existent broker', async () => {
    const config: ConsumerConfig = {
      // Random action + type settings that won't exist in our integration runner
      eventAction: Enum.Events.Event.Action.INITIATE,
      eventType: Enum.Events.Event.Type.NOTIFICATION,
      internalConfig: {
        ...internalConfig,
        rdkafkaConf: {
          "client.id": "ml-con-notification-event",
          "group.id": "ml-group-notification-event",
          // There should be nothing on this port
          "metadata.broker.list": "localhost:9095",
          "socket.keepalive.enable": true
        },
      }
    }
    const topicTemplate = 'topic-{{functionality}}-{{action}}'
    const handlerFunc = jest.fn()
    const consumer = new Consumer(config, topicTemplate, handlerFunc)

    // Act
    const actionStart = async () => await consumer.start()
    const actionIsConnected = async () => await consumer.isConnected()

    // Assert
    await expect(actionStart).rejects.toThrowError('Local: Broker transport failure')
    await expect(actionIsConnected).rejects.toThrowError('Client is disconnected')

    // Note this timeout is so high (60s) because of the `this._consumer.connect()` call in
    // central-services-stream. It _is_ configurable, but central-services-stream does not
    // expose the connection config - it just passes in `null`
  }, 1000 * 60)
})
