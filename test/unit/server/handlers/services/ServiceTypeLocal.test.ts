/*****
 License
--------------
Copyright © 2020 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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
import { Request } from '@hapi/hapi'
import '~/shared/config'

import * as Services from '~/domain/services'
import { mockResponseToolkit } from 'test/unit/__mocks__/responseToolkit'
import ServicesServiceTypeHandler from '~/server/handlers/services/{ServiceType}'
import * as TestData from 'test/unit/data/mockData'

jest.mock('~/shared/config', () => ({
  PARTICIPANT_LIST_SERVICE_URL: undefined,
  PARTICIPANT_LIST_LOCAL: ['dfspa', 'dfspb']
}))
const mockData = JSON.parse(JSON.stringify(TestData))

const forwardGetServicesServiceTypeRequestFromProviderService = jest.spyOn(Services, 'forwardGetServicesServiceTypeRequestFromProviderService')
const getServicesByServiceTypeRequest = mockData.getServicesByServiceTypeRequest
const putServicesByServiceTypeRequest = mockData.putServicesByServiceTypeRequest

describe.only('GET /services/{{ServiceType}} with PARTICIPANT_LIST_LOCAL', () => {
  it('handles a successful request', async () => {
    // Arrange
    forwardGetServicesServiceTypeRequestFromProviderService.mockResolvedValueOnce()
    const expected = [
      '/services/{{ServiceType}}',
      'TP_CB_URL_SERVICES_PUT',
      putServicesByServiceTypeRequest.headers,
      'PUT',
      getServicesByServiceTypeRequest.params.ServiceType,
      putServicesByServiceTypeRequest.payload,
      undefined
    ]

    // Act
    const response = await ServicesServiceTypeHandler.get(
      null,
      getServicesByServiceTypeRequest as unknown as Request,
      mockResponseToolkit
    )

    // Assert
    expect(response.statusCode).toBe(202)
    expect(forwardGetServicesServiceTypeRequestFromProviderService).toHaveBeenCalledWith(...expected)
  })
})
