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

 * Crosslake
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/
'use strict'
import * as Util from '~/shared/util'
import { NotificationMessage } from "~/eventServer/eventHandlers/notificationEvent"
import onEvent from '~/eventServer/eventHandlers/notificationEvent'
import config from '~/shared/config'
import { Enum } from '@mojaloop/central-services-shared'
import * as TPDomain from '~/domain/thirdpartyRequests/transactions'

const mockforwardTransactionRequestNotificationCallback = jest.spyOn(TPDomain, 'forwardTransactionRequestNotification')

const exampleMessage: NotificationMessage = {
  value: {
    from: 'dfspb',
    to: 'dfspa',
    id: 'bc1a9c36-4429-4205-8553-11f92de1919e',
    content: {
      uriParams: { id: 'bc1a9c36-4429-4205-8553-11f92de1919e' },
      headers: {
        'content-type': 'application/vnd.interoperability.transfers+json;version=1.0',
        date: '2020-09-09T03:58:36.000Z',
        'fspiop-source': 'dfspb',
        'fspiop-destination': 'dfspa',
        authorization: 'Bearer 74b241a2-4200-3938-8dfc-0e26ba21dc22',
        'content-length': '136',
        host: 'ml-api-adapter:3000',
      },
      payload: 'data:application/vnd.interoperability.transfers+json;version=1.0;base64,eyJjb21wbGV0ZWRUaW1lc3RhbXAiOiIyMDIwLTA5LTA5VDAzOjU4OjM2Ljg0NFoiLCJ0cmFuc2ZlclN0YXRlIjoiQ09NTUlUVEVEIiwiZnVsZmlsbWVudCI6Ii1TODBPZ0pMbEpSVElHUFAxMlpZTnFjZEhLQlQ3WHNVZDFjenVOMUI5RzQifQ'
    },
    type: 'application/json',
    metadata: {
      correlationId: 'bc1a9c36-4429-4205-8553-11f92de1919e',
      event: {
        type: Enum.Events.Event.Type.NOTIFICATION,
        action: 'commit',
        createdAt: '2020-09-09T03:58:36.859Z',
        state: {
          status: 'success',
          code: 0,
          description: 'success status'
        },
        id: '85756a1d-c159-4316-b8d0-d0a41ecbcfe1',
        responseTo: '0ecc24f8-a617-4b60-b954-3cfb4b909ae8'
      },
      trace: null,
      'protocol.createdAt': 1599623916963
    }
  },
  size: 123,
  key: null,
  topic: 'topic-notification-event',
  offset: 0,
  partition: 0,
  timestamp: 1599623916963,
}

describe('notificationEvent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('handles mocking an incoming message', async() => {
    const mockTransactionCallback = jest.spyOn(Util, 'temporaryMockTransactionCallback')
    await onEvent(null, exampleMessage)
    expect(mockTransactionCallback).toHaveBeenCalledTimes(1)
    expect(mockTransactionCallback).toHaveBeenCalledWith(config.MOCK_CALLBACK, exampleMessage)
  })

  it('handles an array of messages', async () => {
    // Arrange
    // Make a message that will be filtered
    const nonCommitMessage = JSON.parse(JSON.stringify(exampleMessage))
    nonCommitMessage.value.metadata.event.action = 'prepare'

    const messages = [
      exampleMessage,
      exampleMessage,
      nonCommitMessage
    ]
    // Act
    await onEvent(null, messages)

    // Assert
    expect(mockforwardTransactionRequestNotificationCallback).toHaveBeenCalledTimes(2)
    expect(mockforwardTransactionRequestNotificationCallback).toHaveBeenCalledWith(
      exampleMessage.value.content.headers,
      exampleMessage.value.id,
      exampleMessage.value.content.payload,
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PATCH,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PATCH,
      Enum.Http.RestMethods.PATCH
    )
  })

  it('handles a single message', async () => {
    // Arrange
    // Act
    await onEvent(null, exampleMessage)

    // Assert
    expect(mockforwardTransactionRequestNotificationCallback).toHaveBeenCalledTimes(1)
    expect(mockforwardTransactionRequestNotificationCallback).toHaveBeenCalledWith(
      exampleMessage.value.content.headers,
      exampleMessage.value.id,
      exampleMessage.value.content.payload,
      Enum.EndPoints.FspEndpointTemplates.TP_TRANSACTION_REQUEST_PATCH,
      Enum.EndPoints.FspEndpointTypes.TP_CB_URL_TRANSACTION_REQUEST_PATCH,
      Enum.Http.RestMethods.PATCH
    )
  })
})
