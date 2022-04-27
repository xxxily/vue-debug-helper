// ==UserScript==
// @name         vue-debug-helper
// @name:en      vue-debug-helper
// @name:zh      Vue调试分析助手
// @name:zh-TW   Vue調試分析助手
// @name:ja      Vueデバッグ分析アシスタント
// @namespace    https://github.com/xxxily/vue-debug-helper
// @homepage     https://github.com/xxxily/vue-debug-helper
// @version      0.0.4
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
// @run-at       document-start
// @connect      127.0.0.1
// @license      GPL
// ==/UserScript==
(function (w) { if (w) { w._vueDebugHelper_ = 'https://github.com/xxxily/vue-debug-helper'; } })();

/**
 * 对特定数据结构的对象进行排序
 * @param {object} obj 一个对象，其结构应该类似于：{key1: [], key2: []}
 * @param {boolean} reverse -可选 是否反转、降序排列，默认为false
 * @param {object} opts -可选 指定数组的配置项，默认为{key: 'key', value: 'value'}
 * @param {object} opts.key -可选 指定对象键名的别名，默认为'key'
 * @param {object} opts.value -可选 指定对象值的别名，默认为'value'
 * @returns {array} 返回一个数组，其结构应该类似于：[{key: key1, value: []}, {key: key2, value: []}]
 */
const objSort = (obj, reverse, opts = { key: 'key', value: 'value' }) => {
  const arr = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && Array.isArray(obj[key])) {
      const tmpObj = {};
      tmpObj[opts.key] = key;
      tmpObj[opts.value] = obj[key];
      arr.push(tmpObj);
    }
  }

  arr.sort((a, b) => {
    return a[opts.value].length - b[opts.value].length
  });

  reverse && arr.reverse();
  return arr
};

/**
 * 根据指定长度创建空白数据
 * @param {number} size -可选 指str的重复次数，默认为1024次，如果str为单个单字节字符，则意味着默认产生1Mb的空白数据
 * @param {string|number|any} str - 可选 指定数据的字符串，默认为'd'
 */
function createEmptyData (count = 1024, str = 'd') {
  const arr = [];
  arr.length = count + 1;
  return arr.join(str)
}

window.vueDebugHelper = {
  /* 存储全部未被销毁的组件对象 */
  components: {},
  /* 存储全部创建过的组件的概要信息，即使销毁了概要信息依然存在 */
  componentsSummary: {},
  /* 基于componentsSummary的组件情况统计 */
  componentsSummaryStatistics: {},
  /* 已销毁的组件概要信息列表 */
  destroyList: [],
  /* 基于destroyList的组件情况统计 */
  destroyStatistics: {},
  /* 给组件注入空白数据的配置信息 */
  ddConfig: {
    enabled: false,
    filters: [],
    size: 1024
  }
};

const helper = window.vueDebugHelper;

const methods = {
  objSort,
  createEmptyData,
  /* 清除全部helper的全部记录数据，以便重新统计 */
  clearAll () {
    helper.components = {};
    helper.componentsSummary = {};
    helper.componentsSummaryStatistics = {};
    helper.destroyList = [];
    helper.destroyStatistics = {};
  },

  /**
   * 对当前的helper.components进行统计与排序
   * 如果一直没运行过清理函数，则表示统计页面创建至今依然存活的组件对象
   * 运行过清理函数，则表示统计清理后新创建且至今依然存活的组件对象
   */
  componentsStatistics (reverse = true) {
    const tmpObj = {};

    Object.keys(helper.components).forEach(key => {
      const component = helper.components[key];

      tmpObj[component._componentName]
        ? tmpObj[component._componentName].push(component)
        : (tmpObj[component._componentName] = [component]);
    });

    return objSort(tmpObj, reverse, {
      key: 'componentName',
      value: 'componentInstance'
    })
  },

  /**
   * 对componentsSummaryStatistics进行排序输出，以便可以直观查看组件的创建情况
   */
  componentsSummaryStatisticsSort (reverse = true) {
    return objSort(helper.componentsSummaryStatistics, reverse, {
      key: 'componentName',
      value: 'componentsSummary'
    })
  },

  /**
   * 对destroyList进行排序输出，以便可以直观查看组件的销毁情况
   */
  destroyStatisticsSort (reverse = true) {
    return objSort(helper.destroyStatistics, reverse, {
      key: 'componentName',
      value: 'destroyList'
    })
  },

  /**
   * 对destroyList进行排序输出，以便可以直观查看组件的销毁情况
   */
  getDestroyByDuration (duration = 1000) {
    const destroyList = helper.destroyList;
    const destroyListLength = destroyList.length;
    const destroyListDuration = destroyList.map(item => item.duration).sort();
    const maxDuration = Math.max(...destroyListDuration);
    const minDuration = Math.min(...destroyListDuration);
    const avgDuration =
      destroyListDuration.reduce((a, b) => a + b, 0) / destroyListLength;
    const durationRange = maxDuration - minDuration;
    const durationRangePercent = (duration - minDuration) / durationRange;

    return {
      destroyList,
      destroyListLength,
      destroyListDuration,
      maxDuration,
      minDuration,
      avgDuration,
      durationRange,
      durationRangePercent
    }
  },

  /**
   * 获取组件的调用链信息
   */
  getComponentChain (component, moreDetail = false) {
    const result = [];
    let current = component;
    let deep = 0;

    while (current && deep < 50) {
      deep++;

      if (moreDetail) {
        result.push({
          name: current._componentName,
          componentsSummary: helper.componentsSummary[current._uid] || null
        });
      } else {
        result.push(current._componentName);
      }

      current = current.$parent;
    }

    if (moreDetail) {
      return result
    } else {
      return result.join(' -> ')
    }
  },

  /**
   * 给指定组件注入大量空数据，以便观察组件的内存泄露情况
   * @param {Array|string} filter -必选 指定组件的名称，如果为空则表示注入所有组件
   * @param {number} size -可选 指定注入空数据的大小，单位Kb，默认为1024Kb，即1Mb
   * @returns
   */
  dd (filter, size = 1024) {
    filter = filter || [];

    /* 如果是字符串，则支持通过, | 两个符号来指定多个组件名称的过滤器 */
    if (typeof filter === 'string') {
      /* 移除前后的, |分隔符，防止出现空字符的过滤规则 */
      filter.replace(/^(,|\|)/, '').replace(/(,|\|)$/, '');

      if (/\|/.test(filter)) {
        filter = filter.split('|');
      } else {
        filter = filter.split(',');
      }
    }

    helper.ddConfig = {
      enabled: true,
      filters: filter,
      size
    };
  },
  /* 禁止给组件注入空数据 */
  undd () {
    helper.ddConfig = {
      enabled: false,
      filters: [],
      size: 1024
    };

    /* 删除之前注入的数据 */
    Object.keys(helper.components).forEach(key => {
      const component = helper.components[key];
      component.$data && delete component.$data.__dd__;
    });
  }
};

helper.methods = methods;

class Debug {
  constructor (msg) {
    const t = this;
    msg = msg || 'debug message:';
    t.log = t.createDebugMethod('log', null, msg);
    t.error = t.createDebugMethod('error', null, msg);
    t.info = t.createDebugMethod('info', null, msg);
    t.warn = t.createDebugMethod('warn', null, msg);
  }

  create (msg) {
    return new Debug(msg)
  }

  createDebugMethod (name, color, tipsMsg) {
    name = name || 'info';

    const bgColorMap = {
      info: '#2274A5',
      log: '#95B46A',
      error: '#D33F49'
    };

    return function () {
      if (!window._debugMode_) {
        return false
      }

      const curTime = new Date();
      const H = curTime.getHours();
      const M = curTime.getMinutes();
      const S = curTime.getSeconds();
      const msg = tipsMsg || 'debug message:';

      const arg = Array.from(arguments);
      arg.unshift(`color: white; background-color: ${color || bgColorMap[name] || '#95B46A'}`);
      arg.unshift(`%c [${H}:${M}:${S}] ${msg} `);
      window.console[name].apply(window.console, arg);
    }
  }

  isDebugMode () {
    return Boolean(window._debugMode_)
  }
}

var Debug$1 = new Debug();

var debug = Debug$1.create('vue-debug-helper message:');

function mixinRegister (Vue) {
  if (!Vue || !Vue.mixin) {
    debug.error('未检查到VUE对象，请检查是否引入了VUE，且将VUE对象挂载到全局变量window.Vue上');
    return false
  }

  Vue.mixin({
    beforeCreate: function () {
      const tag = this.$options?._componentTag || this.$vnode?.tag || this._uid;
      const chain = helper.methods.getComponentChain(this);
      this._componentTag = tag;
      this._componentChain = chain;
      this._componentName = isNaN(Number(tag)) ? tag.replace(/^vue\-component\-\d+\-/, '') : 'anonymous-component';
      this._createdTime = Date.now();

      /* 判断是否为函数式组件，函数式组件无状态 (没有响应式数据)，也没有实例，也没生命周期概念 */
      if (this._componentName === 'anonymous-component' && !this.$parent && !this.$vnode) {
        this._componentName = 'functional-component';
      }

      helper.components[this._uid] = this;

      /**
       * 收集所有创建过的组件信息，此处只存储组件的基础信息，没销毁的组件会包含组件实例
       * 严禁对组件内其它对象进行引用，否则会导致组件实列无法被正常回收
       */
      const componentSummary = {
        uid: this._uid,
        name: this._componentName,
        tag: this._componentTag,
        createdTime: this._createdTime,
        // 0 表示还没被销毁
        destroyTime: 0,
        // 0 表示还没被销毁，duration可持续当当前查看时间
        duration: 0,
        component: this,
        chain
      };
      helper.componentsSummary[this._uid] = componentSummary;

      /* 添加到componentsSummaryStatistics里，生成统计信息 */
      Array.isArray(helper.componentsSummaryStatistics[this._componentName])
        ? helper.componentsSummaryStatistics[this._componentName].push(componentSummary)
        : (helper.componentsSummaryStatistics[this._componentName] = [componentSummary]);
    },
    created: function () {
      /* 增加空白数据，方便观察内存泄露情况 */
      if (helper.ddConfig.enabled) {
        let needDd = false;

        if (helper.ddConfig.filters.length === 0) {
          needDd = true;
        } else {
          for (let index = 0; index < helper.ddConfig.filters.length; index++) {
            const filter = helper.ddConfig.filters[index];
            if (filter === this._componentName || String(this._componentName).endsWith(filter)) {
              needDd = true;
              break
            }
          }
        }

        if (needDd) {
          const size = helper.ddConfig.size * 1024;
          const componentInfo = `tag: ${this._componentTag}, uid: ${this._uid}, createdTime: ${this._createdTime}`;
          /* 此处必须使用JSON.stringify对产生的字符串进行消费，否则没法将内存占用上去 */
          this.$data.__dd__ = JSON.stringify(componentInfo + ' ' + helper.methods.createEmptyData(size, this._uid));
          console.log(`[dd success] ${componentInfo} componentChain: ${this._componentChain}`);
        }
      }
    },
    destroyed: function () {
      if (this._componentTag) {
        const uid = this._uid;
        const name = this._componentName;
        const destroyTime = Date.now();

        /* helper里的componentSummary有可能通过调用clear函数而被清除掉，所以需进行判断再更新赋值 */
        const componentSummary = helper.componentsSummary[this._uid];
        if (componentSummary) {
          /* 补充/更新组件信息 */
          componentSummary.destroyTime = destroyTime;
          componentSummary.duration = destroyTime - this._createdTime;

          helper.destroyList.push(componentSummary);

          /* 统计被销毁的组件信息 */
          Array.isArray(helper.destroyStatistics[name])
            ? helper.destroyStatistics[name].push(componentSummary)
            : (helper.destroyStatistics[name] = [componentSummary]);

          /* 删除已销毁的组件实例 */
          delete componentSummary.component;
        }

        // 解除引用关系
        delete this._componentTag;
        delete this._componentChain;
        delete this._componentName;
        delete this._createdTime;
        delete this.$data.__dd__;
        delete helper.components[uid];
      } else {
        console.error('存在未被正常标记的组件，请检查组件采集逻辑是否需完善', this);
      }
    }
  });
}

/*!
 * @name      menuCommand.js
 * @version   0.0.1
 * @author    Blaze
 * @date      2019/9/21 14:22
 */

const monkeyMenu = {
  on (title, fn, accessKey) {
    return window.GM_registerMenuCommand && window.GM_registerMenuCommand(title, fn, accessKey)
  },
  off (id) {
    return window.GM_unregisterMenuCommand && window.GM_unregisterMenuCommand(id)
  },
  /* 切换类型的菜单功能 */
  switch (title, fn, defVal) {
    const t = this;
    t.on(title, fn);
  }
};

/**
 * 简单的i18n库
 */

class I18n {
  constructor (config) {
    this._languages = {};
    this._locale = this.getClientLang();
    this._defaultLanguage = '';
    this.init(config);
  }

  init (config) {
    if (!config) return false

    const t = this;
    t._locale = config.locale || t._locale;
    /* 指定当前要是使用的语言环境，默认无需指定，会自动读取 */
    t._languages = config.languages || t._languages;
    t._defaultLanguage = config.defaultLanguage || t._defaultLanguage;
  }

  use () {}

  t (path) {
    const t = this;
    let result = t.getValByPath(t._languages[t._locale] || {}, path);

    /* 版本回退 */
    if (!result && t._locale !== t._defaultLanguage) {
      result = t.getValByPath(t._languages[t._defaultLanguage] || {}, path);
    }

    return result || ''
  }

  /* 当前语言值 */
  language () {
    return this._locale
  }

  languages () {
    return this._languages
  }

  changeLanguage (locale) {
    if (this._languages[locale]) {
      this._languages = locale;
      return locale
    } else {
      return false
    }
  }

  /**
   * 根据文本路径获取对象里面的值
   * @param obj {Object} -必选 要操作的对象
   * @param path {String} -必选 路径信息
   * @returns {*}
   */
  getValByPath (obj, path) {
    path = path || '';
    const pathArr = path.split('.');
    let result = obj;

    /* 递归提取结果值 */
    for (let i = 0; i < pathArr.length; i++) {
      if (!result) break
      result = result[pathArr[i]];
    }

    return result
  }

  /* 获取客户端当前的语言环境 */
  getClientLang () {
    return navigator.languages ? navigator.languages[0] : navigator.language
  }
}

var zhCN = {
  about: '关于',
  issues: '反馈',
  setting: '设置',
  hotkeys: '快捷键',
  donate: '赞赏',
  debugHelper: {
    viewVueDebugHelperObject: 'vueDebugHelper对象',
    componentsStatistics: '当前存活组件统计',
    destroyStatisticsSort: '已销毁组件统计',
    componentsSummaryStatisticsSort: '全部组件混合统计',
    getDestroyByDuration: '组件存活时间信息',
    clearAll: '清空统计信息',
    dd: '数据注入（dd）',
    undd: '取消数据注入（undd）',
    ddPrompt: {
      filter: '组件过滤器（如果为空，则对所有组件注入）',
      count: '指定注入数据的重复次数（默认1024）'
    }
  }
};

var enUS = {
  about: 'about',
  issues: 'feedback',
  setting: 'settings',
  hotkeys: 'Shortcut keys',
  donate: 'donate',
  debugHelper: {
    viewVueDebugHelperObject: 'vueDebugHelper object',
    componentsStatistics: 'Current surviving component statistics',
    destroyStatisticsSort: 'Destroyed component statistics',
    componentsSummaryStatisticsSort: 'All components mixed statistics',
    getDestroyByDuration: 'Component survival time information',
    clearAll: 'Clear statistics',
    dd: 'Data injection (dd)',
    undd: 'Cancel data injection (undd)',
    ddPrompt: {
      filter: 'Component filter (if empty, inject all components)',
      count: 'Specify the number of repetitions of injected data (default 1024)'
    }
  }
};

var zhTW = {
  about: '關於',
  issues: '反饋',
  setting: '設置',
  hotkeys: '快捷鍵',
  donate: '讚賞',
  debugHelper: {
    viewVueDebugHelperObject: 'vueDebugHelper對象',
    componentsStatistics: '當前存活組件統計',
    destroyStatisticsSort: '已銷毀組件統計',
    componentsSummaryStatisticsSort: '全部組件混合統計',
    getDestroyByDuration: '組件存活時間信息',
    clearAll: '清空統計信息',
    dd: '數據注入（dd）',
    undd: '取消數據注入（undd）',
    ddPrompt: {
      filter: '組件過濾器（如果為空，則對所有組件注入）',
      count: '指定注入數據的重複次數（默認1024）'
    }
  }
};

const messages = {
  'zh-CN': zhCN,
  zh: zhCN,
  'zh-HK': zhTW,
  'zh-TW': zhTW,
  'en-US': enUS,
  en: enUS,
};

/*!
 * @name         i18n.js
 * @description  vue-debug-helper的国际化配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/26 14:56
 * @github       https://github.com/xxxily
 */

const i18n = new I18n({
  defaultLanguage: 'en',
  /* 指定当前要是使用的语言环境，默认无需指定，会自动读取 */
  // locale: 'zh-TW',
  languages: messages
});

/*!
 * @name         functionCall.js
 * @description  统一的提供外部功能调用管理模块
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/27 17:42
 * @github       https://github.com/xxxily
 */

const functionCall = {
  viewVueDebugHelperObject () {
    debug.log(i18n.t('debugHelper.viewVueDebugHelperObject'), helper);
  },
  componentsStatistics () {
    debug.log(i18n.t('debugHelper.componentsStatistics'), helper.methods.componentsStatistics());
  },
  destroyStatisticsSort () {
    debug.log(i18n.t('debugHelper.destroyStatisticsSort'), helper.methods.destroyStatisticsSort());
  },
  componentsSummaryStatisticsSort () {
    debug.log(i18n.t('debugHelper.componentsSummaryStatisticsSort'), helper.methods.componentsSummaryStatisticsSort());
  },
  getDestroyByDuration () {
    debug.log(i18n.t('debugHelper.getDestroyByDuration'), helper.methods.getDestroyByDuration());
  },
  clearAll () {
    helper.methods.clearAll();
    debug.log(i18n.t('debugHelper.clearAll'));
  },
  dd () {
    const filter = window.prompt(i18n.t('debugHelper.ddPrompt.filter'), localStorage.getItem('vueDebugHelper_dd_filter') || '');
    const count = window.prompt(i18n.t('debugHelper.ddPrompt.count'), localStorage.getItem('vueDebugHelper_dd_count') || 1024);
    filter && localStorage.setItem('vueDebugHelper_dd_filter', filter);
    count && localStorage.setItem('vueDebugHelper_dd_count', count);
    debug.log(i18n.t('debugHelper.dd'));
    helper.methods.dd(filter, Number(count));
  },
  undd () {
    debug.log(i18n.t('debugHelper.undd'));
    helper.methods.undd();
  }
};

/*!
 * @name         menu.js
 * @description  vue-debug-helper的菜单配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/25 22:28
 * @github       https://github.com/xxxily
 */

function menuRegister (Vue) {
  if (!Vue) {
    monkeyMenu.on('not detected ' + i18n.t('issues'), () => {
      window.GM_openInTab('https://github.com/xxxily/vue-debug-helper/issues', {
        active: true,
        insert: true,
        setParent: true
      });
    });
    return false
  }

  // 批量注册菜单
  Object.keys(functionCall).forEach(key => {
    const text = i18n.t(`debugHelper.${key}`);
    if (text && functionCall[key] instanceof Function) {
      monkeyMenu.on(text, functionCall[key]);
    }
  });

  // monkeyMenu.on('i18n.t('setting')', () => {
  //   window.alert('功能开发中，敬请期待...')
  // })

  monkeyMenu.on(i18n.t('issues'), () => {
    window.GM_openInTab('https://github.com/xxxily/vue-debug-helper/issues', {
      active: true,
      insert: true,
      setParent: true
    });
  });

  // monkeyMenu.on(i18n.t('donate'), () => {
  //   window.GM_openInTab('https://cdn.jsdelivr.net/gh/xxxily/vue-debug-helper@main/donate.png', {
  //     active: true,
  //     insert: true,
  //     setParent: true
  //   })
  // })
}

const isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false;

// 绑定事件
function addEvent (object, event, method) {
  if (object.addEventListener) {
    object.addEventListener(event, method, false);
  } else if (object.attachEvent) {
    object.attachEvent(`on${event}`, () => { method(window.event); });
  }
}

// 修饰键转换成对应的键码
function getMods (modifier, key) {
  const mods = key.slice(0, key.length - 1);
  for (let i = 0; i < mods.length; i++) mods[i] = modifier[mods[i].toLowerCase()];
  return mods
}

// 处理传的key字符串转换成数组
function getKeys (key) {
  if (typeof key !== 'string') key = '';
  key = key.replace(/\s/g, ''); // 匹配任何空白字符,包括空格、制表符、换页符等等
  const keys = key.split(','); // 同时设置多个快捷键，以','分割
  let index = keys.lastIndexOf('');

  // 快捷键可能包含','，需特殊处理
  for (; index >= 0;) {
    keys[index - 1] += ',';
    keys.splice(index, 1);
    index = keys.lastIndexOf('');
  }

  return keys
}

// 比较修饰键的数组
function compareArray (a1, a2) {
  const arr1 = a1.length >= a2.length ? a1 : a2;
  const arr2 = a1.length >= a2.length ? a2 : a1;
  let isIndex = true;

  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
  }
  return isIndex
}

// Special Keys
const _keyMap = {
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  num_0: 96,
  num_1: 97,
  num_2: 98,
  num_3: 99,
  num_4: 100,
  num_5: 101,
  num_6: 102,
  num_7: 103,
  num_8: 104,
  num_9: 105,
  num_multiply: 106,
  num_add: 107,
  num_enter: 108,
  num_subtract: 109,
  num_decimal: 110,
  num_divide: 111,
  '⇪': 20,
  ',': 188,
  '.': 190,
  '/': 191,
  '`': 192,
  '-': isff ? 173 : 189,
  '=': isff ? 61 : 187,
  ';': isff ? 59 : 186,
  '\'': 222,
  '[': 219,
  ']': 221,
  '\\': 220
};

// Modifier Keys
const _modifier = {
  // shiftKey
  '⇧': 16,
  shift: 16,
  // altKey
  '⌥': 18,
  alt: 18,
  option: 18,
  // ctrlKey
  '⌃': 17,
  ctrl: 17,
  control: 17,
  // metaKey
  '⌘': 91,
  cmd: 91,
  command: 91
};
const modifierMap = {
  16: 'shiftKey',
  18: 'altKey',
  17: 'ctrlKey',
  91: 'metaKey',

  shiftKey: 16,
  ctrlKey: 17,
  altKey: 18,
  metaKey: 91
};
const _mods = {
  16: false,
  18: false,
  17: false,
  91: false
};
const _handlers = {};

// F1~F12 special key
for (let k = 1; k < 20; k++) {
  _keyMap[`f${k}`] = 111 + k;
}

// https://github.com/jaywcjlove/hotkeys

let _downKeys = []; // 记录摁下的绑定键
let winListendFocus = false; // window是否已经监听了focus事件
let _scope = 'all'; // 默认热键范围
const elementHasBindEvent = []; // 已绑定事件的节点记录

// 返回键码
const code = (x) => _keyMap[x.toLowerCase()] ||
  _modifier[x.toLowerCase()] ||
  x.toUpperCase().charCodeAt(0);

// 设置获取当前范围（默认为'所有'）
function setScope (scope) {
  _scope = scope || 'all';
}
// 获取当前范围
function getScope () {
  return _scope || 'all'
}
// 获取摁下绑定键的键值
function getPressedKeyCodes () {
  return _downKeys.slice(0)
}

// 表单控件控件判断 返回 Boolean
// hotkey is effective only when filter return true
function filter (event) {
  const target = event.target || event.srcElement;
  const { tagName } = target;
  let flag = true;
  // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>
  if (
    target.isContentEditable ||
    ((tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') && !target.readOnly)
  ) {
    flag = false;
  }
  return flag
}

// 判断摁下的键是否为某个键，返回true或者false
function isPressed (keyCode) {
  if (typeof keyCode === 'string') {
    keyCode = code(keyCode); // 转换成键码
  }
  return _downKeys.indexOf(keyCode) !== -1
}

// 循环删除handlers中的所有 scope(范围)
function deleteScope (scope, newScope) {
  let handlers;
  let i;

  // 没有指定scope，获取scope
  if (!scope) scope = getScope();

  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length;) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  }

  // 如果scope被删除，将scope重置为all
  if (getScope() === scope) setScope(newScope || 'all');
}

// 清除修饰键
function clearModifier (event) {
  let key = event.keyCode || event.which || event.charCode;
  const i = _downKeys.indexOf(key);

  // 从列表中清除按压过的键
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }
  // 特殊处理 cmmand 键，在 cmmand 组合快捷键 keyup 只执行一次的问题
  if (event.key && event.key.toLowerCase() === 'meta') {
    _downKeys.splice(0, _downKeys.length);
  }

  // 修饰键 shiftKey altKey ctrlKey (command||metaKey) 清除
  if (key === 93 || key === 224) key = 91;
  if (key in _mods) {
    _mods[key] = false;

    // 将修饰键重置为false
    for (const k in _modifier) if (_modifier[k] === key) hotkeys[k] = false;
  }
}

function unbind (keysInfo, ...args) {
  // unbind(), unbind all keys
  if (!keysInfo) {
    Object.keys(_handlers).forEach((key) => delete _handlers[key]);
  } else if (Array.isArray(keysInfo)) {
    // support like : unbind([{key: 'ctrl+a', scope: 's1'}, {key: 'ctrl-a', scope: 's2', splitKey: '-'}])
    keysInfo.forEach((info) => {
      if (info.key) eachUnbind(info);
    });
  } else if (typeof keysInfo === 'object') {
    // support like unbind({key: 'ctrl+a, ctrl+b', scope:'abc'})
    if (keysInfo.key) eachUnbind(keysInfo);
  } else if (typeof keysInfo === 'string') {
    // support old method
    // eslint-disable-line
    let [scope, method] = args;
    if (typeof scope === 'function') {
      method = scope;
      scope = '';
    }
    eachUnbind({
      key: keysInfo,
      scope,
      method,
      splitKey: '+'
    });
  }
}

// 解除绑定某个范围的快捷键
const eachUnbind = ({
  key, scope, method, splitKey = '+'
}) => {
  const multipleKeys = getKeys(key);
  multipleKeys.forEach((originKey) => {
    const unbindKeys = originKey.split(splitKey);
    const len = unbindKeys.length;
    const lastKey = unbindKeys[len - 1];
    const keyCode = lastKey === '*' ? '*' : code(lastKey);
    if (!_handlers[keyCode]) return
    // 判断是否传入范围，没有就获取范围
    if (!scope) scope = getScope();
    const mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
    _handlers[keyCode] = _handlers[keyCode].filter((record) => {
      // 通过函数判断，是否解除绑定，函数相等直接返回
      const isMatchingMethod = method ? record.method === method : true;
      return !(
        isMatchingMethod &&
        record.scope === scope &&
        compareArray(record.mods, mods)
      )
    });
  });
};

// 对监听对应快捷键的回调函数进行处理
function eventHandler (event, handler, scope, element) {
  if (handler.element !== element) {
    return
  }
  let modifiersMatch;

  // 看它是否在当前范围
  if (handler.scope === scope || handler.scope === 'all') {
    // 检查是否匹配修饰符（如果有返回true）
    modifiersMatch = handler.mods.length > 0;

    for (const y in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, y)) {
        if (
          (!_mods[y] && handler.mods.indexOf(+y) > -1) ||
          (_mods[y] && handler.mods.indexOf(+y) === -1)
        ) {
          modifiersMatch = false;
        }
      }
    }

    // 调用处理程序，如果是修饰键不做处理
    if (
      (handler.mods.length === 0 &&
        !_mods[16] &&
        !_mods[18] &&
        !_mods[17] &&
        !_mods[91]) ||
      modifiersMatch ||
      handler.shortcut === '*'
    ) {
      if (handler.method(event, handler) === false) {
        if (event.preventDefault) event.preventDefault();
        else event.returnValue = false;
        if (event.stopPropagation) event.stopPropagation();
        if (event.cancelBubble) event.cancelBubble = true;
      }
    }
  }
}

// 处理keydown事件
function dispatch (event, element) {
  const asterisk = _handlers['*'];
  let key = event.keyCode || event.which || event.charCode;

  // 表单控件过滤 默认表单控件不触发快捷键
  if (!hotkeys.filter.call(this, event)) return

  // Gecko(Firefox)的command键值224，在Webkit(Chrome)中保持一致
  // Webkit左右 command 键值不一样
  if (key === 93 || key === 224) key = 91;

  /**
   * Collect bound keys
   * If an Input Method Editor is processing key input and the event is keydown, return 229.
   * https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
   * http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
   */
  if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);
  /**
   * Jest test cases are required.
   * ===============================
   */
  ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach((keyName) => {
    const keyNum = modifierMap[keyName];
    if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
      _downKeys.push(keyNum);
    } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
      _downKeys.splice(_downKeys.indexOf(keyNum), 1);
    } else if (keyName === 'metaKey' && event[keyName] && _downKeys.length === 3) {
      /**
       * Fix if Command is pressed:
       * ===============================
       */
      if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
        _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
      }
    }
  });
  /**
   * -------------------------------
   */

  if (key in _mods) {
    _mods[key] = true;

    // 将特殊字符的key注册到 hotkeys 上
    for (const k in _modifier) {
      if (_modifier[k] === key) hotkeys[k] = true;
    }

    if (!asterisk) return
  }

  // 将 modifierMap 里面的修饰键绑定到 event 中
  for (const e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e)) {
      _mods[e] = event[modifierMap[e]];
    }
  }
  /**
   * https://github.com/jaywcjlove/hotkeys/pull/129
   * This solves the issue in Firefox on Windows where hotkeys corresponding to special characters would not trigger.
   * An example of this is ctrl+alt+m on a Swedish keyboard which is used to type μ.
   * Browser support: https://caniuse.com/#feat=keyboardevent-getmodifierstate
   */
  if (event.getModifierState && (!(event.altKey && !event.ctrlKey) && event.getModifierState('AltGraph'))) {
    if (_downKeys.indexOf(17) === -1) {
      _downKeys.push(17);
    }

    if (_downKeys.indexOf(18) === -1) {
      _downKeys.push(18);
    }

    _mods[17] = true;
    _mods[18] = true;
  }

  // 获取范围 默认为 `all`
  const scope = getScope();
  // 对任何快捷键都需要做的处理
  if (asterisk) {
    for (let i = 0; i < asterisk.length; i++) {
      if (
        asterisk[i].scope === scope &&
        ((event.type === 'keydown' && asterisk[i].keydown) ||
        (event.type === 'keyup' && asterisk[i].keyup))
      ) {
        eventHandler(event, asterisk[i], scope, element);
      }
    }
  }
  // key 不在 _handlers 中返回
  if (!(key in _handlers)) return

  for (let i = 0; i < _handlers[key].length; i++) {
    if (
      (event.type === 'keydown' && _handlers[key][i].keydown) ||
      (event.type === 'keyup' && _handlers[key][i].keyup)
    ) {
      if (_handlers[key][i].key) {
        const record = _handlers[key][i];
        const { splitKey } = record;
        const keyShortcut = record.key.split(splitKey);
        const _downKeysCurrent = []; // 记录当前按键键值
        for (let a = 0; a < keyShortcut.length; a++) {
          _downKeysCurrent.push(code(keyShortcut[a]));
        }
        if (_downKeysCurrent.sort().join('') === _downKeys.sort().join('')) {
          // 找到处理内容
          eventHandler(event, record, scope, element);
        }
      }
    }
  }
}

// 判断 element 是否已经绑定事件
function isElementBind (element) {
  return elementHasBindEvent.indexOf(element) > -1
}

function hotkeys (key, option, method) {
  _downKeys = [];
  const keys = getKeys(key); // 需要处理的快捷键列表
  let mods = [];
  let scope = 'all'; // scope默认为all，所有范围都有效
  let element = document; // 快捷键事件绑定节点
  let i = 0;
  let keyup = false;
  let keydown = true;
  let splitKey = '+';

  // 对为设定范围的判断
  if (method === undefined && typeof option === 'function') {
    method = option;
  }

  if (Object.prototype.toString.call(option) === '[object Object]') {
    if (option.scope) scope = option.scope; // eslint-disable-line
    if (option.element) element = option.element; // eslint-disable-line
    if (option.keyup) keyup = option.keyup; // eslint-disable-line
    if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line
    if (typeof option.splitKey === 'string') splitKey = option.splitKey; // eslint-disable-line
  }

  if (typeof option === 'string') scope = option;

  // 对于每个快捷键进行处理
  for (; i < keys.length; i++) {
    key = keys[i].split(splitKey); // 按键列表
    mods = [];

    // 如果是组合快捷键取得组合快捷键
    if (key.length > 1) mods = getMods(_modifier, key);

    // 将非修饰键转化为键码
    key = key[key.length - 1];
    key = key === '*' ? '*' : code(key); // *表示匹配所有快捷键

    // 判断key是否在_handlers中，不在就赋一个空数组
    if (!(key in _handlers)) _handlers[key] = [];
    _handlers[key].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method,
      key: keys[i],
      splitKey,
      element
    });
  }
  // 在全局document上设置快捷键
  if (typeof element !== 'undefined' && !isElementBind(element) && window) {
    elementHasBindEvent.push(element);
    addEvent(element, 'keydown', (e) => {
      dispatch(e, element);
    });
    if (!winListendFocus) {
      winListendFocus = true;
      addEvent(window, 'focus', () => {
        _downKeys = [];
      });
    }
    addEvent(element, 'keyup', (e) => {
      dispatch(e, element);
      clearModifier(e);
    });
  }
}

function trigger (shortcut, scope = 'all') {
  Object.keys(_handlers).forEach((key) => {
    const data = _handlers[key].find((item) => item.scope === scope && item.shortcut === shortcut);
    if (data && data.method) {
      data.method();
    }
  });
}

const _api = {
  setScope,
  getScope,
  deleteScope,
  getPressedKeyCodes,
  isPressed,
  filter,
  trigger,
  unbind,
  keyMap: _keyMap,
  modifier: _modifier,
  modifierMap
};
for (const a in _api) {
  if (Object.prototype.hasOwnProperty.call(_api, a)) {
    hotkeys[a] = _api[a];
  }
}

if (typeof window !== 'undefined') {
  const _hotkeys = window.hotkeys;
  hotkeys.noConflict = (deep) => {
    if (deep && window.hotkeys === hotkeys) {
      window.hotkeys = _hotkeys;
    }
    return hotkeys
  };
  window.hotkeys = hotkeys;
}

/*!
 * @name         hotKeyRegister.js
 * @description  vue-debug-helper的快捷键配置
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/26 14:37
 * @github       https://github.com/xxxily
 */

function hotKeyRegister () {
  const hotKeyMap = {
    'shift+alt+a,shift+alt+ctrl+a': functionCall.componentsSummaryStatisticsSort,
    'shift+alt+l': functionCall.componentsStatistics,
    'shift+alt+d': functionCall.destroyStatisticsSort,
    'shift+alt+c': functionCall.clearAll,
    'shift+alt+e': function (event, handler) {
      if (helper.ddConfig.enabled) {
        functionCall.undd();
      } else {
        functionCall.dd();
      }
    }
  };

  Object.keys(hotKeyMap).forEach(key => {
    hotkeys(key, hotKeyMap[key]);
  });
}

/*!
 * @name         vueDetector.js
 * @description  检测页面是否存在Vue对象
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/27 11:43
 * @github       https://github.com/xxxily
 */

/**
 * 检测页面是否存在Vue对象，方法参考：https://github.com/vuejs/devtools/blob/main/packages/shell-chrome/src/detector.js
 * @param {window} win windwod对象
 * @param {function} callback 检测到Vue对象后的回调函数
 */
function vueDetect (win, callback) {
  let delay = 1000;
  let detectRemainingTries = 10;

  function runDetect () {
    // Method 1: use defineProperty to detect Vue, has BUG, so use Method 2
    // 使用下面方式会导致 'Vue' in window 为 true，从而引发其他问题
    // Object.defineProperty(win, 'Vue', {
    //   enumerable: true,
    //   configurable: true,
    //   get () {
    //     return win.__originalVue__
    //   },
    //   set (value) {
    //     win.__originalVue__ = value

    //     if (value && value.mixin) {
    //       callback(value)
    //     }
    //   }
    // })

    // Method 2: Check  Vue 3
    const vueDetected = !!(window.__VUE__);
    if (vueDetected) {
      callback(window.__VUE__);
      return
    }

    // Method 3: Scan all elements inside document
    const all = document.querySelectorAll('*');
    let el;
    for (let i = 0; i < all.length; i++) {
      if (all[i].__vue__) {
        el = all[i];
        break
      }
    }
    if (el) {
      let Vue = Object.getPrototypeOf(el.__vue__).constructor;
      while (Vue.super) {
        Vue = Vue.super;
      }
      callback(Vue);
      return
    }

    if (detectRemainingTries > 0) {
      detectRemainingTries--;
      setTimeout(() => {
        runDetect();
      }, delay);
      delay *= 5;
    }
  }

  setTimeout(() => {
    runDetect();
  }, 100);
}

/**
 * 判断是否处于Iframe中
 * @returns {boolean}
 */
function isInIframe () {
  return window !== window.top
}

/**
 * 由于tampermonkey对window对象进行了封装，我们实际访问到的window并非页面真实的window
 * 这就导致了如果我们需要将某些对象挂载到页面的window进行调试的时候就无法挂载了
 * 所以必须使用特殊手段才能访问到页面真实的window对象，于是就有了下面这个函数
 * @returns {Promise<void>}
 */
async function getPageWindow () {
  return new Promise(function (resolve, reject) {
    if (window._pageWindow) {
      return resolve(window._pageWindow)
    }

    const listenEventList = ['load', 'mousemove', 'scroll', 'get-page-window-event'];

    function getWin (event) {
      window._pageWindow = this;
      // debug.log('getPageWindow succeed', event)
      listenEventList.forEach(eventType => {
        window.removeEventListener(eventType, getWin, true);
      });
      resolve(window._pageWindow);
    }

    listenEventList.forEach(eventType => {
      window.addEventListener(eventType, getWin, true);
    });

    /* 自行派发事件以便用最短的时候获得pageWindow对象 */
    window.dispatchEvent(new window.Event('get-page-window-event'));
  })
}

let registerStatus = 'init';
window._debugMode_ = true

;(async function () {
  if (isInIframe()) {
    debug.log('running in iframe, skip init', window.location.href);
    return false
  }

  debug.log('init');

  const win = await getPageWindow();
  vueDetect(win, function (Vue) {
    mixinRegister(Vue);
    menuRegister(Vue);
    hotKeyRegister();

    // 挂载到window上，方便通过控制台调用调试
    win.vueDebugHelper = helper;

    debug.log('vue debug helper register success');
    registerStatus = 'success';
  });

  setTimeout(() => {
    if (registerStatus !== 'success') {
      menuRegister(null);
      debug.warn('vue debug helper register failed, please check if vue is loaded .', win.location.href);
    }
  }, 1000 * 10);
})();
