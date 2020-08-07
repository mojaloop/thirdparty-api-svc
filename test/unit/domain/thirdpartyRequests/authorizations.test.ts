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

 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/

import { ResponseObject, ResponseToolkit} from "@hapi/hapi"

import { Authorizations } from '~/domain/thirdpartyRequests'
import Logger from '@mojaloop/central-services-logger'
import {
  Util, Enum,
} from '@mojaloop/central-services-shared'

const mock_getEndpoint = jest.spyOn(Util.Endpoints, 'getEndpoint')
const mock_sendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mock_loggerPush = jest.spyOn(Logger, 'push')
const mock_loggerError = jest.spyOn(Logger, 'error')

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

const path = Enum.EndPoints.FspEndpointTemplates.THIRDPARTY_TRANSACTION_REQUEST_AUTHORIZATIONS_POST

describe('domain/authorizations', () => {
  describe('forwardPostAuthorization', () => {
    beforeAll((): void => {
      mock_loggerPush.mockReturnValue(null)
      mock_loggerError.mockReturnValue(null)
      jest.useFakeTimers()
    })

    beforeEach((): void => {
      jest.clearAllTimers()
      jest.clearAllMocks()
    })

    it('forwards the POST `thirdpartyRequests/transactions/{id}/authorizations request', async () => {
      // Arrange
      mock_getEndpoint.mockResolvedValue('http://auth-service.local')
      mock_sendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = "123456"
      const payload: Authorizations.PostAuthorizationPayload = {
        challenge: '12345',
        value: '12345',
        consentId: '12345',
        sourceAccountId: 'dfspa.12345.67890',
        status: 'PENDING',
      }

      const getEndpointExpected: Array<any> = [
        'localhost:3001',
        'dfspA',
        Enum.EndPoints.FspEndpointTypes.THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_POST
      ]
      const sendRequestExpected: Array<any> = [
        'http://auth-service.local/thirdpartyRequests/transactions/123456/authorizations',
        headers,
        'pispA',
        'dfspA',
        Enum.Http.RestMethods.POST,
        payload,
        Enum.Http.ResponseTypes.JSON
      ]

      // Act
      await Authorizations.forwardPostAuthorization(path, headers, id, payload)

      // Assert
      expect(mock_getEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
      expect(mock_sendRequest).toHaveBeenCalledWith(...sendRequestExpected)
    })

    it('throws the original error when the endpoint cannot be found', async () => {
      // Arrange
      mock_getEndpoint.mockRejectedValue(new Error('Cannot find endpoint'))
      const headers = {
        'fspiop-source': 'pispA',
        'fspiop-destination': 'dfspA'
      }
      const id = "123456"
      const payload: Authorizations.PostAuthorizationPayload = {
        challenge: '12345',
        value: '12345',
        consentId: '12345',
        sourceAccountId: 'dfspa.12345.67890',
        status: 'PENDING',
      }

      const getEndpointExpected: Array<any> = [
        'localhost:3001',
        'dfspA',
        Enum.EndPoints.FspEndpointTypes.THIRDPARTY_TRANSACTIONS_AUTHORIZATIONS_POST
      ]

      // Act
      const action = async () => await Authorizations.forwardPostAuthorization(path, headers, id, payload)

      // Assert
      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mock_getEndpoint).toHaveBeenCalledWith(...getEndpointExpected)
    })
  })

  // TODO: implement these tests!
  // describe('sendErrorCallback', () => {
  //   // TODO: this test will be updated once we implement error handling
  //   it('stub implementation', async () => {
  //     // Arrange

  //     // Act
  //     await Authorizations.sendErrorCallback()

  //     // Assert
  //   })
  // })
})
