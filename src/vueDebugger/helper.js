import {
  objSort,
  createEmptyData
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
  /* 给组件注入空白数据的配置信息 */
  ddConfig: {
    enabled: false,
    filters: [],
    size: 1024
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

      if (moreDetail) {
        result.push({
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

  /**
   * 给指定组件注入大量空数据，以便观察组件的内存泄露情况
   * @param {Array|string} filter -必选 指定组件的名称，如果为空则表示注入所有组件
   * @param {number} size -可选 指定注入空数据的大小，单位Kb，默认为1024Kb，即1Mb
   * @returns
   */
  dd (filter, size = 1024) {
    filter = filter || []

    /* 如果是字符串，则支持通过, | 两个符号来指定多个组件名称的过滤器 */
    if (typeof filter === 'string') {
      /* 移除前后的, |分隔符，防止出现空字符的过滤规则 */
      filter.replace(/^(,|\|)/, '').replace(/(,|\|)$/, '')

      if (/\|/.test(filter)) {
        filter = filter.split('|')
      } else {
        filter = filter.split(',')
      }
    }

    helper.ddConfig = {
      enabled: true,
      filters: filter,
      size
    }
  },
  /* 禁止给组件注入空数据 */
  undd () {
    helper.ddConfig = {
      enabled: false,
      filters: [],
      size: 1024
    }
  }
}

helper.methods = methods

export default helper
