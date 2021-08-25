/* eslint-disable @typescript-eslint/no-explicit-any */
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

 * ModusBox
 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>

 * Crosslake
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/
'use strict'

import { Request } from '@hapi/hapi'
import util from 'util'
import { Enum } from '@mojaloop/central-services-shared'
import { EventStateMetadata, EventStatusType } from '@mojaloop/event-sdk'
import { FSPIOPError } from '@mojaloop/central-services-error-handling'
import { NotificationMessage } from '../eventServer/eventHandlers/notificationEvent'

/**
 * @function finishChildSpan
 * @description Helper function for reporting errors to a childSpan, and then finishing it
 * @param {FSPIOPError} fspiopError error object
 * @param {any} span request span
 * @returns {Promise<void>}
 */
async function finishChildSpan (fspiopError: FSPIOPError, childSpan: any): Promise<void> {
  const state = new EventStateMetadata(
    EventStatusType.failed,
    fspiopError.apiErrorCode.code,
    fspiopError.apiErrorCode.message)
  await childSpan.error(fspiopError, state)
  await childSpan.finish(fspiopError.message, state)
}

/**
 * @function getStackOrInspect
 * @description Gets the error stack, or uses util.inspect to inspect the error
 * @param {*} err - An error object
 */
function getStackOrInspect (err: Error): string {
  return err.stack || util.inspect(err)
}

/**
 * @function getSpanTags
 * @description Returns span tags based on headers, transactionType and action.
 * @param {Object} request
 * @param {string} eventType
 * @param {string} eventAction
 * @returns {Object}
 */
function getSpanTags (request: Request, eventType: string, eventAction: string, customTags: { [id: string]: string } = {}): { [id: string]: string } {
  const tags: { [id: string]: string } = {
    eventType,
    eventAction,
    source: request.headers && request.headers[Enum.Http.Headers.FSPIOP.SOURCE],
    destination: request.headers && request.headers[Enum.Http.Headers.FSPIOP.DESTINATION],
    ...customTags
  }
  return tags
}


/**
 * @function temporaryMockTransactionCallback
 * @description Convert a Transfer Committed kafka message to a transactionRequest commited message
 */
function temporaryMockTransactionCallback (config: { transactionRequestId: string; pispId: string }, originalMessage: NotificationMessage): NotificationMessage {
  originalMessage.value.from = 'Hub'
  originalMessage.value.to = config.pispId
  originalMessage.value.id = config.transactionRequestId
  originalMessage.value.content.headers['fspiop-source'] = 'Hub'
  originalMessage.value.content.headers['fspiop-destination'] = config.pispId

  // Note: we may wish to use a different event type or action as well, but
  // I'm going to leave that until we have a clearer picture on the final event
  // from the central-event-processor, and what it looks like.

  return originalMessage
}

export {
  finishChildSpan,
  getStackOrInspect,
  getSpanTags,
  temporaryMockTransactionCallback
}
