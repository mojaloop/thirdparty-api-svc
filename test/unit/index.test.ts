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

const mockForwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mockForwardTransactionRequestError = jest.spyOn(Transactions, 'forwardTransactionRequestError')
const mockForwardAuthorizationRequest = jest.spyOn(Authorizations, 'forwardAuthorizationRequest')
const mockForwardConsentsRequest = jest.spyOn(Consents, 'forwardConsentsRequest')
const mockForwardConsentsIdRequest = jest.spyOn(Consents, 'forwardConsentsIdRequest')
const mockForwardConsentRequestsRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsRequest')
const mockForwardConsentRequestsIdRequest = jest.spyOn(ConsentRequests, 'forwardConsentRequestsIdRequest')
const mockForwardConsentsIdGenerateChallengeRequest = jest.spyOn(Consents, 'forwardConsentsIdGenerateChallengeRequest')
const mockForwardAccountsIdRequest = jest.spyOn(Accounts, 'forwardAccountsIdRequest')
const mockForwardAccountsIdRequestError = jest.spyOn(Accounts, 'forwardAccountsIdRequestError')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockData = JSON.parse(JSON.stringify(TestData))
const trxnRequest = mockData.transactionRequest
const trxnRequestError = mockData.genericThirdpartyError

describe('index', (): void => {
  it('should have proper layout', (): void => {
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
          accept: 'application/json'
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
          accept: 'application/json'
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
          { 'ID': 'b37605f7-bcd9-408b-9291-6c554aa4c802' },
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
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'transactionRequestId\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardTransactionRequest).not.toHaveBeenCalled()
      })
    })

    it('PUT', async (): Promise<void> => {
      mockForwardTransactionRequest.mockResolvedValueOnce()
      const reqHeaders = Object.assign(mockData.updateTransactionRequest.headers, {
        date: 'Thu, 23 Jan 2020 10:22:12 GMT',
        accept: 'application/json'
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
        { 'ID': 'b37605f7-bcd9-408b-9291-6c554aa4c802' },
        request.payload,
        expect.any(Object)
      ]
      const response = await server.inject(request)

      expect(response.statusCode).toBe(200)
      expect(response.result).toBeNull()
      expect(mockForwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })

    describe('/thirdpartyRequests/transactions/{ID}/error', (): void => {
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
          accept: 'application/json'
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
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'errorInformation\''
          }
        }
        const response = await server.inject(request)

        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardTransactionRequestError).not.toHaveBeenCalled()
      })
    })

    describe('POST /thirdpartyRequests/transactions/{ID}/authorizations', (): void => {
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
          url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'dfspA',
            'fspiop-destination': 'dfspA'
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
            sourceAccountId: 'dfspa.alice.1234',
            status: 'PENDING'
          }
        }
        const expected = [
          '/thirdpartyRequests/transactions/{{ID}}/authorizations',
          'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
          expect.objectContaining(request.headers),
          'POST',
          '7d34f91d-d078-4077-8263-2c047876fcf6',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
      })

      it('responds with a 400 when status !== PENDING', async (): Promise<void> => {
        const request = {
          method: 'POST',
          url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'pispA',
            'fspiop-destination': 'dfspA'
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
            sourceAccountId: 'dfspa.alice.1234',
            status: 'VERIFIED'
          }
        }
        const expected = {
          errorInformation: {
            errorCode: '3100',
            errorDescription: 'Generic validation error - .requestBody.status should be equal to one of the allowed values'
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAuthorizationRequest).not.toHaveBeenCalled()
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'POST',
          url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'pispA',
            'fspiop-destination': 'dfspA'
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
            status: 'PENDING'
          }
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'sourceAccountId\''
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

    describe('PUT /thirdpartyRequests/transactions/{ID}/authorizations', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('PUT', async (): Promise<void> => {
        mockForwardAuthorizationRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'dfspA',
            'fspiop-destination': 'dfspA'
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
            sourceAccountId: 'dfspa.alice.1234',
            status: 'VERIFIED'
          }
        }
        const expected = [
          '/thirdpartyRequests/transactions/{{ID}}/authorizations',
          'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
          expect.objectContaining(request.headers),
          'PUT',
          '7d34f91d-d078-4077-8263-2c047876fcf6',
          request.payload,
          expect.any(Object)
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeNull()
        expect(mockForwardAuthorizationRequest).toHaveBeenCalledWith(...expected)
      })

      it('responds with a 400 when status !== VERIFIED', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'pispA',
            'fspiop-destination': 'dfspA'
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
            sourceAccountId: 'dfspa.alice.1234',
            status: 'PENDING'
          }
        }
        const expected = {
          errorInformation: {
            errorCode: '3100',
            errorDescription: 'Generic validation error - .requestBody.status should be equal to one of the allowed values'
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardAuthorizationRequest).not.toHaveBeenCalled()
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'PUT',
          url: '/thirdpartyRequests/transactions/7d34f91d-d078-4077-8263-2c047876fcf6/authorizations',
          headers: {
            accept: 'application/json',
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
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'sourceAccountId\''
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentsPostRequest.headers
          },
          payload: {
            ...mockData.consentsPostRequest.payload
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentsPostRequest.headers
          },
          payload: {
            ...mockData.consentsPostRequest.payload
          }
        }
        delete request.payload.consentId

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'consentId\''
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

    describe('POST /consentsRequests', (): void => {
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
            accept: 'application/json',
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPostRequest.headers
          },
          payload: {
            ...mockData.consentRequestsPostRequest.payload
          }
        }
        delete request.payload.initiatorId

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'initiatorId\''
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
            accept: 'application/json',
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

      it('puts /consentRequests/{{ID}} web auth payload successfully', async (): Promise<void> => {
        mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/consentRequests/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPutRequestWebAuth.headers
          },
          payload: {
            ...mockData.consentRequestsPutRequestWebAuth.payload
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
            accept: 'application/json',
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

      it('puts /consentRequests/{{ID}} otp auth payload successfully', async (): Promise<void> => {
        mockForwardConsentRequestsIdRequest.mockResolvedValueOnce()
        const request = {
          method: 'PUT',
          url: '/consentRequests/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPutRequestOTPAuth.headers
          },
          payload: {
            ...mockData.consentRequestsPutRequestOTPAuth.payload
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentRequestsPutRequestWeb.headers
          },
          payload: {
            ...mockData.consentRequestsPutRequestWeb.payload
          }
        }
        delete request.payload.initiatorId

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'initiatorId\''
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
            accept: 'application/json',
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
            accept: 'application/json',
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
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'authToken\''
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

    describe('POST /consents/{{ID}}/generateChallenge', (): void => {
      beforeAll((): void => {
        mockLoggerPush.mockReturnValue(null)
        mockLoggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('posts /consents/{{ID}}/generateChallenge payload successfully', async (): Promise<void> => {
        mockForwardConsentsIdGenerateChallengeRequest.mockResolvedValueOnce()
        const request = {
          method: 'POST',
          url: '/consents/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1/generateChallenge',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentsGenerateChallengeRequest.headers
          },
          payload: {
            ...mockData.consentsGenerateChallengeRequest.payload
          }
        }
        const expected = [
          'cd9c9b3a-fa64-4aab-8240-760fafa7f9b1',
          '/consents/{{ID}}/generateChallenge',
          'TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST',
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
        expect(mockForwardConsentsIdGenerateChallengeRequest).toHaveBeenCalledWith(...expected)
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'POST',
          url: '/consents/cd9c9b3a-fa64-4aab-8240-760fafa7f9b1/generateChallenge',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentsGenerateChallengeRequest.headers
          },
          payload: {
            ...mockData.consentsGenerateChallengeRequest.payload
          }
        }
        delete request.payload.type

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'type\''
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        expect(mockForwardConsentsIdGenerateChallengeRequest).not.toHaveBeenCalled()
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentsIdPutRequestUnsigned.headers
          },
          payload: {
            ...mockData.consentsIdPutRequestUnsigned.payload
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.consentsIdPutRequestUnsigned.headers
          },
          payload: {
            ...mockData.consentsIdPutRequestUnsigned.payload
          }
        }
        delete request.payload.credential

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'credential\''
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
            accept: 'application/json',
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.accountsRequest.headers
          },
          payload: [
            ...mockData.accountsRequest.payload
          ]
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
            accept: 'application/json',
            date: (new Date()).toISOString(),
            ...mockData.accountsRequest.headers
          },
          payload: [
            {
              "accountNickname": "dfspa.user.nickname",
              "id": "dfspa.username.1234"
            }
          ]
        }

        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - .requestBody[0] should have required property \'currency\''
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
          accept: 'application/json'
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
            errorDescription: 'Missing mandatory element - .requestBody should have required property \'errorInformation\''
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
