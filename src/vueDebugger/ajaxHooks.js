/*!
 * @name         ajaxHooks.js
 * @description  底层请求hook
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/12 17:46
 * @github       https://github.com/xxxily
 */

import debug from './debug'
import { proxy, unProxy } from '../libs/ajax-hook/index'
import cacheStore from './cacheStore'
import helper from './helper'
import {
  filtersMatch
} from './utils'
import hookJs from '../libs/hookJs'

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

let ajaxHooksWin = window

const ajaxHooks = {
  hook (win = ajaxHooksWin) {
    proxy({
      onRequest: async (config, handler) => {
        let hitCache = false

        if (useCache(config)) {
          const cacheInfo = await cacheStore.getCacheInfo(config)
          const cache = await cacheStore.getCache(config)

          if (cache && cacheInfo) {
            const isExpires = Date.now() - cacheInfo.cacheTime > helper.config.ajaxCache.expires

            if (!isExpires) {
              handler.resolve({
                config: config,
                status: 200,
                headers: { 'content-type': 'application/json' },
                response: cache
              })

              hitCache = true
            }
          }
        }

        if (hitCache) {
          debug.warn(`[ajaxHooks] use cache:${config.method} ${config.url}`, config)
        } else {
          handler.next(config)
        }
      },

      onError: (err, handler) => {
        handler.next(err)
      },

      onResponse: async (response, handler) => {
        if (useCache(response.config)) {
          // 加入缓存
          cacheStore.setCache(response, 'application/json')
        }

        handler.next(response)
      }
    }, win)
  },

  unHook (win = ajaxHooksWin) {
    unProxy(win)
  },

  init (win) {
    ajaxHooksWin = win

    if (helper.config.ajaxCache.enabled) {
      ajaxHooks.hook(ajaxHooksWin)
    }

    // hookJs.before(win, 'fetch', (args, parentObj, methodName, originMethod, execInfo, ctx) => {
    //   debug.log('[ajaxHooks] fetch', args)
    // })

    // hookJs.after(win, 'fetch', async (args, parentObj, methodName, originMethod, execInfo, ctx) => {
    //   debug.log('[ajaxHooks] fetch after', args, execInfo, await execInfo.result)
    // })

    /* 定时清除接口的缓存数据，防止不断堆积 */
    setTimeout(() => {
      cacheStore.cleanCache(helper.config.ajaxCache.expires)
    }, 1000 * 10)
  }
}

export default ajaxHooks
