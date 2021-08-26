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
import Consents from './consents'
import ConsentsId from './consents/{ID}'
import ConsentsByIdError from './consents/{ID}/error'
import ConsentRequests from './consentRequests'
import ConsentRequestsId from './consentRequests/{ID}'
import ConsentRequestsByIdError from './consentRequests/{ID}/error'
import Accounts from './accounts/{ID}'
import AccountsByUserIdError from './accounts/{ID}/error'
import Services from './services/{ServiceType}'
import ServicesByServiceTypeError from './services/{ServiceType}/error'
import * as ThirdpartyTransactions from './thirdpartyRequests/transactions'
import * as ThirdpartyRequestsAuthorizations from './thirdpartyRequests/authorizations'
import * as ThirdpartyRequestsVerifications from './thirdpartyRequests/verifications'
import { wrapWithHistogram } from '~/shared/histogram'
const OpenapiBackend = Util.OpenapiBackend

export default {
  HealthGet: Health.get,
  MetricsGet: Metrics.get,
  GetThirdpartyTransactionRequests: wrapWithHistogram(
    ThirdpartyTransactions.get,
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
    ThirdpartyTransactions.put,
    [
      'thirdpartyRequests_transactions_put',
      'Put thirdpartyRequests transactions request',
      ['success']
    ]
  ),
  NotifyThirdpartyTransactionRequests: wrapWithHistogram(
    ThirdpartyTransactions.patch,
    [
      'thirdpartyRequests_transactions_patch',
      'Patch thirdpartyRequests transactions request',
      ['success']
    ]
  ),
  ThirdpartyTransactionRequestsError: wrapWithHistogram(
    ThirdpartyTransactions.putError,
    [
      'thirdpartyRequests_transactions_error_put',
      'Put thirdpartyRequests transactions error request',
      ['success']
    ]
  ),
  PostThirdpartyRequestsAuthorizations: wrapWithHistogram(
    ThirdpartyRequestsAuthorizations.post,
    [
      'thirdpartyRequests_authorizations_post',
      'Post thirdpartyRequests authorizations request',
      ['success']
    ]
  ),
  PutThirdpartyRequestsAuthorizationsById: wrapWithHistogram(
    ThirdpartyRequestsAuthorizations.put,
    [
      'thirdpartyRequests_authorizations_put',
      'Put thirdpartyRequests authorizations request',
      ['success']
    ]
  ),
  PutThirdpartyRequestsAuthorizationsByIdAndError: wrapWithHistogram(
    ThirdpartyRequestsAuthorizations.putError,
    [
      'thirdpartyRequests_authorizations_error_put',
      'Put thirdpartyRequests authorizations request error',
      ['success']
    ]
  ),
  PostThirdpartyRequestsVerifications: wrapWithHistogram(
    ThirdpartyRequestsVerifications.post,
    [
      'thirdpartyRequests_verifications_post',
      'Post thirdpartyRequests verifications request',
      ['success']
    ]
  ),
  PutThirdpartyRequestsVerificationsById: wrapWithHistogram(
    ThirdpartyRequestsVerifications.put,
    [
      'thirdpartyRequests_verifications_put',
      'Put thirdpartyRequests verifications request',
      ['success']
    ]
  ),
  PutThirdpartyRequestsVerificationsByIdAndError: wrapWithHistogram(
    ThirdpartyRequestsVerifications.putError,
    [
      'thirdpartyRequests_verifications_error_put',
      'Put thirdpartyRequests verifications request error',
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
  PatchConsentRequest: wrapWithHistogram(
    ConsentRequestsId.patch,
    [
      'consentRequestsId_patch',
      'Patch consentRequestsId request',
      ['success']
    ]
  ),
  PostConsents: wrapWithHistogram(
    Consents.post,
    [
      'consents_post',
      'Post consents request',
      ['success']
    ]
  ),
  PutConsentByID: wrapWithHistogram(
    ConsentsId.put,
    [
      'consentsId_put',
      'Put consentsId request',
      ['success']
    ]
  ),
  PatchConsentByID: wrapWithHistogram(
    ConsentsId.patch,
    [
      'consentsId_patch',
      'Patch consentsId request',
      ['success']
    ]
  ),
  NotifyErrorConsents: wrapWithHistogram(
    ConsentsByIdError.put,
    [
      'consentsId_error_put',
      'Put consentsId error request',
      ['success']
    ]
  ),
  GetAccountsByUserId: wrapWithHistogram(
    Accounts.get,
    [
      'accounts_by_userid_get',
      'Get Accounts by userId request',
      ['success']
    ]
  ),
  UpdateAccountsByUserId: wrapWithHistogram(
    Accounts.put,
    [
      'accounts_by_userid_put',
      'Put accountsByUserId request',
      ['success']
    ]
  ),
  UpdateAccountsByUserIdError: wrapWithHistogram(
    AccountsByUserIdError.put,
    [
      'accounts_by_userid_error_put',
      'Put accountsByUserIdError request',
      ['success']
    ]
  ),
  NotifyErrorConsentRequests: wrapWithHistogram(
    ConsentRequestsByIdError.put,
    [
      'consentRequestsId_error_put',
      'Put consentRequestsId error request',
      ['success']
    ]
  ),
  GetServicesByServiceType: wrapWithHistogram(
    Services.get,
    [
      'servicesServiceType_get',
      'Put servicesServiceType request',
      ['success']
    ]
  ),
  PutServicesByServiceType: wrapWithHistogram(
    Services.put,
    [
      'servicesServiceType_put',
      'Put servicesServiceType request',
      ['success']
    ]
  ),
  PutServicesByServiceTypeAndError: wrapWithHistogram(
    ServicesByServiceTypeError.put,
    [
      'servicesServiceType_error_put',
      'Put servicesServiceType error request',
      ['success']
    ]
  ),
  validationFail: OpenapiBackend.validationFail,
  notFound: OpenapiBackend.notFound,
  methodNotAllowed: OpenapiBackend.methodNotAllowed
}
