/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
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

 - Lewis Daly <lewisd@crosslaketech.com>
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/

import { Util as HapiUtil } from '@hapi/hapi'
import {
  APIErrorObject,
  FSPIOPError,
  ReformatFSPIOPError
} from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import {
  Enum,
  FspEndpointTypesEnum,
  RestMethodsEnum,
  Util
} from '@mojaloop/central-services-shared'

import { inspect } from 'util'
import Config from '~/shared/config'
import { finishChildSpan } from '~/shared/util'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

/**
 * @function forwardAuthorizationRequest
 * @description Forwards a POST /thirdpartyRequests/authorizations or PUT /thirdpartyRequests/authorizations/{ID} request
 * @param {string} path Callback endpoint path
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method POST or PUT
 * @param {string} authorizationRequestId the ID of the thirdpartyRequests/transactions resource
 * @param {object} payload Body of the POST/PUT request
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardAuthorizationRequest(
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  authorizationRequestId: string,
  payload: tpAPI.Schemas.ThirdpartyRequestsAuthorizationsPostRequest
    | tpAPI.Schemas.ThirdpartyRequestsAuthorizationsIDPutResponse,
  span?: any): Promise<void> {

  const childSpan = span?.getChild('forwardAuthorizationRequest')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ID: authorizationRequestId }
    )
    Logger.info(`authorizations::forwardAuthorizationRequest - Forwarding authorization to endpoint: ${url}`)

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

    Logger.info(`authorizations::forwardAuthorizationRequest - Forwarded thirdpartyTransaction authorization: ${authorizationRequestId} from ${sourceDfspId} to ${destinationDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`authorizations::forwardAuthorizationRequest - Error forwarding thirdpartyTransaction authorization to endpoint: ${inspect(err)}`)
    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': sourceDfspId
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardAuthorizationRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_AUTHORIZATIONS_PUT_ERROR,
      errorHeaders,
      authorizationRequestId,
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
 * @function forwardAuthorizationRequestError
 * @description Generic function to handle sending `PUT thirdpartyRequests/authorizations/{ID}/error` back to the FSPIOP-Source
 * @param {string} path Callback endpoint path
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {string} authorizationRequestId the ID of the thirdpartyRequests/authorizations resource
 * @param {APIErrorObject} error Error details
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardAuthorizationRequestError(
  path: string,
  headers: HapiUtil.Dictionary<string>,
  authorizationRequestId: string,
  error: APIErrorObject,
  span?: any): Promise<void> {

  const childSpan = span?.getChild('forwardAuthorizationRequestError')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ID: authorizationRequestId }
    )
    Logger.info(`authorizations::forwardAuthorizationRequestError - Forwarding thirdpartyTransaction authorization error callback to endpoint: ${url}`)

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

    Logger.info(`authorizations::forwardAuthorizationRequest - Forwarded thirdpartyTransaction authorization error callback: ${authorizationRequestId} from ${sourceDfspId} to ${destinationDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

  } catch (err) {
    Logger.error(`authorizations::forwardAuthorizationRequestError - Error forwarding thirdpartyTransaction authorization error to endpoint: ${inspect(err)}`)
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }

}
