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
import { ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'

import { forwardConsentRequestsRequest } from '~/domain/consentRequests'
import { getSpanTags } from '~/shared/util'
import { RequestSpanExtended } from '../../interface/types'

/**
 * summary: CreateConsentRequest
 * description: The HTTP request POST /consentRequests is used to establish consent
 * between a PISP, DFSP and user.
 * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri, fspiop-http-method
 * produces: application/json
 * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
 */
async function post (
  _context: unknown,
  request: RequestSpanExtended,
  h: ResponseToolkit
): Promise<ResponseObject> {
  const span = request.span
  // Trust that hapi parsed the ID and Payload for us
  const payload = request.payload as tpAPI.Schemas.ConsentRequestsPostRequest
  const consentRequestsId: string = payload.consentRequestId

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.CONSENT_REQUEST,
      Enum.Events.Event.Action.POST,
      { consentRequestsId }
    )

    span?.setTags(tags)
    await span?.audit(
      {
        headers: request.headers,
        payload: request.payload
      },
      AuditEventAction.start
    )

    // Note: calling async function without `await`
    forwardConsentRequestsRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_POST,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_POST,
      request.headers,
      Enum.Http.RestMethods.POST,
      payload,
      span
    ).catch((err) => {
      // Do nothing with the error - forwardConsentRequestsRequest takes care of async errors
      Logger.error(
        'ConsentRequests::post - forwardConsentRequestsRequest async handler threw an unhandled error'
      )
      Logger.error(ReformatFSPIOPError(err))
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
