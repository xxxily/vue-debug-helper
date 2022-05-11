/*!
 * @name         performanceObserver.js
 * @description  进行性能监测结果的打印
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/11 10:39
 * @github       https://github.com/xxxily
 */

import debug from './debug'
import helper from './helper'
import i18n from './i18n'

const performanceObserver = {
  observer: null,
  init () {
    if (typeof PerformanceObserver === 'undefined') {
      debug.log(i18n.t('debugHelper.performanceObserver.notSupport'))
      return false
    }

    if (performanceObserver.observer && performanceObserver.observer.disconnect) {
      performanceObserver.observer.disconnect()
    }

    /* 不进行性能观察 */
    if (!helper.config.performanceObserver.enabled) {
      performanceObserver.observer = null
      return false
    }

    // https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceObserver/observe
    performanceObserver.observer = new PerformanceObserver(function (list, observer) {
      if (!helper.config.performanceObserver.enabled) {
        return
      }

      const entries = list.getEntries()
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        debug.info(`[performanceObserver ${entry.entryType}]`, entry)
      }
    })

    // https://runebook.dev/zh-CN/docs/dom/performanceentry/entrytype
    performanceObserver.observer.observe({ entryTypes: helper.config.performanceObserver.entryTypes })
  }
}

export default performanceObserver
