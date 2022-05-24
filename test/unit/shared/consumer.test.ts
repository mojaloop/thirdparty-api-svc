/* eslint-disable import/first */
// These mocks must be declared before the imports. Needs further investigation.
const mockRdKafkaConsumer = {
  connect: jest.fn(),
  consume: jest.fn(),
  getMetadata: jest.fn(),
  disconnect: jest.fn()
}
const mockConstructor = jest.fn(() => mockRdKafkaConsumer)

import { Util, Enum } from '@mojaloop/central-services-shared'
import { GetMetadataResult } from '@mojaloop/central-services-stream'
import Consumer, { ConsumerConfig } from '~/shared/consumer'
import { internalConfig } from 'test/unit/data/mockData'

// note - we must declare this mock before importing from `~/shared/consumer`
jest.mock('@mojaloop/central-services-stream', () => {
  return {
    Kafka: {
      Consumer: mockConstructor
    }
  }
})

const mockCreateGeneralTopicConf = jest.spyOn(Util.Kafka, 'createGeneralTopicConf')

describe('consumer', () => {
  describe('constructor', () => {
    it('should be well constructed', () => {
      // Arrange
      mockCreateGeneralTopicConf.mockReturnValueOnce({
        topicName: 'hello_topic',
        key: null,
        partition: null,
        opaqueKey: {}
      })
      const config: ConsumerConfig = {
        eventAction: Enum.Events.Event.Action.EVENT,
        eventType: Enum.Events.Event.Type.NOTIFICATION,
        internalConfig
      }
      const topicTemplate = ''
      const handlerFunc = jest.fn()

      // Act
      new Consumer(config, topicTemplate, handlerFunc)

      // Assert
      expect(mockConstructor).toHaveBeenCalledWith(['hello_topic'], internalConfig)
      // Testing private values
      // No longer accessible
      // expect(consumer.topicName).toBe('hello_topic')
      // expect(consumer.rdKafkaConsumer).toStrictEqual(mockRdKafkaConsumer)
      // expect(consumer.handlerFunc).toStrictEqual(handlerFunc)
    })
  })

  describe('start', () => {
    it('starts the consumer', async () => {
      // Arrange
      mockCreateGeneralTopicConf.mockReturnValueOnce({
        topicName: 'hello_topic',
        key: null,
        partition: null,
        opaqueKey: {}
      })
      const config: ConsumerConfig = {
        eventAction: Enum.Events.Event.Action.EVENT,
        eventType: Enum.Events.Event.Type.NOTIFICATION,
        internalConfig
      }
      const topicTemplate = ''
      const handlerFunc = jest.fn()
      const consumer = new Consumer(config, topicTemplate, handlerFunc)

      // Act
      await consumer.start()

      // Assert
      expect(mockRdKafkaConsumer.connect).toHaveBeenCalledTimes(1)
      expect(mockRdKafkaConsumer.consume).toHaveBeenCalledTimes(1)
      expect(mockRdKafkaConsumer.consume).toHaveBeenCalledWith(handlerFunc)
    })
  })

  describe('isConnected', () => {
    // Any is fine here - we are mocking the handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let consumer: Consumer<any>

    beforeEach(() => {
      mockCreateGeneralTopicConf.mockReturnValueOnce({
        topicName: 'hello_topic',
        key: null,
        partition: null,
        opaqueKey: {}
      })
      const config: ConsumerConfig = {
        eventAction: Enum.Events.Event.Action.EVENT,
        eventType: Enum.Events.Event.Type.NOTIFICATION,
        internalConfig
      }
      const topicTemplate = ''
      const handlerFunc = jest.fn()
      consumer = new Consumer(config, topicTemplate, handlerFunc)
    })

    it('resolves `true` when connected', async () => {
      // Arrange
      const mockGetMetadata = (_config: unknown, cb: (err: unknown, value: GetMetadataResult) => void) => {
        return cb(null, { topics: [{ name: 'hello_topic' }] })
      }
      mockRdKafkaConsumer.getMetadata.mockImplementationOnce(mockGetMetadata)
      await consumer.start()

      // Act
      const result = await consumer.isConnected()

      // Assert
      expect(result).toBe(true)
    })

    it('throws an error if not connected to the topic', async () => {
      // Arrange
      const mockGetMetadata = (_config: unknown, cb: (err: unknown, value: GetMetadataResult) => void) => {
        return cb(null, { topics: [{ name: 'not_this_topic' }] })
      }
      mockRdKafkaConsumer.getMetadata.mockImplementationOnce(mockGetMetadata)
      await consumer.start()

      // Act
      const action = async () => await consumer.isConnected()

      // Assert
      await expect(action).rejects.toThrowError('Connected to consumer, but')
    })

    it('throws an error if getMetadata fails', async () => {
      // Arrange
      const mockGetMetadata = (_config: unknown, cb: (err: unknown, value: GetMetadataResult) => void) => {
        return cb(new Error('Test Error'), {
          topics: [{ name: 'not_this_topic' }]
        })
      }
      mockRdKafkaConsumer.getMetadata.mockImplementationOnce(mockGetMetadata)
      await consumer.start()

      // Act
      const action = async () => await consumer.isConnected()

      // Assert
      await expect(action).rejects.toThrowError('Test Error')
    })
  })

  describe('disconnect', () => {
    // Any is fine here - we are mocking the handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let consumer: Consumer<any>

    beforeEach(() => {
      mockCreateGeneralTopicConf.mockReturnValueOnce({
        topicName: 'hello_topic',
        key: null,
        partition: null,
        opaqueKey: {}
      })
      const config: ConsumerConfig = {
        eventAction: Enum.Events.Event.Action.EVENT,
        eventType: Enum.Events.Event.Type.NOTIFICATION,
        internalConfig
      }
      const topicTemplate = ''
      const handlerFunc = jest.fn()
      consumer = new Consumer(config, topicTemplate, handlerFunc)
    })

    it('disconnects the rdKafkaConsumer', async () => {
      // Arrange
      const mockDisconnect = (cb: (err: unknown, value: unknown) => void) => {
        return cb(null, true)
      }
      mockRdKafkaConsumer.disconnect.mockImplementationOnce(mockDisconnect)
      await consumer.start()

      // Act
      await consumer.disconnect()

      // Assert
      // Main test - no error was thrown
      expect(mockRdKafkaConsumer.disconnect).toHaveBeenCalledTimes(1)
    })

    it('throws error from rdkafka', async () => {
      // Arrange
      const mockDisconnect = (cb: (err: unknown, value: unknown) => void) => {
        return cb(new Error('Test Error'), true)
      }
      mockRdKafkaConsumer.disconnect.mockImplementationOnce(mockDisconnect)

      // Act
      const action = async () => await consumer.disconnect()

      // Assert
      await expect(action).rejects.toThrowError('Test Error')
    })
  })
})
