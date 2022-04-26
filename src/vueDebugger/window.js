/**
 * 由于tampermonkey对window对象进行了封装，我们实际访问到的window并非页面真实的window
 * 这就导致了如果我们需要将某些对象挂载到页面的window进行调试的时候就无法挂载了
 * 所以必须使用特殊手段才能访问到页面真实的window对象，于是就有了下面这个函数
 * @returns {Promise<void>}
 */
 async function getPageWindow () {
  return new Promise(function (resolve, reject) {
    if (window._pageWindow) {
      return resolve(window._pageWindow)
    }

    const listenEventList = ['load', 'mousemove', 'scroll', 'get-page-window-event']

    function getWin (event) {
      window._pageWindow = this
      // debug.log('getPageWindow succeed', event)
      listenEventList.forEach(eventType => {
        window.removeEventListener(eventType, getWin, true)
      })
      resolve(window._pageWindow)
    }

    listenEventList.forEach(eventType => {
      window.addEventListener(eventType, getWin, true)
    })

    /* 自行派发事件以便用最短的时候获得pageWindow对象 */
    window.dispatchEvent(new window.Event('get-page-window-event'))
  })
}
// getPageWindow()

/**
 * 通过同步的方式获取pageWindow
 * 注意同步获取的方式需要将脚本写入head，部分网站由于安全策略会导致写入失败，而无法正常获取
 * @returns {*}
 */
function getPageWindowSync () {
  if (document._win_) return document._win_

  const head = document.head || document.querySelector('head')
  const script = document.createElement('script')
  script.appendChild(document.createTextNode('document._win_ = window'))
  head.appendChild(script)

  return document._win_
}

export { getPageWindow, getPageWindowSync }