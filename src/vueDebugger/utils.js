/**
 * 对特定数据结构的对象进行排序
 * @param {object} obj 一个对象，其结构应该类似于：{key1: [], key2: []}
 * @param {boolean} reverse -可选 是否反转、降序排列，默认为false
 * @param {object} opts -可选 指定数组的配置项，默认为{key: 'key', value: 'value'}
 * @param {object} opts.key -可选 指定对象键名的别名，默认为'key'
 * @param {object} opts.value -可选 指定对象值的别名，默认为'value'
 * @returns {array} 返回一个数组，其结构应该类似于：[{key: key1, value: []}, {key: key2, value: []}]
 */
const objSort = (obj, reverse, opts = { key: 'key', value: 'value' }) => {
  const arr = []
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && Array.isArray(obj[key])) {
      const tmpObj = {}
      tmpObj[opts.key] = key
      tmpObj[opts.value] = obj[key]
      arr.push(tmpObj)
    }
  }

  arr.sort((a, b) => {
    return a[opts.value].length - b[opts.value].length
  })

  reverse && arr.reverse()
  return arr
}

/**
 * 根据指定长度创建空白数据
 * @param {number} size -可选 指str的重复次数，默认为1024次，如果str为单个单字节字符，则意味着默认产生1Mb的空白数据
 * @param {string|number|any} str - 可选 指定数据的字符串，默认为'd'
 */
function createEmptyData (count = 1024, str = 'd') {
  const arr = []
  arr.length = count + 1
  return arr.join(str)
}

/**
 * 将字符串分隔的过滤器转换为数组形式的过滤器
 * @param {string|array} filter - 必选 字符串或数组，字符串支持使用 , |符号对多个项进行分隔
 * @returns {array}
 */
function toArrFilters (filter) {
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

  filter = filter.map(item => item.trim())

  return filter
}

export { objSort, createEmptyData, toArrFilters }
