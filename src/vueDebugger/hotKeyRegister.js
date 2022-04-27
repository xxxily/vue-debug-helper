/*!
 * @name         hotKeyRegister.js
 * @description  vue-debug-helper的快捷键配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/26 14:37
 * @github       https://github.com/xxxily
 */
import helper from './helper'
import hotkeys from '../libs/hotkeys'
import debug from './debug'

function hotKeyRegister () {
  const hotKeyMap = {
    'shift+alt+a,shift+alt+ctrl+a': function (event, handler) {
      debug.log('全部组件混合统计', helper.methods.componentsSummaryStatisticsSort())
    },
    'shift+alt+l': function (event, handler) {
      debug.log('当前存活组件统计', helper.methods.componentsStatistics())
    },
    'shift+alt+d': function (event, handler) {
      debug.log('已销毁组件统计', helper.methods.destroyStatisticsSort())
    },
    'shift+alt+c': function (event, handler) {
      helper.methods.clearAll()
      debug.log('清空统计信息')
    },
    'shift+alt+e': function (event, handler) {
      if (helper.ddConfig.enabled) {
        debug.log('取消数据注入（undd）')
        helper.methods.undd()
      } else {
        const filter = window.prompt('组件过滤器（如果为空，则对所有组件注入）', localStorage.getItem('vueDebugHelper_dd_filter') || '')
        const count = window.prompt('指定注入数据的重复次数（默认1024）', localStorage.getItem('vueDebugHelper_dd_count') || 1024)
        filter && localStorage.setItem('vueDebugHelper_dd_filter', filter)
        count && localStorage.setItem('vueDebugHelper_dd_count', count)
        debug.log('数据注入（dd）')
        helper.methods.dd(filter, Number(count))
      }
    }
  }

  Object.keys(hotKeyMap).forEach(key => {
    hotkeys(key, hotKeyMap[key])
  })
}

export default hotKeyRegister
