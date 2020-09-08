import { Util, Enum } from '@mojaloop/central-services-shared'
// import { Consumer as StreamLibConsumer} from '@mojaloop/central-services-stream'
// import mockConsumer from '../__mocks__/consumer'
import Consumer, { ConsumerConfig } from "~/shared/consumer"

const { internalConfig } = require('../data/mockData.json')

const mockCreateGeneralTopicConf = jest.spyOn(Util.Kafka, 'createGeneralTopicConf')
// const mockConsumer = jest.spyOn(StreamLib.Consumer, 'constructor')
// const mockConsumer = jest.mock(StreamLib.Consumer)
// jest.mock('@mojaloop/central-services-stream')

// console.log(StreamLibConsumer)
// console.log(mockConsumer)

describe('consumer', () => {
  describe('constructor', () => {
    it('creates the internal rdKafkaConsumer', () => {
      // Arrange
      mockCreateGeneralTopicConf.mockReturnValueOnce({
        topicName: 'hello_topic',
        key: null,
        partition: null,
        opaqueKey: {},
      })
      const config: ConsumerConfig = {
        eventAction: Enum.Events.Event.Action.EVENT,
        eventType: Enum.Events.Event.Type.NOTIFICATION,
        internalConfig
      }
      const topicTemplate = ''
      const handlerFunc = jest.fn()

      // Act
      const consumer = new Consumer(config, topicTemplate, handlerFunc)

      // Assert
      // Testing private values
      expect(consumer['topicName']).toBe('hello_topic')
    })
  })

  describe('start', () => {
    it.todo('starts the consumer')
  })

  describe('isConnected', () => {
    it.todo('resolves `true` when connected')
    it.todo('throws an error if not connected to the topic')
  })

  describe('disconnect', () => {
    it.todo('disconnects the rdKafkaConsumer')
    it.todo('throws an error if not connected')
  })
})
