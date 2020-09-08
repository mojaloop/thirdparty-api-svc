// import { Util, Enum } from '@mojaloop/central-services-shared'
// import Kafka from '@mojaloop/central-services-stream'
// // import * as Kafka from '../__mocks__/central-services-stream'

// const { internalConfig } = require('../data/mockData.json')

// const mockCreateGeneralTopicConf = jest.spyOn(Util.Kafka, 'createGeneralTopicConf')
// // const mockConsumer = jest.spyOn(StreamLib.Consumer, 'constructor')
// const mockConsumer = jest.spyOn(StreamLibConsumer, 'prototype.constructor')
// jest.mock('@mojaloop/central-services-stream/src')

// import Consumer, { ConsumerConfig } from "~/shared/consumer"

// console.log('StreamLibConsumer', StreamLibConsumer)
// // console.log('mockConsumer', Kafka)

// describe('consumer', () => {
//   describe('constructor', () => {
//     it.todo('should be well constructed')

//     it('creates the internal rdKafkaConsumer', () => {
//       // Arrange
//       mockCreateGeneralTopicConf.mockReturnValueOnce({
//         topicName: 'hello_topic',
//         key: null,
//         partition: null,
//         opaqueKey: {},
//       })
//       const config: ConsumerConfig = {
//         eventAction: Enum.Events.Event.Action.EVENT,
//         eventType: Enum.Events.Event.Type.NOTIFICATION,
//         internalConfig
//       }
//       const topicTemplate = ''
//       const handlerFunc = jest.fn()

//       // Act
//       const consumer = new Consumer(config, topicTemplate, handlerFunc)

//       // Assert
//       // Testing private values
//       expect(consumer['topicName']).toBe('hello_topic')
//     })
//   })

//   describe('start', () => {
//     it.todo('starts the consumer')
//   })

//   describe('isConnected', () => {
//     it.todo('resolves `true` when connected')
//     it.todo('throws an error if not connected to the topic')
//   })

//   describe('disconnect', () => {
//     it.todo('disconnects the rdKafkaConsumer')
//     it.todo('throws an error if not connected')
//   })
// })
