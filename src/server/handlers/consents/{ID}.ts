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

 - Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/

import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Enum } from '@mojaloop/central-services-shared'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { AuditEventAction } from '@mojaloop/event-sdk'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import { getSpanTags } from '~/shared/util'
import { forwardConsentsIdRequest } from '~/domain/consents'

/**
  * summary: UpdateConsent
  * description: The method PUT /consents/ID is called by both a PISP and DFSP
  * parameters: body, content-length
  * produces: application/json
  * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
  */
async function put(_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const span = (request as any).span
  // Trust that hapi parsed the ID and Payload for us
  const consentsRequestId: string = request.params.ID
  const payload = request.payload as
    tpAPI.Schemas.ConsentsIDPutResponseVerified |
    tpAPI.Schemas.ConsentsIDPutResponseSigned

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.CONSENT,
      Enum.Events.Event.Action.PUT,
      { consentsRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    forwardConsentsIdRequest(
      consentsRequestId,
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PUT,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
      request.headers,
      Enum.Http.RestMethods.PUT,
      payload,
      span
    )
    .catch(err => {
        // Do nothing with the error - forwardConsentsIdRequest takes care of async errors
        Logger.error('Consents::put - forwardConsentsIdRequest async handler threw an unhandled error')
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
  * summary: PatchConsentByID
  * description: The method PATCH /consents/ID is called by DFSP or Auth Service
  * parameters: body, content-length
  * produces: application/json
  * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
  */
 async function patch(_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const span = (request as any).span
  // Trust that hapi parsed the ID and Payload for us
  const consentsRequestId: string = request.params.ID
  const payload = request.payload as
    tpAPI.Schemas.ConsentsIDPatchResponseVerified |
    tpAPI.Schemas.ConsentsIDPatchResponseRevoked

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.CONSENT,
      Enum.Events.Event.Action.PATCH,
      { consentsRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    forwardConsentsIdRequest(
      consentsRequestId,
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_PATCH,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PATCH,
      request.headers,
      Enum.Http.RestMethods.PATCH,
      payload,
      span
    )
    .catch(err => {
        // Do nothing with the error - forwardConsentsIdRequest takes care of async errors
        Logger.error('Consents::patch - forwardConsentsIdRequest async handler threw an unhandled error')
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
  put,
  patch
}

