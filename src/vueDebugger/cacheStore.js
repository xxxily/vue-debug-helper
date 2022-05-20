/*!
 * @name         cacheStore.js
 * @description  接口请求缓存存储管理模块
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/13 09:36
 * @github       https://github.com/xxxily
 */

import debug from './debug'
const localforage = window.localforage
const CryptoJS = window.CryptoJS

function md5 (str) {
  return CryptoJS.MD5(str).toString()
}

function createHash (config) {
  if (config._hash_) {
    return config._hash_
  }

  let url = config.url || ''

  /**
   * 如果检测到url使用了时间戳来防止缓存，则进行替换，进行缓存
   * TODO
   * 注意，这很可能会导致误伤，例如url上的时间戳并不是用来清理缓存的，而是某个时间点的参数
   */
  if (/=\d{13}/.test(url)) {
    url = url.replace(/=\d{13}/, '=cache')
  }

  let hashStr = url + config.method

  if (config.method.toUpperCase() === 'POST') {
    hashStr += JSON.stringify(config.data) + JSON.stringify(config.body)
  }

  const hash = md5(hashStr)

  // if (url.includes('weixin.qq.com')) {
  //   hash = md5(config.url.replace(/\?\S+/, ''))
  // }

  config._hash_ = hash

  return hash
}

class CacheStore {
  constructor (opts = {
    localforageConfig: {}
  }) {
    this.store = localforage.createInstance(Object.assign({
      name: 'vue-debug-helper-cache',
      storeName: 'ajax-cache'
    }, opts.localforageConfig))

    /* 外部应该使用同样的hash生成方法，否则无法正常命中缓存规则 */
    this.createHash = createHash
  }

  async getCache (config) {
    const hash = createHash(config)
    const data = await this.store.getItem(hash)
    return data
  }

  async setCache (response, isFetch) {
    const headers = response.headers || {}
    let isJsonResult = String(headers['content-type']).includes('application/json')

    let resData = response.response || null
    if (isFetch && response.clone) {
      const res = response.clone()
      const resJson = await res.json().catch((err) => {
        // 解析出错，忽略报错
        if (err) {}
      })

      if (resJson) {
        isJsonResult = true
        resData = JSON.stringify(resJson)
      }
    }

    if (resData && isJsonResult) {
      const hash = createHash(response.config)
      await this.store.setItem(hash, resData)

      /* 设置缓存的时候顺便更新缓存相关的基础信息，注意，该信息并不能100%被同步到本地 */
      await this.updateCacheInfo(response.config)

      debug.log(`[cacheStore setCache][${hash}] ${response.config.url}`, response)
    }
  }

  async getCacheInfo (config) {
    const hash = config ? this.createHash(config) : ''
    if (this._cacheInfo_) {
      return hash ? this._cacheInfo_[hash] : this._cacheInfo_
    }

    /* 在没将cacheInfo加载到内存前，只能单线程获取cacheInfo，防止多线程获取cacheInfo时出现问题 */
    if (this._takeingCacheInfo_) {
      const getCacheInfoHanderList = this._getCacheInfoHanderList_ || []
      const P = new Promise((resolve, reject) => {
        getCacheInfoHanderList.push({
          resolve,
          config
        })
      })
      this._getCacheInfoHanderList_ = getCacheInfoHanderList
      return P
    }

    this._takeingCacheInfo_ = true
    const cacheInfo = await this.store.getItem('ajaxCacheInfo') || {}
    this._cacheInfo_ = cacheInfo

    delete this._takeingCacheInfo_
    if (this._getCacheInfoHanderList_) {
      this._getCacheInfoHanderList_.forEach(async (handler) => {
        handler.resolve(await this.getCacheInfo(handler.config))
      })
      delete this._getCacheInfoHanderList_
    }

    return hash ? cacheInfo[hash] : cacheInfo
  }

  async updateCacheInfo (config) {
    const cacheInfo = await this.getCacheInfo()

    if (config) {
      const hash = createHash(config)
      if (hash && config) {
        const info = {
          url: config.url,
          cacheTime: Date.now()
        }

        // 增加或更新缓存的基本信息
        cacheInfo[hash] = info
      }
    }

    if (!this._updateCacheInfoIsWorking_) {
      this._updateCacheInfoIsWorking_ = true
      await this.store.setItem('ajaxCacheInfo', cacheInfo)
      this._updateCacheInfoIsWorking_ = false
    }
  }

  /**
   * 清理已过期的缓存数据
   * @param {number} expires 指定过期时间，单位：毫秒
   * @returns
   */
  async cleanCache (expires) {
    if (!expires) {
      return
    }

    const cacheInfo = await this.getCacheInfo()
    const cacheInfoKeys = Object.keys(cacheInfo)
    const now = Date.now()

    const storeKeys = await this.store.keys()

    const needKeepKeys = cacheInfoKeys.filter(key => now - cacheInfo[key].cacheTime < expires)
    needKeepKeys.push('ajaxCacheInfo')

    const clearResult = []

    /* 清理不需要的数据 */
    storeKeys.forEach((key) => {
      if (!needKeepKeys.includes(key)) {
        clearResult.push(this._cacheInfo_[key] || key)

        this.store.removeItem(key)
        delete this._cacheInfo_[key]
      }
    })

    /* 更新缓存信息 */
    if (clearResult.length) {
      await this.updateCacheInfo()
      debug.log('[cacheStore cleanCache] clearResult:', clearResult)
    }
  }

  async get (key) {
    const data = await this.store.getItem(key)
    debug.log('[cacheStore]', key, data)
    return data
  }

  async set (key, data) {
    await this.store.setItem(key, data)
    debug.log('[cacheStore]', key, data)
  }

  async remove (key) {
    await this.store.removeItem(key)
    debug.log('[cacheStore]', key)
  }

  async clear () {
    await this.store.clear()
    debug.log('[cacheStore] clear')
  }

  async keys () {
    const keys = await this.store.keys()
    debug.log('[cacheStore] keys', keys)
    return keys
  }
}

export default new CacheStore()
