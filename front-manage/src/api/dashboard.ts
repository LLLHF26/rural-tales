// ============================================================
// 仪表盘 API
// ============================================================
import http from './http'
import type {
  ApiResponse,
  DashboardOverview,
  DashboardTrend,
  HotScript,
  ListData
} from '@/types'

export function getDashboardOverview() {
  return http.get<ApiResponse<DashboardOverview>>('/dashboard/overview')
}

export function getDashboardTrend(days?: number) {
  return http.get<ApiResponse<DashboardTrend>>('/dashboard/trend', { params: { days } })
}

export function getHotScripts(limit?: number) {
  return http.get<ApiResponse<ListData<HotScript>>>('/dashboard/hot-scripts', { params: { limit } })
}
