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

 - Paweł Marzec <pawel.marzec@modusbox.com>
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>
 - Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/
import { Util } from '@mojaloop/central-services-shared'
import Health from './health'
import Metrics from './metrics'
import ThirdpartyTransactions from './thirdpartyRequests/transactions'
import ThirdpartyTransactionsId from './thirdpartyRequests/transactions/{ID}'
import ThirdpartyTransactionsIdError from './thirdpartyRequests/transactions/{ID}/error'
import Consents from './consents'
import ConsentsId from './consents/{ID}'
import ConsentsIdGenerateChallenge from './consents/{ID}/generateChallenge'
import ConsentRequests from './consentRequests'
import Authorizations from './thirdpartyRequests/transactions/{ID}/authorizations'
import ConsentRequestsId from './consentRequests/{ID}'
import { wrapWithHistogram } from '~/shared/histogram'
const OpenapiBackend = Util.OpenapiBackend

export default {
  HealthGet: Health.get,
  MetricsGet: Metrics.get,
  GetThirdpartyTransactionRequests: wrapWithHistogram(
    ThirdpartyTransactionsId.get,
    [
      'thirdpartyRequests_transactions_get',
      'Get thirdpartyRequests transactions request',
      ['success']
    ]
  ),
  CreateThirdpartyTransactionRequests: wrapWithHistogram(
    ThirdpartyTransactions.post,
    [
      'thirdpartyRequests_transactions_post',
      'Post thirdpartyRequests transactions request',
      ['success']
    ]
  ),
  UpdateThirdPartyTransactionRequests: wrapWithHistogram(
    ThirdpartyTransactionsId.put,
    [
      'thirdpartyRequests_transactions_put',
      'Put thirdpartyRequests transactions request',
      ['success']
    ]
  ),
  ThirdpartyTransactionRequestsError: wrapWithHistogram(
    ThirdpartyTransactionsIdError.put,
    [
      'thirdpartyRequests_transactions_error_put',
      'Put thirdpartyRequests transactions error request',
      ['success']
    ]
  ),
  VerifyThirdPartyAuthorization: wrapWithHistogram(
    Authorizations.post,
    [
      'thirdpartyRequests_transactions_authorizations_post',
      'Post thirdpartyRequests transactions authorizations request',
      ['success']
    ]
  ),
  UpdateThirdpartyAuthorization: wrapWithHistogram(
    Authorizations.put,
    [
      'thirdpartyRequests_transactions_authorizations_put',
      'Put thirdpartyRequests transactions authorizations request',
      ['success']
    ]
  ),
  CreateConsentRequest: wrapWithHistogram(
    ConsentRequests.post,
    [
      'consentRequests_post',
      'Post consentRequests request',
      ['success']
    ]
  ),
  UpdateConsentRequest: wrapWithHistogram(
    ConsentRequestsId.put,
    [
      'consentRequestsId_put',
      'Put consentRequestsId request',
      ['success']
    ]
  ),
  CreateConsent: wrapWithHistogram(
    Consents.post,
    [
      'consents_post',
      'Post consents request',
      ['success']
    ]
  ),
  UpdateConsent: wrapWithHistogram(
    ConsentsId.put,
    [
      'consentsId_put',
      'Put consentsId request',
      ['success']
    ]
  ),
  GenerateChallengeRequest: wrapWithHistogram(
    ConsentsIdGenerateChallenge.post,
    [
      'consentsGenerateChallenge_post',
      'Post consents generate challenge request',
      ['success']
    ]
  ),
  validationFail: OpenapiBackend.validationFail,
  notFound: OpenapiBackend.notFound,
  methodNotAllowed: OpenapiBackend.methodNotAllowed
}
