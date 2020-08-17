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

const mockForwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mockForwardAuthorizationRequest = jest.spyOn(Authorizations, 'forwardAuthorizationRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockData = JSON.parse(JSON.stringify(TestData))
const trxnRequest = mockData.transactionRequest

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
          expect.any(Object),
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
          'THIRDPARTY_CALLBACK_URL_TRANSACTION_REQUEST_AUTHORIZATIONS_POST',
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
          'THIRDPARTY_CALLBACK_URL_TRANSACTION_REQUEST_AUTHORIZATIONS_PUT',
          expect.objectContaining(request.headers),
          'PUT',
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
