import debug from './debug'
import helper from './helper'

function mixinRegister (Vue) {
  if(!Vue || !Vue.mixin) {
    debug.error('未检查到VUE对象，请检查是否引入了VUE，且将VUE对象挂载到全局变量window.Vue上')
    return false
  }
  
  Vue.mixin({
    beforeCreate: function() {
      const tag = this.$options?._componentTag || this.$vnode?.tag || this._uid
      const chain = helper.methods.getComponentChain(this)
      this._componentTag = tag
      this._componentChain = chain
      this._componentName = isNaN(Number(tag)) ? tag.replace(/^vue\-component\-\d+\-/, '') : 'anonymous-component'
      this._createdTime = Date.now()
  
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
    },
    created: function() {
      /* 增加空白数据，方便观察内存泄露情况 */
      if (helper.ddConfig.enabled) {
        let needDd = false
  
        if (helper.ddConfig.filters.length === 0) {
          needDd = true
        } else {
          for (let index = 0; index < helper.ddConfig.filters.length; index++) {
            const filter = helper.ddConfig.filters[index]
            if (filter === this._componentName || String(this._componentName).endsWith(filter)) {
              needDd = true
              break
            }
          }
        }
  
        if (needDd) {
          const size = helper.ddConfig.size * 1024
          const componentInfo = `tag: ${this._componentTag}, uid: ${this._uid}, createdTime: ${this._createdTime}`
          this.$data.__dd__ = componentInfo + ' ' + helper.methods.createEmptyData(size, 'd')
          console.log(`[dd success] ${componentInfo}`, this)
        }
      }
    },
    destroyed: function() {
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
        delete helper.components[uid]
      } else {
        console.error('存在未被正常标记的组件，请检查组件采集逻辑是否需完善', this)
      }
    }
  })
}

export default mixinRegister