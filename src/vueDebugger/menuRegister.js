/*!
 * @name         menu.js
 * @description  vue-debug-helper的菜单配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/25 22:28
 * @github       https://github.com/xxxily
 */
import helper from './helper'
import monkeyMenu from './monkeyMenu'
import debug from './debug'
import I18n from '../libs/I18n/index'
import langMessage from './locale/core-lang/index'

const i18n = new I18n({
  defaultLanguage: 'en',
  /* 指定当前要是使用的语言环境，默认无需指定，会自动读取 */
  // locale: 'zh-TW',
  languages: langMessage
})

function menuRegister () {
  monkeyMenu.on('查看vueDebugHelper对象', () => {
    debug.log('vueDebugHelper对象', helper)
  })

  monkeyMenu.on('当前存活组件统计', () => {
    debug.log('当前存活组件统计', helper.methods.componentsStatistics())
  })

  monkeyMenu.on('已销毁组件统计', () => {
    debug.log('已销毁组件统计', helper.methods.destroyStatisticsSort())
  })

  monkeyMenu.on('全部组件混合统计', () => {
    debug.log('全部组件混合统计', helper.methods.componentsSummaryStatisticsSort())
  })

  monkeyMenu.on('组件存活时间信息', () => {
    debug.log('组件存活时间信息', helper.methods.getDestroyByDuration())
  })

  monkeyMenu.on('清空统计信息', () => {
    debug.log('清空统计信息', helper.methods.clearAll())
  })

  monkeyMenu.on('数据注入（dd）', () => {
    const filter = window.prompt('组件过滤器（如果为空，则对所有组件注入）', '')
    const size = window.prompt('指定注入数据的大小值（默认1Mb）', 1024)
    helper.methods.dd(filter, Number(size))
  })

  monkeyMenu.on('取消数据注入（undd）', () => {
    helper.methods.undd()
  })

  // monkeyMenu.on('i18n.t('setting')', () => {
  //   window.alert('功能开发中，敬请期待...')
  // })

  monkeyMenu.on(i18n.t('issues'), () => {
    window.GM_openInTab('https://github.com/xxxily/vue-debug-helper/issues', {
      active: true,
      insert: true,
      setParent: true
    })
  })

  monkeyMenu.on(i18n.t('donate'), () => {
    window.GM_openInTab('https://cdn.jsdelivr.net/gh/xxxily/h5player@master/donate.png', {
      active: true,
      insert: true,
      setParent: true
    })
  })
}

export default menuRegister
