/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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
declare module '@mojaloop/central-services-metrics'
declare module '@mojaloop/central-services-shared' {
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
      GET: string;
      POST: string;
      PUT: string;
      DELETE: string;
      PATCH: string;
    };
    ResponseTypes: {
      JSON: string;
    };
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
    THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_POST = 'FSPIOP_THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_POST',
    THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_PUT = 'FSPIOP_THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_PUT',
    THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_ERROR = 'FSPIOP_THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_PUT_ERROR',
    THIRDPARTY_CALLBACK_URL_TRX_REQ_POST = 'THIRDPARTY_CALLBACK_URL_TRX_REQ_POST'
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
      THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_POST: FspEndpointTypesEnum.THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_POST;
      THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_PUT: FspEndpointTypesEnum.THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_PUT;
      THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_ERROR: FspEndpointTypesEnum.THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_ERROR;
      THIRDPARTY_CALLBACK_URL_TRX_REQ_POST: FspEndpointTypesEnum.THIRDPARTY_CALLBACK_URL_TRX_REQ_POST;
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
      THIRDPARTY_TRANSACTION_REQUEST_PUT_ERROR: string;
      THIRDPARTY_TRANSACTION_REQUEST_POST: string;
    };
  }
  interface Enum {
    Http: HttpEnum;
    EndPoints: EndPointsEnum;
    Events: {
      Event: {
        Action: {
          POST: string;
        };
        Type: {
          TRANSACTION_REQUEST: string;
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
    sendRequest(url: string, headers: any, source: string, destination: string, method?: string, payload?: any, responseType?: string, span?: any, jwsSigner?: any): Promise<any>
  }

  interface Util {
    Endpoints: Endpoints;
    Request: Request;
    Hapi: any;
    OpenapiBackend: any;
  }

  const Enum: Enum
  const Util: Util
  const HealthCheck: any
}

declare module '@mojaloop/central-services-error-handling' {
  class FSPIOPError {
    toApiErrorObject(includeCauseExtension?: boolean, truncateExtensions?: boolean): any
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

declare module '@hapi/good'
declare module 'hapi-openapi'
declare module 'blipp'
