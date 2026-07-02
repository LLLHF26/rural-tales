// ============================================================
// AI 生成 API
// ============================================================
import http from './http'
import type { ApiResponse, ImageTaskResult } from '@/types'

// SSE 流式剧本生成（基于已有乡村）
export function generateScriptSSE(
  params: { villageId: number; type: string; difficulty: number; estimatedDuration: number; extraRequirement?: string },
  onProgress: (data: any) => void,
  onResult: (data: any) => void,
  onDone: () => void,
  onError: (msg: string) => void
): AbortController {
  const controller = new AbortController()
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/admin'
  const token = localStorage.getItem('admin_token')

  fetch(`${baseURL}/ai/generate-script`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(params),
    signal: controller.signal
  }).then(async (response) => {
    if (!response.ok || !response.body) {
      onError(`请求失败 (${response.status})`)
      return
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      let eventType = ''
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim()
        } else if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))
          if (eventType === 'progress') onProgress(data)
          else if (eventType === 'result') onResult(data)
          else if (eventType === 'done') onDone()
          else if (eventType === 'error') onError(data.message)
        }
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError') onError(err.message)
  })

  return controller
}

// 通用图片生成
export function generateImage(data: { prompt: string; size?: string; style?: string }, silent = false) {
  return http.post<ApiResponse<{ url: string }>>('/ai/generate-image', data, silent ? { silent: true, timeout: 120000 } as any : undefined)
}

// 生成场景图
export function generateSceneImage(data: { scriptId: string; description: string; style?: string; aspectRatio?: string }, silent = false) {
  return http.post<ApiResponse<ImageTaskResult>>('/ai/generate-scene-image', data, silent ? { silent: true, timeout: 120000 } as any : undefined)
}

// 生成 NPC 立绘
export function generateNPCPortrait(data: {
  scriptId: string; name: string; gender: string; age: number
  appearance: string; personality?: string; style?: string
}, silent = false) {
  return http.post<ApiResponse<ImageTaskResult>>('/ai/generate-npc-portrait', data, silent ? { silent: true, timeout: 120000 } as any : undefined)
}

// 查询生成任务状态
export function getGenerationTask(taskId: string) {
  return http.get<ApiResponse<ImageTaskResult>>(`/ai/generation-task/${taskId}`)
}

// 确认使用图片
export function confirmImage(taskId: string, imageUrl: string) {
  return http.post<ApiResponse<null>>('/ai/confirm-image', { taskId, imageUrl })
}
