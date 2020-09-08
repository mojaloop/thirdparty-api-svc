import { KafkaConsumerConfig } from '@mojaloop/central-services-stream';


export default class Consumer {
  constructor(_topics: Array<any>, _config: KafkaConsumerConfig) {
    console.log("calling fake consumer!")
  }
}
