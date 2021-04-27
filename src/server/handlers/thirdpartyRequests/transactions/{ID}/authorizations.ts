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

import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'

import { Authorizations } from '~/domain/thirdpartyRequests'
import { getSpanTags } from '~/shared/util'


/**
  * summary: VerifyThirdPartyAuthorization
  * description: The method POST /thirdpartyRequests/transactions/{ID}/authorizations is used
  *   by the DFSP to verify an authorization result with the Auth-Service.
  * parameters: body, content-length
  * produces: application/json
  * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
  */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post(_context: any, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const span = (request as any).span
  // Trust that hapi parsed the ID and Payload for us
  const transactionRequestId: string = request.params.ID
  const payload = request.payload as
    tpAPI.Schemas.ThirdpartyRequestsTransactionsIDAuthorizationsPostRequest
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.AUTHORIZATION,
      Enum.Events.Event.Action.POST,
      { transactionRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Authorizations.forwardAuthorizationRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_AUTHORIZATIONS_POST,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST,
      request.headers,
      Enum.Http.RestMethods.POST,
      transactionRequestId,
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
  * description: The method PUT /thirdpartyRequests/transactions/{ID}/authorizations is called by the Auth-Service on  * successful validation of authorization.
  * parameters: body, content-length
  * produces: application/json
  * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
  */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function put(_context: any, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const span = (request as any).span
  // Trust that hapi parsed the ID and Payload for us
  const transactionRequestId: string = request.params.ID
  const payload = request.payload as
    tpAPI.Schemas.ThirdpartyRequestsTransactionsIDAuthorizationsPutResponse

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.AUTHORIZATION,
      Enum.Events.Event.Action.PUT,
      { transactionRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Authorizations.forwardAuthorizationRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_AUTHORIZATIONS_PUT,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT,
      request.headers,
      Enum.Http.RestMethods.PUT,
      transactionRequestId,
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

export default {
  post,
  put
}

