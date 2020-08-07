/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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

 --------------
 ******/

import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Enum } from '@mojaloop/central-services-shared'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
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
  const thirdpartyRequestId: string = request.params.ID
  const payload = request.payload as Authorizations.TPostAuthorizationPayload

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      // TODO update this for thirdparty authorization
      Enum.Events.Event.Type.TRANSACTION_REQUEST,
      Enum.Events.Event.Action.POST,
      { transactionRequestId: thirdpartyRequestId  })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Authorizations.forwardPostAuthorization(request.headers, thirdpartyRequestId, payload)
    .catch(_ => {
      // Do nothing with the error - forwardPostAuthorization takes care of async errors
    })

    return h.response().code(Enum.Http.ReturnCodes.ACCEPTED.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

export default {
  post
}

