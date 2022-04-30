import helper from './helper'
import debug from './debug'

/**
 * 打印生命周期信息
 * @param {Vue} vm vue组件实例
 * @param {string} lifeCycle vue生命周期名称
 * @returns
 */
function printLifeCycle (vm, lifeCycle) {
  const lifeCycleConf = helper.config.lifecycle || { show: false, filters: ['created'], componentFilters: [] }

  if (!vm || !lifeCycle || !lifeCycleConf.show) {
    return false
  }

  const { _componentTag, _componentName, _componentChain, _createdHumanTime, _uid } = vm
  const info = `[${lifeCycle}] tag: ${_componentTag}, uid: ${_uid}, createdTime: ${_createdHumanTime}, chain: ${_componentChain}`
  const matchComponentFilters = lifeCycleConf.componentFilters.length === 0 || lifeCycleConf.componentFilters.includes(_componentName)

  if (lifeCycleConf.filters.includes(lifeCycle) && matchComponentFilters) {
    debug.log(info)
  }
}

function mixinRegister (Vue) {
  if (!Vue || !Vue.mixin) {
    debug.error('未检查到VUE对象，请检查是否引入了VUE，且将VUE对象挂载到全局变量window.Vue上')
    return false
  }

  /* 自动开启Vue的调试模式 */
  if (Vue.config) {
    if (helper.config.devtools) {
      Vue.config.debug = true
      Vue.config.devtools = true
      Vue.config.performance = true
    } else {
      Vue.config.debug = false
      Vue.config.devtools = false
      Vue.config.performance = false
    }
  } else {
    debug.log('Vue.config is not defined')
  }

  Vue.mixin({
    beforeCreate: function () {
      // const tag = this.$options?._componentTag || this.$vnode?.tag || this._uid
      const tag = this.$vnode?.tag || this.$options?._componentTag || this._uid
      const chain = helper.methods.getComponentChain(this)
      this._componentTag = tag
      this._componentChain = chain
      this._componentName = isNaN(Number(tag)) ? tag.replace(/^vue-component-\d+-/, '') : 'anonymous-component'
      this._createdTime = Date.now()

      /* 增加人类方便查看的时间信息 */
      const timeObj = new Date(this._createdTime)
      this._createdHumanTime = `${timeObj.getHours()}:${timeObj.getMinutes()}:${timeObj.getSeconds()}`

      /* 判断是否为函数式组件，函数式组件无状态 (没有响应式数据)，也没有实例，也没生命周期概念 */
      if (this._componentName === 'anonymous-component' && !this.$parent && !this.$vnode) {
        this._componentName = 'functional-component'
      }

      helper.components[this._uid] = this

      /**
       * 收集所有创建过的组件信息，此处只存储组件的基础信息，没销毁的组件会包含组件实例
       * 严禁对组件内其它对象进行引用，否则会导致组件实列无法被正常回收
       */
      const componentSummary = {
        uid: this._uid,
        name: this._componentName,
        tag: this._componentTag,
        createdTime: this._createdTime,
        createdHumanTime: this._createdHumanTime,
        // 0 表示还没被销毁
        destroyTime: 0,
        // 0 表示还没被销毁，duration可持续当当前查看时间
        duration: 0,
        component: this,
        chain
      }
      helper.componentsSummary[this._uid] = componentSummary

      /* 添加到componentsSummaryStatistics里，生成统计信息 */
      Array.isArray(helper.componentsSummaryStatistics[this._componentName])
        ? helper.componentsSummaryStatistics[this._componentName].push(componentSummary)
        : (helper.componentsSummaryStatistics[this._componentName] = [componentSummary])

      printLifeCycle(this, 'beforeCreate')

      /* 使用$destroy阻断组件的创建 */
      if (helper.config.blockFilters && helper.config.blockFilters.length) {
        if (helper.config.blockFilters.includes(this._componentName)) {
          debug.log(`[block component]: name: ${this._componentName}, tag: ${this._componentTag}, uid: ${this._uid}`)
          this.$destroy()
          return false
        }
      }
    },
    created: function () {
      /* 增加空白数据，方便观察内存泄露情况 */
      if (helper.config.dd.enabled) {
        let needDd = false

        if (helper.config.dd.filters.length === 0) {
          needDd = true
        } else {
          for (let index = 0; index < helper.config.dd.filters.length; index++) {
            const filter = helper.config.dd.filters[index]
            if (filter === this._componentName || String(this._componentName).endsWith(filter)) {
              needDd = true
              break
            }
          }
        }

        if (needDd) {
          const count = helper.config.dd.count * 1024
          const componentInfo = `tag: ${this._componentTag}, uid: ${this._uid}, createdTime: ${this._createdHumanTime}`

          /* 此处必须使用JSON.stringify对产生的字符串进行消费，否则没法将内存占用上去 */
          this.$data.__dd__ = JSON.stringify(componentInfo + ' ' + helper.methods.createEmptyData(count, this._uid))

          console.log(`[dd success] ${componentInfo} chain: ${this._componentChain}`)
        }
      }

      printLifeCycle(this, 'created')
    },
    beforeMount: function () {
      printLifeCycle(this, 'beforeMount')
    },
    mounted: function () {
      printLifeCycle(this, 'mounted')
    },
    beforeUpdate: function () {
      printLifeCycle(this, 'beforeUpdate')
    },
    activated: function () {
      printLifeCycle(this, 'activated')
    },
    deactivated: function () {
      printLifeCycle(this, 'deactivated')
    },
    updated: function () {
      printLifeCycle(this, 'updated')
    },
    beforeDestroy: function () {
      printLifeCycle(this, 'beforeDestroy')
    },
    destroyed: function () {
      printLifeCycle(this, 'destroyed')

      if (this._componentTag) {
        const uid = this._uid
        const name = this._componentName
        const destroyTime = Date.now()

        /* helper里的componentSummary有可能通过调用clear函数而被清除掉，所以需进行判断再更新赋值 */
        const componentSummary = helper.componentsSummary[this._uid]
        if (componentSummary) {
          /* 补充/更新组件信息 */
          componentSummary.destroyTime = destroyTime
          componentSummary.duration = destroyTime - this._createdTime

          helper.destroyList.push(componentSummary)

          /* 统计被销毁的组件信息 */
          Array.isArray(helper.destroyStatistics[name])
            ? helper.destroyStatistics[name].push(componentSummary)
            : (helper.destroyStatistics[name] = [componentSummary])

          /* 删除已销毁的组件实例 */
          delete componentSummary.component
        }

        // 解除引用关系
        delete this._componentTag
        delete this._componentChain
        delete this._componentName
        delete this._createdTime
        delete this._createdHumanTime
        delete this.$data.__dd__
        delete helper.components[uid]
      } else {
        console.error('存在未被正常标记的组件，请检查组件采集逻辑是否需完善', this)
      }
    }
  })
}

export default mixinRegister
