import localStorageProxy from 'local-storage-proxy'
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
    },

    /* 查找组件的过滤器配置 */
    findComponentsFilters: [],

    /* 阻止组件创建的过滤器 */
    blockFilters: [],

    devtools: true,

    /* 给组件注入空白数据的配置信息 */
    dd: {
      enabled: false,
      filters: [],
      count: 1024
    }
  }
}

const helper = window.vueDebugHelper

/* 配置信息跟localStorage联动 */
const state = localStorageProxy('vueDebugHelperConfig', {
  defaults: helper.config,
  lspReset: false,
  storageEventListener: false
})
helper.config = state

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
    const avgDuration = destroyListDuration.reduce((a, b) => a + b, 0) / destroyListLength
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
   * 查找组件
   * @param {string|array} filters 组件名称或组件uid的过滤器，可以是字符串或者数组，如果是字符串多个过滤选可用,或|分隔
   * 如果过滤项是数字，则跟组件的id进行精确匹配，如果是字符串，则跟组件的tag信息进行模糊匹配
   * @returns {object} {components: [], componentNames: []}
   */
  findComponents (filters) {
    filters = toArrFilters(filters)

    /* 对filters进行预处理，如果为纯数字则表示通过id查找组件 */
    filters = filters.map(filter => {
      if (/^\d+$/.test(filter)) {
        return Number(filter)
      } else {
        return filter
      }
    })

    helper.config.findComponentsFilters = filters

    const result = {
      components: [],
      globalComponents: [],
      destroyedComponents: []
    }

    /* 在helper.components里进行组件查找 */
    const components = helper.components
    const keys = Object.keys(components)
    for (let i = 0; i < keys.length; i++) {
      const component = components[keys[i]]

      for (let j = 0; j < filters.length; j++) {
        const filter = filters[j]

        if (typeof filter === 'number' && component._uid === filter) {
          result.components.push(component)
          break
        } else if (typeof filter === 'string') {
          const { _componentTag, _componentName } = component

          if (String(_componentTag).includes(filter) || String(_componentName).includes(filter)) {
            result.components.push(component)
            break
          }
        }
      }
    }

    /* 进行全局组件查找 */
    const globalComponentsKeys = Object.keys(helper.Vue.options.components)
    for (let i = 0; i < globalComponentsKeys.length; i++) {
      const key = String(globalComponentsKeys[i])
      const component = helper.Vue.options.components[globalComponentsKeys[i]]

      for (let j = 0; j < filters.length; j++) {
        const filter = filters[j]
        if (key.includes(filter)) {
          const tmpObj = {}
          tmpObj[key] = component
          result.globalComponents.push(tmpObj)
          break
        }
      }
    }

    helper.destroyList.forEach(item => {
      for (let j = 0; j < filters.length; j++) {
        const filter = filters[j]

        if (typeof filter === 'number' && item.uid === filter) {
          result.destroyedComponents.push(item)
          break
        } else if (typeof filter === 'string') {
          if (String(item.tag).includes(filter) || String(item.name).includes(filter)) {
            result.destroyedComponents.push(item)
            break
          }
        }
      }
    })

    return result
  },

  findNotContainElementComponents () {
    const result = []
    const keys = Object.keys(helper.components)
    keys.forEach(key => {
      const component = helper.components[key]
      const elStr = Object.prototype.toString.call(component.$el)
      if (!/(HTML|Comment)/.test(elStr)) {
        result.push(component)
      }
    })

    return result
  },

  /**
   * 阻止组件的创建
   * @param {string|array} filters 组件名称过滤器，可以是字符串或者数组，如果是字符串多个过滤选可用,或|分隔
   */
  blockComponents (filters) {
    filters = toArrFilters(filters)
    helper.config.blockFilters = filters
  },

  /**
   * 给指定组件注入大量空数据，以便观察组件的内存泄露情况
   * @param {Array|string} filter -必选 指定组件的名称，如果为空则表示注入所有组件
   * @param {number} count -可选 指定注入空数据的大小，单位Kb，默认为1024Kb，即1Mb
   * @returns
   */
  dd (filter, count = 1024) {
    filter = toArrFilters(filter)
    helper.config.dd = {
      enabled: true,
      filters: filter,
      count
    }
  },
  /* 禁止给组件注入空数据 */
  undd () {
    helper.config.dd = {
      enabled: false,
      filters: [],
      count: 1024
    }

    /* 删除之前注入的数据 */
    Object.keys(helper.components).forEach(key => {
      const component = helper.components[key]
      component.$data && delete component.$data.__dd__
    })
  },

  toggleDevtools () {
    helper.config.devtools = !helper.config.devtools
  }
}

helper.methods = methods

export default helper
