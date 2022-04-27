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
    debug.log(i18n.t('debugHelper.componentsStatistics'), helper.methods.componentsStatistics())
  },
  destroyStatisticsSort () {
    debug.log(i18n.t('debugHelper.destroyStatisticsSort'), helper.methods.destroyStatisticsSort())
  },
  componentsSummaryStatisticsSort () {
    debug.log(i18n.t('debugHelper.componentsSummaryStatisticsSort'), helper.methods.componentsSummaryStatisticsSort())
  },
  getDestroyByDuration () {
    debug.log(i18n.t('debugHelper.getDestroyByDuration'), helper.methods.getDestroyByDuration())
  },
  clearAll () {
    helper.methods.clearAll()
    debug.log(i18n.t('debugHelper.clearAll'))
  },
  dd () {
    const filter = window.prompt(i18n.t('debugHelper.ddPrompt.filter'), localStorage.getItem('vueDebugHelper_dd_filter') || '')
    const count = window.prompt(i18n.t('debugHelper.ddPrompt.count'), localStorage.getItem('vueDebugHelper_dd_count') || 1024)
    filter && localStorage.setItem('vueDebugHelper_dd_filter', filter)
    count && localStorage.setItem('vueDebugHelper_dd_count', count)
    debug.log(i18n.t('debugHelper.dd'))
    helper.methods.dd(filter, Number(count))
  },
  undd () {
    debug.log(i18n.t('debugHelper.undd'))
    helper.methods.undd()
  }
}

export default functionCall
