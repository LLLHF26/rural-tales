// ============================================================
// AI 剧本生成状态管理 —— 跨页面持久化，支持后台生成 + 通知
// ============================================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { generateScriptSSE } from '@/api/ai'
import type { ScriptGenerated } from '@/types'

interface StepDef {
  title: string
  icon: string
  defaultDesc: string
}

interface ProgressStep {
  title: string
  icon: string
  defaultDesc: string
  status: 'wait' | 'process' | 'finish'
  message: string
}

const STEPS: StepDef[] = [
  { title: '分析乡村素材', icon: 'compass', defaultDesc: '正在解析乡村的文化背景...' },
  { title: '构建故事框架', icon: 'build', defaultDesc: '设计剧本主线与章节结构...' },
  { title: '塑造NPC角色', icon: 'user', defaultDesc: '为故事注入鲜活的人物性格...' },
  { title: '编排剧情节点', icon: 'map', defaultDesc: '将实景地点融入探险路线...' },
  { title: '设计互动任务', icon: 'experience', defaultDesc: '制作谜题、寻宝与AR互动...' },
  { title: '润色最终成品', icon: 'wand', defaultDesc: '优化对话文本，生成结局分支...' }
]

export const useAiGenerationStore = defineStore('aiGeneration', () => {
  const generating = ref(false)
  const completed = ref(false)
  const errorState = ref(false)
  const errorMsg = ref('')
  const result = ref<ScriptGenerated | null>(null)
  const progressSteps = ref<ProgressStep[]>([])

  let savedController: AbortController | null = null

  function initSteps(villageName: string) {
    progressSteps.value = STEPS.map((s, i) => ({
      ...s,
      status: 'wait' as const,
      message: '',
      defaultDesc: i === 0
        ? `正在解析「${villageName}」的文化背景...`
        : s.defaultDesc
    }))
    progressSteps.value[0].status = 'process'
  }

  function startGeneration(
    params: { villageId: number; type: string; difficulty: number; estimatedDuration: number; extraRequirement?: string },
    villageName: string
  ) {
    if (savedController) {
      savedController.abort()
    }

    generating.value = true
    completed.value = false
    errorState.value = false
    errorMsg.value = ''
    result.value = null
    initSteps(villageName)

    savedController = generateScriptSSE(
      params,
      (data) => {
        const stepIndex = (data.step ?? 1) - 1
        if (stepIndex >= 0 && stepIndex < progressSteps.value.length) {
          for (let i = 0; i < stepIndex; i++) {
            progressSteps.value[i].status = 'finish'
          }
          progressSteps.value[stepIndex].status = 'process'
          if (data.message) {
            progressSteps.value[stepIndex].message = data.message
          }
        }
      },
      (data) => {
        result.value = data
      },
      () => {
        progressSteps.value.forEach(s => { s.status = 'finish' })
        generating.value = false
        completed.value = true
        const title = result.value?.title || 'AI剧本'
        ElNotification({
          title: '剧本生成成功',
          message: `《${title}》已生成完毕，可前往编辑器查看修改`,
          type: 'success',
          duration: 6000,
          position: 'top-right'
        })
      },
      (msg) => {
        generating.value = false
        errorState.value = true
        errorMsg.value = msg
        if (msg !== '已取消生成') {
          ElNotification({
            title: '剧本生成失败',
            message: msg,
            type: 'error',
            duration: 6000,
            position: 'top-right'
          })
        }
      }
    )
  }

  function cancelGeneration() {
    savedController?.abort()
    savedController = null
    generating.value = false
    errorState.value = true
    errorMsg.value = '已取消生成'
  }

  function resetState() {
    savedController?.abort()
    savedController = null
    generating.value = false
    completed.value = false
    errorState.value = false
    errorMsg.value = ''
    result.value = null
    progressSteps.value = []
  }

  return {
    generating, completed, errorState, errorMsg, result, progressSteps,
    startGeneration, cancelGeneration, resetState
  }
})
