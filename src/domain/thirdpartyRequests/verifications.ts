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

 - Lewis Daly <lewisd@crosslaketech.com>
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/

import { Util as HapiUtil } from '@hapi/hapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import {
  APIErrorObject,
  FSPIOPError,
  ReformatFSPIOPError
} from '@mojaloop/central-services-error-handling'
import Logger from '@mojaloop/central-services-logger'
import {
  Enum,
  FspEndpointTypesEnum,
  RestMethodsEnum,
  Util
} from '@mojaloop/central-services-shared'
import { Span } from '@mojaloop/event-sdk'

import { inspect } from 'util'
import Config from '~/shared/config'
import { finishChildSpan } from '~/shared/util'

export async function forwardVerificationRequest (
  path: string,
  endpointType: FspEndpointTypesEnum,
  headers: HapiUtil.Dictionary<string>,
  method: RestMethodsEnum,
  verificationRequestId: string,
  payload:
  | tpAPI.Schemas.ThirdpartyRequestsVerificationsPostRequest
  | tpAPI.Schemas.ThirdpartyRequestsVerificationsIDPutResponse,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardVerificationRequest')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ID: verificationRequestId }
    )
    Logger.info(
      `verifications::forwardVerificationRequest - Forwarding verification to endpoint: ${url}`
    )

    await Util.Request.sendRequest(
      url,
      headers,
      sourceDfspId,
      destinationDfspId,
      method,
      payload,
      Enum.Http.ResponseTypes.JSON,
      childSpan
    )

    Logger.info(
      `verifications::forwardVerificationRequest - Forwarded thirdpartyTransaction verification: ${verificationRequestId} from ${sourceDfspId} to ${destinationDfspId}`
    )
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `verifications::forwardVerificationRequest - Error forwarding thirdpartyTransaction verification to endpoint: ${inspect(
        err
      )}`
    )
    const errorHeaders = {
      ...headers,
      'fspiop-source': Enum.Http.Headers.FSPIOP.SWITCH.value,
      'fspiop-destination': sourceDfspId
    }
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    await forwardVerificationRequestError(
      Enum.EndPoints.FspEndpointTemplates.TP_REQUESTS_VERIFICATIONS_PUT_ERROR,
      errorHeaders,
      verificationRequestId,
      fspiopError.toApiErrorObject(
        Config.ERROR_HANDLING.includeCauseExtension,
        Config.ERROR_HANDLING.truncateExtensions
      ),
      childSpan
    )

    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}

export async function forwardVerificationRequestError (
  path: string,
  headers: HapiUtil.Dictionary<string>,
  verificationRequestId: string,
  error: APIErrorObject,
  span?: Span
): Promise<void> {
  const childSpan = span?.getChild('forwardVerificationRequestError')
  const sourceDfspId = headers[Enum.Http.Headers.FSPIOP.SOURCE]
  const destinationDfspId = headers[Enum.Http.Headers.FSPIOP.DESTINATION]
  const endpointType =
    Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR

  try {
    const url = await Util.Endpoints.getEndpointAndRender(
      Config.ENDPOINT_SERVICE_URL,
      destinationDfspId,
      endpointType,
      path,
      { ID: verificationRequestId }
    )
    Logger.info(
      `verifications::forwardVerificationRequestError - Forwarding thirdpartyTransaction verification error callback to endpoint: ${url}`
    )

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

    Logger.info(
      `verifications::forwardVerificationRequestError - Forwarded thirdpartyTransaction verification error callback: ${verificationRequestId} from ${sourceDfspId} to ${destinationDfspId}`
    )
    if (childSpan && !childSpan.isFinished) {
      childSpan.finish()
    }
  } catch (err) {
    Logger.error(
      `verifications::forwardVerificationRequestError - Error forwarding thirdpartyTransaction verification error to endpoint: ${inspect(
        err
      )}`
    )
    const fspiopError: FSPIOPError = ReformatFSPIOPError(err)
    if (childSpan && !childSpan.isFinished) {
      await finishChildSpan(fspiopError, childSpan)
    }
    throw fspiopError
  }
}
