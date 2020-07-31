/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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
 --------------
 ******/

import index from '../../src/index'
import Config from '../../src/shared/config'
import { Server } from '@hapi/hapi'

import { Authorizations } from '../../src/domain'
import Logger from '@mojaloop/central-services-logger'

const mock_forwardPostAuthorization = jest.spyOn(Authorizations, 'forwardPostAuthorization')
const mock_loggerPush = jest.spyOn(Logger, 'push')
const mock_loggerError = jest.spyOn(Logger, 'error')

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

    describe('/thirdpartyRequests/transactions/{ID}/authorizations', () => {
      beforeAll((): void => {
        // Disable all async actions for the handlers
        jest.useFakeTimers()
        mock_loggerPush.mockReturnValue(null)
        mock_loggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllTimers()
        jest.clearAllMocks()
      })

      afterAll((): void => {
        jest.useRealTimers()
      })

      it('POST', async (): Promise<void> => {
        mock_forwardPostAuthorization.mockResolvedValueOnce()
        const request = {
          method: 'POST',
          url: '/tpr/transactions/12345/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'dfspA',
            'fspiop-destination': 'dfspA',
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '12345',
            sourceAccountId: '12345',
            status: 'PENDING',
          }
        }
        const expected: Array<any> = [
          expect.objectContaining(request.headers),
          '12345',
          request.payload
        ]

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        jest.runAllTimers()
        expect(setImmediate).toHaveBeenCalled()
        expect(mock_forwardPostAuthorization).toHaveBeenCalledWith(...expected)
      })

      it('responds with a 400 when status !== PENDING', async (): Promise<void> => {
        const request = {
          method: 'POST',
          url: '/tpr/transactions/12345/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'pispA',
            'fspiop-destination': 'dfspA',
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '12345',
            sourceAccountId: '12345',
            status: 'VERIFIED',
          }
        }
        const expected = {
          errorInformation: {
            errorCode: '3100',
            errorDescription: 'Generic validation error - \"status\" must be [PENDING]'
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        jest.runAllTimers()
        expect(setImmediate).toHaveBeenCalled()
        expect(mock_forwardPostAuthorization).not.toHaveBeenCalled()
      })

      it('requires all fields to be set', async (): Promise<void> => {
        const request = {
          method: 'POST',
          url: '/tpr/transactions/trId_12345/authorizations',
          headers: {
            accept: 'application/json',
            date: (new Date()).toISOString(),
            'fspiop-source': 'pispA',
            'fspiop-destination': 'dfspA',
          },
          payload: {
            challenge: '12345',
            value: '12345',
            consentId: '12345',
            status: 'PENDING',
          }
        }
        const expected = {
          errorInformation: {
            errorCode: '3102',
            errorDescription: 'Missing mandatory element - \"sourceAccountId\" is required'
          }
        }

        // Act
        const response = await server.inject(request)

        // Assert
        expect(response.statusCode).toBe(400)
        expect(response.result).toStrictEqual(expected)
        jest.runAllTimers()
        expect(setImmediate).toHaveBeenCalled()
        expect(mock_forwardPostAuthorization).not.toHaveBeenCalled()
      })
    })

    describe('/health', () => {
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

    describe('/hello', () => {
      it('GET', async (): Promise<void> => {
        interface HelloResponse {
          hello: string;
        }

        const request = {
          method: 'GET',
          url: '/hello'
        }

        const response = await server.inject(request)
        expect(response.statusCode).toBe(200)
        expect(response.result).toBeDefined()

        const result = response.result as HelloResponse
        expect(result.hello).toEqual('world')
      })
    })

    describe('/metrics', () => {
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
