const babel = require('@babel/core')
const code = babel.transformFileSync('./src/test.js', {})

console.log(code)
