import helper from './helper'
import debug from './debug'
import { fetchProxy } from '../libs/network-hook/index'
import {
  copyToClipboard
} from './utils'

export default function editingAssistance (window) {
  if (!helper.config.editingAssistance.enabled) {
    return
  }

  debug.log('[editingAssistance] init')

  fetchProxy({
    onRequest: async (config, handler, isFetch) => {
      // debug.log(`[editingAssistance] ${config.url}`, config)

      /* 检测到请求了在编辑器中打开的接口，则将地址的file后面的参数解析出来，并将其复制到剪切板 */
      if (config.url.indexOf('open-in-editor?file=') > -1) {
        const file = config.url.split('open-in-editor?file=')[1]
        if (file) {
          debug.log(`[componentFilePath] ${file}`)
          copyToClipboard(file)
        }
      }

      handler.next(config)
    },
    onError: (err, handler, isFetch) => {
      handler.next(err)
    },
    onResponse: async (response, handler, isFetch) => {
      // debug.log('[fetchHooks onResponse]', response)

      /* 当和Ajax-hook混合使用时，需要判断isFetch，进行区分处理 */
      // if (isFetch) {
      //   const res = response.clone()
      //   const result = await res.json().catch((err) => {
      //     // 解析出错，忽略报错
      //     if (err) {}
      //   })
      //   debug.log('[fetchHooks onResponse json]', result)
      // }

      handler.next(response)
    }
  }, window)
}
