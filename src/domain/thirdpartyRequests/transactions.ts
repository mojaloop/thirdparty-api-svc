/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation The Mojaloop files are made available by the Bill
 & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not
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
import { FSPIOPError, ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import { Enum, Util } from '@mojaloop/central-services-shared'
import { EventStateMetadata, EventStatusType } from '@mojaloop/event-sdk'
import Mustache from 'mustache'
import Config from '~/shared/config'
import inspect from '~/shared/inspect'
import { getStackOrInspect } from '~/shared/util'
import * as types from '~/interface/types'

/**
 * Forwards POST transactions requests to destination FSP for processing
 * @param {string} path Callback endpoint path
 * @param {object} headers Headers object of the request 
 * @param {string} method The http method POST
 * @param {object} params Params object of the request 
 * @param {object} payload Body of the POST request
 * @param {object} span request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 * found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
async function forwardTransactionRequest(path: string, headers: Hapi.Util.Dictionary<string>, method: string, params: Hapi.Util.Dictionary<string>, payload?: types.ThirdPartyTransactionRequest, span?: any): Promise<void> {

  const childSpan = span?.getChild('forwardTransactionRequest')
  const fspiopSource: string = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const fspiopDest: string = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const payloadLocal = payload || { transactionRequestId: params.ID }
  const transactionRequestId: string = (payload && payload.transactionRequestId) || params.ID
  const endpointType = Enum.EndPoints.FspEndpointTypes.THIRDPARTY_CALLBACK_URL_TRX_REQ_POST
  try {
    const endpoint = await Util.Endpoints.getEndpoint(
      Config.SWITCH_ENDPOINT,
      fspiopDest,
      endpointType)
    Logger.info(`Resolved PAYER party ${endpointType} endpoint for transactionRequest
     ${transactionRequestId} to: ${inspect(endpoint)}`)
    const fullUrl: string = Mustache.render(endpoint + path, { ID: transactionRequestId })
    Logger.info(`Forwarding transaction request to endpoint: ${fullUrl}`)
    await Util.Request.sendRequest(
      fullUrl,
      headers,
      fspiopSource,
      fspiopDest,
      method,
      method.trim().toUpperCase() !== Enum.Http.RestMethods.GET ? payloadLocal : undefined,
      Enum.Http.ResponseTypes.JSON,
      childSpan)

    Logger.info(`Forwarded transaction request ${transactionRequestId} from ${fspiopSource} to ${fspiopDest}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.info(`Error forwarding transaction request to endpoint : ${inspect(err)}`)
    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': fspiopSource
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardTransactionRequestError(
      errorHeaders,
      Enum.EndPoints.FspEndpointTemplates.THIRDPARTY_TRANSACTION_REQUEST_PUT_ERROR,
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
 * Finish childSpan
 * @param {object} fspiopError error object
 * @param {object} span request span
 * @returns {Promise<void>}
 */
async function finishChildSpan(fspiopError: FSPIOPError, childSpan: any): Promise<void> {
  const state = new EventStateMetadata(
    EventStatusType.failed,
    fspiopError.apiErrorCode.code,
    fspiopError.apiErrorCode.message)
  await childSpan.error(fspiopError, state)
  await childSpan.finish(fspiopError.message, state)
}

/**
 * Forwards transactions requests errors to destination FSP
 * @param {object} headers Headers object of the request
 * @param {string} path callback endpoint path
 * @param {string} method The http method POST/PUT
 * @param {string} transactionRequestId Transaction request id that the transaction is for
 * @param {object} payload Body of the request
 * @param {object} span request span
 * @throws {FSPIOPError} Will throw an error, if no endpoint is found to forward the transactions 
 * error or if there are network errors or if there is a bad response.
 * @returns {Promise<void>}
 */
async function forwardTransactionRequestError(errorHeaders: Hapi.Util.Dictionary<string>, path: string, method: string, transactionRequestId: string, payload: types.ErrorInformation, span?: any): Promise<void> {

  const childSpan = span?.getChild('forwardTransactionRequestError')
  const fspiopSource: string = errorHeaders[Enum.Http.Headers.FSPIOP.SOURCE]
  const fspiopDestination: string = errorHeaders[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.THIRDPARTY_CALLBACK_URL_TRX_REQ_POST
  try {
    const endpoint = await Util.Endpoints.getEndpoint(
      Config.SWITCH_ENDPOINT,
      fspiopDestination,
      endpointType)
    Logger.info(`Resolved PAYER party ${endpointType} endpoint for transactionRequest 
      ${transactionRequestId} to: ${inspect(endpoint)}`)

    const fullUrl: string = Mustache.render(endpoint + path, { ID: transactionRequestId })
    Logger.info(`Forwarding transaction request error to endpoint: ${fullUrl}`)

    await Util.Request.sendRequest(
      fullUrl,
      errorHeaders,
      fspiopSource,
      fspiopDestination,
      method,
      payload,
      Enum.Http.ResponseTypes.JSON,
      childSpan)

    Logger.info(`Forwarding transaction request error for ${transactionRequestId} from ${fspiopSource} to ${fspiopDestination}`)

    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.info(`Error forwarding transaction request error to endpoint : ${getStackOrInspect(err)}`)
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

export {
  forwardTransactionRequest,
  forwardTransactionRequestError
}
