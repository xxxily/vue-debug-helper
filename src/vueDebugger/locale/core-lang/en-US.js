export default {
  about: 'about',
  issues: 'feedback',
  setting: 'settings',
  hotkeys: 'Shortcut keys',
  donate: 'donate',
  quit: 'quit',
  refreshPage: 'Refresh the page',
  debugHelper: {
    viewVueDebugHelperObject: 'vueDebugHelper object',
    componentsStatistics: 'Current surviving component statistics',
    destroyStatisticsSort: 'Destroyed component statistics',
    componentsSummaryStatisticsSort: 'All components mixed statistics',
    getDestroyByDuration: 'Component survival time information',
    clearAll: 'Clear statistics',
    printLifeCycleInfo: 'Print component life cycle information',
    notPrintLifeCycleInfo: 'Cancel the printing of component life cycle information',
    printLifeCycleInfoPrompt: {
      lifecycleFilters: 'Enter the lifecycle name to be printed, multiple available, or | separated, supported values: beforeCreate|created|beforeMount|mounted|beforeUpdate|updated|activated|deactivated|beforeDestroy|destroyed',
      componentFilters: 'Enter the name of the component to be printed, multiple available, or | separated, if not input, print all components, add * after the string to perform fuzzy matching'
    },
    findComponents: 'Find Components',
    findComponentsPrompt: {
      filters: 'Enter the name of the component to find, or uid, multiple available, or | separated, followed by * to perform fuzzy matching'
    },
    findNotContainElementComponents: 'Find components that do not contain DOM objects',
    blockComponents: 'Block the creation of components',
    blockComponentsPrompt: {
      filters: 'Enter the name of the component to be blocked, multiple available, or | separated, the input is empty to cancel the blocking, add * after the string to perform fuzzy matching'
    },
    dd: 'Data injection (dd)',
    undd: 'Cancel data injection (undd)',
    ddPrompt: {
      filter: 'Component filter (if empty, inject all components)',
      count: 'Specify the number of repetitions of injected data (default 1024)'
    },
    toggleHackVueComponent: 'Rewrite/restore Vue.component',
    hackVueComponent: {
      hack: 'Rewrite Vue.component',
      unhack: 'Restore Vue.component'
    },
    toggleInspect: 'Toggle Inspect',
    inspectStatus: {
      on: 'Enable Inspect',
      off: 'Turn off Inspect'
    },
    togglePerformanceObserver: 'Turn on/off performance observation',
    performanceObserverStatus: {
      on: 'Enable performance observation',
      off: 'Turn off performance observation'
    },
    performanceObserverPrompt: {
      entryTypes: 'Enter the type to be observed, multiple types are available, or | separated, the supported types are: element, navigation, resource, mark, measure, paint, longtask',
      notSupport: 'The current browser does not support performance observation'
    },
    enableAjaxCacheTips: 'The interface cache function is enabled',
    disableAjaxCacheTips: 'The interface cache function has been closed',
    toggleAjaxCache: 'Enable/disable interface cache',
    ajaxCacheStatus: {
      on: 'Enable interface cache',
      off: 'Turn off the interface cache'
    },
    clearAjaxCache: 'Clear interface cache data',
    clearAjaxCacheTips: 'The interface cache data has been cleared',
    jaxCachePrompt: {
      filters: 'Enter the interface address to be cached, multiple available, or | separated, followed by * to perform fuzzy matching',
      expires: 'Enter the cache expiration time in minutes, the default is 1440 minutes (ie 24 hours)'
    },
    measureSelectorInterval: 'Measure selector time difference',
    measureSelectorIntervalPrompt: {
      selector1: 'input start selector',
      selector2: 'input end selector'
    },
    selectorReadyTips: 'The element is ready',
    devtools: {
      enabled: 'Automatically enable vue-devtools',
      disable: 'Disable to enable vue-devtools'
    }
  },
  contextMenu: {
    consoleComponent: 'View component',
    consoleComponentData: 'View component data',
    consoleComponentProps: 'View component props',
    consoleComponentChain: 'View the component call chain',
    consoleParentComponent: 'View parent component',
    componentAction: 'Related actions',
    copyFilePath: 'Copy file path',
    copyComponentName: 'Copy component name',
    copyComponentData: 'Copy component $data',
    copyComponentProps: 'Copy component $props',
    copyComponentTag: 'Copy component tag',
    copyComponentUid: 'Copy component uid',
    copyComponentChian: 'Copy component call chain',
    findComponents: 'Find Components',
    printLifeCycleInfo: 'Print life cycle information',
    blockComponents: 'Block Components'
  }
}
