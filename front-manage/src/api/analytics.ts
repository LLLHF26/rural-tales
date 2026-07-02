// ============================================================
// 数据分析 API
// ============================================================
import http from './http'
import type {
  ApiResponse,
  ScriptAnalytics,
  NodeFunnelItem,
  TaskStatItem,
  UserProfile,
  RatingItem,
  PaginatedData,
  ListData
} from '@/types'

export function getScriptsOverview(villageId?: string) {
  return http.get<ApiResponse<ListData<ScriptAnalytics>>>('/analytics/scripts-overview', { params: { villageId } })
}

export function getNodeFunnel(scriptId: string) {
  return http.get<ApiResponse<{ nodes: NodeFunnelItem[] }>>(`/analytics/scripts/${scriptId}/node-funnel`)
}

export function getTaskStats(scriptId: string) {
  return http.get<ApiResponse<ListData<TaskStatItem>>>(`/analytics/scripts/${scriptId}/task-stats`)
}

export function getUserProfile() {
  return http.get<ApiResponse<UserProfile>>('/analytics/user-profile')
}

export function getRatings(params: { page?: number; pageSize?: number; scriptId?: string; rating?: number }) {
  return http.get<ApiResponse<PaginatedData<RatingItem>>>('/analytics/ratings', { params })
}
