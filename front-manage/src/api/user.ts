// ============================================================
// 用户管理 API
// ============================================================
import http from './http'
import type { ApiResponse, PaginatedData, UserListItem, UserDetail, UserProgress, ProgressDetail } from '@/types'

export function getUserList(params: {
  page?: number; pageSize?: number; keyword?: string; startDate?: string; endDate?: string
}) {
  return http.get<ApiResponse<PaginatedData<UserListItem>>>('/users', { params })
}

export function getUserDetail(userId: string) {
  return http.get<ApiResponse<UserDetail>>(`/users/${userId}`)
}

export function getUserProgresses(userId: string, params: { page?: number; pageSize?: number; status?: string }) {
  return http.get<ApiResponse<PaginatedData<UserProgress>>>(`/users/${userId}/progresses`, { params })
}

export function getProgressDetail(userId: string, progressId: string) {
  return http.get<ApiResponse<ProgressDetail>>(`/users/${userId}/progresses/${progressId}`)
}
