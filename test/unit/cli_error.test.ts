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

 * Paweł Marzec <pawel.marzec@modusbox.com>
 * Lewis Daly <lewisd@crosslaketech.com>
 --------------
 ******/
import eventServer from '~/eventServer'
jest.mock('~/server')
jest.mock('~/eventServer')

const flushPromises = () => new Promise(setImmediate);

// Note: we need to define a separate file here
// to get around quirks with Jest and module caching
describe('cli_error', (): void => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('exits when the eventServer fails to start', async (): Promise<void> => {
    // Arrange
    jest.spyOn(eventServer, 'run').mockRejectedValueOnce(new Error('Test Error'))
    // @ts-ignore - we need to mock a function with a never, otherwise process.exit() still gets called
    const mockExit = jest.spyOn(process, 'exit').mockImplementationOnce((code?: number) => {})
    process.argv = ['jest', 'cli.ts', 'event']

    // Act
    await import('~/cli')

    // Assert
    await flushPromises()
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
