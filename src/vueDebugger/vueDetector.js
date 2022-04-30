/*!
 * @name         vueDetector.js
 * @description  检测页面是否存在Vue对象
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/04/27 11:43
 * @github       https://github.com/xxxily
 */
import debug from './debug'

function mutationDetector (callback, shadowRoot) {
  const win = window
  const MutationObserver = win.MutationObserver || win.WebKitMutationObserver
  const docRoot = shadowRoot || win.document.documentElement
  const maxDetectTries = 1500
  const timeout = 1000 * 10
  const startTime = Date.now()
  let detectCount = 0
  let detectStatus = false

  if (!MutationObserver) {
    debug.warn('MutationObserver is not supported in this browser')
    return false
  }

  let mObserver = null
  const mObserverCallback = (mutationsList, observer) => {
    if (detectStatus) {
      return
    }

    /* 超时或检测次数过多，取消监听 */
    if (Date.now() - startTime > timeout || detectCount > maxDetectTries) {
      debug.warn('mutationDetector timeout or detectCount > maxDetectTries, stop detect')
      if (mObserver && mObserver.disconnect) {
        mObserver.disconnect()
        mObserver = null
      }
    }

    for (let i = 0; i < mutationsList.length; i++) {
      detectCount++
      const mutation = mutationsList[i]
      if (mutation.target && mutation.target.__vue__) {
        let Vue = Object.getPrototypeOf(mutation.target.__vue__).constructor
        while (Vue.super) {
          Vue = Vue.super
        }

        /* 检测成功后销毁观察对象 */
        if (mObserver && mObserver.disconnect) {
          mObserver.disconnect()
          mObserver = null
        }

        detectStatus = true
        callback && callback(Vue)
        break
      }
    }
  }

  mObserver = new MutationObserver(mObserverCallback)
  mObserver.observe(docRoot, {
    attributes: true,
    childList: true,
    subtree: true
  })
}

/**
 * 检测页面是否存在Vue对象，方法参考：https://github.com/vuejs/devtools/blob/main/packages/shell-chrome/src/detector.js
 * @param {window} win windwod对象
 * @param {function} callback 检测到Vue对象后的回调函数
 */
function vueDetect (win, callback) {
  let delay = 1000
  let detectRemainingTries = 10
  let detectSuc = false

  // Method 1: MutationObserver detector
  mutationDetector((Vue) => {
    if (!detectSuc) {
      debug.info(`------------- Vue mutation detected (${Vue.version}) -------------`)
      detectSuc = true
      callback(Vue)
    }
  })

  function runDetect () {
    if (detectSuc) {
      return false
    }

    // Method 2: Check  Vue 3
    const vueDetected = !!(win.__VUE__)
    if (vueDetected) {
      debug.info(`------------- Vue global detected (${win.__VUE__.version}) -------------`)
      detectSuc = true
      callback(win.__VUE__)
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
      debug.info(`------------- Vue dom detected (${Vue.version}) -------------`)
      detectSuc = true
      callback(Vue)
      return
    }

    if (detectRemainingTries > 0) {
      detectRemainingTries--

      if (detectRemainingTries >= 7) {
        setTimeout(() => {
          runDetect()
        }, 40)
      } else {
        setTimeout(() => {
          runDetect()
        }, delay)
        delay *= 5
      }
    }
  }

  setTimeout(() => {
    runDetect()
  }, 40)
}

export default vueDetect
