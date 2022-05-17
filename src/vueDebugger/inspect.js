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
import {
  copyToClipboard
} from './utils'

const $ = window.$
let currentComponent = null
// let parentComponent = null
// let grandParentComponent = null
// let greatGrandParentComponent = null

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

    function createComponentMenuItem (vueComponent, deep = 0) {
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
          }
        }
      }

      if (vueComponent.$parent && deep <= 10) {
        componentMenu.parentComponent = {
          name: `查看父组件：${vueComponent.$parent._componentName}`,
          icon: 'fa-eye',
          items: createComponentMenuItem(vueComponent.$parent, deep + 1)
        }
      }

      const file = vueComponent.options?.__file || vueComponent.$options?.__file || ''
      let copyFilePath = {}
      if (file) {
        copyFilePath = {
          copyFilePath: {
            name: '复制组件文件路径',
            icon: 'fa-copy',
            callback: function (key, options) {
              debug.log(`[componentFilePath ${vueComponent._componentName}] ${file}`)
              copyToClipboard(file)
            }
          }
        }
      }

      componentMenu.componentAction = {
        name: `相关操作：${vueComponent._componentName}`,
        icon: 'fa-cog',
        items: {
          ...copyFilePath,
          copyComponentName: {
            name: `复制组件名称：${vueComponent._componentName}`,
            icon: 'fa-copy',
            callback: function (key, options) {
              copyToClipboard(vueComponent._componentName)
            }
          },
          copyComponentData: {
            name: `复制组件$data：${vueComponent._componentName}`,
            icon: 'fa-copy',
            callback: function (key, options) {
              const data = JSON.stringify(vueComponent.$data, null, 2)
              debug.log(`[vueComponentData] ${vueComponent._componentName}`, JSON.parse(data))
              debug.log(data)
              copyToClipboard(data)
            }
          },
          copyComponentProps: {
            name: `复制组件$props：${vueComponent._componentName}`,
            icon: 'fa-copy',
            callback: function (key, options) {
              const props = JSON.stringify(vueComponent.$props, null, 2)
              debug.log(`[vueComponentProps] ${vueComponent._componentName}`, JSON.parse(props))
              debug.log(props)
              copyToClipboard(props)
            }
          },
          // copyComponentTag: {
          //   name: `复制组件标签：${vueComponent._componentTag}`,
          //   icon: 'fa-copy',
          //   callback: function (key, options) {
          //     copyToClipboard(vueComponent._componentTag)
          //   }
          // },
          copyComponentUid: {
            name: `复制组件uid：${vueComponent._uid}`,
            icon: 'fa-copy',
            callback: function (key, options) {
              copyToClipboard(vueComponent._uid)
            }
          },
          copyComponentChian: {
            name: '复制组件调用链',
            icon: 'fa-copy',
            callback: function (key, options) {
              debug.log(`[vueComponentChain] ${vueComponent._componentName}`, vueComponent._componentChain)
              copyToClipboard(vueComponent._componentChain)
            }
          },
          findComponents: {
            name: `查找组件：${vueComponent._componentName}`,
            icon: 'fa-search',
            callback: function (key, options) {
              functionCall.findComponents(vueComponent._componentName)
            }
          },
          printLifeCycleInfo: {
            name: `打印生命周期信息：${vueComponent._componentName}`,
            icon: 'fa-print',
            callback: function (key, options) {
              functionCall.printLifeCycleInfo(vueComponent._componentName)
            }
          },
          blockComponents: {
            name: `阻断组件：${vueComponent._componentName}`,
            icon: 'fa-ban',
            callback: function (key, options) {
              functionCall.blockComponents(vueComponent._componentName)
            }
          }
        }
      }

      return componentMenu
    }

    $.contextMenu({
      selector: 'body.vue-debug-helper-inspect-mode',
      zIndex: 2147483647,
      build: function ($trigger, e) {
        const conf = helper.config
        const vueComponent = currentComponent ? currentComponent.__vue__ : null

        let componentMenu = {}
        if (vueComponent) {
          componentMenu = createComponentMenuItem(vueComponent)
          componentMenu.componentMenuSeparator = '---------'
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
          findComponents: {
            name: i18n.t('debugHelper.findComponents'),
            icon: 'fa-regular fa-search',
            callback: () => {
              functionCall.findComponents()
            }
          },
          blockComponents: {
            name: i18n.t('debugHelper.blockComponents'),
            icon: 'fa-regular fa-ban',
            callback: () => {
              functionCall.blockComponents()
            }
          },
          printLifeCycleInfo: {
            name: conf.lifecycle.show ? i18n.t('debugHelper.notPrintLifeCycleInfo') : i18n.t('debugHelper.printLifeCycleInfo'),
            icon: 'fa-regular fa-life-ring',
            callback: () => {
              conf.lifecycle.show ? functionCall.notPrintLifeCycleInfo() : functionCall.printLifeCycleInfo()
            }
          },
          dd: {
            name: conf.dd.enabled ? i18n.t('debugHelper.undd') : i18n.t('debugHelper.dd'),
            icon: 'fa-regular fa-arrows-alt',
            callback: conf.dd.enabled ? functionCall.undd : functionCall.dd
          },
          toggleHackVueComponent: {
            name: conf.hackVueComponent ? i18n.t('debugHelper.hackVueComponent.unhack') : i18n.t('debugHelper.hackVueComponent.hack'),
            icon: 'fa-regular fa-bug',
            callback: functionCall.toggleHackVueComponent
          },
          togglePerformanceObserver: {
            name: conf.performanceObserver.enabled ? i18n.t('debugHelper.performanceObserverStatus.off') : i18n.t('debugHelper.performanceObserverStatus.on'),
            icon: 'fa-regular fa-paint-brush',
            callback: functionCall.togglePerformanceObserver
          },
          toggleAjaxCache: {
            name: conf.ajaxCache.enabled ? i18n.t('debugHelper.ajaxCacheStatus.off') : i18n.t('debugHelper.ajaxCacheStatus.on'),
            icon: 'fa-regular fa-database',
            callback: functionCall.toggleAjaxCache
          },
          clearAjaxCache: {
            name: i18n.t('debugHelper.clearAjaxCache'),
            icon: 'fa-regular fa-database',
            callback: functionCall.clearAjaxCache
          },
          measureSelectorInterval: {
            name: i18n.t('debugHelper.measureSelectorInterval'),
            icon: 'fa-regular fa-clock-o',
            callback: functionCall.measureSelectorInterval
          },
          commonEndSeparator: '---------',
          toggleInspect: {
            name: conf.inspect.enabled ? i18n.t('debugHelper.inspectStatus.off') : i18n.t('debugHelper.inspectStatus.on'),
            icon: 'fa-regular fa-eye',
            callback: functionCall.toggleInspect
          }
        }

        const menu = {
          callback: function (key, options) {
            debug.log(`[contextMenu] ${key}`)
          },
          items: {
            refresh: {
              name: i18n.t('refreshPage'),
              icon: 'fa-refresh',
              callback: function (key, options) {
                window.location.reload()
              }
            },
            sep0: '---------',
            ...componentMenu,
            ...commonMenu,
            quit: {
              name: i18n.t('quit'),
              icon: 'fa-close',
              callback: function ($element, key, item) {
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
