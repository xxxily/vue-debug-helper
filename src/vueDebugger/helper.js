import {
  objSort,
  createEmptyData,
  toArrFilters
} from './utils'

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

  config: {
    /* 是否在控制台打印组件生命周期的相关信息 */
    lifecycle: {
      show: false,
      filters: ['created'],
      componentFilters: []
    }
  },

  /* 给组件注入空白数据的配置信息 */
  ddConfig: {
    enabled: false,
    filters: [],
    count: 1024
  }
}

const helper = window.vueDebugHelper

const methods = {
  objSort,
  createEmptyData,
  /* 清除全部helper的全部记录数据，以便重新统计 */
  clearAll () {
    helper.components = {}
    helper.componentsSummary = {}
    helper.componentsSummaryStatistics = {}
    helper.destroyList = []
    helper.destroyStatistics = {}
  },

  /**
   * 对当前的helper.components进行统计与排序
   * 如果一直没运行过清理函数，则表示统计页面创建至今依然存活的组件对象
   * 运行过清理函数，则表示统计清理后新创建且至今依然存活的组件对象
   */
  componentsStatistics (reverse = true) {
    const tmpObj = {}

    Object.keys(helper.components).forEach(key => {
      const component = helper.components[key]

      tmpObj[component._componentName]
        ? tmpObj[component._componentName].push(component)
        : (tmpObj[component._componentName] = [component])
    })

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
    const destroyList = helper.destroyList
    const destroyListLength = destroyList.length
    const destroyListDuration = destroyList.map(item => item.duration).sort()
    const maxDuration = Math.max(...destroyListDuration)
    const minDuration = Math.min(...destroyListDuration)
    const avgDuration =
      destroyListDuration.reduce((a, b) => a + b, 0) / destroyListLength
    const durationRange = maxDuration - minDuration
    const durationRangePercent = (duration - minDuration) / durationRange

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
    const result = []
    let current = component
    let deep = 0

    while (current && deep < 50) {
      deep++

      /**
       * 由于脚本注入的运行时间会比应用创建时间晚，所以会导致部分先创建的组件缺少相关信息
       * 这里尝试对部分信息进行修复，以便更好的查看组件的创建情况
       */
      if (!current._componentTag) {
        const tag = current.$vnode?.tag || current.$options?._componentTag || current._uid
        current._componentTag = tag
        current._componentName = isNaN(Number(tag)) ? tag.replace(/^vue-component-\d+-/, '') : 'anonymous-component'
      }

      if (moreDetail) {
        result.push({
          tag: current._componentTag,
          name: current._componentName,
          componentsSummary: helper.componentsSummary[current._uid] || null
        })
      } else {
        result.push(current._componentName)
      }

      current = current.$parent
    }

    if (moreDetail) {
      return result
    } else {
      return result.join(' -> ')
    }
  },

  printLifeCycleInfo (lifecycleFilters, componentFilters) {
    lifecycleFilters = toArrFilters(lifecycleFilters)
    componentFilters = toArrFilters(componentFilters)

    helper.config.lifecycle = {
      show: true,
      filters: lifecycleFilters,
      componentFilters: componentFilters
    }
  },
  notPrintLifeCycleInfo () {
    helper.config.lifecycle = {
      show: false,
      filters: ['created'],
      componentFilters: []
    }
  },

  /**
   * 给指定组件注入大量空数据，以便观察组件的内存泄露情况
   * @param {Array|string} filter -必选 指定组件的名称，如果为空则表示注入所有组件
   * @param {number} count -可选 指定注入空数据的大小，单位Kb，默认为1024Kb，即1Mb
   * @returns
   */
  dd (filter, count = 1024) {
    filter = toArrFilters(filter)
    helper.ddConfig = {
      enabled: true,
      filters: filter,
      count
    }
  },
  /* 禁止给组件注入空数据 */
  undd () {
    helper.ddConfig = {
      enabled: false,
      filters: [],
      count: 1024
    }

    /* 删除之前注入的数据 */
    Object.keys(helper.components).forEach(key => {
      const component = helper.components[key]
      component.$data && delete component.$data.__dd__
    })
  }
}

helper.methods = methods

export default helper
