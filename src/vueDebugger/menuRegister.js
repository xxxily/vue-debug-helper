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
import i18n from './i18n'

function menuRegister (Vue) {
  if (!Vue) {
    monkeyMenu.on('not detected ' + i18n.t('issues'), () => {
      window.GM_openInTab('https://github.com/xxxily/vue-debug-helper/issues', {
        active: true,
        insert: true,
        setParent: true
      })
    })
    return false
  }

  // 批量注册菜单
  Object.keys(functionCall).forEach(key => {
    const text = i18n.t(`debugHelper.${key}`)
    if (text && functionCall[key] instanceof Function) {
      monkeyMenu.on(text, functionCall[key])
    }
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

  // monkeyMenu.on(i18n.t('donate'), () => {
  //   window.GM_openInTab('https://cdn.jsdelivr.net/gh/xxxily/vue-debug-helper@main/donate.png', {
  //     active: true,
  //     insert: true,
  //     setParent: true
  //   })
  // })
}

export default menuRegister
