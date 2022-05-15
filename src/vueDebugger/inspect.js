/*!
 * @name         inspect.js
 * @description  vue组件审查模块
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/10 18:25
 * @github       https://github.com/xxxily
 */
import helper from './helper'
import debug from './debug'
import i18n from './i18n'
import functionCall from './functionCall'

const $ = window.$
let currentComponent = null

const inspect = {
  findComponentsByElement (el) {
    let result = null
    let deep = 0
    let parent = el
    while (parent) {
      if (deep >= 50) {
        break
      }

      if (parent.__vue__) {
        result = parent
        break
      }

      deep++
      parent = parent.parentNode
    }

    return result
  },

  initContextMenu () {
    if (this._hasInitContextMenu_) {
      return
    }

    $.contextMenu({
      selector: 'body.vue-debug-helper-inspect-mode',
      zIndex: 2147483647,
      build: function ($trigger, e) {
        const vueComponent = currentComponent ? currentComponent.__vue__ : null

        let componentMenu = {}
        if (vueComponent) {
          componentMenu = {
            consoleComponent: {
              name: `查看组件：${vueComponent._componentName}`,
              icon: 'fa-eye',
              callback: function (key, options) {
                debug.log(`[vueComponent] ${vueComponent._componentTag}`, vueComponent)
              }
            },
            consoleComponentData: {
              name: `查看组件数据：${vueComponent._componentName}`,
              icon: 'fa-eye',
              callback: function (key, options) {
                debug.log(`[vueComponentData] ${vueComponent._componentTag}`, vueComponent.$data)
              }
            },
            consoleComponentProps: {
              name: `查看组件props：${vueComponent._componentName}`,
              icon: 'fa-eye',
              callback: function (key, options) {
                debug.log(`[vueComponentProps] ${vueComponent._componentTag}`, vueComponent.$props)
              }
            },
            consoleComponentChain: {
              name: `查看组件调用链：${vueComponent._componentName}`,
              icon: 'fa-eye',
              callback: function (key, options) {
                debug.log(`[vueComponentMethods] ${vueComponent._componentTag}`, vueComponent._componentChain)
              }
            },
            componentMenuSeparator: '---------'
          }
        }

        const commonMenu = {
          componentsStatistics: {
            name: i18n.t('debugHelper.componentsStatistics'),
            icon: 'fa-thin fa-info-circle',
            callback: functionCall.componentsStatistics
          },
          componentsSummaryStatisticsSort: {
            name: i18n.t('debugHelper.componentsSummaryStatisticsSort'),
            icon: 'fa-thin fa-info-circle',
            callback: functionCall.componentsSummaryStatisticsSort
          },
          destroyStatisticsSort: {
            name: i18n.t('debugHelper.destroyStatisticsSort'),
            icon: 'fa-regular fa-trash',
            callback: functionCall.destroyStatisticsSort
          },
          clearAll: {
            name: i18n.t('debugHelper.clearAll'),
            icon: 'fa-regular fa-close',
            callback: functionCall.clearAll
          },
          statisticsSeparator: '---------',
          printLifeCycleInfo: {
            name: i18n.t('debugHelper.printLifeCycleInfo'),
            icon: 'fa-regular fa-life-ring',
            callback: functionCall.printLifeCycleInfo
          },
          notPrintLifeCycleInfo: {
            name: i18n.t('debugHelper.notPrintLifeCycleInfo'),
            icon: 'fa-regular fa-life-ring',
            callback: functionCall.notPrintLifeCycleInfo
          },
          findComponents: {
            name: i18n.t('debugHelper.findComponents'),
            icon: 'fa-regular fa-search',
            callback: functionCall.findComponents
          },
          blockComponents: {
            name: i18n.t('debugHelper.blockComponents'),
            icon: 'fa-regular fa-ban',
            callback: functionCall.blockComponents
          },
          dd: {
            name: i18n.t('debugHelper.dd'),
            icon: 'fa-regular fa-arrows-alt',
            callback: functionCall.dd
          },
          undd: {
            name: i18n.t('debugHelper.undd'),
            icon: 'fa-regular fa-arrows-alt',
            callback: functionCall.undd
          },
          toggleHackVueComponent: {
            name: i18n.t('debugHelper.toggleHackVueComponent'),
            icon: 'fa-regular fa-bug',
            callback: functionCall.toggleHackVueComponent
          },
          toggleInspect: {
            name: i18n.t('debugHelper.toggleInspect'),
            icon: 'fa-regular fa-eye',
            callback: functionCall.toggleInspect
          },
          togglePerformanceObserver: {
            name: i18n.t('debugHelper.togglePerformanceObserver'),
            icon: 'fa-regular fa-paint-brush',
            callback: functionCall.togglePerformanceObserver
          },
          commonEndSeparator: '---------'
        }

        const menu = {
          callback: function (key, options) {
            debug.log(`[contextMenu] ${key}`)
          },
          items: {
            refresh: {
              name: '刷新页面',
              icon: 'fa-refresh',
              callback: function (key, options) {
                window.location.reload()
              }
            },
            sep0: '---------',
            ...componentMenu,
            ...commonMenu,
            // edit: {
            //   name: '',
            //   icon: 'edit',
            //   // superseeds "global" callback
            //   callback: function (itemKey, opt, e) {
            //     var m = 'edit was clicked'
            //     window.console && console.log(m)
            //   }
            // },
            // cut: { name: 'Cut', icon: 'cut' },
            // copy: { name: 'Copy', icon: 'copy' },
            // paste: { name: 'Paste', icon: 'paste' },
            // delete: { name: 'Delete', icon: 'delete' },
            quit: {
              name: 'Quit',
              icon:
              function ($element, key, item) {
                return 'context-menu-icon context-menu-icon-quit'
              }
            }
          }
        }

        return menu
      }
    })

    this._hasInitContextMenu_ = true
  },

  setOverlay (el) {
    let overlay = document.querySelector('#vue-debugger-overlay')
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = 'vue-debugger-overlay'
      overlay.style.position = 'fixed'
      overlay.style.backgroundColor = 'rgba(65, 184, 131, 0.35)'
      overlay.style.zIndex = 2147483647
      overlay.style.pointerEvents = 'none'
      document.body.appendChild(overlay)
    }

    const rect = el.getBoundingClientRect()

    overlay.style.width = rect.width + 'px'
    overlay.style.height = rect.height + 'px'
    overlay.style.left = rect.x + 'px'
    overlay.style.top = rect.y + 'px'
    overlay.style.display = 'block'

    // overlay.parentElement.addEventListener('contextmenu', function (e) {
    //   debug.log('overlay contextmenu')
    //   e.preventDefault()
    //   e.stopPropagation()
    // }, true)

    $(document.body).addClass('vue-debug-helper-inspect-mode')

    inspect.initContextMenu()
    // console.log(el, rect, el.__vue__._componentTag)
  },

  clearOverlay () {
    $(document.body).removeClass('vue-debug-helper-inspect-mode')
    const overlay = document.querySelector('#vue-debugger-overlay')
    if (overlay) {
      overlay.style.display = 'none'
    }
  },

  init (Vue) {
    document.body.addEventListener('mouseover', (event) => {
      if (!helper.config.inspect.enabled) {
        return
      }

      const componentEl = inspect.findComponentsByElement(event.target)

      if (componentEl) {
        currentComponent = componentEl
        inspect.setOverlay(componentEl)
      } else {
        currentComponent = null
      }
    })
  }
}

export default inspect
