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

 - Kevin Leyow <kevin.leyow@modusbox.com>
 --------------
 ******/
import { Util as HapiUtil } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'

import {
  Enum,
  Util,
  FspEndpointTypesEnum,
  RestMethodsEnum
} from '@mojaloop/central-services-shared'
// eslint is complaining about these imports. not sure why.
// eslint-disable-next-line import/no-unresolved
import Config from '~/shared/config'
import { inspect } from 'util'
import {
  APIErrorObject,
  FSPIOPError,
  ReformatFSPIOPError
} from '@mojaloop/central-services-error-handling'
// eslint-disable-next-line import/no-unresolved
import { finishChildSpan } from '~/shared/util'
// eslint-disable-next-line import/no-unresolved
import * as types from '~/interface/types'

/**
 * @function forwardConsentsIdRequestError
 * @description Generic function to handle sending `PUT .../consents/error` back to the FSPIOP-Source
 * @param {string} path Callback endpoint path
 * @param {string} consentsId the ID of the consents request
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {APIErrorObject} error Error details
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentsIdRequestError (
  path: string,
  consentsId: string,
  headers: HapiUtil.Dictionary<string>,
  error: APIErrorObject,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardConsentsIdGenerateChallengeRequestError')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ID: consentsId })
    Logger.info(`consents::forwardConsentsIdGenerateChallengeRequestError - Forwarding consents error callback to endpoint: ${url}`)

    await Util.Request.sendRequest(
      url,
      headers,
      sourceDfspId,
      destinationDfspId,
      Enum.Http.RestMethods.PUT,
      error,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    Logger.info(`consents::forwardConsentsRequestError - Forwarded consents error callback: from ${sourceDfspId} to ${destinationDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`consents::forwardConsentsRequestError - Error forwarding consents error to endpoint: ${inspect(err)}`)
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

/**
 * @function forwardConsentsRequest
 * @description Forwards a /consents request
 * @param {string} path Callback endpoint path
 * @param {FspEndpointTypesEnum} path Callback endpoint template
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method POST or PUT
 * @param {object} payload Body of the request
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the consents requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentsRequest (
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  payload: types.ConsentsPayload,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardConsentsRequest')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path
    )
    Logger.info(`consents::forwardConsentsRequestError - Forwarding consents error callback to endpoint: ${url}`)

    await Util.Request.sendRequest(
      url,
      headers,
      sourceDfspId,
      destinationDfspId,
      method,
      payload,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )
    // todo: forward request to auth-service as well

    Logger.info(`consents::forwardConsentsRequest - Forwarded consents: from ${sourceDfspId} to ${destinationDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`consents::forwardConsentsRequest - Error forwarding consents to endpoint: ${inspect(err)}`)
    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': sourceDfspId
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardConsentsIdRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT_ERROR,
      payload.id,
      errorHeaders,
      fspiopError.toApiErrorObject(Config.ERROR_HANDLING.includeCauseExtension, Config.ERROR_HANDLING.truncateExtensions),
      childSpan
    )

    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

/**
 * @function forwardConsentsIdGenerateChallengeError
 * @description Generic function to handle sending `PUT .../consents/{ID}/generateChallenge/error` back to the FSPIOP-Source
 * @param {string} path Callback endpoint path
 * @param {string} consentsId the ID of the consents request
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {APIErrorObject} error Error details
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the request is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentsIdGenerateChallengeError (
  path: string,
  consentsId: string,
  headers: HapiUtil.Dictionary<string>,
  error: APIErrorObject,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardConsentsRequestError')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ID: consentsId })
    Logger.info(`consents::forwardConsentsRequestError - Forwarding consents error callback to endpoint: ${url}`)

    await Util.Request.sendRequest(
      url,
      headers,
      sourceDfspId,
      destinationDfspId,
      Enum.Http.RestMethods.PUT,
      error,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    Logger.info(`consents::forwardConsentsRequestError - Forwarded consents error callback: from ${sourceDfspId} to ${destinationDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`consents::forwardConsentsRequestError - Error forwarding consents error to endpoint: ${inspect(err)}`)
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

/**
 * @function forwardConsentsIdGenerateChallengeRequest
 * @description Forwards a /consents/{ID}/generateChallenge request
 * @param {string} path Callback endpoint path
 * @param {FspEndpointTypesEnum} path Callback endpoint template
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method POST
 * @param {object} payload Body of the request
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the consents generate challenge requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentsIdGenerateChallengeRequest (
  consentsIdGenerateChallengeRequestId: string,
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  payload: types.ConsentsGenerateChallengePayload,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardConsentsIdGenerateChallengeRequest')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspAuthServiceId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspAuthServiceId,
      endpointType,
      path,
      { ID: consentsIdGenerateChallengeRequestId }
    )
    Logger.info(`consents::forwardConsentsIdGenerateChallengeRequestError - Forwarding consents error callback to endpoint: ${url}`)

    await Util.Request.sendRequest(
      url,
      headers,
      sourceDfspId,
      destinationDfspAuthServiceId,
      method,
      payload,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    Logger.info(`consents::forwardConsentsIdGenerateChallengeRequest - Forwarded consents: from ${sourceDfspId} to ${destinationDfspAuthServiceId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`consents::forwardConsentsIdGenerateChallengeRequest - Error forwarding consents to endpoint: ${inspect(err)}`)
    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': sourceDfspId
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardConsentsIdGenerateChallengeError(
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_PUT_ERROR,
      consentsIdGenerateChallengeRequestId,
      errorHeaders,
      fspiopError.toApiErrorObject(Config.ERROR_HANDLING.includeCauseExtension, Config.ERROR_HANDLING.truncateExtensions),
      childSpan
    )

    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}
