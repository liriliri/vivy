import axios, {
  AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  AxiosPromise,
} from 'axios'
import { net } from 'electron'
import isFn from 'licia/isFn'
import each from 'licia/each'
import lowerCase from 'licia/lowerCase'
import keys from 'licia/keys'
import settle from 'axios/unsafe/core/settle.js'
import resolveConfig from 'axios/unsafe/helpers/resolveConfig.js'
import composeSignals from 'axios/unsafe/helpers/composeSignals.js'

const resolvers = {}
const res = new Response()
const types = ['text', 'arrayBuffer', 'blob', 'formData']
each(types, (type) => {
  if (!resolvers[type]) {
    if (isFn(res[type])) {
      resolvers[type] = (res) => res[type]()
    } else {
      resolvers[type] = (_, config) => {
        throw new AxiosError(
          `Response type '${type}' is not supported`,
          AxiosError.ERR_NOT_SUPPORT,
          config
        )
      }
    }
  }
})

const adapter: AxiosAdapter = async function (config): AxiosPromise {
  const { method, url, headers, data, timeout, responseType } =
    resolveConfig(config)
  const [composedSignal, stopTimeout] = composeSignals([], timeout)

  let finished = false
  const onFinish = () => {
    if (!finished) {
      setTimeout(() => {
        composedSignal.unsubscribe()
      })
    }

    finished = true
  }

  const request = new Request(url, {
    signal: composedSignal,
    method: method.toUpperCase(),
    headers: headers.normalize().toJSON(),
    body: data,
  })

  const response = await net.fetch(request)

  const responseData = await resolvers[
    findKey(resolvers, responseType) || 'text'
  ](response, config)

  onFinish()
  stopTimeout()

  return await new Promise((resolve, reject) => {
    settle(resolve, reject, {
      data: responseData,
      headers: AxiosHeaders.from(response.headers as any),
      status: response.status,
      statusText: response.statusText,
      config,
      request,
    })
  })
}

function findKey(obj, key) {
  key = lowerCase(key)
  const _keys = keys(obj)
  let i = _keys.length
  let _key
  while (i-- > 0) {
    _key = _keys[i]
    if (key === _key.toLowerCase()) {
      return _key
    }
  }
  return null
}

const instance = axios.create({
  adapter,
  timeout: 10000,
  responseType: 'json',
})

export default instance
