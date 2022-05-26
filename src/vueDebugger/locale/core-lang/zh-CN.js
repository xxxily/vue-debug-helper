export default {
  help: '插件帮助中心',
  about: '关于',
  issues: '反馈',
  setting: '设置',
  hotkeys: '快捷键',
  donate: '赞赏',
  docs: '文档',
  quit: '退出',
  update: '更新',
  refreshPage: '刷新页面',
  debugHelper: {
    viewVueDebugHelperObject: 'vueDebugHelper对象',
    componentsStatistics: '当前存活组件统计',
    destroyStatisticsSort: '已销毁组件统计',
    componentsSummaryStatisticsSort: '全部组件混合统计',
    getDestroyByDuration: '组件存活时间信息',
    clearAll: '清空统计信息',
    printLifeCycleInfo: '打印组件生命周期信息',
    notPrintLifeCycleInfo: '取消组件生命周期信息打印',
    printLifeCycleInfoPrompt: {
      lifecycleFilters: '输入要打印的生命周期名称，多个可用,或|分隔，支持的值：beforeCreate|created|beforeMount|mounted|beforeUpdate|updated|activated|deactivated|beforeDestroy|destroyed',
      componentFilters: '输入要打印的组件名称，多个可用,或|分隔，不输入则打印所有组件，字符串后面加*可执行模糊匹配'
    },
    findComponents: '查找组件',
    findComponentsPrompt: {
      filters: '输入要查找的组件名称，或uid，多个可用,或|分隔，字符串后面加*可执行模糊匹配'
    },
    findNotContainElementComponents: '查找不包含DOM对象的组件',
    blockComponents: '阻断组件的创建',
    blockComponentsPrompt: {
      filters: '输入要阻断的组件名称，多个可用,或|分隔，输入为空则取消阻断，字符串后面加*可执行模糊匹配'
    },
    dd: '数据注入（dd）',
    undd: '取消数据注入（undd）',
    ddPrompt: {
      filter: '组件过滤器（如果为空，则对所有组件注入）',
      count: '指定注入数据的重复次数（默认1024）'
    },
    toggleHackVueComponent: '改写/还原Vue.component',
    hackVueComponent: {
      hack: '改写Vue.component',
      unhack: '还原Vue.component'
    },
    toggleInspect: '切换Inspect',
    inspectStatus: {
      on: '开启Inspect',
      off: '关闭Inspect'
    },
    togglePerformanceObserver: '开启/关闭性能观察',
    performanceObserverStatus: {
      on: '开启性能观察',
      off: '关闭性能观察'
    },
    performanceObserverPrompt: {
      entryTypes: '输入要观察的类型，多个类型可用,或|分隔，支持的类型有：element,navigation,resource,mark,measure,paint,longtask',
      notSupport: '当前浏览器不支持性能观察'
    },
    enableAjaxCacheTips: '接口缓存功能已开启',
    disableAjaxCacheTips: '接口缓存功能已关闭',
    toggleAjaxCache: '开启/关闭接口缓存',
    ajaxCacheStatus: {
      on: '开启接口缓存',
      off: '关闭接口缓存'
    },
    clearAjaxCache: '清空接口缓存数据',
    clearAjaxCacheTips: '接口缓存数据已清空',
    jaxCachePrompt: {
      filters: '输入要缓存的接口地址，多个可用,或|分隔，字符串后面加*可执行模糊匹配',
      expires: '输入缓存过期时间，单位为分钟，默认为1440分钟（即24小时）'
    },
    toggleBlockAjax: '开启/关闭接口请求拦截',
    blockAjax: {
      enabled: '开启接口请求拦截',
      disable: '关闭接口请求拦截',
      prompt: {
        filters: '输入要拦截的接口地址，多个可用,或|分隔，字符串后面加*可执行模糊匹配'
      }
    },

    measureSelectorInterval: '测量选择器时间差',
    measureSelectorIntervalPrompt: {
      selector1: '输入起始选择器',
      selector2: '输入结束选择器'
    },
    selectorReadyTips: '元素已就绪',
    devtools: {
      enabled: '自动开启vue-devtools',
      disable: '禁止开启vue-devtools'
    },
    simplifyMode: {
      enabled: '简化右键菜单',
      disable: '展开全部菜单'
    }
  },
  contextMenu: {
    consoleComponent: '查看组件',
    consoleComponentData: '查看组件数据',
    consoleComponentProps: '查看组件props',
    consoleComponentChain: '查看组件调用链',
    consoleParentComponent: '查看父组件',
    componentAction: '相关操作',
    copyFilePath: '复制文件路径',
    copyComponentName: '复制组件名称',
    copyComponentData: '复制组件$data',
    copyComponentProps: '复制组件$props',
    copyComponentTag: '复制组件标签',
    copyComponentUid: '复制组件uid',
    copyComponentChian: '复制组件调用链',
    findComponents: '查找组件',
    printLifeCycleInfo: '打印生命周期信息',
    blockComponents: '阻断组件',
    more: '更多'
  }
}
