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
 - Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/
'use strict'
/**
 * This is used for personal information
 */
interface PersonalInfo {
  complexName?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  dateOfBirth?: string;
}
interface PartyIdInfo {
  partyIdType: string;
  partyIdentifier: string;
  partySubIdOrType?: string;
  fspId?: string;
}
export enum AmountType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}
/**
* common interface used for payee and payer
*/
interface Party {
  partyIdInfo: PartyIdInfo;
  merchantClassificationCode?: string;
  name?: string;
  personalInfo?: PersonalInfo;
}
/**
* This is used for amount feilds
*/
interface Money {
  currency: string;
  amount: string;
}
/**
* This interface used for transaction information
*/
interface TransactionType {
  scenario: string;
  subScenario?: string;
  initiator: string;
  initiatorType: string;
  refundInfo?: {
    originalTransactionId: string;
    refundReason?: string;
  };
  balanceOfPayments?: string;
}
/**
* This interface is used for consentRequests
*/
export enum ConsentScopeType {
  ACCOUNTS_GET_BALANCE = 'accounts.getBalance',
  ACCOUNTS_TRANSFER = 'accounts.transfer',
}
interface Scope {
  accountId: string;
  actions: ConsentScopeType[];
}
/**
* This interface used for transaction requests
*/
export interface ThirdPartyTransactionRequest {
  transactionRequestId: string;
  sourceAccountId: string;
  consentId: string;
  payee: Party;
  payer: Party;
  amountType: AmountType;
  amount: Money;
  transactionType: TransactionType;
  expiration: string;
}
/**
* Transaction request state
*/
export enum TransactionRequestState {
  RECEIVED = 'RECEIVED',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}
/**
* This interface used for update transaction requests
*/
export interface UpdateThirdPartyTransactionRequest {
  transactionId: string;
  transactionRequestState: TransactionRequestState;
}
/**
* This interface used for common errors
*/
export interface ErrorInformation {
  errorCode?: string;
  errorDescription?: string;
  extensionList?: {
    extension: [{
      key: string;
      value: string;
    }];
  };
}
/**
* authorization status
*/
export enum AuthorizationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
}
/**
* used for authorization requests
*/
export interface AuthorizationPayload {
  challenge: string;
  value: string;
  consentId: string;
  sourceAccountId: string;
  status: AuthorizationStatus;
}
export enum ConsentRequestChannelType {
  WEB = 'WEB',
  OTP = 'OTP',
}
/**
* used for consentRequests requests
*/
export interface ConsentRequestsPayload {
  id: string;
  initiatorId: string;
  scopes: Scope[];
  authChannels: ConsentRequestChannelType[];
  callbackUri: string;
}
/**
* used for consentRequests/{ID} requests
*/
export interface ConsentRequestsIDPayload {
  initiatorId: string;
  scopes: Scope[];
  authChannels: ConsentRequestChannelType[];
  callbackUri: string;
  authUri?: string;
  authToken?: string;
}
/**
* used for consents requests
*/
export interface ConsentsPayload {
  id: string;
  requestId: string;
  initiatorId: string;
  participantId: string;
  scopes: Scope[];
}
/**
* used for consents generate challenge requests
*/
export interface ConsentsGenerateChallengePayload {
  type: string;
}
/**
* used for consents/{ID} requests
*/
export interface ConsentsIDPayload {
  requestId: string;
  participantId: string;
  initiatorId: string;
  scopes: Scope[];
  credential: UnsignedCredential | SignedCredential;
}

interface UnsignedCredential {
  type: string;
  status: string;
  challenge: CredentialChallengeUnsigned;
}
interface SignedCredential {
  id: string;
  type: string;
  status: string;
  challenge: CredentialChallengeSigned;
  payload: string;
}

interface CredentialChallengeUnsigned {
  payload: string;
}

interface CredentialChallengeSigned {
  payload: string;
  signature: string;
}
/**
* used for accounts requests
*/
export interface AccountsIdRequest {
  accountNickname: string;
  id: string;
  currency: string;
}

export interface PatchConsentRequestsIDPayload {
  authToken: string;
}
