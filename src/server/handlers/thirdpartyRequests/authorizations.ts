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

 - Lewis Daly <lewisd@crosslaketech.com>
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>
 --------------
 ******/

import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { APIErrorObject, ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'
import {
  thirdparty as tpAPI
} from '@mojaloop/api-snippets'

import { Authorizations } from '~/domain/thirdpartyRequests'
import { getSpanTags } from '~/shared/util'

/**
  * summary: VerifyThirdPartyAuthorization
  * description: The method POST /thirdpartyRequests/authorizations/{ID} is used
  *   by the DFSP to ask the PISP to authorize a transaction before continuing
  * parameters: body, content-length
  * produces: application/json
  * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
  */
async function post (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const span = (request as any).span
  const payload = request.payload as tpAPI.Schemas.ThirdpartyRequestsAuthorizationsPostRequest
  const authorizationRequestId = payload.authorizationRequestId
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.AUTHORIZATION,
      Enum.Events.Event.Action.POST,
      { authorizationRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Authorizations.forwardAuthorizationRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_AUTHORIZATIONS_POST,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST,
      request.headers,
      Enum.Http.RestMethods.POST,
      authorizationRequestId,
      payload,
      span
    )
      .catch(err => {
        // Do nothing with the error - forwardAuthorizationRequest takes care of async errors
        Logger.error('Authorizations::post - forwardAuthorizationRequest async handler threw an unhandled error')
        Logger.error(ReformatFSPIOPError(err))
      })

    return h.response().code(Enum.Http.ReturnCodes.ACCEPTED.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

/**
  * summary: UpdateThirdpartyAuthorization
  * description: The method PUT /thirdpartyRequests/authorizations/{ID}
  * is called by the PISP to include the authorization result from their user.
  *
  * parameters: body, content-length
  * produces: application/json
  * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
  */
async function put (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const span = (request as any).span
  // Trust that hapi parsed the ID and Payload for us
  const authorizationRequestId: string = request.params.ID
  const payload = request.payload as tpAPI.Schemas.ThirdpartyRequestsAuthorizationsIDPutResponse
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.AUTHORIZATION,
      Enum.Events.Event.Action.PUT,
      { authorizationRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    // TODO: double check this!
    Authorizations.forwardAuthorizationRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_AUTHORIZATIONS_PUT,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT,
      request.headers,
      Enum.Http.RestMethods.PUT,
      authorizationRequestId,
      payload,
      span
    )
      .catch(err => {
        // Do nothing with the error - forwardAuthorizationRequest takes care of async errors
        Logger.error('Authorizations::put - forwardAuthorizationRequest async handler threw an unhandled error')
        Logger.error(ReformatFSPIOPError(err))
      })

    return h.response().code(Enum.Http.ReturnCodes.OK.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

/**
 * summary: ThirdpartyAuthorizationRequestsError
 * description: The HTTP request PUT /thirdpartyRequests/authorizations/{ID}/error is used to inform a thirdparty
 * of an thirdparty transaction request error
 * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
 * produces: application/json
 * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
 */
const putError = async (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  const span = (request as any).span
  const authorizationRequestId: string = request.params.ID
  const payload = request.payload as APIErrorObject

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.AUTHORIZATION,
      Enum.Events.Event.Action.PUT,
      { authorizationRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Authorizations.forwardAuthorizationRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_AUTHORIZATIONS_PUT_ERROR,
      request.headers,
      authorizationRequestId,
      payload,
      span
    )
      .catch(err => {
        // Do nothing with the error - forwardAuthorizationRequestError takes care of async errors
        Logger.error('ThirdpartyRequestsAuthorizations::put - forwardThirdpartyRequestsAuthorizationsError async handler threw an unhandled error')
        Logger.error(ReformatFSPIOPError(err))
      })

    return h.response().code(Enum.Http.ReturnCodes.OK.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

export {
  post,
  put,
  putError
}
