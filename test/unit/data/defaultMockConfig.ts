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

 * Lewis Daly <lewisd@crosslaketech.com>
 --------------
 ******/

import { ServiceConfig } from '~/shared/config'
import { Enum } from '@mojaloop/central-services-shared'

const defaultMockConfig: ServiceConfig = {
  PACKAGE: {
    version: '11.0.0'
  },
  PORT: 1234,
  HOST: 'auth-service.local',
  ENDPOINT_CACHE_CONFIG: {
    expiresIn: 5000,
    generateTimeout: 5000
  },
  ENDPOINT_SERVICE_URL: 'central-ledger.local',
  ERROR_HANDLING: {
    includeCauseExtension: true,
    truncateExtensions: true,
  },
  INSTRUMENTATION: {
    METRICS: {
      DISABLED: false,
      labels: {
        eventId: "*"
      },
      config: {
        timeout: 5000,
        prefix: "moja_3p_api"
      }
    }
  },
  KAFKA: {
    TOPIC_TEMPLATES: {
      GENERAL_TOPIC_TEMPLATE: {
        TEMPLATE: 'topic-{{functionality}}-{{action}}',
        REGEX: 'topic-(.*)-(.*)'
      }
    },
    CONSUMER: [
      {
        eventType: Enum.Events.Event.Type.NOTIFICATION,
        eventAction: Enum.Events.Event.Action.COMMIT,
        options: {
          mode: 2,
          batchSize: 1,
          pollFrequency: 10,
          recursiveTimeout: 100,
          messageCharset: 'utf8',
          messageAsJSON: true,
          sync: true,
          consumeTimeout: 1000
        },
        rdkafkaConf: {
          'client.id': '3p-con-notification-event',
          'group.id': '3p-group-notification-event',
          'metadata.broker.list': 'localhost:9092',
          'socket.keepalive.enable': true
        },
        topicConf: {
          'auto.offset.reset': 'earliest'
        }
      }
    ]
  },
  MOCK_CALLBACK: {
    transactionRequestId: '12345',
    pispId: 'pisp'
  }
}

export default defaultMockConfig