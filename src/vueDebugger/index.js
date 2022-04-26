import './comment'
import debug from './debug'
import mixinRegister from './mixinRegister'
import menuRegister from './menuRegister'
import hotKeyRegister from './hotKeyRegister'

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
  if (win.Vue) {
    mixinRegister(win.Vue)
    menuRegister()
    hotKeyRegister()
    debug.log('vue debug helper register success')
    registerStatus = 'success'
  } else {
    win.__originalVue__ = null
    Object.defineProperty(win, 'Vue', {
      enumerable: true,
      configurable: true,
      get () {
        return win.__originalVue__
      },
      set (value) {
        win.__originalVue__ = value

        if (value && value.mixin) {
          mixinRegister(value)
          menuRegister()
          hotKeyRegister()
          debug.log('vue debug helper register success')
          registerStatus = 'success'
        }
      }
    })
  }

  setTimeout(() => {
    if (registerStatus !== 'success') {
      debug.warn('vue debug helper register failed, please check if vue is loaded .', win.location.href)
    }
  }, 5000)
})()
