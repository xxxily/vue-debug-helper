import './comment'
import helper from './helper'
import debug from './debug'
import mixinRegister from './mixinRegister'
import menuRegister from './menuRegister'
import hotKeyRegister from './hotKeyRegister'
import vueDetector from './vueDetector'

import {
  isInIframe
} from '../libs/utils/index'

import {
  getPageWindow
} from './window'

let registerStatus = 'init'
window._debugMode_ = true

;(async function () {
  if (isInIframe()) {
    debug.log('running in iframe, skip init', window.location.href)
    return false
  }

  debug.log('init')

  const win = await getPageWindow()
  vueDetector(win, function (Vue) {
    mixinRegister(Vue)
    menuRegister(Vue)
    hotKeyRegister(Vue)

    // 挂载到window上，方便通过控制台调用调试
    win.vueDebugHelper = helper

    debug.log('vue debug helper register success')
    registerStatus = 'success'
  })

  setTimeout(() => {
    if (registerStatus !== 'success') {
      menuRegister(null)
      debug.warn('vue debug helper register failed, please check if vue is loaded .', win.location.href)
    }
  }, 1000 * 10)
})()
