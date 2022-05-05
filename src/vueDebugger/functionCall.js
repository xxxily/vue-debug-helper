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
    helper.config.hackVueComponent ? helper.methods.unHackVueComponent() : helper.methods.hackVueComponent()
    helper.config.hackVueComponent = !helper.config.hackVueComponent
  }

}

export default functionCall
