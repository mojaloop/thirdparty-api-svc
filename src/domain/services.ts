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
import Mustache from 'mustache'

import { inspect } from 'util'
import Config from '~/shared/config'
import { finishChildSpan } from '~/shared/util'

const hubNameRegex = Util.HeaderValidation.getHubNameRegex(Config.HUB_PARTICIPANT.NAME)
const responseType = Enum.Http.ResponseTypes.JSON

/**
 * @function forwardServicesServiceTypeRequestError
 * @description Generic function to handle sending `PUT .../services/{ServiceType}/error` back to the FSPIOP-Source
 * @param {string} path Callback endpoint path
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {string} serviceType the ServiceType of the /services/{ServiceType} resource
 * @param {APIErrorObject} error Error details
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the services requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardServicesServiceTypeRequestError(
  path: string,
  headers: HapiUtil.Dictionary<string>,
  serviceType: string,
  error: APIErrorObject,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardServicesServiceTypeRequestError')
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      { ServiceType: serviceType }
    )
    Logger.info(
      `services::forwardServicesServiceTypeRequestError - Forwarding services error callback to endpoint: ${url}`
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

    Logger.info(`services::forwardServicesServiceTypeRequest - Forwarded services error callback: ${serviceType}
    from ${source} to ${destination}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`services::forwardServicesServiceTypeRequestError - Error forwarding services error to endpoint:
    ${inspect(err)}`)
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

/**
 * @function forwardGetServicesServiceTypeRequestToProviderService
 * @description Forwards a GET /services/{ServiceType} request to the Service Provider micro-service
 * @param {string} path Callback endpoint path
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method GET
 * @param {string} serviceType the ServiceType of the service resource
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the services requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardGetServicesServiceTypeRequestToProviderService(
  path: string,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  serviceType: string,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardGetServicesServiceTypeRequestToProviderService')
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = Config.HUB_PARTICIPANT.NAME

  try {
    // render provider service url and path
    const urlPath = Config.PARTICIPANT_LIST_SERVICE_URL + path
    const url = Mustache.render(urlPath, { ServiceType: serviceType })

    Logger.info(
      `services::forwardGetServicesServiceTypeRequestToProviderService - Forwarding services to endpoint: ${url}`
    )

    await Util.Request.sendRequest({
      url,
      headers,
      source,
      destination,
      method,
      payload: undefined,
      responseType,
      span: childSpan,
      hubNameRegex
    })

    Logger.info(
      `services::forwardGetServicesServiceTypeRequestToProviderService - Forwarded services request : ${serviceType} from ${source}`
    )
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `services::forwardGetServicesServiceTypeRequestToProviderService - Error forwarding services request to endpoint: ${inspect(
        err
      )}`
    )
    const errorHeaders = {
      ...headers,
      'fspiop-source': Config.HUB_PARTICIPANT.NAME,
      'fspiop-destination': source
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardServicesServiceTypeRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_PUT_ERROR,
      errorHeaders,
      serviceType,
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
 * @function forwardGetServicesServiceTypeRequestFromProviderService
 * @description Forwards a PUT /services/{ServiceType} request to a fsp
 * @param {string} path Callback endpoint path
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {RestMethodsEnum} method The http method PUT
 * @param {string} serviceType the ServiceType of the service resource
 * @param {object} payload Body of the request
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the services requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardGetServicesServiceTypeRequestFromProviderService(
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  serviceType: string,
  payload?: tpAPI.Schemas.ServicesServiceTypePutResponse,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardGetServicesServiceTypeRequestFromProviderService')
  const source = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destination = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destination,
      endpointType,
      path,
      { ServiceType: serviceType }
    )
    Logger.info(
      `services::forwardGetServicesServiceTypeRequestFromProviderService - Forwarding services to endpoint: ${url}`
    )

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
      `services::forwardGetServicesServiceTypeRequestFromProviderService - Forwarded services request : ${serviceType} from ${source} to ${destination}`
    )
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `services::forwardGetServicesServiceTypeRequestFromProviderService - Error forwarding services request to endpoint: ${inspect(
        err
      )}`
    )

    // render provider service url and path
    const urlPath = Config.PARTICIPANT_LIST_SERVICE_URL + Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_PUT_ERROR
    const url = Mustache.render(urlPath, { ServiceType: serviceType })

    const errorHeaders = {
      ...headers,
      'fspiop-source': Config.HUB_PARTICIPANT.NAME,
      'fspiop-destination': Config.HUB_PARTICIPANT.NAME
    }

    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await Util.Request.sendRequest({
      url,
      headers: errorHeaders,
      source: Config.HUB_PARTICIPANT.NAME,
      destination: Config.HUB_PARTICIPANT.NAME,
      method: Enum.Http.RestMethods.PUT,
      payload: fspiopError.toApiErrorObject(
        Config.ERROR_HANDLING.includeCauseExtension,
        Config.ERROR_HANDLING.truncateExtensions
      ),
      responseType,
      span: childSpan,
      hubNameRegex
    })

    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}
