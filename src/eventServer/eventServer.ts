import { ServiceConfig, KafkaConsumerConfig } from '~/shared/config';
import Consumer, {InternalConsumerConfig } from '~/shared/consumer';
import EventHandlers from './eventHandlers'

// TODO: move this elsewhere
/**
 * @function mapServiceConfigToRdKafkaConfig
 * @description Convert the kafka config we specify at runtime to one 
 *   that central-services-stream likes
 */
const mapServiceConfigToRdKafkaConfig = (input: KafkaConsumerConfig): InternalConsumerConfig=> {
  return {
    eventAction: input.eventAction,
    eventType: input.eventType,
    rdKafkaConfig: {
      ...input.options,
      ...input.rdkafkaConf,
      ...input.topicConf,
    }
  }
}

/**
 * @function create
 * @description Creates the Kafka Consumer server based on config
 * @param { ServiceConfig } config
 */
export function create (config: ServiceConfig): Array<Consumer> {
  const topicTemplate = config.KAFKA.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE
  const consumerConfigs = config.KAFKA.CONSUMER

  return consumerConfigs.map(config => {
    // lookup the handler based on our Action + Event Pair
    const handler = EventHandlers.get({action: config.eventAction, type: config.eventType})
    if (!handler) {
      // TODO: custom error?
      throw new Error(`No Handler found for action: ${config.eventAction} and type: ${config.eventType}`)
    }

    return new Consumer(mapServiceConfigToRdKafkaConfig(config), topicTemplate, handler)
  })
}

export async function start (consumers: Array<Consumer>): Promise<void> {
  await Promise.all(consumers.map(c => c.start()))
}

export default async function run (config: ServiceConfig): Promise<void> {
  const consumers = create(config)

  return start(consumers)
}