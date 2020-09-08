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
    getMetricsForPrometheus: () => string

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
declare module '@mojaloop/central-services-shared' {
  import { Util as HapiUtil } from '@hapi/hapi'
  interface ReturnCode {
    CODE: number;
    DESCRIPTION: string;
  }
  interface HttpEnum {
    Headers: {
      FSPIOP: {
        SWITCH: {
          regex: RegExp;
          value: string;
        };
        SOURCE: string;
        DESTINATION: string;
        HTTP_METHOD: string;
        SIGNATURE: string;
        URI: string;
      };
    };
    ReturnCodes: {
      OK: ReturnCode;
      ACCEPTED: ReturnCode;
    };
    RestMethods: {
      GET: RestMethodsEnum.GET;
      POST: RestMethodsEnum.POST;
      PUT: RestMethodsEnum.PUT;
      DELETE: RestMethodsEnum.DELETE;
      PATCH: RestMethodsEnum.PATCH;
    };
    ResponseTypes: {
      JSON: string;
    };
  }
  enum RestMethodsEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
  }
  enum FspEndpointTypesEnum {
    FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE = 'FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE',
    FSPIOP_CALLBACK_URL = 'FSPIOP_CALLBACK_URL',
    FSPIOP_CALLBACK_URL_PARTICIPANT_PUT = 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT',
    FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT = 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT',
    FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE = 'FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE',
    FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE = 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE',
    FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT = 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT',
    FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTIES_GET = 'FSPIOP_CALLBACK_URL_PARTIES_GET',
    FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET = 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET',
    FSPIOP_CALLBACK_URL_PARTIES_PUT = 'FSPIOP_CALLBACK_URL_PARTIES_PUT',
    FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT = 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT',
    FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR',
    FSPIOP_CALLBACK_URL_TRANSFER_POST = 'FSPIOP_CALLBACK_URL_TRANSFER_POST',
    FSPIOP_CALLBACK_URL_TRANSFER_PUT = 'FSPIOP_CALLBACK_URL_TRANSFER_PUT',
    FSPIOP_CALLBACK_URL_TRANSFER_ERROR = 'FSPIOP_CALLBACK_URL_TRANSFER_ERROR',
    ALARM_NOTIFICATION_URL = 'ALARM_NOTIFICATION_URL',
    ALARM_NOTIFICATION_TOPIC = 'ALARM_NOTIFICATION_TOPIC',
    NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL = 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
    NET_DEBIT_CAP_ADJUSTMENT_EMAIL = 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL',
    SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL = 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL',
    FSPIOP_CALLBACK_URL_QUOTES = 'FSPIOP_CALLBACK_URL_QUOTES',
    FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST = 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST',
    FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT = 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT',
    FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR = 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR',
    FSPIOP_CALLBACK_URL_AUTHORIZATIONS = 'FSPIOP_CALLBACK_URL_AUTHORIZATIONS',
    TP_CB_URL_TRANSACTION_REQUEST_POST = 'TP_CB_URL_TRANSACTION_REQUEST_POST',
    TP_CB_URL_TRANSACTION_REQUEST_PUT = 'TP_CB_URL_TRANSACTION_REQUEST_PUT',
    TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR = 'TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR',
    TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST = 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
    TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT = 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
    TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR = 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR',
    TP_CB_URL_CONSENT_REQUEST_POST = 'TP_CB_URL_CONSENT_REQUEST_POST',
    TP_CB_URL_CONSENT_REQUEST_PUT = 'TP_CB_URL_CONSENT_REQUEST_PUT',
    TP_CB_URL_CONSENT_REQUEST_PUT_ERROR = 'TP_CB_URL_CONSENT_REQUEST_PUT_ERROR',
    TP_CB_URL_CREATE_CREDENTIAL_POST = 'TP_CB_URL_CREATE_CREDENTIAL_POST',
    TP_CB_URL_CONSENT_POST = 'TP_CB_URL_CONSENT_POST',
    TP_CB_URL_CONSENT_GET = 'TP_CB_URL_CONSENT_GET',
    TP_CB_URL_CONSENT_PUT = 'TP_CB_URL_CONSENT_PUT',
    TP_CB_URL_CONSENT_PUT_ERROR = 'TP_CB_URL_CONSENT_PUT_ERROR'
  }
  interface EndPointsEnum {
    EndpointType: {
      ALARM_NOTIFICATION_URL: number;
      ALARM_NOTIFICATION_TOPIC: number;
      FSPIOP_CALLBACK_URL_TRANSFER_POST: number;
      FSPIOP_CALLBACK_URL_TRANSFER_PUT: number;
      FSPIOP_CALLBACK_URL_TRANSFER_ERROR: number;
    };
    FspEndpointTypes: {
      FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE;
      FSPIOP_CALLBACK_URL: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL;
      FSPIOP_CALLBACK_URL_PARTICIPANT_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_PUT;
      FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT;
      FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE;
      FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE;
      FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT;
      FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTIES_GET: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_GET;
      FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET;
      FSPIOP_CALLBACK_URL_PARTIES_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_PUT;
      FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT;
      FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR;
      FSPIOP_CALLBACK_URL_TRANSFER_POST: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRANSFER_POST;
      FSPIOP_CALLBACK_URL_TRANSFER_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRANSFER_PUT;
      FSPIOP_CALLBACK_URL_TRANSFER_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRANSFER_ERROR;
      ALARM_NOTIFICATION_URL: FspEndpointTypesEnum.ALARM_NOTIFICATION_URL;
      ALARM_NOTIFICATION_TOPIC: FspEndpointTypesEnum.ALARM_NOTIFICATION_TOPIC;
      NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL: FspEndpointTypesEnum.NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL;
      NET_DEBIT_CAP_ADJUSTMENT_EMAIL: FspEndpointTypesEnum.NET_DEBIT_CAP_ADJUSTMENT_EMAIL;
      SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL: FspEndpointTypesEnum.SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL;
      FSPIOP_CALLBACK_URL_QUOTES: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_QUOTES;
      FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST;
      FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT;
      FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR;
      FSPIOP_CALLBACK_URL_AUTHORIZATIONS: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_AUTHORIZATIONS;
      TP_CB_URL_TRANSACTION_REQUEST_POST: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_POST;
      TP_CB_URL_TRANSACTION_REQUEST_PUT: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_PUT;
      TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR;
      TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST;
      TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT;
      TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR;
      TP_CB_URL_CONSENT_REQUEST_POST: FspEndpointTypesEnum.TP_CB_URL_CONSENT_REQUEST_POST;
      TP_CB_URL_CONSENT_REQUEST_PUT: FspEndpointTypesEnum.TP_CB_URL_CONSENT_REQUEST_PUT;
      TP_CB_URL_CONSENT_REQUEST_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_CONSENT_REQUEST_PUT_ERROR;
      TP_CB_URL_CREATE_CREDENTIAL_POST: FspEndpointTypesEnum.TP_CB_URL_CREATE_CREDENTIAL_POST;
      TP_CB_URL_CONSENT_POST: FspEndpointTypesEnum.TP_CB_URL_CONSENT_POST;
      TP_CB_URL_CONSENT_GET: FspEndpointTypesEnum.TP_CB_URL_CONSENT_GET;
      TP_CB_URL_CONSENT_PUT: FspEndpointTypesEnum.TP_CB_URL_CONSENT_PUT;
      TP_CB_URL_CONSENT_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_CONSENT_PUT_ERROR;
    };
    FspEndpointTemplates: {
      TRANSACTION_REQUEST_POST: string;
      TRANSACTION_REQUEST_PUT: string;
      TRANSACTION_REQUEST_GET: string;
      TRANSACTION_REQUEST_PUT_ERROR: string;
      PARTICIPANT_ENDPOINTS_GET: string;
      PARTICIPANTS_GET: string;
      PARTIES_GET: string;
      PARTIES_PUT_ERROR: string;
      PARTIES_SUB_ID_PUT_ERROR: string;
      ORACLE_PARTICIPANTS_TYPE_ID: string;
      ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY: string;
      ORACLE_PARTICIPANTS_TYPE_ID_SUB_ID: string;
      ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY_SUB_ID: string;
      ORACLE_PARTICIPANTS_BATCH: string;
      TRANSFERS_POST: string;
      TRANSFERS_PUT: string;
      TRANSFERS_PUT_ERROR: string;
      BULK_TRANSFERS_POST: string;
      BULK_TRANSFERS_PUT: string;
      BULK_TRANSFERS_PUT_ERROR: string;
      TP_TRANSACTION_REQUEST_POST: string;
      TP_TRANSACTION_REQUEST_PUT: string;
      TP_TRANSACTION_REQUEST_PUT_ERROR: string;
      TP_AUTHORIZATIONS_POST: string;
      TP_AUTHORIZATIONS_PUT: string;
      TP_TRANSACTION_REQUEST_AUTHORIZATIONS_POST: string;
      TP_TRANSACTION_REQUEST_AUTHORIZATIONS_PUT: string;
      TP_TRANSACTION_REQUEST_AUTHORIZATIONS_PUT_ERROR: string;
      TP_CONSENT_REQUEST_POST: string;
      TP_CONSENT_REQUEST_PUT: string;
      TP_CONSENT_REQUEST_PUT_ERROR: string;
      TP_CONSENT_CREATE_CREDENTIAL_POST: string;
      TP_CONSENT_POST: string;
      TP_CONSENT_GET: string;
      TP_CONSENT_PUT: string;
      TP_CONSENT_PUT_ERROR: string;
    };
  }

  enum EventTypeEnum {
    AUTHORIZATION = 'AUTHORIZATION',
    NOTIFICATION = 'NOTIFICATION',
    TRANSACTION_REQUEST = 'TRANSACTION_REQUEST',
  }

  enum EventActionEnum {
    EVENT = 'EVENT',
    POST = 'POST',
    PUT = 'PUT',
  }

  interface Enum {
    Http: HttpEnum;
    EndPoints: EndPointsEnum;
    Kafka: {
      Config: {
        CONSUMER: string
      }
    }
    Events: {
      Event: {
        Action: {
          EVENT: EventActionEnum.EVENT;
          POST: EventActionEnum.POST;
          PUT: EventActionEnum.PUT;
        };
        Type: {
          AUTHORIZATION: EventTypeEnum.AUTHORIZATION;
          NOTIFICATION: EventTypeEnum.NOTIFICATION;
          TRANSACTION_REQUEST: EventTypeEnum.TRANSACTION_REQUEST;
        };
      };
    };
  }
  class Endpoints {
    fetchEndpoints(fspId: string): Promise<any>
    getEndpoint(switchUrl: string, fsp: string, endpointType: FspEndpointTypesEnum, options?: any): Promise<string>
    initializeCache(policyOptions: object): Promise<boolean>
  }

  class Request {
    sendRequest(url: string, headers: HapiUtil.Dictionary<string>, source: string, destination: string, method?: RestMethodsEnum, payload?: any, responseType?: string, span?: any, jwsSigner?: any): Promise<any>
  }

  class Kafka {
    createGeneralTopicConf(template: string, functionality: string, action: string, key?: string, partition?: number, opaqueKey?: any): {topicName: string, key: string | null, partition: number | null, opaqueKey: any }
  }

  interface Util {
    Endpoints: Endpoints;
    Hapi: any;
    Kafka: Kafka;
    OpenapiBackend: any;
    Request: Request;
  }

  const Enum: Enum
  const Util: Util
  const HealthCheck: any
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
  import { EventActionEnum, EventTypeEnum } from '@mojaloop/central-services-shared';
  export interface KafkaConsumerConfig {
    eventType: EventTypeEnum,
    eventAction: EventActionEnum,
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

  // TODO: figure out a better example of a message - we may need to just do some stringifying
  type Message = any;
  interface GetMetadataResult {
    topics: Array<{
      name: string
    }>
  }
  class Consumer extends EventEmitter {
    constructor(topics: Array<any>, config: KafkaConsumerConfig)
    connect(): Promise<boolean>;
    consume(workDoneCb: (error: Error, payload: Message | Array<Message>) => Promise<void>): void
    disconnect(cb: () => any): void;
    getMetadata(options: any, cb: (err: any, result: GetMetadataResult) => any): void;
  }

  interface Kafka {
    Consumer: Consumer
  }


  const Kafka: Kafka
}


declare module '@hapi/good'
declare module 'hapi-openapi'
declare module 'blipp'
