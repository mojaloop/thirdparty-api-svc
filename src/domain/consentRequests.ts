/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
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
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 - Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/
import { Utils as HapiUtil } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { APIErrorObject, FSPIOPError, ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum, FspEndpointTypesEnum, RestMethodsEnum, Util } from '@mojaloop/central-services-shared'
import { Span } from '@mojaloop/event-sdk'

import { inspect } from 'util'
// eslint is complaining about these imports. not sure why.
// eslint-disable-next-line import/no-unresolved
import Config from '~/shared/config'
// eslint-disable-next-line import/no-unresolved
import { finishChildSpan } from '~/shared/util'

const hubNameRegex = Util.HeaderValidation.getHubNameRegex(Config.HUB_PARTICIPANT.NAME)
const responseType = Enum.Http.ResponseTypes.JSON

/**
 * @function forwardConsentRequestsIdRequestError
 * @description Generic function to handle sending `PUT .../consentRequests/{ID}/error` back to the FSPIOP-Source
 * @param {string} path Callback endpoint path
 * @param {string} consentRequestsRequestId the ID of the consentRequest
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {APIErrorObject} error Error details
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentRequestsIdRequestError(
  path: string,
  consentRequestsRequestId: string,
  headers: HapiUtil.Dictionary<string>,
  error: APIErrorObject,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardConsentRequestsRequestError')
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      { ID: consentRequestsRequestId }
    )
    Logger.info(
      `consentRequest::forwardConsentRequestsRequest - Forwarding consentRequest error callback to endpoint: ${url}`
    )

    await Util.Request.sendRequest({
      url,
      headers,
      source,
      destination,
      method: Enum.Http.RestMethods.PUT,
      payload: error,
      responseType,
      span: childSpan,
      hubNameRegex
    })

    Logger.info(
      `consentRequest::forwardConsentRequestsRequest - Forwarded consentRequest error callback: from ${source} to ${destination}`
    )
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `consentRequest::forwardConsentRequestsRequest - Error forwarding consentRequest error to endpoint: ${inspect(
        err
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
 * @function forwardConsentRequestsRequest
 * @description Forwards a /consentRequests request
 * @param {string} path Callback endpoint path
 * @param {FspEndpointTypesEnum} path Callback endpoint template
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method POST or PUT
 * @param {object} payload Body of the request
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the consentRequests requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentRequestsRequest(
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  payload: tpAPI.Schemas.ConsentRequestsPostRequest,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardConsentRequestsRequest')
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      {}
    )
    Logger.info(`consentRequest::forwardConsentRequestsRequest - Forwarding consentRequest to endpoint: ${url}`)

    await Util.Request.sendRequest({
      url,
      headers,
      source,
      destination,
      method,
      payload,
      responseType,
      span: childSpan,
      hubNameRegex
    })

    Logger.info(
      `consentRequest::forwardConsentRequestsRequest - Forwarded consentRequest: from ${source} to ${destination}`
    )
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `consentRequest::forwardConsentRequestsRequest - Error forwarding consentRequest to endpoint: ${inspect(err)}`
    )
    const errorHeaders = {
      ...headers,
      'fspiop-source': Config.HUB_PARTICIPANT.NAME,
      'fspiop-destination': source
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardConsentRequestsIdRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT_ERROR,
      payload.consentRequestId,
      errorHeaders,
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
 * @function forwardConsentRequestsIdRequest
 * @description Forwards a /consentRequests/{ID} request
 * @param {string} consentRequestsRequestId ConsentRequest ID
 * @param {string} path Callback endpoint path
 * @param {FspEndpointTypesEnum} path Callback endpoint template
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method POST, PUT or PATCH
 * @param {object} payload Body of the request
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the consentRequests requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentRequestsIdRequest(
  consentRequestsRequestId: string,
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  payload:
    | tpAPI.Schemas.ConsentRequestsIDPutResponseOTP
    | tpAPI.Schemas.ConsentRequestsIDPutResponseWeb
    | tpAPI.Schemas.ConsentRequestsIDPatchRequest,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardConsentRequestsIDRequest')
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      { ID: consentRequestsRequestId }
    )
    Logger.info(`consentRequest::forwardConsentRequestsIdRequest - Forwarding consentRequest to endpoint: ${url}`)

    await Util.Request.sendRequest({
      url,
      headers,
      source,
      destination,
      method,
      payload,
      responseType,
      span: childSpan,
      hubNameRegex
    })

    Logger.info(
      `consentRequest::forwardConsentRequestsIdRequest - Forwarded consentRequest: ${consentRequestsRequestId} from ${source} to ${destination}`
    )
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `consentRequest::forwardConsentRequestsIdRequest - Error forwarding consentRequest to endpoint: ${inspect(err)}`
    )
    const errorHeaders = {
      ...headers,
      'fspiop-source': Config.HUB_PARTICIPANT.NAME,
      'fspiop-destination': source
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardConsentRequestsIdRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT_ERROR,
      consentRequestsRequestId,
      errorHeaders,
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
