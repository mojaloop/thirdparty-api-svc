/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 --------------
 ******/
'use strict'
import { ResponseObject, ResponseToolkit, Request } from "@hapi/hapi"
import Logger from '@mojaloop/central-services-logger'
import Handler from '../../../../../src/server/handlers/thirdpartyRequests/transactions'
import { Transactions } from '../../../../../src/domain/thirdpartyRequests'

const mock_forwardTransactionRequest = jest.spyOn(Transactions, 'forwardTransactionRequest')
const mock_loggerPush = jest.spyOn(Logger, 'push')
const mock_loggerError = jest.spyOn(Logger, 'error')
// @ts-ignore
const request: Request = {
  headers: {
    'fspiop-source': 'pispA',
    'fspiop-destination': 'dfspA'
  },
  params: {},
  payload: {
    transactionRequestId: '7d34f91d-d078-4077-8263-2c047876fcf6',
    sourceAccountId: 'dfspa.alice.1234',
    consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
    payee: {
      partyIdInfo: {
        partyIdType: 'MSISDN',
        partyIdentifier: '+44 1234 5678',
        fspId: 'dfspb'
      }
    },
    payer: {
      personalInfo: {
        complexName: {
          firstName: 'Alice',
          lastName: 'K'
        }
      },
      partyIdInfo: {
        partyIdType: 'MSISDN',
        partyIdentifier: '+44 8765 4321',
        fspId: 'dfspa'
      }
    },
    amountType: 'SEND',
    amount: {
      amount: '100',
      currency: 'USD'
    },
    transactionType: {
      scenario: 'TRANSFER',
      initiator: 'PAYER',
      initiatorType: 'CONSUMER'
    },
    expiration: '2020-07-15T22:17:28.985-01:00'
  },

}

// @ts-ignore
const h: ResponseToolkit = {
  response: (): ResponseObject => {
    return {
      code: (num: number): ResponseObject => {
        return num as unknown as ResponseObject
      }
    } as unknown as ResponseObject
  }
}

describe('transactions handler', () => {
  describe('POST /thirdpartyRequests/transactions', () => {
    beforeAll((): void => {
      mock_loggerPush.mockReturnValue(null)
      mock_loggerError.mockReturnValue(null)
    })

    beforeEach((): void => {
      jest.clearAllMocks()
    })

    it('handles a successful request', async (): Promise<void> => {
      mock_forwardTransactionRequest.mockResolvedValueOnce()

      const expected: Array<any> = ['/thirdpartyRequests/transactions', request.headers, 'POST', {}, request.payload]
      const response = await Handler.post(null, request, h as ResponseToolkit)
      expect(response).toBe(202)
      expect(mock_forwardTransactionRequest).toHaveBeenCalledTimes(1)
      expect(mock_forwardTransactionRequest).toHaveBeenCalledWith(...expected)
    })

    it('handles errors', async (): Promise<void> => {
      const err = new Error('Transactions forward Error')
      mock_forwardTransactionRequest.mockImplementation((): any => { throw err })
      await expect(Handler.post(null, request, h as ResponseToolkit)).rejects.toThrowError(new RegExp('Transactions forward Error'))
    })
  })
})
