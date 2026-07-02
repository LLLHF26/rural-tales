// c:\Users\黄泽民\Desktop\vue\front-client\utils\api.js
import request from './request.js'
import { BASE_URL } from './config.js'

const api = {
  get: (url, data) => request({ url, method: 'GET', data }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data })
}

export default api

export const userApi = {
  sendCode: (phone) => request({ url: '/user/send-code', method: 'POST', data: { phone } }),
  login: (phone, code) => request({ url: '/user/login', method: 'POST', data: { phone, code } }),
  loginPassword: (phone, password) => request({ url: '/user/login-password', method: 'POST', data: { phone, password } }),
  setPassword: (phone, code, password) => request({ url: '/user/set-password', method: 'POST', data: { phone, code, password } }),
  getProfile: () => request({ url: '/user/profile' }),
  updateProfile: (data) => request({ url: '/user/profile', method: 'PUT', data }),
  getMyScripts: (status) => request({ url: '/user/scripts', data: { status } }),
  uploadFile: (filePath) => {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token')
      uni.uploadFile({
        url: BASE_URL + '/upload',
        filePath,
        name: 'file',
        header: { Authorization: `Bearer ${token}` },
        success: (res) => {
          const result = JSON.parse(res.data)
          result.code === 0 ? resolve(result.data) : reject(new Error(result.message))
        },
        fail: reject
      })
    })
  }
}

export const scriptApi = {
  getList: (params) => request({ url: '/scripts', data: params }),
  getDetail: (id) => request({ url: `/scripts/${id}` }),
  claim: (id) => request({ url: `/scripts/${id}/claim`, method: 'POST' }),
  rate: (id, rating) => request({ url: `/scripts/${id}/rate?rating=${rating}`, method: 'POST' }),
  getRecommend: (limit) => request({ url: '/scripts/recommend', data: { limit } })
}

export const playApi = {
  getCurrentNode: (progressId) => request({ url: `/play/${progressId}/current-node` }),
  getOpening: (progressId) => request({ url: `/play/${progressId}/opening`, method: 'POST' }),
  getProgress: (progressId) => request({ url: `/play/${progressId}/progress` }),
  getItems: (progressId) => request({ url: `/play/${progressId}/items` }),
  choose: (progressId, nodeId, choiceId) => request({ url: `/play/${progressId}/choose`, method: 'POST', data: { nodeId, choiceId } }),
  submitTask: (progressId, data) => request({ url: `/play/${progressId}/task/submit`, method: 'POST', data }),
  gpsCheckin: (progressId, data) => request({ url: `/play/${progressId}/gps-checkin`, method: 'POST', data }),
  advanceNode: (progressId, nextNodeId) => request({ url: `/play/${progressId}/advance-node`, method: 'POST', data: { nextNodeId } }),
  getEnding: (progressId, endingId) => request({ url: `/play/${progressId}/ending`, method: 'POST', data: { endingId } }),
  arCollect: (progressId, taskId, itemId, nodeId, photoUrl) => request({ url: `/ar/${progressId}/ar-collect`, method: 'POST', data: { taskId, itemId, nodeId, photoUrl } }),
  arPhoto: (progressId, npcId, photoUrl) => request({ url: `/play/${progressId}/ar-photo`, method: 'POST', data: { npcId, photoUrl } })
}

export const villageApi = {
  getList: (params) => request({ url: '/villages', data: params }),
  getDetail: (id) => request({ url: `/villages/${id}` })
}

export const arApi = {
  getResource: (taskId) => request({ url: `/ar/resource/${taskId}` }),
  detect: (taskId, photoUrl) => request({ url: '/ar/detect', method: 'POST', data: { taskId, photoUrl } })
}