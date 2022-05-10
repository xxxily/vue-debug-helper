import './comment'
import helper from './helper'
import debug from './debug'
import mixinRegister from './mixinRegister'
import menuRegister from './menuRegister'
import hotKeyRegister from './hotKeyRegister'
import vueDetector from './vueDetector'
import vueHooks from './vueHooks'
import vueConfigInit from './vueConfig'
import inspect from './inspect'

import {
  isInIframe
} from '../libs/utils/index'

import {
  getPageWindow,
  getPageWindowSync
} from './window'

let registerStatus = 'init'
window._debugMode_ = true

function init (win) {
  if (isInIframe()) {
    debug.log('running in iframe, skip init', window.location.href)
    return false
  }

  if (registerStatus === 'initing') {
    return false
  }

  registerStatus = 'initing'

  vueDetector(win, function (Vue) {
    /* 挂载到window上，方便通过控制台调用调试 */
    helper.Vue = Vue
    win.vueDebugHelper = helper

    /* 注册阻断Vue组件的功能 */
    vueHooks.blockComponents(Vue, helper.config)

    /* 注册打印全局组件注册信息的功能 */
    if (helper.config.hackVueComponent) {
      vueHooks.hackVueComponent(Vue)
    }

    /* 对Vue相关配置进行初始化 */
    vueConfigInit(Vue, helper.config)

    mixinRegister(Vue)
    menuRegister(Vue)
    hotKeyRegister(Vue)

    inspect.init(Vue)

    debug.log('vue debug helper register success')
    registerStatus = 'success'
  })

  setTimeout(() => {
    if (registerStatus !== 'success') {
      menuRegister(null)
      debug.warn('vue debug helper register failed, please check if vue is loaded .', win.location.href)
    }
  }, 1000 * 10)
}

let win = null
try {
  win = getPageWindowSync()
  if (win) {
    init(win)
    debug.log('getPageWindowSync success')
  }
} catch (e) {
  debug.error('getPageWindowSync failed', e)
}

;(async function () {
  if (!win) {
    win = await getPageWindow()
    init(win)
  }
})()
