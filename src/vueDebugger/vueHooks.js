/*!
 * @name         vueHooks.js
 * @description  对Vue对象进行的hooks封装
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/10 14:11
 * @github       https://github.com/xxxily
 */
import debug from './debug'
import hookJs from '../libs/hookJs'
import i18n from './i18n'
import {
  filtersMatch
} from './utils'

const hookJsPro = hookJs.hookJsPro()

let vueComponentHook = null

const vueHooks = {
  /* 对extend进行hooks封装，以便进行组件阻断 */
  blockComponents (Vue, config) {
    hookJsPro.before(Vue, 'extend', (args, parentObj, methodName, originMethod, execInfo, ctx) => {
      const extendOpts = args[0]
      // extendOpts.__file && debug.info(`[extendOptions:${extendOpts.name}]`, extendOpts.__file)

      const hasBlockFilter = config.blockFilters && config.blockFilters.length
      if (hasBlockFilter && extendOpts.name && filtersMatch(config.blockFilters, extendOpts.name)) {
        debug.info(`[block component]: name: ${extendOpts.name}`)
        return 'STOP-INVOKE'
      }
    })

    /* 禁止因为阻断组件的创建而导致的错误提示输出，减少不必要的信息噪音 */
    hookJsPro.before(Vue.util, 'warn', (args) => {
      const msg = args[0]
      if (msg.includes('STOP-INVOKE')) {
        return 'STOP-INVOKE'
      }
    })
  },

  hackVueComponent (Vue, callback) {
    if (vueComponentHook) {
      debug.warn('[Vue.component] you have already hacked')
      return
    }

    vueComponentHook = (args, parentObj, methodName, originMethod, execInfo, ctx) => {
      const name = args[0]
      const opts = args[1]

      if (callback instanceof Function) {
        callback.apply(Vue, args)
      } else {
        /* 打印全局组件的注册信息 */
        if (Vue.options.components[name]) {
          debug.warn(`[Vue.component][REPEAT][old-cid:${Vue.options.components[name].cid}]`, name, opts)
        } else {
          debug.log('[Vue.component]', name, opts)
        }
      }
    }

    hookJsPro.before(Vue, 'component', vueComponentHook)
    debug.log(i18n.t('debugHelper.hackVueComponent.hack') + ' (success)')
  },

  unHackVueComponent (Vue) {
    if (vueComponentHook) {
      hookJsPro.unHook(Vue, 'component', 'before', vueComponentHook)
      vueComponentHook = null
      debug.log(i18n.t('debugHelper.hackVueComponent.unhack') + ' (success)')
    } else {
      debug.warn('[Vue.component] you have not hack vue component, not need to unhack')
    }
  },

  hackVueUpdate () {
    //
  }
}

export default vueHooks
