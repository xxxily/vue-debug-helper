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
            devtools.emit('init', Vue)
            debug.info('vue devtools init emit.')
          }
        } else {
          // debug.info(
          //   'Download the Vue Devtools extension for a better development experience:\n' +
          //   'https://github.com/vuejs/vue-devtools'
          // )
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
