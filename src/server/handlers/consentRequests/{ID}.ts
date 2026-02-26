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
import { ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'

import { forwardConsentRequestsIdRequest } from '~/domain/consentRequests'
import { RequestSpanExtended } from '~/interface/types'
import { getSpanTags } from '~/shared/util'

/**
 * summary: UpdateConsentRequest
 * description: The method PUT /consentRequests/ID is called by both a PISP and DFSP
 * parameters: body, content-length
 * produces: application/json
 * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
 */
async function put(_context: unknown, request: RequestSpanExtended, h: ResponseToolkit): Promise<ResponseObject> {
  const span = request.span
  // Trust that hapi parsed the ID and Payload for us
  const consentRequestsRequestId: string = request.params.ID
  const payload = request.payload as
    | tpAPI.Schemas.ConsentRequestsIDPutResponseOTP
    | tpAPI.Schemas.ConsentRequestsIDPutResponseWeb

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.CONSENT_REQUEST,
      Enum.Events.Event.Action.PUT,
      { consentRequestsRequestId }
    )

    span?.setTags(tags)
    await span?.audit(
      {
        headers: request.headers as Record<string, string>,
        payload: request.payload
      },
      AuditEventAction.start
    )

    // Note: calling async function without `await`
    forwardConsentRequestsIdRequest(
      consentRequestsRequestId,
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT,
      request.headers as Record<string, string>,
      Enum.Http.RestMethods.PUT,
      payload,
      span
    ).catch((err) => {
      // Do nothing with the error - forwardConsentRequestsIdRequest takes care of async errors
      Logger.error('ConsentRequests::put - forwardConsentRequestsIdRequest async handler threw an unhandled error')
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
 * summary: PatchConsentRequest
 * description: The method PATCH /consentRequests/ID is called by both a PISP and DFSP
 * parameters: body, content-length
 * produces: application/json
 * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
 */
async function patch(_context: unknown, request: RequestSpanExtended, h: ResponseToolkit): Promise<ResponseObject> {
  const span = request.span
  // Trust that hapi parsed the ID and Payload for us
  const consentRequestsRequestId: string = request.params.ID
  const payload = request.payload as tpAPI.Schemas.ConsentRequestsIDPatchRequest
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.CONSENT_REQUEST,
      Enum.Events.Event.Action.PATCH,
      { consentRequestsRequestId }
    )

    span?.setTags(tags)
    await span?.audit(
      {
        headers: request.headers as Record<string, string>,
        payload: request.payload
      },
      AuditEventAction.start
    )

    // Note: calling async function without `await`
    forwardConsentRequestsIdRequest(
      consentRequestsRequestId,
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PATCH,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PATCH,
      request.headers as Record<string, string>,
      Enum.Http.RestMethods.PATCH,
      payload,
      span
    ).catch((err) => {
      // Do nothing with the error - forwardConsentRequestsIdRequest takes care of async errors
      Logger.error('ConsentRequests::put - forwardConsentRequestsIdRequest async handler threw an unhandled error')
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
  patch,
  put
}
