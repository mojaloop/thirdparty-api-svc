/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the 'License') and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
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

 - Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/

import * as Services from '~/domain/services'
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
const getServicesByServiceTypeRequest = mockData.getServicesByServiceTypeRequest
const putServicesByServiceTypeRequest = mockData.putServicesByServiceTypeRequest

const sendRequestGetServicesRequestsToProviderExpected = {
  destination: Config.HUB_PARTICIPANT.NAME,
  headers: getServicesByServiceTypeRequest.headers,
  hubNameRegex: /^Hub$/i,
  method: Enum.Http.RestMethods.GET,
  payload: undefined,
  responseType: Enum.Http.ResponseTypes.JSON,
  source: 'pispA',
  span: expect.objectContaining({ isFinished: false }),
  url: 'http://ml-testing-toolkit:5000/services/THIRD_PARTY_DFSP'
}

const getEndpointAndRenderPutServicesRequestToFSPsExpected = [
  'http://central-ledger.local:3001',
  'pispA',
  Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT,
  '/services/{{ServiceType}}',
  { ServiceType: 'THIRD_PARTY_DFSP' }
]

const sendRequestPutServicesRequestsToFSPExpected = {
  destination: 'pispA',
  headers: putServicesByServiceTypeRequest.headers,
  hubNameRegex: /^Hub$/i,
  method: Enum.Http.RestMethods.PUT,
  payload: putServicesByServiceTypeRequest.payload,
  responseType: Enum.Http.ResponseTypes.JSON,
  source: Config.HUB_PARTICIPANT.NAME,
  span: expect.objectContaining({ isFinished: false }),
  url: 'http://pisp-sdk/services/THIRD_PARTY_DFSP'
}

const sendRequestPutServicesRequestsToFSPExpectedProviderError = {
  destination: Config.HUB_PARTICIPANT.NAME,
  headers: {
    'fspiop-destination': Config.HUB_PARTICIPANT.NAME,
    'fspiop-source': Config.HUB_PARTICIPANT.NAME
  },
  hubNameRegex: /^Hub$/i,
  method: Enum.Http.RestMethods.PUT,
  payload: expect.objectContaining({
    errorInformation: expect.any(Object)
  }),
  responseType: Enum.Http.ResponseTypes.JSON,
  source: Config.HUB_PARTICIPANT.NAME,
  span: expect.objectContaining({ isFinished: false }),
  url: 'http://ml-testing-toolkit:5000/services/THIRD_PARTY_DFSP/error'
}

describe('domain/services/{ServiceType}', () => {
  describe('forwardServicesServiceTypeRequest', () => {
    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards GET /services/{ServiceType} request to provider service', async (): Promise<void> => {
      const mockSpan = new Span()
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        payload: null
      })
      await Services.forwardGetServicesServiceTypeRequestToProviderService(
        '/services/{{ServiceType}}',
        getServicesByServiceTypeRequest.headers,
        Enum.Http.RestMethods.GET,
        'THIRD_PARTY_DFSP',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )
      expect(mockGetEndpointAndRender).toHaveBeenCalledTimes(0)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestGetServicesRequestsToProviderExpected)
    })

    it('forwards PUT /services/{ServiceType} request to FSP', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender.mockResolvedValue('http://pisp-sdk/services/THIRD_PARTY_DFSP')
      mockSendRequest.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        payload: null
      })
      await Services.forwardGetServicesServiceTypeRequestFromProviderService(
        '/services/{{ServiceType}}',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT,
        putServicesByServiceTypeRequest.headers,
        Enum.Http.RestMethods.PUT,
        'THIRD_PARTY_DFSP',
        putServicesByServiceTypeRequest.payload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Figure out how to properly mock spans
        mockSpan
      )
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderPutServicesRequestToFSPsExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestPutServicesRequestsToFSPExpected)
    })

    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      const mockSpan = new Span()
      mockGetEndpointAndRender
        .mockRejectedValueOnce(new Error('Cannot find endpoint'))
        .mockResolvedValueOnce('http://pispa-sdk/services/THIRD_PARTY_DFSP/error')

      const action = async () =>
        await Services.forwardGetServicesServiceTypeRequestFromProviderService(
          '/services/{{ServiceType}}',
          Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT,
          putServicesByServiceTypeRequest.headers,
          Enum.Http.RestMethods.PUT,
          'THIRD_PARTY_DFSP',
          putServicesByServiceTypeRequest.payload,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Figure out how to properly mock spans
          mockSpan
        )

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderPutServicesRequestToFSPsExpected)

      // should sent an error back to the Provider micro-service
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestPutServicesRequestsToFSPExpectedProviderError)

      // Children in `forwardServicesServiceTypeRequest()`
      expect(mockSpan.child?.finish).toHaveBeenCalledTimes(1)
      expect(mockSpan.child?.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('forwardServicesServiceTypeRequestError', () => {
    const path = Enum.EndPoints.FspEndpointTemplates.TP_SERVICES_PUT_ERROR

    beforeEach((): void => {
      jest.clearAllMocks()
      mockLoggerPush.mockReturnValue(null)
      mockLoggerError.mockReturnValue(null)
    })

    it('forwards the PUT /services/{ServiceType} error', async () => {
      // Arrange
      mockGetEndpointAndRender.mockResolvedValue('http://pispa-sdk/services/THIRD_PARTY_DFSP/error')
      mockSendRequest.mockResolvedValue({ status: 202, payload: null })
      const headers = {
        'fspiop-source': Config.HUB_PARTICIPANT.NAME,
        'fspiop-destination': 'pispA'
      }
      const serviceType = 'THIRD_PARTY_DFSP'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointAndRenderErrorExpected = [
        'http://central-ledger.local:3001',
        'pispA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT_ERROR,
        '/services/{{ServiceType}}/error',
        { ServiceType: 'THIRD_PARTY_DFSP' }
      ]
      const sendRequestErrorExpected = {
        destination: 'pispA',
        headers: headers,
        hubNameRegex: /^Hub$/i,
        method: Enum.Http.RestMethods.PUT,
        payload: payload,
        responseType: Enum.Http.ResponseTypes.JSON,
        source: Config.HUB_PARTICIPANT.NAME,
        span: undefined,
        url: 'http://pispa-sdk/services/THIRD_PARTY_DFSP/error'
      }

      // Act
      await Services.forwardServicesServiceTypeRequestError(path, headers, serviceType, payload)

      // Assert
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderErrorExpected)
      expect(mockSendRequest).toHaveBeenCalledWith(sendRequestErrorExpected)
    })

    it('handles `getEndpointAndRender` failure', async (): Promise<void> => {
      const headers = {
        'fspiop-source': Config.HUB_PARTICIPANT.NAME,
        'fspiop-destination': 'pispA'
      }
      const serviceType = 'THIRD_PARTY_DFSP'
      const fspiopError = ReformatFSPIOPError(new Error('Test Error'))
      const payload = fspiopError.toApiErrorObject(true, true)
      const getEndpointAndRenderErrorExpected = [
        'http://central-ledger.local:3001',
        'pispA',
        Enum.EndPoints.FspEndpointTypes.TP_CB_URL_SERVICES_PUT_ERROR,
        '/services/{{ServiceType}}/error',
        { ServiceType: 'THIRD_PARTY_DFSP' }
      ]
      mockGetEndpointAndRender.mockRejectedValueOnce(new Error('Cannot find endpoint'))

      const action = async () =>
        await Services.forwardServicesServiceTypeRequestError(path, headers, serviceType, payload)

      await expect(action).rejects.toThrow('Cannot find endpoint')
      expect(mockGetEndpointAndRender).toHaveBeenCalledWith(...getEndpointAndRenderErrorExpected)
    })
  })
})
