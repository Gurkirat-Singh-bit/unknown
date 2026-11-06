import worker from '../src/index'
import { localDirectory, openLocalEnvironment } from './local-env'

const local = await openLocalEnvironment()
try {
  console.log(`Local D1/KV storage: ${localDirectory}`)
  await worker.scheduled({ scheduledTime: Date.now(), cron: '0 */6 * * *', noRetry() {} }, local.env)
} finally {
  await local.dispose()
}
