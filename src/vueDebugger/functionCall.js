/*!
 * @name         functionCall.js
 * @description  统一的提供外部功能调用管理模块
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/27 17:42
 * @github       https://github.com/xxxily
 */

import helper from './helper'
import debug from './debug'
import i18n from './i18n'
import vueHooks from './vueHooks'
import ajaxHooks from './ajaxHooks'
import cacheStore from './cacheStore'
import performanceObserver from './performanceObserver'
import {
  toArrFilters
} from './utils'

const functionCall = {
  viewVueDebugHelperObject () {
    debug.log(i18n.t('debugHelper.viewVueDebugHelperObject'), helper)
  },
  componentsStatistics () {
    const result = helper.methods.componentsStatistics()
    let total = 0

    /* 提供友好的可视化展示方式 */
    console.table && console.table(result.map(item => {
      total += item.componentInstance.length
      return {
        componentName: item.componentName,
        count: item.componentInstance.length
      }
    }))

    debug.log(`${i18n.t('debugHelper.componentsStatistics')} (total:${total})`, result)
  },
  destroyStatisticsSort () {
    const result = helper.methods.destroyStatisticsSort()
    let total = 0

    /* 提供友好的可视化展示方式 */
    console.table && console.table(result.map(item => {
      const durationList = item.destroyList.map(item => item.duration)
      const maxDuration = Math.max(...durationList)
      const minDuration = Math.min(...durationList)
      const durationRange = maxDuration - minDuration
      total += item.destroyList.length

      return {
        componentName: item.componentName,
        count: item.destroyList.length,
        avgDuration: durationList.reduce((pre, cur) => pre + cur, 0) / durationList.length,
        maxDuration,
        minDuration,
        durationRange,
        durationRangePercent: (1000 - minDuration) / durationRange
      }
    }))

    debug.log(`${i18n.t('debugHelper.destroyStatisticsSort')} (total:${total})`, result)
  },
  componentsSummaryStatisticsSort () {
    const result = helper.methods.componentsSummaryStatisticsSort()
    let total = 0

    /* 提供友好的可视化展示方式 */
    console.table && console.table(result.map(item => {
      total += item.componentsSummary.length
      return {
        componentName: item.componentName,
        count: item.componentsSummary.length
      }
    }))

    debug.log(`${i18n.t('debugHelper.componentsSummaryStatisticsSort')} (total:${total})`, result)
  },
  getDestroyByDuration () {
    const destroyInfo = helper.methods.getDestroyByDuration()
    console.table && console.table(destroyInfo.destroyList)
    debug.log(i18n.t('debugHelper.getDestroyByDuration'), destroyInfo)
  },
  clearAll () {
    helper.methods.clearAll()
    debug.log(i18n.t('debugHelper.clearAll'))
  },

  printLifeCycleInfo () {
    const lifecycleFilters = window.prompt(i18n.t('debugHelper.printLifeCycleInfoPrompt.lifecycleFilters'), helper.config.lifecycle.filters.join(','))
    const componentFilters = window.prompt(i18n.t('debugHelper.printLifeCycleInfoPrompt.componentFilters'), helper.config.lifecycle.componentFilters.join(','))

    if (lifecycleFilters !== null && componentFilters !== null) {
      debug.log(i18n.t('debugHelper.printLifeCycleInfo'))
      helper.methods.printLifeCycleInfo(lifecycleFilters, componentFilters)
    }
  },

  notPrintLifeCycleInfo () {
    debug.log(i18n.t('debugHelper.notPrintLifeCycleInfo'))
    helper.methods.notPrintLifeCycleInfo()
  },

  findComponents () {
    const filters = window.prompt(i18n.t('debugHelper.findComponentsPrompt.filters'), helper.config.findComponentsFilters.join(','))
    if (filters !== null) {
      debug.log(i18n.t('debugHelper.findComponents'), helper.methods.findComponents(filters))
    }
  },

  findNotContainElementComponents () {
    debug.log(i18n.t('debugHelper.findNotContainElementComponents'), helper.methods.findNotContainElementComponents())
  },

  blockComponents () {
    const filters = window.prompt(i18n.t('debugHelper.blockComponentsPrompt.filters'), helper.config.blockFilters.join(','))
    if (filters !== null) {
      helper.methods.blockComponents(filters)
      debug.log(i18n.t('debugHelper.blockComponents'), filters)
    }
  },

  dd () {
    const filter = window.prompt(i18n.t('debugHelper.ddPrompt.filter'), helper.config.dd.filters.join(','))
    const count = window.prompt(i18n.t('debugHelper.ddPrompt.count'), helper.config.dd.count)

    if (filter !== null && count !== null) {
      debug.log(i18n.t('debugHelper.dd'))
      helper.methods.dd(filter, Number(count))
    }
  },

  undd () {
    debug.log(i18n.t('debugHelper.undd'))
    helper.methods.undd()
  },

  toggleHackVueComponent () {
    helper.config.hackVueComponent ? vueHooks.unHackVueComponent() : vueHooks.hackVueComponent()
    helper.config.hackVueComponent = !helper.config.hackVueComponent
  },

  toggleInspect () {
    helper.config.inspect.enabled = !helper.config.inspect.enabled
    debug.log(`${i18n.t('debugHelper.toggleInspect')} success (${helper.config.inspect.enabled})`)
  },

  togglePerformanceObserver () {
    helper.config.performanceObserver.enabled = !helper.config.performanceObserver.enabled

    if (helper.config.performanceObserver.enabled) {
      let entryTypes = window.prompt(i18n.t('debugHelper.performanceObserverPrompt.entryTypes'), helper.config.performanceObserver.entryTypes.join(','))
      if (entryTypes) {
        const entryTypesArr = toArrFilters(entryTypes)
        const supportEntryTypes = ['element', 'navigation', 'resource', 'mark', 'measure', 'paint', 'longtask']

        /* 过滤出支持的entryTypes */
        entryTypes = entryTypesArr.filter(item => supportEntryTypes.includes(item))

        if (entryTypes.length !== entryTypesArr.length) {
          debug.warn(`some entryTypes not support, only support: ${supportEntryTypes.join(',')}`)
        }

        helper.config.performanceObserver.entryTypes = entryTypes

        performanceObserver.init()
      } else {
        alert('entryTypes is empty')
      }
    }

    debug.log(`${i18n.t('debugHelper.togglePerformanceObserver')} success (${helper.config.performanceObserver.enabled})`)
  },

  useAjaxCache () {
    helper.config.ajaxCache.enabled = true

    const filters = window.prompt(i18n.t('debugHelper.jaxCachePrompt.filters'), helper.config.ajaxCache.filters.join(','))
    const expires = window.prompt(i18n.t('debugHelper.jaxCachePrompt.expires'), helper.config.ajaxCache.expires / 1000 / 60)

    if (filters && expires) {
      helper.config.ajaxCache.filters = toArrFilters(filters)

      if (!isNaN(Number(expires))) {
        helper.config.ajaxCache.expires = Number(expires) * 1000 * 60
      }

      ajaxHooks.hook()

      debug.log(`${i18n.t('debugHelper.enableAjaxCacheTips')}`)
    }
  },

  disableAjaxCache () {
    helper.config.ajaxCache.enabled = false
    ajaxHooks.unHook()
    debug.log(`${i18n.t('debugHelper.disableAjaxCacheTips')}`)
  },

  toggleAjaxCache () {
    if (helper.config.ajaxCache.enabled) {
      functionCall.disableAjaxCache()
    } else {
      functionCall.useAjaxCache()
    }
  },

  async clearAjaxCache () {
    await cacheStore.store.clear()
    debug.log(`${i18n.t('debugHelper.clearAjaxCacheTips')}`)
  }
}

export default functionCall
