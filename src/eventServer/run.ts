import { create, start } from './eventServer'
import { ServiceConfig } from '~/shared/config'


export default async function run(config: ServiceConfig): Promise<void> {
  const consumers = create(config)

  return start(consumers)
}
