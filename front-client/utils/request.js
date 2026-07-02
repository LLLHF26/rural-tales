// c:\Users\黄泽民\Desktop\vue\front-client\utils\request.js
import { BASE_URL } from './config.js'

const request = (options) => {
  const token = uni.getStorageSync('token')
  const header = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }

  // 过滤掉 null/undefined/空字符串，避免后端 422
  let data = options.data
  if (data) {
    const clean = {}
    Object.keys(data).forEach(k => {
      const v = data[k]
      if (v !== null && v !== undefined && v !== '') clean[k] = v
    })
    data = clean
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data,
      header,
      timeout: 8000,
      success: (res) => {
        const { code, message, data, detail } = res.data

        // FastAPI HTTPException 把错误包在 detail 里
        if (detail && detail.code) {
          if (detail.code === 1002) {
            uni.removeStorageSync('token')
            uni.reLaunch({ url: '/pages/login/index' })
            reject(new Error(detail.message || '请先登录'))
            return
          }
          uni.showToast({ title: detail.message || '请求失败', icon: 'none' })
          reject(new Error(detail.message))
          return
        }

        if (code === 0) {
          resolve(data)
        } else if (code === 1002) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/login/index' })
          reject(new Error(message || '请先登录'))
        } else {
          uni.showToast({ title: message || '请求失败', icon: 'none' })
          reject(new Error(message))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default request