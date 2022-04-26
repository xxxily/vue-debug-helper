// ==UserScript==
// @name         vue-debug-helper
// @name:en      vue-debug-helper
// @name:zh      vue调试分析助手
// @name:zh-TW   Vue組件探測、統計、分析輔助腳本
// @name:ja      Vueコンポーネントの検出、統計、分析補助スクリプト
// @namespace    https://github.com/xxxily/vue-debug-helper
// @homepage     https://github.com/xxxily/vue-debug-helper
// @version      0.0.1
// @description  vue components debug helper
// @description:en  vue components debug helper
// @description:zh  Vue组件探测、统计、分析辅助脚本
// @description:zh-TW  Vue組件探測、統計、分析輔助腳本
// @description:ja  Vueコンポーネントの検出、統計、分析補助スクリプト
// @author       ankvps
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
    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
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
 * @param {number} size -可选 指定数据长度，默认为1024
 * @param {string} str - 可选 指定数据的字符串，默认为'd'
 */
 function createEmptyData(size = 1024, str = 'd') {
  const arr = [];
  arr.length = size + 1;
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
  clearAll() {
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
  componentsStatistics(reverse = true) {
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
  componentsSummaryStatisticsSort(reverse = true) {
    return objSort(helper.componentsSummaryStatistics, reverse, {
      key: 'componentName',
      value: 'componentsSummary'
    })
  },

  /**
   * 对destroyList进行排序输出，以便可以直观查看组件的销毁情况
   */
  destroyStatisticsSort(reverse = true) {
    return objSort(helper.destroyStatistics, reverse, {
      key: 'componentName',
      value: 'destroyList'
    })
  },

  /**
   * 对destroyList进行排序输出，以便可以直观查看组件的销毁情况
   */
  getDestroyByDuration(duration = 1000) {
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
  getComponentChain(component, moreDetail = false) {
    const result = [];
    let current = component;

    while (current) {
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
  dd(filter, size = 1024) {
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
  undd() {
    helper.ddConfig = {
      enabled: false,
      filters: [],
      size: 1024
    };
  }
};

helper.methods = methods;

function mixinRegister (Vue) {
  if(!Vue || !Vue.mixin) {
    debug.error('未检查到VUE对象，请检查是否引入了VUE，且将VUE对象挂载到全局变量window.Vue上');
    return false
  }
  
  Vue.mixin({
    beforeCreate: function() {
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
    created: function() {
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
          this.$data.__dd__ = componentInfo + ' ' + helper.methods.createEmptyData(size, 'd');
          console.log(`[dd success] ${componentInfo}`, this);
        }
      }
    },
    destroyed: function() {
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
};

var enUS = {
  about: 'about',
  issues: 'issues',
  setting: 'setting',
  hotkeys: 'hotkeys',
  donate: 'donate'
};

var zhTW = {
  about: '關於',
  issues: '反饋',
  setting: '設置',
  hotkeys: '快捷鍵',
  donate: '讚賞',
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
 * @name         menu.js
 * @description  vue-debug-helper的菜单配置
 * @version      0.0.1
 * @author       ${2|Blaze,xxxily,liudaohui}
 * @date         2022/04/25 22:28
 * @github       https://github.com/xxxily
 */

const i18n = new I18n({
  defaultLanguage: 'en',
  /* 指定当前要是使用的语言环境，默认无需指定，会自动读取 */
  // locale: 'zh-TW',
  languages: messages
});

function menuRegister(){
  monkeyMenu.on('查看vueDebugHelper对象', () => {
    debug.log(helper);
  });

  monkeyMenu.on('数据注入（dd）', () => {
    const filter = window.prompt('组件过滤器（如果为空，则对所有组件注入）', '');
    const size = window.prompt('指定注入数据的大小值（默认1Mb）', 1024);
    helper.methods.dd(filter, Number(size));
  });

  monkeyMenu.on('取消数据注入（undd）', () => {
    helper.methods.undd();
  });

  // monkeyMenu.on('i18n.t('setting')', () => {
  //   window.alert('功能开发中，敬请期待...')
  // })
  
  monkeyMenu.on(i18n.t('donate'), () => {
    window.GM_openInTab('https://cdn.jsdelivr.net/gh/xxxily/h5player@master/donate.png', {
      active: true,
      insert: true,
      setParent: true
    });
  });
  monkeyMenu.on(i18n.t('issues'), () => {
    window.GM_openInTab('https://github.com/xxxily/vue-debug-helper/issues', {
      active: true,
      insert: true,
      setParent: true
    });
  });
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
  debug.log('init');

  const win = await getPageWindow();
  if(win.Vue) {
    mixinRegister(win.Vue);
    menuRegister();
    debug.log('mixinRegister success');
    registerStatus = 'success';
  }else {
    win.__originalVue__ = null;
    Object.defineProperty(win, 'Vue', {
      enumerable: true,
      configurable: true,
      get() {
        return win.__originalVue__
      },
      set(value) {
        win.__originalVue__ = value;
    
        if(value && value.mixin) {
          mixinRegister(value);
          menuRegister();
          debug.log('mixinRegister success');
          registerStatus = 'success';
        }
      }
    });
  }

  setTimeout(() => {
    if(registerStatus !== 'success') {
      debug.warn('vue debug helper register failed, please check if vue is loaded .', win.location.href);
    }
  }, 5000);
})();
