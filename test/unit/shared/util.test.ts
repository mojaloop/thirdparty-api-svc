/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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

 --------------
 ******/
'use strict'

import { getStackOrInspect, getSpanTags } from '~/shared/util'
import * as types from '~/interface/types'

const headers = {
  'fspiop-source': 'pispA',
  'fspiop-destination': 'dfspA'
}

describe('util', () => {
  describe('getStackOrInspect', () => {
    it('handles an error without a stack', () => {
      const input = new Error('This is a normal error')
      delete input.stack
      const expected = '[Error: This is a normal error]'
      const output = getStackOrInspect(input)
      expect(output).toBe(expected)
    })
  })
  describe('getSpanTags', () => {
    it('create correct span tags', () => {
      const request: any = {
        headers: headers,
        params: {},
        payload: { transactionRequestId: '1234' }
      }
      const expected = {
        source: 'pispA',
        destination: 'dfspA',
        transactionType: 'transaction-request',
        transactionAction: 'POST',
        transactionId: '1234'
      }
      const output = getSpanTags(request, 'transaction-request', 'POST')
      expect(output).toStrictEqual(expected)
    })
    it('create correct span tags when params set', () => {
      const request: any = {
        headers: headers,
        params: { ID: '1234' },
        payload: {}
      }
      const expected = {
        source: 'pispA',
        destination: 'dfspA',
        transactionType: 'transaction-request',
        transactionAction: 'POST',
        transactionId: '1234'
      }
      const output = getSpanTags(request, 'transaction-request', 'POST')
      expect(output).toStrictEqual(expected)
    })
    it('create correct span tags when headers are not set', () => {
      const request: any = {
        headers: null,
        params: {},
        payload: null
      }
      const transactionType = 'transaction-request'
      const transactionAction = 'POST'
      const transactionId = undefined
      const expected = {
        transactionType,
        transactionAction,
        transactionId
      }
      const output = getSpanTags(request, transactionType, transactionAction)
      expect(output).toStrictEqual(expected)
    })
  })
})

describe('types', () => {
  it('common types', () => {
    types.TAmountType.RECEIVE
    expect(types.TAmountType.RECEIVE).toEqual("RECEIVE")
    expect(types.TAmountType.SEND).toEqual("SEND")
  })
})