// ============================================================
// 认证 API
// ============================================================
import http from './http'
import type { ApiResponse, LoginResult, AdminInfo } from '@/types'

export function login(username: string, password: string) {
  return http.post<ApiResponse<LoginResult>>('/auth/login', { username, password })
}

export function getProfile() {
  return http.get<ApiResponse<AdminInfo>>('/auth/profile')
}

export function changePassword(oldPassword: string, newPassword: string) {
  return http.put<ApiResponse<null>>('/auth/password', { oldPassword, newPassword })
}
