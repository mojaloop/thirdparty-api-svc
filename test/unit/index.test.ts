/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
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

 * Lewis Daly <lewis@vesselstech.com>
 * Paweł Marzec <pawel.marzec@modusbox.com>
 * Sridhar Voruganti <sridhar.voruganti@modusbox.com>
 --------------
 ******/

import index from '~/index'
import Config from '~/shared/config'
import { Server } from '@hapi/hapi'

import { Authorizations, Transactions } from '~/domain/thirdpartyRequests'
import Logger from '@mojaloop/central-services-logger'
import TestData from 'test/unit/data/mockData.json'
import * as Consents from '~/domain/consents'
import * as ConsentRequests from '~/domain/consentRequests'
import * as Accounts from '~/domain/accounts'
import * as Services from '~/domain/services'

const mockForwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mockForwardTransactionRequestError = jest.spyOn(Transactions, 'forwardTransactionRequestError')
const mockForwardAuthorizationRequest = jest.spyOn(Authorizations, 'forwardAuthorizationRequest')
const mockForwardConsentsRequest = jest.spyOn(Consents, 'forwardConsentsRequest')
const mockForwardConsentsIdRequest = jest.spyOn(Consents, 'forwardConsentsIdRequest')
const mockForwardConsentsIdRequestError = jest.spyOn(Consents, 'forwardConsentsIdRequestError')
const mockForwardConsentRequestsRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsRequest')
const mockForwardConsentRequestsIdRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsIdRequest')
const mockForwardConsentRequestsIdErrorRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsIdRequestError')
const mockForwardConsentsIdGenerateChallengeRequest = jest.spyOn(Consents, 'forwardConsentsIdGenerateChallengeRequest')
const mockForwardAccountsIdRequest = jest.spyOn(Accounts, 'forwardAccountsIdRequest')
const mockForwardAccountsIdRequestError = jest.spyOn(Accounts, 'forwardAccountsIdRequestError')
const mockForwardGetServicesServiceTypeRequestToProviderService = jest.spyOn(Services, 'forwardGetServicesServiceTypeRequestToProviderService')
const mockForwardGetServicesServiceTypeRequestFromProviderService = jest.spyOn(Services, 'forwardGetServicesServiceTypeRequestFromProviderService')
const mockForwardServicesServiceTypeRequestError = jest.spyOn(Services, 'forwardServicesServiceTypeRequestError')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockData = JSON.parse(JSON.stringify(TestData))
const trxnRequest = mockData.transactionRequest
const trxnRequestError = mockData.genericThirdpartyError
const consentRequestsRequestError = mockData.consentRequestsThirdpartyError
const consentsRequestError = mockData.consentsThirdpartyError
const patchThirdpartyTransactionIdRequest = mockData.patchThirdpartyTransactionIdRequest

describe('index', (): void => {
  it('must have proper layout', (): void => {
    expect(typeof index.server).toBeDefined()
    expect(typeof index.server.run).toEqual('function')
  })

  describe('api routes', (): void => {
    let server: Server

    beforeAll(async (): Promise<Server> => {
      server = await index.server.run(Config)
      return server
    })

    afterAll((done): void => {
      server.events.on('stop', done)
      server.stop()
    })

    describe('/thirdpartyRequests/transactions', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('POST', async (): Promise<void> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        const reqHeaders = Object.assign(trxnRequest.headers, {
          date: 'Thu, 23 Jan 2020 10:22:12 GMT',
          accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
          'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
        })
        const request = {
          method: 'POST',
          url: '/thirdpartyRequests/transactions',
          headers: reqHeaders,
          payload: trxnRequest.payload
        }

        const expected = [
          '/thirdpartyRequests/transactions',
          'TP_CB_URL_TRANSACTION_REQUEST_POST',
          expect.objectContaining(request.headers),
          'POST',
          {},
          request.payload,
          expect.any(Object)
        ]
        const response = await server.inject(request)

        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
      })

      it('GET', async (): Promise<void> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        const reqHeaders = Object.assign(trxnRequest.headers, {
          date: 'Thu, 23 Jan 2020 10:22:12 GMT',
          accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
          'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
        })
        const request = {
          method: 'GET',
          url: '/thirdpartyRequests/transactions/b37605f7-bcd9-408b-9291-6c554aa4c802',
          headers: reqHeaders
        }

        const expected = [
          '/thirdpartyRequests/transactions/{{ID}}',
          'TP_CB_URL_TRANSACTION_REQUEST_GET',
          expect.objectContaining(request.headers),
          'GET',
          { ID: 'b37605f7-bcd9-408b-9291-6c554aa4c802' },
          undefined,
          expect.any(Object)
        ]
        const response = await server.inject(request)

        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
      })

      it('mandatory fields validation', async (): Promise<void> => {
        const errPayload = Object.assign(trxnRequest.payload, { transactionRequestId: undefined })
        const request = {
          method: 'POST',
          url: '/thirdpartyRequests/transactions',
          headers: trxnRequest.headers,
          payload: errPayload
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'transactionRequestId\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardTransactionRequest).not.toHaveBeenCalled()
      })

      it('PUT', async (): Promise<void> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        const reqHeaders = Object.assign(mockData.updateTransactionRequest.headers, {
          date: 'Thu, 23 Jan 2020 10:22:12 GMT',
          accept: 'application/vnd.interoperability.thirdparty+json;version=1.0'
        })
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/transactions/b37605f7-bcd9-408b-9291-6c554aa4c802',
          headers: reqHeaders,
          payload: mockData.updateTransactionRequest.payload
        }

        const expected = [
          '/thirdpartyRequests/transactions/{{ID}}',
          'TP_CB_URL_TRANSACTION_REQUEST_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          { ID: 'b37605f7-bcd9-408b-9291-6c554aa4c802' },
          request.payload,
          expect.any(Object)
        ]
        const response = await server.inject(request)

        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
      })

      it('PATCH', async (): Promise<void> => {
        mockForwardTransactionRequest.mockResolvedValueOnce()
        const reqHeaders = Object.assign(patchThirdpartyTransactionIdRequest.headers, {
          date: 'Thu, 23 Jan 2020 10:22:12 GMT',
          accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
          'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
        })
        const request = {
          method: 'PATCH',
          url: '/thirdpartyRequests/transactions/b37605f7-bcd9-408b-9291-6c554aa4c802',
          headers: reqHeaders,
          payload: patchThirdpartyTransactionIdRequest.payload
        }

        const expected = [
          '/thirdpartyRequests/transactions/{{ID}}',
          'TP_CB_URL_TRANSACTION_REQUEST_PATCH',
          expect.objectContaining(request.headers),
          'PATCH',
          { ID: 'b37605f7-bcd9-408b-9291-6c554aa4c802' },
          request.payload,
          undefined
        ]
        const response = await server.inject(request)

        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
      })


      it('PATCH mandatory fields validation', async (): Promise<void> => {
        const errPayload = Object.assign(trxnRequest.payload, {})
        const request = {
          method: 'PATCH',
          url: '/thirdpartyRequests/transactions/b37605f7-bcd9-408b-9291-6c554aa4c802',
          headers: trxnRequest.headers,
          payload: errPayload
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'transactionId\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardTransactionRequest).not.toHaveBeenCalled()
      })
    })

    describe('PUT /thirdpartyRequests/transactions/{ID}/error', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('PUT', async (): Promise<void> => {
        mockForwardTransactionRequestError.mockResolvedValueOnce()
        const reqHeaders = Object.assign(trxnRequestError.headers, {
          date: 'Thu, 23 Jan 2020 10:22:12 GMT',
          'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
        })
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/transactions/a5bbfd51-d9fc-4084-961a-c2c2221a31e0/error',
          headers: reqHeaders,
          payload: trxnRequestError.payload
        }

        const expected = [
          expect.objectContaining(request.headers),
          '/thirdpartyRequests/transactions/{{ID}}/error',
          'PUT',
          'a5bbfd51-d9fc-4084-961a-c2c2221a31e0',
          request.payload,
          expect.any(Object)
        ]
        const response = await server.inject(request)

        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardTransactionRequestError).toHaveBeenCalledWith(...expected)
      })

      it('mandatory fields validation', async (): Promise<void> => {
        const errPayload = Object.assign(trxnRequestError.payload, { errorInformation: undefined })
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/transactions/a5bbfd51-d9fc-4084-961a-c2c2221a31e0/error',
          headers: trxnRequestError.headers,
          payload: errPayload
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'errorInformation\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardTransactionRequestError).not.toHaveBeenCalled()
      })
    })

    describe('POST /thirdpartyRequests/authorizations', (): void => {
      const authorizationPostRequestPayload = {
        authorizationRequestId: '5f8ee7f9-290f-4e03-ae1c-1e81ecf398df',
        transactionRequestId: '2cf08eed-3540-489e-85fa-b2477838a8c5',
        challenge: '<base64 encoded binary - the encoded challenge>',
        transferAmount: {
          amount: '100',
          currency: 'USD'
        },
        payeeReceiveAmount: {
          amount: '99',
          currency: 'USD'
        },
        fees: {
          amount: '1',
          currency: 'USD'
        },
        payee: {
          partyIdInfo: {
            partyIdType: 'MSISDN',
            partyIdentifier: '+4412345678',
            fspId: 'dfspb',
          }
        },
        payer: {
          partyIdType: 'THIRD_PARTY_LINK',
          partyIdentifier: 'qwerty-123456',
          fspId: 'dfspa'
        },
        transactionType: {
          scenario: 'TRANSFER',
          initiator: 'PAYER',
          initiatorType: 'CONSUMER'
        },
        expiration: '2020-06-15T12:00:00.000Z'
      }

      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('POST', async (): Promise<void> => {
        mockForwardAuthorizationRequest.mockResolvedValueOnce()
        const request = {
          method: 'POST',
          url: '/thirdpartyRequests/authorizations',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            'fspiop-source': 'dspa',
            'fspiop-destination': 'pispa'
          },
          payload: authorizationPostRequestPayload
        }
        const expected = [
          '/thirdpartyRequests/authorizations',
          'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
          expect.objectContaining(request.headers),
          'POST',
          '5f8ee7f9-290f-4e03-ae1c-1e81ecf398df',
          request.payload,
          // span is undefined
          undefined
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const invalidPayload = JSON.parse(JSON.stringify(authorizationPostRequestPayload))
        delete invalidPayload.challenge
        const request = {
          method: 'POST',
          url: '/thirdpartyRequests/authorizations',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            'fspiop-source': 'pispA',
            'fspiop-destination': 'dfspA'
          },
          payload: invalidPayload
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'challenge\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAuthorizationRequest).not.toHaveBeenCalled()
      })
    })

    describe('PUT /thirdpartyRequests/authorizations/{ID}', (): void => {
      const authorizationPutRequestPayload = {
        signedPayloadType: 'FIDO',
        signedPayload: {
          id: '45c-TkfkjQovQeAWmOy-RLBHEJ_e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA',
          rawId: '45c+TkfkjQovQeAWmOy+RLBHEJ/e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA==',
          response: {
            authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2MBAAAACA==',
            clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiQUFBQUFBQUFBQUFBQUFBQUFBRUNBdyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIxODEiLCJjcm9zc09yaWdpbiI6ZmFsc2UsIm90aGVyX2tleXNfY2FuX2JlX2FkZGVkX2hlcmUiOiJkbyBub3QgY29tcGFyZSBjbGllbnREYXRhSlNPTiBhZ2FpbnN0IGEgdGVtcGxhdGUuIFNlZSBodHRwczovL2dvby5nbC95YWJQZXgifQ==',
            signature: 'MEUCIDcJRBu5aOLJVc/sPyECmYi23w8xF35n3RNhyUNVwQ2nAiEA+Lnd8dBn06OKkEgAq00BVbmH87ybQHfXlf1Y4RJqwQ8='
          },
          type: 'public-key'
        }
      }

      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it.only('PUT', async (): Promise<void> => {
        mockForwardAuthorizationRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/authorizations/7d34f91d-d078-4077-8263-2c047876fcf6',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            'fspiop-source': 'dfspA',
            'fspiop-destination': 'dfspA'
          },
          payload: authorizationPutRequestPayload
        }
        const expected = [
          '/thirdpartyRequests/authorizations/{{ID}}',
          'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          '7d34f91d-d078-4077-8263-2c047876fcf6',
          request.payload,
          // span is undefined
          undefined
        ]

        // Act
        const response = await server.inject(request)

        console.log('response', response)

        // Assert
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/authorizations/7d34f91d-d078-4077-8263-2c047876fcf6',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            'fspiop-source': 'pispA',
            'fspiop-destination': 'dfspA'
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
            status: 'VERIFIED'
          }
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'sourceAccountId\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAuthorizationRequest).not.toHaveBeenCalled()
      })
    })

    describe('PUT /thirdpartyRequests/authorizations/{ID}/error', () => {
      it.todo('responds with 200 for a valid request')
      it.todo('responds with 400 for an invalid request')
    })

    describe('POST /thirdpartyRequests/verifications', (): void => {
      it.todo('returns 202 for a valid request')
      it.todo('mandatory fields validation')
    })

    describe('PUT /thirdpartyRequests/verifications/{ID}', (): void => {
      it.todo('returns 202 for a valid request')
      it.todo('mandatory fields validation')
    })

    describe('PUT /thirdpartyRequests/verifications/{ID}/error', (): void => {
      it.todo('returns 202 for a valid request')
      it.todo('mandatory fields validation')
    })

    describe('POST /consents', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('posts successfully', async (): Promise<void> => {
        mockForwardConsentsRequest.mockResolvedValueOnce()
        const request = {
          method: 'POST',
          url: '/consents',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentsPostRequestPISP.headers
          },
          payload: {
            ...mockData.consentsPostRequestPISP.payload
          }
        }
        const expected = [
          '/consents',
          'TP_CB_URL_CONSENT_POST',
          expect.objectContaining(request.headers),
          'POST',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardConsentsRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'POST',
          url: '/consents',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentsPostRequestPISP.headers
          },
          payload: {
            ...mockData.consentsPostRequestPISP.payload
          }
        }
        delete request.payload.consentId

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'consentId\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentsRequest).not.toHaveBeenCalled()
      })
    })

    describe('POST /consentRequests', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('posts successfully', async (): Promise<void> => {
        mockForwardConsentRequestsRequest.mockResolvedValueOnce()
        const request = {
          method: 'POST',
          url: '/consentRequests',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPostRequest.headers
          },
          payload: {
            ...mockData.consentRequestsPostRequest.payload
          }
        }
        const expected = [
          '/consentRequests',
          'TP_CB_URL_CONSENT_REQUEST_POST',
          expect.objectContaining(request.headers),
          'POST',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardConsentRequestsRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'POST',
          url: '/consentRequests',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPostRequest.headers
          },
          payload: {
            ...mockData.consentRequestsPostRequest.payload
          }
        }
        delete request.payload.consentRequestId

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'consentRequestId\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentRequestsRequest).not.toHaveBeenCalled()
      })
    })

    describe('PUT /consentRequests', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('puts /consentRequests/{{ID}} web payload successfully', async (): Promise<void> => {
        mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/consentRequests/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPutRequestWeb.headers
          },
          payload: {
            ...mockData.consentRequestsPutRequestWeb.payload
          }
        }
        const expected = [
          'cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          '/consentRequests/{{ID}}',
          'TP_CB_URL_CONSENT_REQUEST_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
      })

      it('puts /consentRequests/{{ID}} otp payload successfully', async (): Promise<void> => {
        mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/consentRequests/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPutRequestOTP.headers
          },
          payload: {
            ...mockData.consentRequestsPutRequestOTP.payload
          }
        }
        const expected = [
          'cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          '/consentRequests/{{ID}}',
          'TP_CB_URL_CONSENT_REQUEST_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/consentRequests/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPutRequestWeb.headers
          },
          payload: {
            ...mockData.consentRequestsPutRequestWeb.payload
          }
        }
        delete request.payload.consentRequestId

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'consentRequestId\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentRequestsIdRequest).not.toHaveBeenCalled()
      })
    })

    describe('/consentRequests/{ID}/error', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('PUT', async (): Promise<void> => {
        mockForwardConsentRequestsIdErrorRequest.mockResolvedValueOnce()
        const reqHeaders = Object.assign(consentRequestsRequestError.headers, {
          date: 'Thu, 23 Jan 2020 10:22:12 GMT',
          'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
        })
        const request = {
          method: 'PUT',
          url: '/consentRequests/a5bbfd51-d9fc-4084-961a-c2c2221a31e0/error',
          headers: reqHeaders,
          payload: consentRequestsRequestError.payload
        }

        const expected = [
          '/consentRequests/{{ID}}/error',
          'a5bbfd51-d9fc-4084-961a-c2c2221a31e0',
          expect.objectContaining(request.headers),
          request.payload,
          expect.any(Object)
        ]
        const response = await server.inject(request)

        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardConsentRequestsIdErrorRequest).toHaveBeenCalledWith(...expected)
      })

      it('mandatory fields validation', async (): Promise<void> => {
        const errPayload = Object.assign(consentRequestsRequestError.payload, { errorInformation: undefined })
        const request = {
          method: 'PUT',
          url: '/consentRequests/a5bbfd51-d9fc-4084-961a-c2c2221a31e0/error',
          headers: consentRequestsRequestError.headers,
          payload: errPayload
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'errorInformation\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentRequestsIdErrorRequest).not.toHaveBeenCalled()
      })
    })

    describe('PATCH /consentRequests', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('patch /consentRequests/{{ID}} payload successfully', async (): Promise<void> => {
        mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'PATCH',
          url: '/consentRequests/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPatch.headers
          },
          payload: {
            ...mockData.consentRequestsPatch.payload
          }
        }
        const expected = [
          'cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          '/consentRequests/{{ID}}',
          'TP_CB_URL_CONSENT_REQUEST_PATCH',
          expect.objectContaining(request.headers),
          'PATCH',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardConsentRequestsIdRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PATCH',
          url: '/consentRequests/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPatch.headers
          },
          payload: {
            ...mockData.consentRequestsPatch.payload
          }
        }
        delete request.payload.authToken

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'authToken\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentRequestsIdRequest).not.toHaveBeenCalled()
      })
    })


    describe('PUT /consents/{{ID}}', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('puts /consents/{{ID}} payload successfully', async (): Promise<void> => {
        mockForwardConsentsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/consents/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentsIdPutRequestVerified.headers
          },
          payload: {
            ...mockData.consentsIdPutRequestVerified.payload
          }
        }

        const expected = [
          'cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          '/consents/{{ID}}',
          'TP_CB_URL_CONSENT_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardConsentsIdRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/consents/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.consentsIdPutRequestVerified.headers
          },
          payload: {
            ...mockData.consentsIdPutRequestVerified.payload
          }
        }
        delete request.payload.credential

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'credential\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentsIdRequest).not.toHaveBeenCalled()
      })
    })

    describe('PUT /consents/{{ID}}/error', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('puts /consents/{{ID}}/error payload successfully', async (): Promise<void> => {
        mockForwardConsentsIdRequestError.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/consents/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1/error',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...consentsRequestError.headers
          },
          payload: {
            ...consentsRequestError.payload
          }
        }

        const expected = [
          '/consents/{{ID}}/error',
          'cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          expect.objectContaining(request.headers),
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardConsentsIdRequestError).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/consents/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1/error',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...consentsRequestError.headers
          },
          payload: {
            ...consentsRequestError.payload
          }
        }
        delete request.payload.errorInformation

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'errorInformation\''
          }
        }
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentsIdRequest).not.toHaveBeenCalled()
      })
    })

    describe('GET /accounts/{{ID}}', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('GET /accounts/{{ID}}', async (): Promise<void> => {
        mockForwardAccountsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'GET',
          url: '/accounts/username1234',
          headers: {
            accept: 'application/vnd.interoperability.thirdparty+json;version=1.0',
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.accountsRequest.headers
          }
        }
        const expected = [
          '/accounts/{{ID}}',
          'TP_CB_URL_ACCOUNTS_GET',
          expect.objectContaining(request.headers),
          'GET',
          'username1234',
          undefined,
          expect.any(Object)
        ]

        const response = await server.inject(request)

        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...expected)
      })
    })

    describe('PUT /accounts/{{ID}}', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('puts /accounts/{{ID}} payload successfully', async (): Promise<void> => {
        mockForwardAccountsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/accounts/username1234',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.accountsRequest.headers
          },
          payload: {
            ...mockData.accountsRequest.payload
          }
        }

        const expected = [
          '/accounts/{{ID}}',
          'TP_CB_URL_ACCOUNTS_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          'username1234',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardAccountsIdRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/accounts/username1234',
          headers: {
            'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.accountsRequest.headers
          },
          payload: {
            accounts: [
              {
                'accountNickname': 'dfspa.user.nickname',
                'id': 'dfspa.username.1234'
              }
            ]
          }
        }

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody/accounts/0 must have required property \'currency\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAccountsIdRequest).not.toHaveBeenCalled()
      })
    })

    describe('/accounts/{ID}/error', (): void => {
      const acctRequestError = mockData.accountsRequestError

      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('PUT', async (): Promise<void> => {
        mockForwardAccountsIdRequestError.mockResolvedValueOnce()

        const reqHeaders = Object.assign(acctRequestError.headers, {
          date: 'Tue, 02 Mar 2021 10:10:10 GMT',
          'content-type': 'application/vnd.interoperability.thirdparty+json;version=1.0'
        })
        const request = {
          method: 'PUT',
          url: '/accounts/username1234/error',
          headers: reqHeaders,
          payload: acctRequestError.payload
        }

        const expected = [
          '/accounts/{{ID}}/error',
          expect.objectContaining(request.headers),
          'username1234',
          request.payload,
          expect.any(Object)
        ]

        const response = await server.inject(request)

        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardAccountsIdRequestError).toHaveBeenCalledWith(...expected)
      })

      it('mandatory fields validation', async (): Promise<void> => {
        const errPayload = Object.assign(acctRequestError.payload, { errorInformation: undefined })
        const request = {
          method: 'PUT',
          url: '/accounts/username1234/error',
          headers: trxnRequestError.headers,
          payload: errPayload
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'errorInformation\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAccountsIdRequestError).not.toHaveBeenCalled()
      })
    })


    describe('GET /services/{{ServiceType}}', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('GET /services/{{ServiceType}}', async (): Promise<void> => {
        mockForwardGetServicesServiceTypeRequestToProviderService.mockResolvedValueOnce()
        const request = {
          method: 'GET',
          url: '/services/THIRD_PARTY_DFSP',
          headers: {
            accept: 'application/vnd.interoperability.services+json;version=1.0',
            'content-type': 'application/vnd.interoperability.service+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.getServicesByServiceTypeRequest.headers
          }
        }
        const expected = [
          '/services/{{ServiceType}}',
          expect.objectContaining(request.headers),
          'GET',
          'THIRD_PARTY_DFSP',
          expect.any(Object)
        ]

        const response = await server.inject(request)

        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardGetServicesServiceTypeRequestToProviderService).toHaveBeenCalledWith(...expected)
      })
    })

    describe('PUT /services/{{ServiceType}}', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('puts /services/{{ServiceType}} payload successfully', async (): Promise<void> => {
        mockForwardGetServicesServiceTypeRequestFromProviderService.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/services/THIRD_PARTY_DFSP',
          headers: {
            'content-type': 'application/vnd.interoperability.services+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.putServicesByServiceTypeRequest.headers
          },
          payload: {
            ...mockData.putServicesByServiceTypeRequest.payload
          }
        }

        const expected = [
          '/services/{{ServiceType}}',
          'TP_CB_URL_SERVICES_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          'THIRD_PARTY_DFSP',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardGetServicesServiceTypeRequestFromProviderService).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/services/THIRD_PARTY_DFSP',
          headers: {
            'content-type': 'application/vnd.interoperability.services+json;version=1.0',
            date: (new Date()).toISOString(),
            ...mockData.putServicesByServiceTypeRequest.headers
          },
          payload: {
          }
        }

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'providers\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAccountsIdRequest).not.toHaveBeenCalled()
      })
    })

    describe('PUT /services/{{ServiceType}}/error', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('PUT', async (): Promise<void> => {
        mockForwardServicesServiceTypeRequestError.mockResolvedValueOnce()

        const reqHeaders = Object.assign(mockData.putServicesByServiceTypeRequestError.headers, {
          date: 'Tue, 02 Mar 2021 10:10:10 GMT',
          'content-type': 'application/vnd.interoperability.services+json;version=1.0'
        })
        const request = {
          method: 'PUT',
          url: '/services/THIRD_PARTY_DFSP/error',
          headers: reqHeaders,
          payload: mockData.putServicesByServiceTypeRequestError.payload
        }

        const expected = [
          '/services/{{ServiceType}}/error',
          expect.objectContaining(request.headers),
          'THIRD_PARTY_DFSP',
          request.payload,
          expect.any(Object)
        ]

        const response = await server.inject(request)

        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardServicesServiceTypeRequestError).toHaveBeenCalledWith(...expected)
      })

      it('mandatory fields validation', async (): Promise<void> => {
        const errPayload = Object.assign(
          mockData.putServicesByServiceTypeRequestError.payload,
          { errorInformation: undefined }
        )
        const request = {
          method: 'PUT',
          url: '/services/{{ServiceType}}/error',
          headers: trxnRequestError.headers,
          payload: errPayload
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - /requestBody must have required property \'errorInformation\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAccountsIdRequestError).not.toHaveBeenCalled()
      })
    })

    describe('/health', (): void => {
      it('GET', async (): Promise<void> => {
        interface HealthResponse {
          status: string;
          uptime: number;
          startTime: string;
          versionNumber: string;
        }

        const request = {
          method: 'GET',
          url: '/health'
        }

        const response = await server.inject(request)
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeDefined()

        const result = response.result as HealthResponse
        expect(result.status).toEqual('OK')
        expect(result.uptime).toBeGreaterThan(1.0)
      })
    })

    describe('/metrics', (): void => {
      it('GET', async (): Promise<void> => {
        const request = {
          method: 'GET',
          url: '/metrics'
        }

        const response = await server.inject(request)
        expect(response.statusCode).toBe(200)
      })
    })
  })
})
