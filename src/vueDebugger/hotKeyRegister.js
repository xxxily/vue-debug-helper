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
  hotkeys('shift+alt+a,⇧+⌥+a', function (event, handler) {
    debug.log('全部组件混合统计', helper.methods.componentsSummaryStatisticsSort())
  })

  hotkeys('shift+alt+l,⇧+⌥+l', function (event, handler) {
    debug.log('当前存活组件统计', helper.methods.componentsStatistics())
  })

  hotkeys('shift+alt+d,⇧+⌥+d', function (event, handler) {
    debug.log('已销毁组件统计', helper.methods.destroyStatisticsSort())
  })

  hotkeys('shift+alt+c,⇧+⌥+c', function (event, handler) {
    debug.log('清空统计信息', helper.methods.clearAll())
  })

  hotkeys('shift+alt+e,⇧+⌥+e', function (event, handler) {
    if (helper.ddConfig.enable) {
      debug.log('取消数据注入（undd）')
      helper.methods.undd()
    } else {
      const filter = window.prompt('组件过滤器（如果为空，则对所有组件注入）', '')
      const size = window.prompt('指定注入数据的大小值（默认1Mb）', 1024)
      debug.log('数据注入（dd）')
      helper.methods.dd(filter, Number(size))
    }
  })
}

export default hotKeyRegister
