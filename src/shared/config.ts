/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the "License") and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files
 are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
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

 - Paweł Marzec <pawel.marzec@modusbox.com>
 --------------
 ******/

import rc from 'rc'
import parse from 'parse-strings-in-object'
import Config from '../../config/default.json'
import Package from '../../package.json'
import logger from '@mojaloop/central-services-logger'

export interface ServiceConfig {
  // package.json
  PACKAGE: Record<string, unknown>

  // ../server.ts
  PORT: number
  HOST: string

  // inspect.ts
  INSPECT?: {
    DEPTH?: number
    SHOW_HIDDEN?: boolean
    COLOR?: boolean
  }

  // transactions.ts
  ENDPOINT_CACHE_CONFIG: {
    expiresIn: number
    generateTimeout: number
  }
  ENDPOINT_SERVICE_URL: string
  // if set, will use this url to lookup the /services/{ServiceType} call
  PARTICIPANT_LIST_SERVICE_URL?: string
  // if set, will respond with this static list of participants
  PARTICIPANT_LIST_LOCAL?: Array<string>
  ERROR_HANDLING: {
    includeCauseExtension: boolean
    truncateExtensions: boolean
  }
  INSTRUMENTATION: {
    METRICS: {
      DISABLED: boolean
      labels: {
        eventId: string
      }
      config: {
        timeout: number
        prefix: string
        defaultLabels?: Map<string, string>
      }
    }
  }
  MOCK_CALLBACK: {
    transactionRequestId: string
    pispId: string
  }
}

const RC = parse(rc('THIRD_PARTY', Config)) as ServiceConfig

// Custom validation
if (RC.PARTICIPANT_LIST_LOCAL && RC.PARTICIPANT_LIST_SERVICE_URL) {
  logger.warn(
    'Both `PARTICIPANT_LIST_LOCAL` and `PARTICIPANT_LIST_SERVICE_URL` set. Defaulting to `PARTICIPANT_LIST_SERVICE_URL`'
  )
  RC.PARTICIPANT_LIST_LOCAL = undefined
}

if (!RC.PARTICIPANT_LIST_LOCAL && !RC.PARTICIPANT_LIST_SERVICE_URL) {
  logger.error('Either `PARTICIPANT_LIST_LOCAL` or `PARTICIPANT_LIST_SERVICE_URL` are required configs')
  throw new Error('Either `PARTICIPANT_LIST_LOCAL` or `PARTICIPANT_LIST_SERVICE_URL` are required configs')
}

export default {
  ...RC,
  PACKAGE: Package
}
