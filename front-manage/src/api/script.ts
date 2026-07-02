// ============================================================
// 剧本管理 API（含章节/节点/NPC/结局/任务/AR资源）
// ============================================================
import http from './http'
import type {
  ApiResponse,
  PaginatedData,
  ScriptListItem,
  ScriptDetail,
  ScriptChapter,
  ScriptNode,
  ScriptNPC,
  ScriptEnding,
  TaskDef,
  ARResource,
  ScriptStatus,
  ListData
} from '@/types'

// --- 剧本 ---
export function getScriptList(params: {
  page?: number; pageSize?: number; villageId?: string
  type?: string; status?: string; keyword?: string
}) {
  return http.get<ApiResponse<PaginatedData<ScriptListItem>>>('/scripts', { params })
}

export function getScriptDetail(scriptId: string) {
  return http.get<ApiResponse<ScriptDetail>>(`/scripts/${scriptId}`)
}

export function createScript(data: {
  villageId: string; title: string; coverImage?: string
  type: string; difficulty: number; estimatedDuration: number; storyline?: string
}) {
  return http.post<ApiResponse<{ scriptId: string }>>('/scripts', data)
}

export function updateScript(scriptId: string, data: Record<string, any>) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}`, data)
}

export function updateScriptStatus(scriptId: string, status: ScriptStatus) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/status`, { status })
}

export function deleteScript(scriptId: string) {
  return http.delete<ApiResponse<null>>(`/scripts/${scriptId}`)
}

// --- 章节 ---
export function getChapters(scriptId: string) {
  return http.get<ApiResponse<ListData<ScriptChapter>>>(`/scripts/${scriptId}/chapters`)
}

export function createChapter(scriptId: string, data: { title: string; sortOrder?: number }) {
  return http.post<ApiResponse<{ chapterId: string }>>(`/scripts/${scriptId}/chapters`, data)
}

export function updateChapter(scriptId: string, chapterId: string, data: { title?: string; sortOrder?: number }) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/chapters/${chapterId}`, data)
}

export function deleteChapter(scriptId: string, chapterId: string) {
  return http.delete<ApiResponse<null>>(`/scripts/${scriptId}/chapters/${chapterId}`)
}

// --- 节点 ---
export function getNodes(scriptId: string, chapterId: string) {
  return http.get<ApiResponse<ListData<ScriptNode>>>(`/scripts/${scriptId}/chapters/${chapterId}/nodes`)
}

export function getNodeDetail(scriptId: string, nodeId: string) {
  return http.get<ApiResponse<ScriptNode>>(`/scripts/${scriptId}/nodes/${nodeId}`)
}

export function createNode(scriptId: string, chapterId: string, data: Partial<ScriptNode>) {
  return http.post<ApiResponse<{ nodeId: string }>>(`/scripts/${scriptId}/chapters/${chapterId}/nodes`, data)
}

export function updateNode(scriptId: string, nodeId: string, data: Partial<ScriptNode>) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/nodes/${nodeId}`, data)
}

export function deleteNode(scriptId: string, nodeId: string) {
  return http.delete<ApiResponse<null>>(`/scripts/${scriptId}/nodes/${nodeId}`)
}

export function sortNodes(scriptId: string, orders: { nodeId: string; sortOrder: number }[]) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/nodes/sort`, { orders })
}

// --- NPC ---
export function getNPCs(scriptId: string) {
  return http.get<ApiResponse<ListData<ScriptNPC>>>(`/scripts/${scriptId}/npcs`)
}

export function getNPCDetail(scriptId: string, npcId: string) {
  return http.get<ApiResponse<ScriptNPC>>(`/scripts/${scriptId}/npcs/${npcId}`)
}

export function createNPC(scriptId: string, data: Partial<ScriptNPC>) {
  return http.post<ApiResponse<{ npcId: string }>>(`/scripts/${scriptId}/npcs`, data)
}

export function updateNPC(scriptId: string, npcId: string, data: Partial<ScriptNPC>) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/npcs/${npcId}`, data)
}

export function deleteNPC(scriptId: string, npcId: string) {
  return http.delete<ApiResponse<null>>(`/scripts/${scriptId}/npcs/${npcId}`)
}

// --- 结局 ---
export function getEndings(scriptId: string) {
  return http.get<ApiResponse<ListData<ScriptEnding>>>(`/scripts/${scriptId}/endings`)
}

export function createEnding(scriptId: string, data: Partial<ScriptEnding>) {
  return http.post<ApiResponse<{ endingId: string }>>(`/scripts/${scriptId}/endings`, data)
}

export function updateEnding(scriptId: string, endingId: string, data: Partial<ScriptEnding>) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/endings/${endingId}`, data)
}

export function deleteEnding(scriptId: string, endingId: string) {
  return http.delete<ApiResponse<null>>(`/scripts/${scriptId}/endings/${endingId}`)
}

// --- 任务 ---
export function getTasks(scriptId: string, nodeId: string) {
  return http.get<ApiResponse<ListData<TaskDef>>>(`/scripts/${scriptId}/nodes/${nodeId}/tasks`)
}

export function createTask(scriptId: string, nodeId: string, data: Partial<TaskDef>) {
  return http.post<ApiResponse<{ taskId: string }>>(`/scripts/${scriptId}/nodes/${nodeId}/tasks`, data)
}

export function updateTask(scriptId: string, taskId: string, data: Partial<TaskDef>) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/tasks/${taskId}`, data)
}

export function deleteTask(scriptId: string, taskId: string) {
  return http.delete<ApiResponse<null>>(`/scripts/${scriptId}/tasks/${taskId}`)
}

// --- AR 资源 ---
export function getARResources(scriptId: string) {
  return http.get<ApiResponse<ListData<ARResource>>>(`/scripts/${scriptId}/ar-resources`)
}

export function createARResource(scriptId: string, data: Partial<ARResource>) {
  return http.post<ApiResponse<{ resourceId: string }>>(`/scripts/${scriptId}/ar-resources`, data)
}

export function updateARResource(scriptId: string, resourceId: string, data: Partial<ARResource>) {
  return http.put<ApiResponse<null>>(`/scripts/${scriptId}/ar-resources/${resourceId}`, data)
}

export function deleteARResource(scriptId: string, resourceId: string) {
  return http.delete<ApiResponse<null>>(`/scripts/${scriptId}/ar-resources/${resourceId}`)
}
