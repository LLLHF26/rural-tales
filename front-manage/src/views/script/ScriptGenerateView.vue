<template>
  <div class="script-generate-page">
    <!-- 装饰性山水线条 -->
    <div class="mountain-decoration"></div>

    <!-- 页面标题区 — 始终可见 -->
    <div class="page-header">
      <h1 class="workshop-title"><AppIcon name="script" :size="32" /> AI 剧本工坊</h1>
      <div class="quote-block subtitle-quote">
        以古村为纸，AI为笔，书写沉浸式文旅篇章
      </div>
    </div>

    <!-- 输入区 — 始终可见，生成中也可继续操作 -->
    <div class="input-section">
      <el-card class="form-card scroll-card">
        <div class="card-body">
          <el-form :model="formA" :rules="formARules" ref="formARef" label-width="100px">
            <el-form-item label="选择乡村" prop="villageId">
              <el-select v-model="formA.villageId" placeholder="请选择乡村" filterable style="width: 100%">
                <el-option
                  v-for="v in villageOptions"
                  :key="v.villageId"
                  :label="v.name"
                  :value="v.villageId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="剧本类型" prop="type">
              <el-select v-model="formA.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="探秘" value="mystery" />
                <el-option label="研学" value="history" />
                <el-option label="亲子" value="family" />
                <el-option label="情侣" value="couple" />
                <el-option label="团建" value="team" />
              </el-select>
            </el-form-item>
            <el-form-item label="难度">
              <el-slider v-model="formA.difficulty" :min="1" :max="5" :show-stops="true" :marks="difficultyMarks" />
            </el-form-item>
            <el-form-item label="预计时长">
              <el-slider v-model="formA.estimatedDuration" :min="30" :max="180" :step="10" :format-tooltip="(v: number) => v + '分钟'" />
            </el-form-item>
            <el-form-item label="补充需求">
              <el-input
                v-model="formA.extraRequirement"
                type="textarea"
                :rows="3"
                placeholder="例如：增加夜间探险元素、侧重非遗文化体验..."
              />
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!-- 生成按钮 -->
      <div class="generate-btn-wrap">
        <button
          class="btn-ink btn-generate"
          :class="{ 'is-busy': store.generating }"
          :disabled="store.generating"
          @click="startGenerate"
        >
          <AppIcon name="wand" :size="20" />
          {{ store.generating ? '正在生成中...' : '开始创作' }}
        </button>
      </div>
    </div>

    <!-- 紧凑型生成进度面板（非阻塞） -->
    <div class="compact-progress" v-if="store.generating">
      <div class="progress-header">
        <span class="progress-label"><span class="dot-pulse"></span> AI 正在创作剧本</span>
        <span class="progress-count">{{ currentStepIndex + 1 }} / {{ store.progressSteps.length }}</span>
      </div>
      <div class="progress-timeline">
        <div
          v-for="(step, idx) in store.progressSteps"
          :key="idx"
          :class="['timeline-dot', step.status]"
          :title="step.title"
        ></div>
      </div>
      <div class="current-step-info">
        <AppIcon :name="activeStep.icon" :size="16" class="step-icon-pulse" />
        <span class="current-step-title">{{ activeStep.title }}</span>
        <span class="current-step-msg">{{ activeStep.message || activeStep.defaultDesc }}</span>
      </div>
      <div class="progress-actions">
        <button class="btn-scroll-cancel" @click="handleCancel">
          <AppIcon name="cross" :size="14" /> 取消
        </button>
      </div>
    </div>

    <!-- 生成完成 — 书本式结果预览 -->
    <div class="result-section" v-if="store.completed && store.result">
      <div class="book-card">
        <div class="book-spine"></div>

        <div class="book-page book-left">
          <h2 class="script-title-calligraphy">{{ store.result.title }}</h2>
          <div class="meta-tags">
            <span class="meta-tag type-tag">{{ SCRIPT_TYPE_MAP[store.result.type as ScriptType] || store.result.type }}</span>
            <span class="meta-tag difficulty-tag">
              难度 <el-rate :model-value="store.result.difficulty" disabled :max="5" size="small" />
            </span>
          </div>
          <div class="meta-info">
            <span><AppIcon name="village" :size="14" /> {{ store.result.villageName }}</span>
            <span><AppIcon name="clock" :size="14" /> {{ store.result.estimatedDuration }}分钟</span>
          </div>
          <div class="seal stamp-seal">古村</div>
        </div>

        <div class="book-page book-right">
          <h3 class="section-title"><AppIcon name="book" :size="16" /> 故事主线</h3>
          <p class="storyline-preview">{{ store.result.storyline }}</p>
          <div class="stats-row">
            <span class="stat-badge"><AppIcon name="book" :size="14" /> {{ store.result.chapterCount }} 章</span>
            <span class="stat-badge"><AppIcon name="user" :size="14" /> {{ store.result.npcCount }} NPC</span>
            <span class="stat-badge"><AppIcon name="gamepad" :size="14" /> {{ store.result.endingCount }} 结局</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn-ink btn-large" @click="importToEditor"><AppIcon name="book" :size="18" /> 导入编辑器</button>
        <el-button size="large" plain @click="resetAll"><AppIcon name="refresh" :size="16" /> 重新生成</el-button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div class="error-section" v-if="store.errorState && !store.generating">
      <el-alert type="error" :title="store.errorMsg" show-icon :closable="false" />
      <div class="error-actions">
        <el-button type="primary" @click="resetAll"><AppIcon name="refresh" :size="16" /> 重新生成</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getVillageList } from '@/api/village'
import { SCRIPT_TYPE_MAP } from '@/types'
import { useAiGenerationStore } from '@/stores/aiGeneration'
import type { ScriptType } from '@/types'

const router = useRouter()
const store = useAiGenerationStore()

// ── 乡村选项 ──
const villageOptions = ref<{ villageId: string; name: string }[]>([])

async function loadVillages() {
  try {
    const res = await getVillageList({ pageSize: 999 })
    villageOptions.value = res.data.data.list
  } catch {
    // ignore
  }
}

// ── 难度标记 ──
const difficultyMarks: Record<number, string> = {
  1: '入门', 2: '简单', 3: '中等', 4: '困难', 5: '挑战'
}

// ── 表单 ──
const formARef = ref<FormInstance>()
const formA = reactive({
  villageId: '',
  type: '',
  difficulty: 3,
  estimatedDuration: 60,
  extraRequirement: ''
})

const formARules: FormRules = {
  villageId: [{ required: true, message: '请选择乡村', trigger: 'change' }],
  type: [{ required: true, message: '请选择剧本类型', trigger: 'change' }]
}

// ── 当前进度步骤的计算属性 ──
const currentStepIndex = computed(() => {
  const steps = store.progressSteps
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].status !== 'wait') return i
  }
  return 0
})

const activeStep = computed(() => {
  return store.progressSteps[currentStepIndex.value] || {
    title: '准备中', icon: 'compass', defaultDesc: '', message: ''
  }
})

// ── 生成流程 ──
async function startGenerate() {
  const valid = await formARef.value?.validate().catch(() => false)
  if (!valid) return

  const found = villageOptions.value.find(v => v.villageId === formA.villageId)
  const villageName = found?.name || '乡村'

  store.startGeneration(
    {
      villageId: Number(formA.villageId),
      type: formA.type,
      difficulty: formA.difficulty,
      estimatedDuration: formA.estimatedDuration,
      extraRequirement: formA.extraRequirement || undefined
    },
    villageName
  )

  // 重置表单，允许继续操作
  formARef.value?.resetFields()
  formA.difficulty = 3
  formA.estimatedDuration = 60
  formA.extraRequirement = ''
}

// ── 取消生成 ──
function handleCancel() {
  store.cancelGeneration()
}

// ── 导入编辑器 ──
function importToEditor() {
  if (!store.result) return
  ElMessage.success('正在跳转到编辑器...')
  const query = encodeURIComponent(JSON.stringify(store.result))
  router.push('/script/editor/new?data=' + query)
}

// ── 重置状态 ──
function resetAll() {
  store.resetState()
}

onMounted(() => {
  loadVillages()
  // 恢复未完成的生成任务状态（如果页面被刷新，任务已丢失但 UI 状态一致）
})
</script>

<style scoped>
/* ==================== 页面基础 ==================== */
.script-generate-page {
  max-width: 900px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--tea-50);
  padding: 32px 24px 48px;
  position: relative;
}

.mountain-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background:
    linear-gradient(135deg, transparent 30%, var(--bamboo-200) 30%, var(--bamboo-200) 31%, transparent 31%),
    linear-gradient(225deg, transparent 25%, var(--sprout-200) 25%, var(--sprout-200) 26%, transparent 26%),
    linear-gradient(180deg, var(--tea-100) 0%, transparent 100%);
  opacity: 0.4;
  pointer-events: none;
}

/* ==================== 页面标题区 ==================== */
.page-header {
  text-align: center;
  padding: 48px 0 24px;
  position: relative;
}

.workshop-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--ink-800);
  letter-spacing: 4px;
  margin: 0 0 16px;
  font-family: 'Noto Serif SC', 'SimSun', 'STSong', serif;
}

.subtitle-quote {
  display: inline-block;
  max-width: 500px;
  text-align: left;
  font-size: 15px;
}

/* ==================== 表单卡片 ==================== */
.form-card {
  margin-bottom: 32px;
}

.form-card :deep(.el-form-item__label) {
  color: var(--ink-600);
  font-weight: 500;
}

/* ==================== 生成按钮 ==================== */
.generate-btn-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.btn-generate {
  padding: 16px 48px;
  font-size: 20px;
  letter-spacing: 3px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(196, 115, 79, 0.45);
}

.btn-generate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-generate.is-busy {
  background: linear-gradient(135deg, var(--tea-400), var(--tea-500));
  box-shadow: none;
}

/* ==================== 紧凑型进度面板 ==================== */
.compact-progress {
  margin: 0 0 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--tea-50), var(--tea-100));
  border: 1px solid var(--tea-300);
  border-radius: 12px;
  animation: fadeIn 0.4s ease;
  position: relative;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-700);
  letter-spacing: 1px;
}

.dot-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bamboo-500);
  display: inline-block;
  animation: dotPulse 1.4s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.75); }
}

.progress-count {
  font-size: 12px;
  color: var(--ink-500);
  background: var(--tea-200);
  padding: 2px 10px;
  border-radius: 10px;
}

/* 进度时间线点 */
.progress-timeline {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.timeline-dot {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--tea-300);
  transition: background 0.5s;
}

.timeline-dot.process {
  background: var(--bamboo-500);
}

.timeline-dot.finish {
  background: var(--sprout-400);
}

/* 当前步骤信息 */
.current-step-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ink-600);
  margin-bottom: 14px;
}

.current-step-title {
  font-weight: 600;
  color: var(--bamboo-600);
  white-space: nowrap;
}

.current-step-msg {
  color: var(--ink-500);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 进度面板操作 */
.progress-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-scroll-cancel {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid var(--tea-300);
  color: var(--ink-500);
  font-weight: 500;
  letter-spacing: 1px;
  border-radius: 6px;
  padding: 6px 16px;
  transition: all 0.3s;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
}

.btn-scroll-cancel:hover {
  border-color: var(--bamboo-400);
  color: var(--bamboo-600);
  background: var(--tea-50);
}

/* ==================== 书本式结果预览 ==================== */
.result-section {
  animation: fadeIn 0.6s ease;
  padding: 24px 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.book-card {
  display: flex;
  background: var(--tea-50);
  border: 1px solid var(--tea-300);
  border-radius: 4px;
  box-shadow:
    0 8px 24px rgba(92, 48, 32, 0.12),
    0 2px 4px rgba(92, 48, 32, 0.06),
    inset 0 -8px 16px -8px rgba(92, 48, 32, 0.08);
  position: relative;
  overflow: hidden;
  animation: bookOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes bookOpen {
  0% { transform: scaleX(0.3); opacity: 0; }
  100% { transform: scaleX(1); opacity: 1; }
}

.book-spine {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 3px;
  background: linear-gradient(180deg, var(--ink-800), var(--bamboo-700), var(--ink-800));
  z-index: 2;
  transform: translateX(-50%);
  box-shadow: -4px 0 8px rgba(92, 48, 32, 0.15), 4px 0 8px rgba(92, 48, 32, 0.15);
}

.book-page {
  flex: 1;
  padding: 32px 24px;
  position: relative;
  min-height: 280px;
}

.book-left {
  background: linear-gradient(90deg, var(--tea-100) 0%, var(--tea-50) 30%, #fff 100%);
  padding-right: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.book-right {
  background: linear-gradient(90deg, #fff 0%, var(--tea-50) 70%, var(--tea-100) 100%);
  padding-left: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.script-title-calligraphy {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink-800);
  letter-spacing: 3px;
  margin: 0 0 16px;
  font-family: 'Noto Serif SC', 'STSong', 'SimSun', serif;
  line-height: 1.4;
}

.meta-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.type-tag {
  background: var(--bamboo-50);
  color: var(--bamboo-700);
  border: 1px solid var(--bamboo-200);
}

.difficulty-tag :deep(.el-rate__icon) {
  font-size: 14px !important;
}

.meta-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--ink-600);
  margin-bottom: 16px;
}

.stamp-seal {
  position: absolute;
  bottom: 24px;
  right: 48px;
  width: 56px;
  height: 56px;
  font-size: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bamboo-600);
  letter-spacing: 2px;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--tea-200);
}

.storyline-preview {
  font-size: 14px;
  color: var(--ink-600);
  line-height: 1.8;
  margin: 0 0 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-row {
  display: flex;
  gap: 12px;
}

.stat-badge {
  padding: 6px 14px;
  background: var(--sprout-50);
  color: var(--sprout-700);
  border: 1px solid var(--sprout-200);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

/* 操作按钮 */
.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.btn-large {
  padding: 14px 36px;
  font-size: 18px;
}

/* ==================== 错误状态 ==================== */
.error-section {
  animation: fadeIn 0.4s ease;
  margin-top: 24px;
}

.error-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

/* ==================== 图标脉冲（复用） ==================== */
.step-icon-pulse {
  animation: pulse 2s ease-in-out infinite;
  color: var(--bamboo-500);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
}
</style>
