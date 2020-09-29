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
import { Util as HapiUtil } from '@hapi/hapi'
import Mustache from 'mustache'
import Logger from '@mojaloop/central-services-logger'

import {
  Enum,
  Util,
} from '@mojaloop/central-services-shared'
import Config from '~/shared/config'
import { inspect } from 'util'
import {
  APIErrorObject,
  FSPIOPError,
  ReformatFSPIOPError
} from '@mojaloop/central-services-error-handling'
import { finishChildSpan } from '~/shared/util'

/**
 * @function forwardConsentsIdRequestError
 * @description Generic function to handle sending `PUT .../consents/error` back to the FSPIOP-Source
 * @param {string} path Callback endpoint path
 * @param {string} consentsId the ID of the consents request
 * @param {HapiUtil.Dictionary<string>} headers Headers object of the request
 * @param {APIErrorObject} error Error details
 * @param {object} span optional request span
 * @throws {FSPIOPError} Will throw an error if no endpoint to forward the transactions requests is
 *  found, if there are network errors or if there is a bad response
 * @returns {Promise<void>}
 */
export async function forwardConsentsIdRequestError(
  path: string,
  consentsId: string,
  headers: HapiUtil.Dictionary<string>,
  error: APIErrorObject,
  span?: any): Promise<void> {

  const childSpan = span?.getChild('forwardConsentsRequestError')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType = Enum.EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT_ERROR

  try {
    const endpoint = await Util.Endpoints.getEndpoint(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType)
    Logger.info(`consents::forwardConsentsRequestError - Resolved destinationDfsp endpoint: ${endpointType}to: ${inspect(endpoint)}`)
    const url: string = Mustache.render(endpoint + path, { ID: consentsId })
    Logger.info(`consents::forwardConsentsRequestError - Forwarding consents error callback to endpoint: ${url}`)

    await Util.Request.sendRequest(
      url,
      headers,
      sourceDfspId,
      destinationDfspId,
      Enum.Http.RestMethods.PUT,
      error,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    Logger.info(`consents::forwardConsentsRequestError - Forwarded consents error callback: from ${sourceDfspId} to ${destinationDfspId}`)
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }

  } catch (err) {
    Logger.error(`consents::forwardConsentsRequestError - Error forwarding consents error to endpoint: ${inspect(err)}`)
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}
