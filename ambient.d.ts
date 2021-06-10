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
 - Name Surname <name.surname@gatesfoundation.com>

 - Paweł Marzec <pawel.marzec@modusbox.com>
 --------------
 ******/


// for mojaloop there is lack for @types files
// to stop typescript complains, we have to declare some modules here
declare module '@mojaloop/central-services-logger'
declare module '@mojaloop/central-services-metrics' {
  import { Histogram } from 'prom-client'

  interface metricOptionsType {
    prefix: string
    timeout: number
  }
  interface Metrics {

    /**
     * @function getHistogram
     * @description Get the histogram values for given name
     * @param {string} name - The name of the histogram to get. If the name doesn't exist, it creates a new histogram
     * @param {string} [help] - (Optional) Help description of the histogram (only used with creating a new histogram)
     * @param {Array<string>} [labelNames] - (Optional) Keys of the label to attach to the histogram
     * @param {Array<number>} [buckets] - (Optional) Buckets used in the histogram
     * @returns {Histogram} - The Prometheus Histogram object
     * @throws {Error} -
     */
    getHistogram: (name: string, help?: string, labelNames?: string[], buckets?: number[]) => Histogram

    /**
     * @function getMetricsForPrometheus
     * @description Gets the metrics
     */
    getMetricsForPrometheus: () => Promise<string>

    /**
     * @function setup
     * @description Setup the prom client for collecting metrics using the options passed
     * @param {metricOptionsType} - Config option for Metrics setup
     * @returns boolean
     */
    setup: (options: metricOptionsType) => boolean
  }

  // `@mojaloop/central-services/metrics` exports a new class
  // i.e. `new metrics.Metrics()`
  const defaultMetrics: Metrics;
  export default defaultMetrics
}

declare module '@mojaloop/central-services-error-handling' {
  interface APIErrorObject {
    errorInformation: {
      errorCode?: string;
      errorDescription?: string;
      extensionList?: {
        extension: [{
          key: string;
          value: string;
        }];
      };
    }
  }
  class FSPIOPError {
    toApiErrorObject(includeCauseExtension?: boolean, truncateExtensions?: boolean): APIErrorObject
    apiErrorCode: {
      code: number;
      message: string;
    }

    message: string
  }
  const Factory: {
    FSPIOPError: FSPIOPError;
  }
  const Enums: {
    FSPIOPErrorCodes: {
      DESTINATION_FSP_ERROR: any;
      DESTINATION_COMMUNICATION_ERROR: any;
    };
  }
  export function validateRoutes(options?: object): object;
  export function ReformatFSPIOPError(error: any, apiErrorCode?: any, replyTo?: any, extensions?: any): FSPIOPError
  export function CreateFSPIOPError(apiErrorCode?: any, message?: any, cause?: any, replyTo?: any, extensions?: any, useDescriptionAsMessage?: boolean): FSPIOPError
}
declare module '@mojaloop/central-services-stream' {
  import { EventEmitter } from 'events';
  export interface GenericMessage<EventType, EventAction> {
    value: {
      from: string,
      to: string,
      id: string,
      content: {
        // Note: we don't know exactly what this will look like at this stage - as we have only inspected
        // a few of the kafka messages
        uriParams: unknown,
        headers: {
          'content-type': string,
          date: string,
          'fspiop-source': string,
          'fspiop-destination': string
          authorization?: string,
          'content-length': string,
          host: string,
        },
        payload: string
      },
      type: string,
      metadata: {
        correlationId: string,
        event: {
          type: EventType,
          action: EventAction,
          createdAt: string,
          state: {
            status: string,
            code: number,
            description: string
          },
          id: string,
          responseTo: string,
        },
        trace: unknown
        "protocol.createdAt": number
      }
    },
    size: number,
    // note: in all of my local tests, this has been `null`, but user beware.
    key: unknown,
    topic: string,
    offset: number,
    partition: number,
    timestamp: number,
  }

  export interface RdKafkaConsumerConfig {
    options: {
      mode: number,
      batchSize: number,
      pollFrequency: number,
      recursiveTimeout: number,
      messageCharset: string,
      messageAsJSON: boolean,
      sync: boolean
      consumeTimeout: number
    },
    rdkafkaConf: {
      'client.id': string,
      'group.id': string
      'metadata.broker.list': string,
      'socket.keepalive.enable': boolean
    },
    topicConf: {
      'auto.offset.reset': string
    }
  }

  interface GetMetadataResult {
    topics: Array<{
      name: string
    }>
  }

  type ConsumeCallback<Payload> = (error: Error | null, payload: Payload) => Promise<void>;
  type GetMetadataCallback = (err: unknown, result: GetMetadataResult) => void;

  namespace Kafka {
    export class Consumer extends EventEmitter {
      constructor(topics: Array<string>, config: RdKafkaConsumerConfig)
      connect(): Promise<boolean>;
      consume<Payload>(consumeCallback: ConsumeCallback<Payload>): void
      disconnect(cb: () => unknown): void;
      getMetadata(options: unknown, cb: GetMetadataCallback): void;
    }
  }
}

declare module '@mojaloop/event-sdk' {
  enum AuditEventAction {
    default = "default",
    start = "start",
    finish = "finish",
    ingress = "ingress",
    egress = "egress"
  }
}

declare module '@hapi/good'
declare module 'hapi-openapi'
declare module 'blipp'

declare module 'canonical-json' {
  export type ReplacerFunc = ((this: unknown, key: unknown, value: unknown) => unknown)
  export default function stringify(value: unknown, replacer?: ReplacerFunc, space?: string | number): string
}
