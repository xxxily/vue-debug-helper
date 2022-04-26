/*!
 * @name         i18n.js
 * @description  vue-debug-helper的国际化配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/26 14:56
 * @github       https://github.com/xxxily
 */
import I18n from '../libs/I18n/index'
import langMessage from './locale/core-lang/index'

const i18n = new I18n({
  defaultLanguage: 'en',
  /* 指定当前要是使用的语言环境，默认无需指定，会自动读取 */
  // locale: 'zh-TW',
  languages: langMessage
})

export default i18n
