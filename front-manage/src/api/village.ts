// ============================================================
// 乡村管理 API
// ============================================================
import http from './http'
import type {
  ApiResponse,
  PaginatedData,
  Village,
  VillageListItem,
  VillageSpot,
  VillageCulture,
  ListData
} from '@/types'

// --- 乡村 ---
export function getVillageList(params: { page?: number; pageSize?: number; keyword?: string }) {
  return http.get<ApiResponse<PaginatedData<VillageListItem>>>('/villages', { params })
}

export function getVillageDetail(villageId: string) {
  return http.get<ApiResponse<Village>>(`/villages/${villageId}`)
}

export function createVillage(data: Partial<Village>) {
  return http.post<ApiResponse<{ villageId: string }>>('/villages', data)
}

export function updateVillage(villageId: string, data: Partial<Village>) {
  return http.put<ApiResponse<null>>(`/villages/${villageId}`, data)
}

export function deleteVillage(villageId: string) {
  return http.delete<ApiResponse<null>>(`/villages/${villageId}`)
}

// --- 打卡点 ---
export function getVillageSpots(villageId: string) {
  return http.get<ApiResponse<ListData<VillageSpot>>>(`/villages/${villageId}/spots`)
}

export function createVillageSpot(villageId: string, data: Partial<VillageSpot>) {
  return http.post<ApiResponse<{ spotId: string }>>(`/villages/${villageId}/spots`, data)
}

export function updateVillageSpot(villageId: string, spotId: string, data: Partial<VillageSpot>) {
  return http.put<ApiResponse<null>>(`/villages/${villageId}/spots/${spotId}`, data)
}

export function deleteVillageSpot(villageId: string, spotId: string) {
  return http.delete<ApiResponse<null>>(`/villages/${villageId}/spots/${spotId}`)
}

// --- 文化条目 ---
export function getVillageCultures(villageId: string, type?: string) {
  return http.get<ApiResponse<ListData<VillageCulture>>>(`/villages/${villageId}/cultures`, { params: { type } })
}

export function createVillageCulture(villageId: string, data: Partial<VillageCulture>) {
  return http.post<ApiResponse<{ cultureId: string }>>(`/villages/${villageId}/cultures`, data)
}

export function updateVillageCulture(villageId: string, cultureId: string, data: Partial<VillageCulture>) {
  return http.put<ApiResponse<null>>(`/villages/${villageId}/cultures/${cultureId}`, data)
}

export function deleteVillageCulture(villageId: string, cultureId: string) {
  return http.delete<ApiResponse<null>>(`/villages/${villageId}/cultures/${cultureId}`)
}
