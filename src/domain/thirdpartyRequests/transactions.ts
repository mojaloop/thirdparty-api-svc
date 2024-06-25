/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the "License") and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files
 are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'

import { Utils as HapiUtils } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { APIErrorObject, FSPIOPError, ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum, FspEndpointTypesEnum, RestMethodsEnum, Util } from '@mojaloop/central-services-shared'
import { Span } from '@mojaloop/event-sdk'

import Config from '~/shared/config'
import inspect from '~/shared/inspect'
import { finishChildSpan, getStackOrInspect } from '~/shared/util'

const hubNameRegex = Util.HeaderValidation.getHubNameRegex(Config.HUB_PARTICIPANT.NAME)
const responseType = Enum.Http.ResponseTypes.JSON

/**
 * @function forwardTransactionRequest
 * @description Forwards a POST /thirdpartyRequests/transactions and
 * GET/PUT/PATCH /thirdpartyRequests/transactions/{ID} to destination FSP for processing
 * @param {string} path Callback endpoint path
 * @param {Hapi.Util.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method POST
 * @param {object} params Params object of the request
 * @param {ThirdPartyTransactionRequest} payload Body of the POST request
 * @param {object} span request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 * found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
async function forwardTransactionRequest(
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtils.Dictionary<string>,
  method: RestMethodsEnum,
  params: HapiUtils.Dictionary<string>,
  payload?:
    | tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest
    | tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPutResponse
    | tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPatchResponse,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardTransactionRequest')
  const source: string = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination: string = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const payloadLocal = payload || { transactionRequestId: params.ID }
  const transactionRequestId: string = payload && isCreateRequest(payload) ? payload.transactionRequestId : params.ID
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      params || {}
    )
    Logger.info(`transactions::forwardTransactionRequest -  Forwarding transaction request to endpoint: ${url}`)
    await Util.Request.sendRequest({
      url,
      headers,
      source,
      destination,
      method,
      payload: method.trim().toUpperCase() !== Enum.Http.RestMethods.GET ? payloadLocal : undefined,
      responseType,
      span: childSpan,
      hubNameRegex
    })

    Logger.info(
      `transactions::forwardTransactionRequest - Forwarded transaction request ${transactionRequestId} from ${source} to ${destination}`
    )

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `transactions::forwardTransactionRequest - Error forwarding transaction request to endpoint : ${inspect(err)}`
    )
    const errorHeaders = {
      ...headers,
      'fspiop-source': Config.HUB_PARTICIPANT.NAME,
      'fspiop-destination': source
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardTransactionRequestError(
      errorHeaders,
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PUT_ERROR,
      Enum.Http.RestMethods.PUT,
      transactionRequestId,
      fspiopError.toApiErrorObject(
        Config.ERROR_HANDLING.includeCauseExtension,
        Config.ERROR_HANDLING.truncateExtensions
      ),
      childSpan
    )

    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

/**
 * @function forwardTransactionRequestError
 * @description Generic function to handle sending `PUT .../transactions/error` back to the FSPIOP-Source
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {string} path callback endpoint path
 * @param {string} transactionRequestId Transaction request id that the transaction is for
 * @param {APIErrorObject} error Error details
 * @param {object} span request span
 * @throws {FSPIOPError} Will throw an error, if no endpoint is found to forward the transactions
 * error or if there are network errors or if there is a bad response.
 * @returns {Promise<void>}
 */
async function forwardTransactionRequestError(
  headers: HapiUtils.Dictionary<string>,
  path: string,
  method: RestMethodsEnum,
  transactionRequestId: string,
  error: APIErrorObject,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardTransactionRequestError')
  const source: string = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination: string = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      { ID: transactionRequestId }
    )
    Logger.info(
      `transactions::forwardTransactionRequestError - Forwarding transaction request error to endpoint: ${url}`
    )

    await Util.Request.sendRequest({
      url,
      headers,
      source,
      destination,
      method,
      payload: error,
      responseType,
      span: childSpan,
      hubNameRegex
    })

    Logger.info(
      `transactions::forwardTransactionRequestError - Forwarding transaction request error for ${transactionRequestId} from ${source} to ${destination}`
    )

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `transactions::forwardTransactionRequestError - Error forwarding transaction request error to endpoint : ${getStackOrInspect(
        err as Error
      )}`
    )
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

/**
 * @function forwardTransactionRequestNotification
 * @description Forwards a PATCH transactions requests to destination PISP for processing
 * @param {string} path Callback endpoint path
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method PATCH
 * @param {string} payload Body of the PATCH request
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 * found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
async function forwardTransactionRequestNotification(
  headers: HapiUtils.Dictionary<string>,
  transactionRequestId: string,
  payload: string,
  path: string,
  endpointType: FspEndpointTypesEnum,
  method: RestMethodsEnum
): Promise<void> {
  const source: string = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination: string = headers[Enum.Http.Headers.FSPIOP.DESTINATION]

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      { ID: transactionRequestId }
    )
    Logger.info(`transactions::forwardTransactionRequestNotification -
      Forwarding transaction request to endpoint: ${url}`)

    await Util.Request.sendRequest({
      url,
      headers,
      source,
      destination,
      method,
      payload,
      responseType,
      hubNameRegex
    })
  } catch (err) {
    // todo: send a PUT /thirdpartyRequests/transactions/{id}/error to PISP
    Logger.error(
      `transactions::forwardTransactionRequestNotification - Error forwarding transaction request error to endpoint : ${getStackOrInspect(
        err as Error
      )}`
    )
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    throw fspiopError
  }
}

type CreateOrUpdateReq =
  | tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest
  | tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPutResponse
function isCreateRequest(
  request: CreateOrUpdateReq
): request is tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest {
  if ((request as tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest).transactionRequestId) {
    return true
  }
  return false
}

export {
  forwardTransactionRequest,
  forwardTransactionRequestError,
  forwardTransactionRequestNotification,
  isCreateRequest // for testing
}
