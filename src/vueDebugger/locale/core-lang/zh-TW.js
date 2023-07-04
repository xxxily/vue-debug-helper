export default {
  about: '關於',
  issues: '反饋',
  setting: '設置',
  hotkeys: '快捷鍵',
  donate: '讚賞',
  quit: '退出',
  refreshPage: '刷新頁面',
  debugHelper: {
    viewVueDebugHelperObject: 'vueDebugHelper對象',
    componentsStatistics: '當前存活組件統計',
    destroyStatisticsSort: '已銷毀組件統計',
    componentsSummaryStatisticsSort: '全部組件混合統計',
    getDestroyByDuration: '組件存活時間信息',
    clearAll: '清空統計信息',
    printLifeCycleInfo: '打印組件生命週期信息',
    notPrintLifeCycleInfo: '取消組件生命週期信息打印',
    printLifeCycleInfoPrompt: {
      lifecycleFilters: '輸入要打印的生命週期名稱，多個可用,或|分隔，支持的值：beforeCreate|created|beforeMount|mounted|beforeUpdate|updated|activated|deactivated|beforeDestroy|destroyed',
      componentFilters: '輸入要打印的組件名稱，多個可用,或|分隔，不輸入則打印所有組件，字符串後面加*可執行模糊匹配'
    },
    setOverlaySelectorOpacity: '區塊透明度',
    setOverlaySelectorOpacityError: '區塊透明度必須是0-1之間的數字',
    findComponents: '查找組件',
    findComponentsPrompt: {
      filters: '輸入要查找的組件名稱，或uid，多個可用,或|分隔，字符串後面加*可執行模糊匹配'
    },
    findNotContainElementComponents: '查找不包含DOM對象的組件',
    blockComponents: '阻斷組件的創建',
    blockComponentsPrompt: {
      filters: '輸入要阻斷的組件名稱，多個可用,或|分隔，輸入為空則取消阻斷，字符串後面加*可執行模糊匹配'
    },
    dd: '數據注入（dd）',
    undd: '取消數據注入（undd）',
    ddPrompt: {
      filter: '組件過濾器（如果為空，則對所有組件注入）',
      count: '指定注入數據的重複次數（默認1024）'
    },
    toggleHackVueComponent: '改寫/還原Vue.component',
    hackVueComponent: {
      hack: '改寫Vue.component',
      unhack: '還原Vue.component'
    },
    toggleInspect: '切換Inspect',
    inspectStatus: {
      on: '開啟Inspect',
      off: '關閉Inspect'
    },
    togglePerformanceObserver: '開啟/關閉性能觀察',
    performanceObserverStatus: {
      on: '開啟性能觀察',
      off: '關閉性能觀察'
    },
    performanceObserverPrompt: {
      entryTypes: '輸入要觀察的類型，多個類型可用,或|分隔，支持的類型有：element,navigation,resource,mark,measure,paint,longtask',
      notSupport: '當前瀏覽器不支持性能觀察'
    },
    enableAjaxCacheTips: '接口緩存功能已開啟',
    disableAjaxCacheTips: '接口緩存功能已關閉',
    toggleAjaxCache: '開啟/關閉接口緩存',
    editingAssistance: {
      on: '開啟編輯輔助',
      off: '關閉編輯輔助'
    },
    ajaxCacheStatus: {
      on: '開啟接口緩存',
      off: '關閉接口緩存'
    },
    clearAjaxCache: '清空接口緩存數據',
    clearAjaxCacheTips: '接口緩存數據已清空',
    jaxCachePrompt: {
      filters: '輸入要緩存的接口地址，多個可用,或|分隔，字符串後面加*可執行模糊匹配',
      expires: '輸入緩存過期時間，單位為分鐘，默認為1440分鐘（即24小時）'
    },
    measureSelectorInterval: '測量選擇器時間差',
    measureSelectorIntervalPrompt: {
      selector1: '輸入起始選擇器',
      selector2: '輸入結束選擇器'
    },
    selectorReadyTips: '元素已就緒',
    devtools: {
      enabled: '自動開啟vue-devtools',
      disable: '禁止開啟vue-devtools'
    }
  },
  contextMenu: {
    consoleComponent: '查看組件',
    consoleComponentData: '查看組件數據',
    consoleComponentProps: '查看組件props',
    consoleComponentChain: '查看組件調用鏈',
    consoleParentComponent: '查看父組件',
    componentAction: '相關操作',
    copyFilePath: '複製文件路徑',
    copyComponentName: '複製組件名稱',
    copyComponentData: '複製組件$data',
    copyComponentProps: '複製組件$props',
    copyComponentTag: '複製組件標籤',
    copyComponentUid: '複製組件uid',
    copyComponentChian: '複製組件調用鏈',
    findComponents: '查找組件',
    printLifeCycleInfo: '打印生命週期信息',
    blockComponents: '阻斷組件'
  }
}
