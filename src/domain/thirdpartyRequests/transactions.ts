/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation The Mojaloop files are made available by the Mojaloop Foundation
 under the Apache License, Version 2.0 (the 'License') and you may not
 use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in
 writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS
 OF ANY KIND, either express or implied. See the License for the specific language governing
 permissions and limitations under the License. Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file. Names of the original
 copyright holders (individuals or organizations) should be listed with a '*' in the first column.
 People who have contributed from an organization can be listed under the organization that actually
 holds the copyright for their contributions (see the Gates Foundation organization for an example).
 Those individuals should have their names indented and be marked with a '-'. Email address can be
 added optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'

import Hapi from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'
import {
  APIErrorObject,
  FSPIOPError,
  ReformatFSPIOPError
} from '@mojaloop/central-services-error-handling'
import {
  Enum,
  Util,
  RestMethodsEnum
} from '@mojaloop/central-services-shared'
import Mustache from 'mustache'
import Config from '~/shared/config'
import inspect from '~/shared/inspect'
import { getStackOrInspect, finishChildSpan } from '~/shared/util'
import * as types from '~/interface/types'

/**
 * @function forwardTransactionRequest
 * @description Forwards a POST transactions requests to destination FSP for processing
 * @param {string} path Callback endpoint path
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
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
  headers: Hapi.Util.Dictionary<string>,
  method: RestMethodsEnum,
  params: Hapi.Util.Dictionary<string>,
  payload?: types.ThirdPartyTransactionRequest,
  span?: any): Promise<void> {

  const childSpan = span?.getChild('forwardTransactionRequest')
  const fspiopSource: string = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const fspiopDest: string = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const payloadLocal = payload || { transactionRequestId: params.ID }
  const transactionRequestId: string = (payload && payload.transactionRequestId) || params.ID
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_POST
  try {
    const endpoint = await Util.Endpoints.getEndpoint(
      Config.ENDPOINT_SERVICE_URL,
      fspiopDest,
      endpointType)
    Logger.info(`transactions::forwardTransactionRequest - Resolved PAYER party ${endpointType} endpoint for transactionRequest
     ${transactionRequestId} to: ${inspect(endpoint)}`)
    const fullUrl: string = Mustache.render(endpoint + path, { ID: transactionRequestId })
    Logger.info(`transactions::forwardTransactionRequest -  Forwarding transaction request to endpoint: ${fullUrl}`)
    await Util.Request.sendRequest(
      fullUrl,
      headers,
      fspiopSource,
      fspiopDest,
      method,
      method.trim().toUpperCase() !== Enum.Http.RestMethods.GET ? payloadLocal : undefined,
      Enum.Http.ResponseTypes.JSON,
      childSpan)

    Logger.info(`transactions::forwardTransactionRequest - Forwarded transaction request ${transactionRequestId} from ${fspiopSource} to ${fspiopDest}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`transactions::forwardTransactionRequest - Error forwarding transaction request to endpoint : ${inspect(err)}`)
    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': fspiopSource
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardTransactionRequestError(
      errorHeaders,
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PUT_ERROR,
      Enum.Http.RestMethods.PUT,
      transactionRequestId,
      fspiopError.toApiErrorObject(Config.ERROR_HANDLING.includeCauseExtension, Config.ERROR_HANDLING.truncateExtensions),
      childSpan)

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
  headers: Hapi.Util.Dictionary<string>,
  path: string,
  method: RestMethodsEnum,
  transactionRequestId: string,
  error: APIErrorObject,
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardTransactionRequestError')
  const fspiopSource: string = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const fspiopDestination: string = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR

  try {
    const endpoint = await Util.Endpoints.getEndpoint(
      Config.ENDPOINT_SERVICE_URL,
      fspiopDestination,
      endpointType)
    Logger.info(`transactions::forwardTransactionRequestError - Resolved PAYER party ${endpointType} endpoint for transactionRequest
      ${transactionRequestId} to: ${inspect(endpoint)}`)

    const fullUrl: string = Mustache.render(endpoint + path, { ID: transactionRequestId })
    Logger.info(`transactions::forwardTransactionRequestError - Forwarding transaction request error to endpoint: ${fullUrl}`)

    await Util.Request.sendRequest(
      fullUrl,
      headers,
      fspiopSource,
      fspiopDestination,
      method,
      error,
      Enum.Http.ResponseTypes.JSON,
      childSpan)

    Logger.info(`transactions::forwardTransactionRequestError - Forwarding transaction request error for ${transactionRequestId} from ${fspiopSource} to ${fspiopDestination}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`transactions::forwardTransactionRequestError - Error forwarding transaction request error to endpoint : ${getStackOrInspect(err)}`)
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

async function forwardTransactionRequestNotification(
  headers: Hapi.Util.Dictionary<string>,
  transactionRequestId: string,
  path: string,
  method: RestMethodsEnum,
  ): Promise<void> {

  // todo: this is a temporary interim endpoint we are using until a PATCH TPR transaction endpoint is added.
  //       i.e TP_CB_URL_TRANSACTION_REQUEST_PATCH
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_POST
  const fspiopSource: string = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const fspiopDestination: string = headers[Enum.Http.Headers.FSPIOP.DESTINATION]

  try {
    const endpoint = await Util.Endpoints.getEndpoint(
      Config.ENDPOINT_SERVICE_URL,
      fspiopDestination,
      endpointType)

    const fullUrl: string = Mustache.render(endpoint + path, { ID: transactionRequestId })

    await Util.Request.sendRequest(
      fullUrl,
      headers,
      fspiopSource,
      fspiopDestination,
      method,
      {},
      Enum.Http.ResponseTypes.JSON,
      null)

  } catch (err) {
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    throw fspiopError
  }
}
export {
  forwardTransactionRequest,
  forwardTransactionRequestError,
  forwardTransactionRequestNotification
}
