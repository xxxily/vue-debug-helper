/*!
 * @name         inspect.js
 * @description  vue组件审查模块
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/10 18:25
 * @github       https://github.com/xxxily
 */
import helper from './helper'
// import debug from './debug'

const inspect = {
  findComponentsByElement (el) {
    let result = null
    let deep = 0
    let parent = el
    while (parent) {
      if (deep >= 50) {
        break
      }

      if (parent.__vue__) {
        result = parent
        break
      }

      deep++
      parent = parent.parentNode
    }

    return result
  },

  setContextMenu () {
    window.$.contextMenu({
      selector: 'body',
      zIndex: 2147483647,
      callback: function (itemKey, opt, e) {
        var m = 'global: ' + itemKey
        window.console && console.log(m)
      },
      items: {
        test: { name: '右键功能尚在开发中……' },
        edit: {
          name: '',
          icon: 'edit',
          // superseeds "global" callback
          callback: function (itemKey, opt, e) {
            var m = 'edit was clicked'
            window.console && console.log(m)
          }
        },
        cut: { name: 'Cut', icon: 'cut' },
        copy: { name: 'Copy', icon: 'copy' },
        paste: { name: 'Paste', icon: 'paste' },
        delete: { name: 'Delete', icon: 'delete' },
        sep1: '---------',
        quit: { name: 'Quit', icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit' } }
      }
    })
  },

  setOverlay (el) {
    let overlay = document.querySelector('#vue-debugger-overlay')
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = 'vue-debugger-overlay'
      overlay.style.position = 'fixed'
      overlay.style.backgroundColor = 'rgba(65, 184, 131, 0.35)'
      overlay.style.zIndex = 2147483647
      overlay.style.pointerEvents = 'none'
      document.body.appendChild(overlay)
    }

    const rect = el.getBoundingClientRect()

    overlay.style.width = rect.width + 'px'
    overlay.style.height = rect.height + 'px'
    overlay.style.left = rect.x + 'px'
    overlay.style.top = rect.y + 'px'
    overlay.style.display = 'block'

    // overlay.parentElement.addEventListener('contextmenu', function (e) {
    //   debug.log('overlay contextmenu')
    //   e.preventDefault()
    //   e.stopPropagation()
    // }, true)

    inspect.setContextMenu()
    // console.log(el, rect, el.__vue__._componentTag)
  },

  clearOverlay () {
    const overlay = document.querySelector('#vue-debugger-overlay')
    if (overlay) {
      overlay.style.display = 'none'
    }
  },

  init (Vue) {
    document.body.addEventListener('mouseover', (event) => {
      if (!helper.config.inspect.enabled) {
        return
      }

      const componentEl = inspect.findComponentsByElement(event.target)

      if (componentEl) {
        inspect.setOverlay(componentEl)
      }
    })
  }
}

export default inspect
