// ============================================================
// Axios 实例封装
// ============================================================
import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/admin',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：注入 Token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一错误处理
http.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code !== 0) {
      if (!(response.config as any).silent) {
        ElMessage.error(res.message || '请求失败')
      }
      if (res.code === 1002) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_info')
        window.location.href = '/login'
      }
      return Promise.reject(res)
    }
    return response
  },
  (error: AxiosError) => {
    const silent = (error.config as any)?.silent
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      window.location.href = '/login'
      if (!silent) ElMessage.error('登录已过期，请重新登录')
    } else if (error.response?.status === 403) {
      if (!silent) ElMessage.error('无权限访问')
    } else if (error.response?.status === 500) {
      if (!silent) ElMessage.error('服务器内部错误')
    } else if (error.code === 'ECONNABORTED') {
      if (!silent) ElMessage.error('请求超时')
    } else {
      if (!silent) ElMessage.error('网络错误')
    }
    return Promise.reject(error)
  }
)

export default http
