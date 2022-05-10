/*!
 * @name         hotKeyRegister.js
 * @description  vue-debug-helper的快捷键配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/26 14:37
 * @github       https://github.com/xxxily
 */
import helper from './helper'
import functionCall from './functionCall'
import hotkeys from '../libs/hotkeys'

function hotKeyRegister () {
  const hotKeyMap = {
    'shift+alt+i': functionCall.toggleInspect,
    'shift+alt+a,shift+alt+ctrl+a': functionCall.componentsSummaryStatisticsSort,
    'shift+alt+l': functionCall.componentsStatistics,
    'shift+alt+d': functionCall.destroyStatisticsSort,
    'shift+alt+c': functionCall.clearAll,
    'shift+alt+e': function (event, handler) {
      if (helper.config.dd.enabled) {
        functionCall.undd()
      } else {
        functionCall.dd()
      }
    }
  }

  Object.keys(hotKeyMap).forEach(key => {
    hotkeys(key, hotKeyMap[key])
  })
}

export default hotKeyRegister
