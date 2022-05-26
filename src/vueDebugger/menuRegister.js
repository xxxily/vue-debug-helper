/*!
 * @name         menu.js
 * @description  vue-debug-helper的菜单配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/25 22:28
 * @github       https://github.com/xxxily
 */
import monkeyMenu from './monkeyMenu'
import functionCall from './functionCall'
import helper from './helper'
import i18n from './i18n'
import debug from './debug'
import {
  openInTab
} from './utils'

const vueStatus = {
  status: ''
}

function menuRegister (vueDetectStatus) {
  vueStatus.status = vueDetectStatus

  function menuBuilder () {
    const conf = helper.config
    let menuList = []

    if (vueStatus.status) {
      if (vueStatus.status === 'initing') {
        menuList.push({
          title: 'Vue Detecting...',
          fn: () => { debug.log('Vue Detecting...') }
        })
      } else if (vueStatus.status === 'failed') {
        menuList.push({
          title: 'Vue not detected',
          fn: () => { debug.log('Vue not detected') }
        })
      } else if (vueStatus.status === 'success') {
        const vueMenu = [
          {
            title: conf.inspect.enabled ? i18n.t('debugHelper.inspectStatus.off') : i18n.t('debugHelper.inspectStatus.on'),
            fn: () => { functionCall.toggleInspect() }
          },
          {
            title: i18n.t('debugHelper.viewVueDebugHelperObject'),
            fn: () => { functionCall.viewVueDebugHelperObject() }
          },
          {
            title: i18n.t('debugHelper.componentsStatistics'),
            fn: () => { functionCall.componentsStatistics() }
          },
          {
            title: i18n.t('debugHelper.componentsSummaryStatisticsSort'),
            fn: () => { functionCall.componentsSummaryStatisticsSort() }
          },
          {
            title: i18n.t('debugHelper.destroyStatisticsSort'),
            fn: () => { functionCall.destroyStatisticsSort() }
          },
          {
            title: i18n.t('debugHelper.clearAll'),
            fn: () => { functionCall.clearAll() }
          },
          {
            title: i18n.t('debugHelper.getDestroyByDuration'),
            fn: () => { functionCall.getDestroyByDuration() }
          },
          {
            title: i18n.t('debugHelper.findComponents'),
            fn: () => { functionCall.findComponents() }
          },
          {
            title: i18n.t('debugHelper.blockComponents'),
            fn: () => { functionCall.blockComponents() }
          },
          {
            title: conf.lifecycle.show ? i18n.t('debugHelper.notPrintLifeCycleInfo') : i18n.t('debugHelper.printLifeCycleInfo'),
            fn: () => { conf.lifecycle.show ? functionCall.notPrintLifeCycleInfo() : functionCall.printLifeCycleInfo() }
          },
          {
            title: conf.dd.enabled ? i18n.t('debugHelper.undd') : i18n.t('debugHelper.dd'),
            fn: () => { conf.dd.enabled ? functionCall.undd() : functionCall.dd() }
          },
          {
            title: conf.hackVueComponent ? i18n.t('debugHelper.hackVueComponent.unhack') : i18n.t('debugHelper.hackVueComponent.hack'),
            fn: () => { functionCall.toggleHackVueComponent() }
          },
          {
            title: helper.config.devtools ? i18n.t('debugHelper.devtools.disable') : i18n.t('debugHelper.devtools.enabled'),
            fn: () => { helper.methods.toggleDevtools() }
          }
        ]
        menuList = menuList.concat(vueMenu)
      }
    }

    const commonMenu = [
      {
        title: conf.ajaxCache.enabled ? i18n.t('debugHelper.ajaxCacheStatus.off') : i18n.t('debugHelper.ajaxCacheStatus.on'),
        fn: () => { functionCall.toggleAjaxCache() }
      },
      {
        title: i18n.t('debugHelper.clearAjaxCache'),
        fn: () => { functionCall.clearAjaxCache() }
      },
      {
        title: conf.blockAjax.enabled ? i18n.t('debugHelper.blockAjax.disable') : i18n.t('debugHelper.blockAjax.enabled'),
        fn: () => { functionCall.toggleBlockAjax() }
      },
      {
        title: conf.performanceObserver.enabled ? i18n.t('debugHelper.performanceObserverStatus.off') : i18n.t('debugHelper.performanceObserverStatus.on'),
        fn: () => { functionCall.togglePerformanceObserver() }
      },
      {
        title: i18n.t('debugHelper.measureSelectorInterval'),
        fn: () => { functionCall.measureSelectorInterval() }
      },
      {
        title: i18n.t('issues'),
        fn: () => { openInTab('https://github.com/xxxily/vue-debug-helper/issues') }
      },
      {
        disable: true,
        title: i18n.t('donate'),
        fn: () => { openInTab('https://cdn.jsdelivr.net/gh/xxxily/vue-debug-helper@main/donate.png') }
      }
    ]

    menuList = menuList.concat(commonMenu)
    return menuList
  }

  /* 注册动态菜单 */
  monkeyMenu.build(menuBuilder)
}

export default menuRegister
