/*!
 * @name         vueConfig.js
 * @description  对Vue的配置进行修改
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/10 15:15
 * @github       https://github.com/xxxily
 */
import debug from './debug'
import {
  getVueDevtools
} from './utils'

function vueConfigInit (Vue, config) {
  if (Vue.config) {
    /* 自动开启Vue的调试模式 */
    if (config.devtools) {
      Vue.config.debug = true
      Vue.config.devtools = true
      Vue.config.performance = true

      setTimeout(() => {
        const devtools = getVueDevtools()
        if (devtools) {
          if (!devtools.enabled) {
            if (/^3\.*/.test(Vue.version)) {
              // https://github.com/vuejs/core/blob/main/packages/runtime-core/src/devtools.ts
              devtools.emit('app:init', Vue, Vue.version, {
                Fragment: 'Fragment',
                Text: 'Text',
                Comment: 'Comment',
                Static: 'Static'
              })

              const unmount = Vue.unmount.bind(Vue)
              Vue.unmount = function () {
                devtools.emit('app:unmount', Vue)
                unmount()
              }
            } else {
              // https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/index.js
              devtools.emit('init', Vue)

              // 注册vuex store，参考vuex源码
              if (Vue.$store) {
                Vue.$store._devtoolHook = devtools
                devtools.emit('vuex:init', Vue.$store)
                devtools.on('vuex:travel-to-state', function (targetState) {
                  Vue.$store.replaceState(targetState)
                })
                Vue.$store.subscribe(function (mutation, state) {
                  devtools.emit('vuex:mutation', mutation, state)
                })
              }
            }

            debug.info('vue devtools init emit.')
          }
        } else {
          debug.info('vue devtools check failed.')
        }
      }, 200)
    } else {
      Vue.config.debug = false
      Vue.config.devtools = false
      Vue.config.performance = false
    }
  } else {
    debug.log('Vue.config is not defined')
  }
}

export default vueConfigInit
