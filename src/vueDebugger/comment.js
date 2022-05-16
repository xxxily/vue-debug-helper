// ==UserScript==
// @name         vue-debug-helper
// @name:en      vue-debug-helper
// @name:zh      Vue调试分析助手
// @name:zh-TW   Vue調試分析助手
// @name:ja      Vueデバッグ分析アシスタント
// @namespace    https://github.com/xxxily/vue-debug-helper
// @homepage     https://github.com/xxxily/vue-debug-helper
// @version      0.0.16
// @description  Vue components debug helper
// @description:en  Vue components debug helper
// @description:zh  Vue组件探测、统计、分析辅助脚本
// @description:zh-TW  Vue組件探測、統計、分析輔助腳本
// @description:ja  Vueコンポーネントの検出、統計、分析補助スクリプト
// @author       ankvps
// @icon         https://cdn.jsdelivr.net/gh/xxxily/vue-debug-helper@main/logo.png
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_openInTab
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @require      https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/core.js
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/md5.js
// @require      https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery-contextmenu@2.9.2/dist/jquery.contextMenu.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery-contextmenu@2.9.2/dist/jquery.ui.position.min.js
// @resource     contextMenuCss https://cdn.jsdelivr.net/npm/jquery-contextmenu@2.9.2/dist/jquery.contextMenu.min.css
// @run-at       document-start
// @connect      127.0.0.1
// @license      GPL
// ==/UserScript==
(function (w) { if (w) { w._vueDebugHelper_ = 'https://github.com/xxxily/vue-debug-helper' } })()
