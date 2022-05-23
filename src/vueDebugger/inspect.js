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

const overlaySelector = 'vue-debugger-overlay'
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

  getComponentInstance (el) {
    let vueComponent = el && el.__vue__ ? el.__vue__ : null

    /* 忽略transition */
    if (vueComponent && vueComponent?.$options._componentTag === 'transition' && vueComponent.$parent) {
      vueComponent = vueComponent.$parent
    }

    return vueComponent
  },

  initContextMenu () {
    if (this._hasInitContextMenu_) {
      return
    }

    function createComponentMenuItem (vueComponent, deep = 0) {
      let componentMenu = {}
      if (vueComponent) {
        helper.methods.initComponentInfo(vueComponent)

        componentMenu = {
          consoleComponent: {
            name: `${i18n.t('contextMenu.consoleComponent')} <${vueComponent._componentName}>`,
            icon: 'fa-eye',
            callback: function (key, options) {
              debug.log(`[vueComponent] ${vueComponent._componentTag}`, vueComponent)
            }
          },
          consoleComponentData: {
            name: `${i18n.t('contextMenu.consoleComponentData')} <${vueComponent._componentName}>`,
            icon: 'fa-eye',
            callback: function (key, options) {
              debug.log(`[vueComponentData] ${vueComponent._componentTag}`, vueComponent.$data)
            }
          },
          consoleComponentProps: {
            name: `${i18n.t('contextMenu.consoleComponentProps')} <${vueComponent._componentName}>`,
            icon: 'fa-eye',
            callback: function (key, options) {
              debug.log(`[vueComponentProps] ${vueComponent._componentTag}`, vueComponent.$props)
            }
          }
          // consoleComponentChain: {
          //   name: `${i18n.t('contextMenu.consoleComponentChain')} <${vueComponent._componentName}>`,
          //   icon: 'fa-eye',
          //   callback: function (key, options) {
          //     debug.log(`[vueComponentMethods] ${vueComponent._componentTag}`, vueComponent._componentChain)
          //   }
          // }
        }
      }

      if (vueComponent.$parent && deep <= 5) {
        componentMenu.parentComponent = {
          name: `${i18n.t('contextMenu.consoleParentComponent')} <${vueComponent.$parent._componentName}>`,
          icon: 'fa-eye',
          items: createComponentMenuItem(vueComponent.$parent, deep + 1)
        }
      }

      const file = vueComponent.options?.__file || vueComponent.$options?.__file || ''
      let copyFilePath = {}
      if (file) {
        copyFilePath = {
          copyFilePath: {
            name: `${i18n.t('contextMenu.copyFilePath')}`,
            icon: 'fa-copy',
            callback: function (key, options) {
              debug.log(`[componentFilePath ${vueComponent._componentName}] ${file}`)
              copyToClipboard(file)
            }
          }
        }
      }

      componentMenu.componentAction = {
        name: `${i18n.t('contextMenu.componentAction')} <${vueComponent._componentName}>`,
        icon: 'fa-cog',
        items: {
          ...copyFilePath,
          copyComponentName: {
            name: `${i18n.t('contextMenu.copyComponentName')} <${vueComponent._componentName}>`,
            icon: 'fa-copy',
            callback: function (key, options) {
              copyToClipboard(vueComponent._componentName)
            }
          },
          copyComponentData: {
            name: `${i18n.t('contextMenu.copyComponentData')} <${vueComponent._componentName}>`,
            icon: 'fa-copy',
            callback: function (key, options) {
              const data = JSON.stringify(vueComponent.$data, null, 2)
              debug.log(`[vueComponentData] ${vueComponent._componentName}`, JSON.parse(data))
              debug.log(data)
              copyToClipboard(data)
            }
          },
          copyComponentProps: {
            name: `${i18n.t('contextMenu.copyComponentProps')} <${vueComponent._componentName}>`,
            icon: 'fa-copy',
            callback: function (key, options) {
              const props = JSON.stringify(vueComponent.$props, null, 2)
              debug.log(`[vueComponentProps] ${vueComponent._componentName}`, JSON.parse(props))
              debug.log(props)
              copyToClipboard(props)
            }
          },
          // copyComponentTag: {
          //   name: `${i18n.t('contextMenu.copyComponentTag')} <${vueComponent._componentName}>`,
          //   icon: 'fa-copy',
          //   callback: function (key, options) {
          //     copyToClipboard(vueComponent._componentTag)
          //   }
          // },
          copyComponentUid: {
            name: `${i18n.t('contextMenu.copyComponentUid')} -> ${vueComponent._uid}`,
            icon: 'fa-copy',
            callback: function (key, options) {
              copyToClipboard(vueComponent._uid)
            }
          },
          copyComponentChian: {
            name: `${i18n.t('contextMenu.copyComponentChian')}`,
            icon: 'fa-copy',
            callback: function (key, options) {
              debug.log(`[vueComponentChain] ${vueComponent._componentName}`, vueComponent._componentChain)
              copyToClipboard(vueComponent._componentChain)
            }
          },
          findComponents: {
            name: `${i18n.t('contextMenu.findComponents')} <${vueComponent._componentName}>`,
            icon: 'fa-search',
            callback: function (key, options) {
              functionCall.findComponents(vueComponent._componentName)
            }
          },
          printLifeCycleInfo: {
            name: `${i18n.t('contextMenu.printLifeCycleInfo')} <${vueComponent._componentName}>`,
            icon: 'fa-print',
            callback: function (key, options) {
              functionCall.printLifeCycleInfo(vueComponent._componentName)
            }
          },
          blockComponents: {
            name: `${i18n.t('contextMenu.blockComponents')} <${vueComponent._componentName}>`,
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
      className: 'vue-debug-helper-context-menu',
      build: function ($trigger, e) {
        const conf = helper.config
        const vueComponent = inspect.getComponentInstance(currentComponent)

        let componentMenu = {}
        if (vueComponent) {
          componentMenu = createComponentMenuItem(vueComponent)
          componentMenu.componentMenuSeparator = '---------'
        }

        const componentsStatisticsInfo = {
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
          }
        }

        const commonMenu = {
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
          componentFunSeparator: '---------',
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
          toggleBlockAjax: {
            name: conf.blockAjax.enabled ? i18n.t('debugHelper.blockAjax.disable') : i18n.t('debugHelper.blockAjax.enabled'),
            icon: 'fa-regular fa-ban',
            callback: functionCall.toggleBlockAjax
          },
          togglePerformanceObserver: {
            name: conf.performanceObserver.enabled ? i18n.t('debugHelper.performanceObserverStatus.off') : i18n.t('debugHelper.performanceObserverStatus.on'),
            icon: 'fa-regular fa-paint-brush',
            callback: functionCall.togglePerformanceObserver
          },
          measureSelectorInterval: {
            name: i18n.t('debugHelper.measureSelectorInterval'),
            icon: 'fa-regular fa-clock-o',
            callback: functionCall.measureSelectorInterval
          },
          commonEndSeparator: '---------'
        }

        const moreMenu = {
          ...(conf.contextMenu.simplify ? commonMenu : {}),
          toggleSimplifyMode: {
            name: conf.contextMenu.simplify ? i18n.t('debugHelper.simplifyMode.disable') : i18n.t('debugHelper.simplifyMode.enabled'),
            icon: 'fa-regular fa-compress',
            callback: functionCall.toggleSimplifyMode
          },
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
            ...componentsStatisticsInfo,
            statisticsSeparator: '---------',
            ...(conf.contextMenu.simplify ? {} : commonMenu),
            more: {
              name: i18n.t('contextMenu.more'),
              icon: 'fa-ellipsis-h',
              items: {
                ...moreMenu
              }
            },
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
    let overlay = document.querySelector('#' + overlaySelector)
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = overlaySelector

      const infoBox = document.createElement('div')
      infoBox.className = 'vue-debugger-component-info'

      const styleDom = document.createElement('style')
      styleDom.appendChild(document.createTextNode(`
        .vue-debug-helper-context-menu {
          font-size: 14px;
        }
        #${overlaySelector} {
          position: fixed;
          z-index: 2147483647;
          background-color: rgba(65, 184, 131, 0.15);
          padding: 5px;
          font-size: 11px;
          pointer-events: none;
          box-size: border-box;
          border-radius: 3px;
          overflow: visible;
        }

        #${overlaySelector} .vue-debugger-component-info {
          position: absolute;
          top: -30px;
          left: 0;
          line-height: 1.5;
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          background-color: #fff;
          font-family: monospace; 
          font-size: 11px;
          color: rgb(51, 51, 51); 
          text-align: center; 
          border: 1px solid rgba(65, 184, 131, 0.5); 
          background-clip: padding-box;
          pointer-events: none;
          white-space: nowrap;
        }
      `))

      overlay.appendChild(infoBox)
      document.body.appendChild(styleDom)
      document.body.appendChild(overlay)
    }

    /* 批量设置样式，减少样式扰动 */
    const rect = el.getBoundingClientRect()
    const overlayStyle = [
      `width: ${rect.width}px;`,
      `height: ${rect.height}px;`,
      `top: ${rect.top}px;`,
      `left: ${rect.left}px;`,
      'display: block;'
    ].join(' ')
    overlay.setAttribute('style', overlayStyle)

    const vm = inspect.getComponentInstance(el)
    if (vm) {
      helper.methods.initComponentInfo(vm)
      const name = vm._componentName || vm._componentTag || vm._uid
      const infoBox = overlay.querySelector('.vue-debugger-component-info')

      infoBox.innerHTML = [
        '<span style="opacity: 0.6;">&lt;</span>',
        `<span style="font-weight: bold; color: rgb(9, 171, 86);">${name}</span>`,
        '<span style="opacity: 0.6;">&gt;</span>',
        `<span style="opacity: 0.5; margin-left: 6px;">${Math.round(rect.width)}<span style="margin-right: 2px; margin-left: 2px;">×</span>${Math.round(rect.height)}</span>`
      ].join('')

      rect.y < 32 ? (infoBox.style.top = '0') : (infoBox.style.top = '-30px')
    }

    $(document.body).addClass('vue-debug-helper-inspect-mode')
    inspect.initContextMenu()
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
