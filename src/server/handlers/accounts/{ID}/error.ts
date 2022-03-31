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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'

import { ResponseToolkit, ResponseObject } from '@hapi/hapi'
import Logger from '@mojaloop/central-services-logger'
import { ReformatFSPIOPError, APIErrorObject } from '@mojaloop/central-services-error-handling'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'
import { forwardAccountsIdRequestError } from '~/domain/accounts'
import { getSpanTags } from '~/shared/util'
import { RequestSpanExtended } from '~/interface/types'

/**
 * summary: UpdateAccountsByUserIdError
 * description: The HTTP request PUT /accounts/{ID}/error is used to inform the client
 * about accounts error.
 * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
 * produces: application/json
 * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
 */
const put = async (
  _context: unknown,
  request: RequestSpanExtended,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  const span = request.span
  const userId: string = request.params.ID
  const payload = request.payload as APIErrorObject

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.ACCOUNT,
      Enum.Events.Event.Action.PUT,
      { userId }
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
    forwardAccountsIdRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_ACCOUNTS_PUT_ERROR,
      request.headers,
      userId,
      payload,
      span
    ).catch((err) => {
      // Do nothing with the error - forwardAccountsIdRequestError takes care of async errors
      Logger.error(
        'Accounts::put:error - forwardAccountsIdRequestError async handler threw an unhandled error'
      )
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
  put
}
