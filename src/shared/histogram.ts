import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import Metrics from '@mojaloop/central-services-metrics'

export type THandlerFunc = (_context: unknown, request: Request, h: ResponseToolkit) => Promise<ResponseObject>

/**
 * @function wrapWithHistogram
 * @description Wraps a handler function with a histogram of the given name
 * @param {THandlerFunc} handler The handler function to be wrapped
 * @param {[string, string, Array<string>]} histogramParams The params of the histogram
 */
function wrapWithHistogram(handler: THandlerFunc, histogramParams: [string, string, string[]]): THandlerFunc {
  return async (_context: unknown, request: Request, h: ResponseToolkit) => {
    let histTimerEnd
    try {
      histTimerEnd = Metrics.getHistogram(...histogramParams).startTimer()
      const response = await handler(_context, request, h)
      histTimerEnd({ success: 'true' })

      return response
    } catch (err) {
      if (typeof histTimerEnd === 'function') {
        histTimerEnd({ success: 'false' })
      }
      throw err
    }
  }
}

export { wrapWithHistogram }
