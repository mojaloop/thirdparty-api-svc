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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'

import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import { Enum } from '@mojaloop/central-services-shared'
import { AuditEventAction } from '@mojaloop/event-sdk'

import { Transactions } from '~/domain/thirdpartyRequests'
import { getSpanTags } from '~/shared/util'


const post = async (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  const span = (request as any).span

  try {
    const payload = request.payload as tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.TRANSACTION_REQUEST,
      Enum.Events.Event.Action.POST,
      { transactionRequestId: payload.transactionRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    // TODO: do something 
    Transactions.forwardTransactionRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_POST,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_POST,
      request.headers,
      Enum.Http.RestMethods.POST,
      request.params,
      payload,
      span
    )
      .catch(err => {
        // Do nothing with the error - forwardTransactionRequest takes care of async errors
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

export default {
  post
}
