import { EventTypeEnum, EventActionEnum, Util } from '@mojaloop/central-services-shared'
import StreamLib from '@mojaloop/central-services-stream'
import { promisify } from 'util';

export interface InternalConsumerConfig {
  eventAction: EventActionEnum,
  eventType: EventTypeEnum,
  internalConfig: StreamLib.KafkaConsumerConfig,
}

/**
 * @class Consumer
 * @description A utility class that wraps around the `@mojaloop/central-services-stream` Kafka Consumer
 */
export default class Consumer {
  topicName: string;
  rdKafkaConsumer: StreamLib.Consumer;
  handlerFunc: (...args: any) => any

  constructor (config: InternalConsumerConfig, topicTemplate: string, handlerFunc: (...args: any) => any) {
    const topicConfig = Util.Kafka.createGeneralTopicConf(topicTemplate, config.eventType, config.eventAction)
    this.topicName = topicConfig.topicName
    config.internalConfig.rdkafkaConf['client.id'] = this.topicName

    // Create the internal consumer
    this.rdKafkaConsumer = new StreamLib.Consumer([this.topicName], config.internalConfig)

    this.handlerFunc = handlerFunc
  }

  /**
   * @function start
   * @description Start the consumer listening for kafka events
   */
  async start (): Promise<void> {
    await this.rdKafkaConsumer.connect()
    this.rdKafkaConsumer.consume(this.handlerFunc)
  }

  /**
   * @function isConnected
   * @description Use this to determine whether or not we are connected to the broker. Internally, it calls `getMetadata` to determine
   * if the broker client is connected.
   *
   * @returns {true} - if connected
   * @throws {Error} - if we can't find the topic name, or the consumer is not connected
   */
  async isConnected (): Promise<true>  {
    const getMetadataPromise = promisify(this.rdKafkaConsumer.getMetadata)
    const getMetadataConfig = {
      topic: this.topicName,
      timeout: 3000
    }

    const metadata = await getMetadataPromise(getMetadataConfig)

    const foundTopics = metadata.topics.map((topic: any) => topic.name)
    if (foundTopics.indexOf(this.topicName) === -1) {
      throw new Error(`Connected to consumer, but ${this.topicName} not found.`)
    }

    return true
  }

  /**
   * @function disconnect
   * @description Disconnect from the consumer
   * @returns Promise<*> - Passes on the Promise from Consumer.disconnect()
   * @throws {Error} - if the consumer hasn't been initialized, or disconnect() throws an error
   */
  async disconnect () {
    if (!this.rdKafkaConsumer || !this.rdKafkaConsumer.disconnect) {
      throw new Error('Tried to disconnect from consumer, but consumer is not initialized')
    }

    const disconnectPromise = promisify(this.rdKafkaConsumer.disconnect)
    return disconnectPromise()
  }
}
