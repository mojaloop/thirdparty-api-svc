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

 - Kevin Leyow <kevin.leyow@modusbox.com>
--------------
******/

import { Util as HapiUtil } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
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
import Mustache from 'mustache'

import { inspect } from 'util'
import Config from '~/shared/config'
import { finishChildSpan } from '~/shared/util'

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
export async function forwardServicesServiceTypeRequestError (
  path: string,
  headers: HapiUtil.Dictionary<string>,
  serviceType: string,
  error: APIErrorObject,
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardServicesServiceTypeRequestError')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ServiceType: serviceType }
    )
    Logger.info(`services::forwardServicesServiceTypeRequestError - Forwarding services error callback to endpoint: ${url}`)

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

    Logger.info(`services::forwardServicesServiceTypeRequest - Forwarded services error callback: ${serviceType}
    from ${sourceDfspId} to ${destinationDfspId}`)
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
export async function forwardGetServicesServiceTypeRequestToProviderService (
  path: string,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  serviceType: string,
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardGetServicesServiceTypeRequestToProviderService')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = Enum.Http.Headers.FSPIOP.SWITCH.value

  try {
    // render provider service url and path
    const urlPath = Config.PARTICIPANT_LIST_SERVICE_URL + path
    const url = Mustache.render(urlPath, { ServiceType: serviceType })

    Logger.info(`services::forwardGetServicesServiceTypeRequestToProviderService - Forwarding services to endpoint: ${url}`)

    await Util.Request.sendRequest(
      url,
      headers,
      sourceDfspId,
      destinationDfspId,
      method,
      undefined,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    Logger.info(`services::forwardGetServicesServiceTypeRequestToProviderService - Forwarded services request : ${serviceType} from ${sourceDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`services::forwardGetServicesServiceTypeRequestToProviderService - Error forwarding services request to endpoint: ${inspect(err)}`)
    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': sourceDfspId
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardServicesServiceTypeRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_PUT_ERROR,
      errorHeaders,
      serviceType,
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
export async function forwardGetServicesServiceTypeRequestFromProviderService (
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  serviceType: string,
  payload?: tpAPI.Schemas.ServicesServiceTypePutResponse,
  span?: any): Promise<void> {
  const childSpan = span?.getChild('forwardGetServicesServiceTypeRequestFromProviderService')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ServiceType: serviceType }
    )
    Logger.info(`services::forwardGetServicesServiceTypeRequestFromProviderService - Forwarding services to endpoint: ${url}`)

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

    Logger.info(`services::forwardGetServicesServiceTypeRequestFromProviderService - Forwarded services request : ${serviceType} from ${sourceDfspId} to ${destinationDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(`services::forwardGetServicesServiceTypeRequestFromProviderService - Error forwarding services request to endpoint: ${inspect(err)}`)

    // render provider service url and path
    const urlPath = Config.PARTICIPANT_LIST_SERVICE_URL + Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_PUT_ERROR
    const url = Mustache.render(urlPath, { ServiceType: serviceType })

    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': Enum.Http.Headers.FSPIOP.SWITCH.value
    }

    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await Util.Request.sendRequest(
      url,
      errorHeaders,
      Enum.Http.Headers.FSPIOP.SWITCH.value,
      Enum.Http.Headers.FSPIOP.SWITCH.value,
      Enum.Http.RestMethods.PUT,
      fspiopError.toApiErrorObject(Config.ERROR_HANDLING.includeCauseExtension, Config.ERROR_HANDLING.truncateExtensions),
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}
