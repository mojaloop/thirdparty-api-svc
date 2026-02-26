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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'

import { ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { APIErrorObject, ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'

import * as Verifications from '~/domain/thirdpartyRequests/verifications'
import { getSpanTags } from '~/shared/util'
import { RequestSpanExtended } from '../../../interface/types'

/**
 * summary: VerifyThirdPartyAuthorization
 * description: The method POST /thirdpartyRequests/verifications/{ID} is used
 *   by the DFSP to ask the PISP to authorize a transaction before continuing
 * parameters: body, content-length
 * produces: application/json
 * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
 */
async function post(_context: unknown, request: RequestSpanExtended, h: ResponseToolkit): Promise<ResponseObject> {
  const span = request.span
  const payload = request.payload as tpAPI.Schemas.ThirdpartyRequestsVerificationsPostRequest
  const verificationRequestId = payload.verificationRequestId
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.VERIFICATION,
      Enum.Events.Event.Action.POST,
      { verificationRequestId }
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
    Verifications.forwardVerificationRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_VERIFICATIONS_POST,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST,
      request.headers as Record<string, string>,
      Enum.Http.RestMethods.POST,
      verificationRequestId,
      payload,
      span
    ).catch((err) => {
      // Do nothing with the error - forwardVerificationRequest takes care of async errors
      Logger.error('Verifications::post - forwardVerificationRequest async handler threw an unhandled error')
      Logger.error(ReformatFSPIOPError(err))
    })

    return h.response().code(Enum.Http.ReturnCodes.ACCEPTED.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

async function put(_context: unknown, request: RequestSpanExtended, h: ResponseToolkit): Promise<ResponseObject> {
  const span = request.span
  // Trust that hapi parsed the ID and Payload for us
  const verificationRequestId: string = request.params.ID
  const payload = request.payload as tpAPI.Schemas.ThirdpartyRequestsVerificationsIDPutResponse

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.VERIFICATION,
      Enum.Events.Event.Action.PUT,
      { verificationRequestId }
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
    Verifications.forwardVerificationRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_VERIFICATIONS_PUT,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT,
      request.headers as Record<string, string>,
      Enum.Http.RestMethods.PUT,
      verificationRequestId,
      payload,
      span
    ).catch((err) => {
      // Do nothing with the error - forwardVerificationRequest takes care of async errors
      Logger.error('Verifications::post - forwardVerificationRequest async handler threw an unhandled error')
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
 * summary: ThirdpartyTransactionRequestsError
 * description: The HTTP request PPUT /thirdpartyRequests/authorizations/{ID} is used to inform a thirdparty
 * of an thirdparty transaction request error
 * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
 * produces: application/json
 * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
 */
const putError = async (
  _context: unknown,
  request: RequestSpanExtended,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  const span = request.span
  const verificationRequestId: string = request.params.ID
  const payload = request.payload as APIErrorObject

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.VERIFICATION,
      Enum.Events.Event.Action.PUT,
      { transactionRequestId: request.params.transactionRequestId }
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
    Verifications.forwardVerificationRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_VERIFICATIONS_PUT_ERROR,
      request.headers as Record<string, string>,
      verificationRequestId,
      payload,
      span
    ).catch((err: unknown) => {
      // Do nothing with the error - forwardVerificationRequest takes care of async errors
      Logger.error('Verifications::post - forwardVerificationRequest async handler threw an unhandled error')
      Logger.error(ReformatFSPIOPError(err))
    })

    return h.response().code(Enum.Http.ReturnCodes.OK.CODE)
  } catch (err) {
    const fspiopError = ReformatFSPIOPError(err)
    Logger.error(fspiopError)
    throw fspiopError
  }
}

export { post, put, putError }
