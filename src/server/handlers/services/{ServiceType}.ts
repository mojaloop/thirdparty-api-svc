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
 'use strict'

import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import Logger from '@mojaloop/central-services-logger'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'
import Config from '~/shared/config'

import {
  forwardGetServicesServiceTypeRequestToProviderService,
  forwardGetServicesServiceTypeRequestFromProviderService
} from '~/domain/services'
import { getSpanTags } from '~/shared/util'

/**
  * summary: GetServicesByServiceType
  * description: The HTTP request GET /services/{ServiceType} is used by a FSP to retrieve the list of potential participants
  * that support a service from a Provider micro-service.
  * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source,
  * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
  * produces: application/json
  * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
  */
const get = async (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  const span = (request as any).span
  const serviceType: string = request.params.ServiceType
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.SERVICE,
      Enum.Events.Event.Action.GET,
      { serviceType })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // If PARTICIPANT_LIST_LOCAL is set, then we should use the local config to
    // respond to this request instead of forwarding it to another service
    if (Config.PARTICIPANT_LIST_LOCAL) {
      const payload: tpAPI.Schemas.ServicesServiceTypePutResponse = {
        providers: Config.PARTICIPANT_LIST_LOCAL
      }

      // reverse the Source and Destination headers
      const sourceDfspId = request.headers[Enum.Http.Headers.FSPIOP.SOURCE]
      const destinationDfspId = request.headers[Enum.Http.Headers.FSPIOP.DESTINATION]
      const headers = {
        ...request.headers,
      }
      headers[Enum.Http.Headers.FSPIOP.DESTINATION] = sourceDfspId
      headers[Enum.Http.Headers.FSPIOP.SOURCE] = destinationDfspId

      // Note: calling async function without `await`
      forwardGetServicesServiceTypeRequestFromProviderService(
        Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_PUT,
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT,
        headers,
        Enum.Http.RestMethods.PUT,
        serviceType,
        payload,
        span
      )
        .catch(err => {
          // Do nothing with the error - forwardGetServicesServiceTypeRequestFromProviderService takes care of async errors
          Logger.error('Services::put - forwardGetServicesServiceTypeRequestFromProviderService async handler threw an unhandled error')
          Logger.error(ReformatFSPIOPError(err))
        })

    } else {
      // Note: calling async function without `await`
      forwardGetServicesServiceTypeRequestToProviderService(
        Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_GET,
        request.headers,
        Enum.Http.RestMethods.GET,
        serviceType,
        span
      )
      .catch(err => {
        // Do nothing with the error - forwardServicesServiceTypeRequest takes care of async errors
        Logger.error('Services::get - forwardGetServicesServiceTypeRequestToProviderService async handler threw an unhandled error')
        Logger.error(ReformatFSPIOPError(err))
      })
    }

    return h.response().code(Enum.Http.ReturnCodes.ACCEPTED.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

/**
  * summary: PutServicesByServiceType
  * description: The HTTP request PUT /services/{ServiceType} is used to forward the list of potential participants
  * that support a service from a Provider micro-service to a FSP.
  * parameters: body, content-length, content-type, date, x-forwarded-for, fspiop-source,
  * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
  * produces: application/json
  * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
  */
const put = async (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  const payload = request.payload as tpAPI.Schemas.ServicesServiceTypePutResponse
  const span = (request as any).span
  const serviceType: string = request.params.ServiceType

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.SERVICE,
      Enum.Events.Event.Action.PUT,
      { serviceType })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    forwardGetServicesServiceTypeRequestFromProviderService(
      Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_PUT,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT,
      request.headers,
      Enum.Http.RestMethods.PUT,
      serviceType,
      payload,
      span
    )
      .catch(err => {
        // Do nothing with the error - forwardGetServicesServiceTypeRequestFromProviderService takes care of async errors
        Logger.error('Services::put - forwardGetServicesServiceTypeRequestFromProviderService async handler threw an unhandled error')
        Logger.error(ReformatFSPIOPError(err))
      })

    return h.response().code(Enum.Http.ReturnCodes.OK.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

export default {
  get,
  put
}
