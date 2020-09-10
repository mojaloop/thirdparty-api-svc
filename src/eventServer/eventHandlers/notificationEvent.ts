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

 - Lewis Daly <lewisd@crosslaketech.com>
 --------------
 ******/

import { ConsumeCallback, GenericMessage } from '@mojaloop/central-services-stream'
import { temporaryMockTransactionCallback } from '~/shared/util'
import config from '~/shared/config'
import { EventTypeEnum } from '@mojaloop/central-services-shared'

/**
 *
 * Note:
 *
 * Due to some odd reuse of Event types, Notification events are emitted on the `topic-notification-event` topic
 * but they may contain `value.metadata.event.action` types which are more not related
 * in this way, it seems that the `EventActionEnum` is doing 'double duty' as (1) actions for a topic name, and
 * (2) actions inside an event's metadata
 */
export type NotificationMessage = GenericMessage<EventTypeEnum.NOTIFICATION, 'commit' | 'prepare' | 'reserved' | 'abort'>

const onEvent: ConsumeCallback<NotificationMessage | Array<NotificationMessage>> = async (_error: Error | null, payload: NotificationMessage | Array<NotificationMessage>) => {
  console.log(JSON.stringify(payload))
  if (!Array.isArray(payload)) {
    payload = [payload]
  }

  /**
   * Note:
   *
   * Here we are listening for a `commit` message from the `central-ledger`, but this is a temporary workaround.
   * In the future, we will listen for a transactionRequest commit message from `central-event-processor`
   */
  payload.filter(m => m.value.metadata.event.action === 'commit')
  .forEach(message => {
    // Pretend this is related to a pre-specified thirdpartyRequest/transaction
    temporaryMockTransactionCallback(config.MOCK_CALLBACK, message)
    // console.log("TODO: sending callback to PISP", mockThirdpartyTransactionRequest)

    // TODO - handle this in domain, and send request to the PISP!
    // handled in https://app.zenhub.com/workspaces/mojaloop-project-59edee71d1407922110cf083/issues/mojaloop/mojaloop/270
  })
}

export default onEvent
