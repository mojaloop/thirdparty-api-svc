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
import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Enum } from '@mojaloop/central-services-shared'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { AuditEventAction } from '@mojaloop/event-sdk'

import { getSpanTags } from '~/shared/util'
import * as types from '~/interface/types'
import { forwardConsentsIdGenerateChallengeRequest } from '~/domain/consents'

/**
 * summary: GenerateChallengeRequest
 * description: The HTTP request POST /consents/generateChallenge
 * between a PISP, DFSP and user.
 * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri, fspiop-http-method
 * produces: application/json
 * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post(_context: any, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const span = (request as any).span
  // Trust that hapi parsed the ID and Payload for us
  const consentsIdGenerateChallengeId: string = request.params.ID
  const payload = request.payload as types.ConsentsGenerateChallengePayload

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      // todo: add a consent-request/thirdparty? eventType to central-services-shared
      'consent-request',
      Enum.Events.Event.Action.POST,
      { consentsIdGenerateChallengeId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    forwardConsentsIdGenerateChallengeRequest(
      consentsIdGenerateChallengeId,
      Enum.EndPoints.FspEndpointTemplates.TP_CONSENT_GENERATE_CHALLENGE_POST,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST,
      request.headers,
      Enum.Http.RestMethods.POST,
      payload,
      span
    )
    .catch((err: any) => {
        // Do nothing with the error - forwardConsentRequestsRequest takes care of async errors
        Logger.error('ConsentRequests::post - forwardConsentRequestsRequest async handler threw an unhandled error')
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
