/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in
 writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS
 OF ANY KIND, either express or implied. See the License for the specific language governing
 permissions and limitations under the License.
Contributors Contributors
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

import * as Accounts from '~/domain/accounts'
import Logger from '@mojaloop/central-services-logger'
import { Util, Enum } from '@mojaloop/central-services-shared'
import { ReformatFSPIOPError } from '@mojaloop/central-services-error-handling'
import * as TestData from 'test/unit/data/mockData'
import Span from 'test/unit/__mocks__/span'
import Config from '~/shared/config'

const mockGetEndpointAndRender = jest.spyOn(Util.Endpoints, 'getEndpointAndRender')
const mockSendRequest = jest.spyOn(Util.Request, 'sendRequest')
const mockLoggerPush = jest.spyOn(Logger, 'push')
const mockLoggerError = jest.spyOn(Logger, 'error')
const mockData = JSON.parse(JSON.stringify(TestData))
const request = mockData.accountsRequest

const getEndpointAndRenderAccountsRequestsIdExpected = [
  'http://central-ledger.local:3001',
  'dfspA',
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_ACCOUNTS_PUT,
  '/accounts/{{ID}}',
  { ID: 'username1234' }
]

const getEndpointAndRenderAccountRequestsIdExpectedSecond = [
  'http://central-ledger.local:3001',
  'pispA',
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_ACCOUNTS_PUT_ERROR,
  '/accounts/{{ID}}/error',
  { ID: 'username1234' }
]

const hubNameRegex = Util.HeaderValidation.getHubNameRegex(Config.HUB_PARTICIPANT.NAME)

const sendRequestAccountsRequestsIdExpected = {
  destination: 'dfspA',
  headers: request.headers,
  hubNameRegex,
  method: Enum.Http.RestMethods.PUT,
  payload: request.payload,
  responseType: Enum.Http.ResponseTypes.JSON,
  source: 'pispA',
  span: expect.objectContaining({ isFinished: false }),
  url: 'http://dfspa-sdk/accounts/username1234'
}

describe('domain/accounts/{ID}', () => {
  describe('forwardAccountsIdRequest', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards GET/PUT /accounts request', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://dfspa-sdk/accounts/username1234')
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })
      await Accounts.forwardAccountsIdRequest(
        '/accounts/{{ID}}',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_ACCOUNTS_PUT,
        request.headers,
        Enum.Http.RestMethods.PUT,
        'username1234',
        request.payload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderAccountsRequestsIdExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestAccountsRequestsIdExpected)
    })

    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk/accounts/username1234/error')

      const action = async () =>
        await Accounts.forwardAccountsIdRequest(
          '/accounts/{{ID}}',
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_ACCOUNTS_PUT,
          request.headers,
          Enum.Http.RestMethods.PUT,
          'username1234',
          request.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderAccountsRequestsIdExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderAccountRequestsIdExpectedSecond)
      // Children's children in `forwardAccountsIdRequestError()`
      expect(mockSpan.child?.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.child?.error).toHaveBeenCalledTimes(0)
      // Children in `forwardAccountsIdRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })

    it('handles `getEndpointAndRender` failure twice', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValue(new Error('Cannot find endpoint first time'))
        .mockRejectedValue(new Error('Cannot find endpoint second time'))

      const action = async () =>
        await Accounts.forwardAccountsIdRequest(
          '/accounts/{{ID}}',
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_ACCOUNTS_PUT,
          request.headers,
          Enum.Http.RestMethods.PUT,
          'username1234',
          request.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Cannot find endpoint second time')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderAccountsRequestsIdExpected)
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderAccountRequestsIdExpectedSecond)
      expect(mockSendRequest).not.toHaveBeenCalled()
    })
  })

  describe('forwardAccountsIdRequestError', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_ACCOUNTS_PUT_ERROR

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the PUT /accounts/{ID} error', async () => {
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue('http://pispa-sdk/accounts/username1234/error')
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': Config.HUB_PARTICIPANT.NAME,
        'fspiop-destination': 'pispA'
      }
      const id = 'username1234'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointAndRenderErrorExpected = [
        'http://central-ledger.local:3001',
        'pispA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_ACCOUNTS_PUT_ERROR,
        '/accounts/{{ID}}/error',
        { ID: 'username1234' }
      ]

      const sendRequestErrorExpected = {
        url: 'http://pispa-sdk/accounts/username1234/error',
        source: Config.HUB_PARTICIPANT.NAME,
        destination: 'pispA',
        headers,
        method: Enum.Http.RestMethods.PUT,
        payload,
        responseType: Enum.Http.ResponseTypes.JSON,
        span: undefined,
        hubNameRegex
      }

      // Act
      await Accounts.forwardAccountsIdRequestError(path, headers, id, payload)

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderErrorExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestErrorExpected)
    })

    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      const headers = {
        'fspiop-source': Config.HUB_PARTICIPANT.NAME,
        'fspiop-destination': 'pispA'
      }
      const id = 'username1234'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointAndRenderErrorExpected = [
        'http://central-ledger.local:3001',
        'pispA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_ACCOUNTS_PUT_ERROR,
        '/accounts/{{ID}}/error',
        { ID: 'username1234' }
      ]
      mockGetEndpointAndRender.mockRejectedValueOnce(new Error('Cannot find endpoint'))

      const action = async () => await Accounts.forwardAccountsIdRequestError(path, headers, id, payload)

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderErrorExpected)
    })
  })
})
