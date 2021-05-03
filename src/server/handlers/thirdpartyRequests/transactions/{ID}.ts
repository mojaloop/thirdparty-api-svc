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

/**
 * summary: GetThirdpartyTransactionRequests
 * description: The HTTP request GET /thirdpartyRequests/transactions/{ID} is used to retrieve a transaction request
 * for the provided financial transaction in the server.
 * parameters: body, accept, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
 * produces: application/json
 * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
 */
const get = async (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  const span = (request as any).span

  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.TRANSACTION_REQUEST,
      Enum.Events.Event.Action.GET,
      { transactionRequestId: request.params.transactionRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Transactions.forwardTransactionRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_GET,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_GET,
      request.headers,
      Enum.Http.RestMethods.GET,
      request.params,
      undefined,
      span
    )
    .catch(err => {
      // Do nothing with the error - forwardTransactionRequest takes care of async errors
      Logger.error('Transactions::get - forwardTransactionRequest async handler threw an unhandled error')
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
 * summary: UpdateThirdPartyTransactionRequests
 * description: The HTTP request PUT /thirdpartyRequests/transactions/{ID} is used to inform the client about
 * status of a previously requested thirdparty transaction.
 * parameters: body, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
 * produces: application/json
 * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
 */
const put = async (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  const payload = request.payload as tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPutResponse
  const span = (request as any).span
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.TRANSACTION_REQUEST,
      Enum.Events.Event.Action.PUT,
      { transactionRequestId: request.params.transactionRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Transactions.forwardTransactionRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PUT,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PUT,
      request.headers,
      Enum.Http.RestMethods.PUT,
      request.params,
      payload,
      span
    )
      .catch(err => {
        // Do nothing with the error - forwardTransactionRequest takes care of async errors
        Logger.error('Transactions::put - forwardTransactionRequest async handler threw an unhandled error')
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
 * summary: NotifyThirdpartyTransactionRequests
 * description: The HTTP request PATCH /thirdpartyRequests/transactions/{ID} is used to inform the client about
 * outcome of a transaction request.
 * parameters: body, content-length, content-type, date, x-forwarded-for, fspiop-source,
 * fspiop-destination, fspiop-encryption,fspiop-signature, fspiop-uri fspiop-http-method
 * produces: application/json
 * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
 */
const patch = async (_context: unknown, request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
  const payload = request.payload as tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPutResponse
  const span = (request as any).span
  try {
    const tags: { [id: string]: string } = getSpanTags(
      request,
      Enum.Events.Event.Type.TRANSACTION_REQUEST,
      Enum.Events.Event.Action.PATCH,
      { transactionRequestId: request.params.transactionRequestId })

    span?.setTags(tags)
    await span?.audit({
      headers: request.headers,
      payload: request.payload
    }, AuditEventAction.start)

    // Note: calling async function without `await`
    Transactions.forwardTransactionRequest(
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PATCH,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PATCH,
      request.headers,
      Enum.Http.RestMethods.PATCH,
      request.params,
      payload,
      span
    )
      .catch(err => {
        // Do nothing with the error - forwardTransactionRequest takes care of async errors
        Logger.error('Transactions::patch - forwardTransactionRequest async handler threw an unhandled error')
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
  get,
  put,
  patch
}
