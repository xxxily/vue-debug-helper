import './comment'
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

    debug.log('vue debug helper register success')
    registerStatus = 'success'
  })

  setTimeout(() => {
    if (registerStatus !== 'success') {
      debug.warn('vue debug helper register failed, please check if vue is loaded .', win.location.href)
    }
    menuRegister(null)
  }, 1000 * 10)
})()
