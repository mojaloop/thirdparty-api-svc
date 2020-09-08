import { KafkaConsumerConfig } from '@mojaloop/central-services-stream';


class Consumer {
  constructor(_topics: Array<any>, _config: KafkaConsumerConfig) {
    console.log("calling fake consumer!")
  }
}
exports.default = {
  kafka: 'hello',
  Consumer
}

// exports.Kafka = {kafka: 'hello', Consumer}
// exports.Util = {Util: 'hello'}

// export Kaf

// export default {
//   Kafka: {
//     Consumer: Consumer
//   }
// }
