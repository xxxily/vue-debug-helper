/*!
 * @name         ajaxHooks.js
 * @description  底层请求hook
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/12 17:46
 * @github       https://github.com/xxxily
 */

import debug from './debug'
import { networkProxy, unNetworkProxy } from '../libs/network-hook/index'
import cacheStore from './cacheStore'
import helper from './helper'
import {
  // copyToClipboard,
  filtersMatch
} from './utils'

/**
 * 判断是否符合进行缓存控制操作的条件
 * @param {object} config
 * @returns {boolean}
 */
function useCache (config) {
  const ajaxCache = helper.config.ajaxCache
  if (ajaxCache.enabled) {
    return filtersMatch(ajaxCache.filters, config.url)
  } else {
    return false
  }
}

function isNeedBlockAjax (config) {
  const blockAjax = helper.config.blockAjax
  if (blockAjax.enabled) {
    return filtersMatch(blockAjax.filters, config.url)
  } else {
    return false
  }
}

/* 基于接口拦截的编辑辅助功能 */
// function editingAssistance (config) {
//   const editingAssistance = helper.config.editingAssistance
//   if (!editingAssistance.enabled) {
//     return false
//   }

//   debug.log(`[editingAssistance] ${config.url}`, config)

//   /* 检测到请求了在编辑器中打开的接口，则将地址的file后面的参数解析出来，并将其复制到剪切板 */
//   if (config.url.indexOf('open-in-editor?file=') > -1) {
//     const file = config.url.split('open-in-editor?file=')[1]
//     if (file) {
//       debug.log(`[componentFilePath] ${file}`)
//       copyToClipboard(file)
//     }
//   }
// }

let ajaxHooksWin = window

const ajaxHooks = {
  hook (win = ajaxHooksWin) {
    networkProxy({
      onRequest: async (config, handler, isFetch) => {
        const fetchTips = isFetch ? 'fetch ' : ''

        // editingAssistance(config)

        if (isNeedBlockAjax(config)) {
          handler.reject(new Error('ajax blocked'))
          debug.warn(`[ajaxHooks][blocked]${fetchTips}${config.method} ${config.url}`, config)
          return false
        }

        let hitCache = false
        if (useCache(config)) {
          const cacheInfo = await cacheStore.getCacheInfo(config)
          const cache = await cacheStore.getCache(config)

          if (cache && cacheInfo) {
            const isExpires = Date.now() - cacheInfo.cacheTime > helper.config.ajaxCache.expires

            if (!isExpires) {
              if (isFetch) {
                const customResponse = new Response(cache, {
                  status: 200,
                  statusText: 'ok',
                  url: config.url,
                  headers: new Headers({
                    'Content-Type': 'application/json'
                  })
                })
                handler.resolve(customResponse)
              } else {
                handler.resolve({
                  config: config,
                  status: 200,
                  headers: { 'content-type': 'application/json' },
                  response: cache
                })
              }

              hitCache = true
            }
          }
        }

        if (hitCache) {
          debug.warn(`[ajaxHooks] use cache:${fetchTips}${config.method} ${config.url}`, config)
        } else {
          handler.next(config)
        }
      },

      onError: (err, handler, isFetch) => {
        handler.next(err)
      },

      onResponse: async (response, handler, isFetch) => {
        if (useCache(response.config)) {
          // 加入缓存
          cacheStore.setCache(response, isFetch)
        }

        handler.next(response)
      }
    }, win)
  },

  unHook (win = ajaxHooksWin, force = false) {
    if (force === true) {
      unNetworkProxy(win)
    } else {
      const conf = helper.config
      const needUnHook = !conf.ajaxCache.enabled || !conf.blockAjax.enabled || !conf.replaceAjax.enabled
      if (needUnHook) {
        unNetworkProxy(win)
      }
    }
  },

  init (win) {
    ajaxHooksWin = win

    const conf = helper.config
    const needHook = conf.ajaxCache.enabled || conf.blockAjax.enabled || conf.replaceAjax.enabled
    if (needHook) {
      ajaxHooks.hook(ajaxHooksWin)
    }

    /* 定时清除接口的缓存数据，防止不断堆积 */
    setTimeout(() => {
      cacheStore.cleanCache(helper.config.ajaxCache.expires)
    }, 1000 * 10)
  }
}

export default ajaxHooks
