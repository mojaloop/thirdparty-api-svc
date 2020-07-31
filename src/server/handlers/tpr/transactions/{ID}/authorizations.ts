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
import Logger from '@mojaloop/central-services-logger'
//TODO: fix imports!
import { Authorizations } from '../../../../../domain'
import { TPostAuthorizationPayload } from 'domain/authorizations'

// import { findHello } from '../../model/hello'

/**
  * summary: VerifyThirdPartyAuthorization
  * description: The method POST /thirdpartyrequests/transactions/{ID}/authorization is used
  *   by the DFSP to verify an authorization result with the Auth-Service.
  * parameters: body, content-length
  * produces: application/json
  * responses: 202, 400, 401, 403, 404, 405, 406, 501, 503
  */
export async function post (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  //TODO: any other custom validation that needs doing?
  const thirdpartyRequestId = request.params.id
  //TODO: do we want to verify that the payload is actually what we want? Or do we trust hapi here?
  const payload = request.payload as TPostAuthorizationPayload

  setImmediate(async (): Promise<void> => {
    try {
      console.log('forwardPostAuthorization is ', Authorizations.forwardPostAuthorization)
      await Authorizations.forwardPostAuthorization(request.headers, thirdpartyRequestId, payload)
    } catch (error) {
      Logger.push(error)
      Logger.error('Error: Failed to forward VerifyThirdPartyAuthorization request')
      await Authorizations.sendErrorCallback()
    }
  })

  return h.response().code(Enum.Http.ReturnCodes.ACCEPTED.CODE)
}
