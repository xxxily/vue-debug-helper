/*!
 * @name         rollup.tree.config.js
 * @description  rollup 打包配置列表
 * @version      0.0.1
 * @author       Blaze
 * @date         24/04/2019 14:20
 * @github       https://github.com/xxxily
 */
const path = require('path')
const resolve = p => {
  return path.resolve(__dirname, '../', p)
}

const confTree = {
  vueDebugger: {
    version: '0.0.1',
    description: 'vueDebugger',
    input: resolve('src/vueDebugger/index.js'),
    output: {
      file: resolve('dist/vue-debug-helper.js'),
      format: 'es', // 可选值： amd, cjs, es, iife, umd
      name: 'vueDebugger'
    }
  }
}

module.exports = confTree
