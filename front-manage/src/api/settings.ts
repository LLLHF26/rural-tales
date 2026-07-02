// ============================================================
// 系统设置 API
// ============================================================
import http from './http'
import type { ApiResponse, AdminAccount, AIConfig, ImageResource, AudioResource, PaginatedData, ListData } from '@/types'

// --- 管理员 ---
export function getAdminList() {
  return http.get<ApiResponse<ListData<AdminAccount>>>('/admins')
}

export function createAdmin(data: { username: string; password: string; nickname: string; role: string }) {
  return http.post<ApiResponse<{ adminId: string }>>('/admins', data)
}

export function updateAdmin(adminId: string, data: Record<string, any>) {
  return http.put<ApiResponse<null>>(`/admins/${adminId}`, data)
}

export function deleteAdmin(adminId: string) {
  return http.delete<ApiResponse<null>>(`/admins/${adminId}`)
}

// --- AI 配置 ---
export function getAIConfig() {
  return http.get<ApiResponse<AIConfig>>('/settings/ai')
}

export function updateAIConfig(data: Partial<AIConfig>) {
  return http.put<ApiResponse<null>>('/settings/ai', data)
}

// --- 素材库 ---
export function uploadFile(file: File, category?: string, resourceType: 'image' | 'audio' = 'image') {
  const formData = new FormData()
  formData.append('file', file)
  if (category) formData.append('category', category)
  formData.append('resource_type', resourceType)
  return http.post<ApiResponse<{ url: string; resourceId: string }>>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function uploadImage(file: File, category?: string) {
  return uploadFile(file, category, 'image')
}

export function getImageResources(params: { page?: number; pageSize?: number; category?: string }) {
  return http.get<ApiResponse<PaginatedData<ImageResource>>>('/resources/images', { params })
}

// --- 音频库 ---
export function uploadAudio(file: File, category?: string) {
  return uploadFile(file, category, 'audio')
}

export function getAudioResources(params: { page?: number; pageSize?: number; category?: string }) {
  return http.get<ApiResponse<PaginatedData<AudioResource>>>('/resources/audio', { params })
}
