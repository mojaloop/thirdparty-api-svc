import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi"
import Metrics from '@mojaloop/central-services-metrics'

export type THandlerFunc = (_context: any, request: Request, h: ResponseToolkit) => Promise<ResponseObject>

/**
 * @function wrapWithHistogram
 * @description Wraps a handler function with a histogram of the given name
 * @param {THandlerFunc} handler The handler function to be wrapped
 * @param {[string, string, Array<string>]} histogramParams The params of the histogram
 */
function wrapWithHistogram(handler: THandlerFunc, histogramParams: [string, string, Array<string>]): THandlerFunc {
  return async (_context: any, request: Request, h: ResponseToolkit) =>  {
    const histTimerEnd = Metrics.getHistogram(...histogramParams).startTimer()
    try {
      const response = await handler(_context, request, h)
      histTimerEnd({ success: 'true' })
      return response;
    } catch(err) {
      histTimerEnd({ success: 'false' })
      throw err;
    }
  }
}

export {
  wrapWithHistogram
}
