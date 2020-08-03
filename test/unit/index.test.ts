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

import { Transactions } from '../../src/domain/thirdpartyRequests'
import Logger from '@mojaloop/central-services-logger'
import MockData from '../unit/data/mockData.json'

const mock_forwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mock_loggerPush = jest.spyOn(Logger, 'push')
const mock_loggerError = jest.spyOn(Logger, 'error')
const mock_data = JSON.parse(JSON.stringify(MockData))
// @ts-ignore
const trxnRequest = mock_data.transactionRequest

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

    describe('/thirdpartyRequests/transactions', () => {

      beforeAll((): void => {
        mock_loggerPush.mockReturnValue(null)
        mock_loggerError.mockReturnValue(null)
      })

      beforeEach((): void => {
        jest.clearAllMocks()
      })

      it('POST', async (): Promise<void> => {
        mock_forwardTransactionRequest.mockResolvedValueOnce()
        const reqHeaders = Object.assign(trxnRequest.headers, {
          'date': 'Thu, 23 Jan 2020 10:22:12 GMT',
          'accept': 'application/json'
        })
        const request = {
          method: 'POST',
          url: '/thirdpartyRequests/transactions',
          headers: reqHeaders,
          payload: trxnRequest.payload
        }

        const expected: Array<any> = ['/thirdpartyRequests/transactions', expect.any(Object), 'POST', {}, request.payload]
        const response = await server.inject(request)

        expect(response.statusCode).toBe(202)
        expect(response.result).toBeNull()
        expect(mock_forwardTransactionRequest).toHaveBeenCalledWith(...expected)
      })

      it('mandatory fields validation', async (): Promise<void> => {
        const errPayload = Object.assign(trxnRequest.payload, { 'transactionRequestId': undefined })
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
        expect(mock_forwardTransactionRequest).not.toHaveBeenCalled()
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
