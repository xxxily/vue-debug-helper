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
  let delay = 1000
  let detectRemainingTries = 10

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
    const vueDetected = !!(window.__VUE__)
    if (vueDetected) {
      callback(window.__VUE__)
      return
    }

    // Method 3: Scan all elements inside document
    const all = document.querySelectorAll('*')
    let el
    for (let i = 0; i < all.length; i++) {
      if (all[i].__vue__) {
        el = all[i]
        break
      }
    }
    if (el) {
      let Vue = Object.getPrototypeOf(el.__vue__).constructor
      while (Vue.super) {
        Vue = Vue.super
      }
      callback(Vue)
      return
    }

    if (detectRemainingTries > 0) {
      detectRemainingTries--
      setTimeout(() => {
        runDetect()
      }, delay)
      delay *= 5
    }
  }

  setTimeout(() => {
    runDetect()
  }, 100)
}

export default vueDetect
