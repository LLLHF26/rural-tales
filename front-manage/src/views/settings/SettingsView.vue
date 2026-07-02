<template>
  <div class="settings-view">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Tab 1: 管理员管理 -->
      <el-tab-pane label="管理员管理" name="admin">
        <div v-if="isSuperAdmin" class="action-bar">
          <el-button type="primary" @click="showCreateDialog = true">新增管理员</el-button>
        </div>
        <el-table :data="adminList" stripe border v-loading="adminLoading">
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="nickname" label="昵称" min-width="120" />
          <el-table-column label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="row.role === 'super_admin' ? 'danger' : 'info'">
                {{ row.role === 'super_admin' ? '超级管理员' : '管理员' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
                {{ row.status === 'active' ? '正常' : '已禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastLoginAt" label="最后登录时间" width="180" />
          <el-table-column label="操作" width="200" v-if="isSuperAdmin">
            <template #default="{ row }">
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button
                size="small"
                :type="row.status === 'active' ? 'warning' : 'success'"
                @click="toggleAdminStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增管理员对话框 -->
        <el-dialog v-model="showCreateDialog" title="新增管理员" width="480px" destroy-on-close>
          <el-form :model="createForm" label-width="80px" :rules="createRules" ref="createFormRef">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="createForm.username" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="createForm.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="createForm.nickname" />
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-select v-model="createForm.role">
                <el-option label="管理员" value="admin" />
                <el-option label="超级管理员" value="super_admin" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showCreateDialog = false">取消</el-button>
            <el-button type="primary" @click="handleCreateAdmin">确定</el-button>
          </template>
        </el-dialog>

        <!-- 编辑管理员对话框 -->
        <el-dialog v-model="showEditDialog" title="编辑管理员" width="480px" destroy-on-close>
          <el-form :model="editForm" label-width="80px">
            <el-form-item label="昵称">
              <el-input v-model="editForm.nickname" />
            </el-form-item>
            <el-form-item label="角色">
              <el-select v-model="editForm.role">
                <el-option label="管理员" value="admin" />
                <el-option label="超级管理员" value="super_admin" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showEditDialog = false">取消</el-button>
            <el-button type="primary" @click="handleEditAdmin">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- Tab 2: AI 配置 -->
      <el-tab-pane label="AI 配置" name="ai">
        <el-form :model="aiConfigForm" label-width="100px" v-loading="aiLoading" style="max-width: 600px">
          <el-divider content-position="left">LLM 配置</el-divider>
          <el-form-item label="Provider">
            <el-input v-model="aiConfigForm.llmProvider" />
          </el-form-item>
          <el-form-item label="Model">
            <el-input v-model="aiConfigForm.llmModel" />
          </el-form-item>
          <el-form-item label="API Key">
            <el-input v-model="aiConfigForm.llmApiKey" type="password" show-password />
          </el-form-item>
          <el-form-item label="Temperature">
            <el-slider v-model="aiConfigForm.llmTemperature" :min="0" :max="2" :step="0.1" show-input />
          </el-form-item>
          <el-form-item label="MaxTokens">
            <el-input-number v-model="aiConfigForm.llmMaxTokens" :min="1" :max="32000" />
          </el-form-item>

          <el-divider content-position="left">图片生成配置</el-divider>
          <el-form-item label="Provider">
            <el-input v-model="aiConfigForm.imageProvider" />
          </el-form-item>
          <el-form-item label="Model">
            <el-input v-model="aiConfigForm.imageModel" />
          </el-form-item>
          <el-form-item label="API Key">
            <el-input v-model="aiConfigForm.imageApiKey" type="password" show-password />
          </el-form-item>
          <el-form-item label="默认风格">
            <el-input v-model="aiConfigForm.imageDefaultStyle" />
          </el-form-item>
          <el-form-item label="默认尺寸">
            <el-input v-model="aiConfigForm.imageDefaultSize" />
          </el-form-item>
          <el-form-item label="负向词">
            <el-input v-model="aiConfigForm.imageNegativePrompt" type="textarea" :rows="3" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSaveAIConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 3: 素材库 -->
      <el-tab-pane label="素材库" name="resource">
        <div class="resource-header">
          <el-select v-model="uploadCategory" placeholder="全部分类" style="width: 180px">
            <el-option label="全部分类" value="" />
            <el-option label="乡村封面" value="village" />
            <el-option label="打卡点图" value="spot" />
            <el-option label="剧本素材" value="script" />
            <el-option label="场景图" value="scene" />
            <el-option label="NPC头像" value="npc" />
            <el-option label="AR素材" value="ar" />
            <el-option label="AI生成" value="ai_generated" />
            <el-option label="其他" value="other" />
          </el-select>
          <el-upload
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :http-request="handleUploadRequest"
            accept="image/*"
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
        </div>
        <div class="image-grid" v-loading="resourceLoading">
          <div v-for="img in resourceList" :key="img.imageId" class="image-card">
            <el-image :src="img.url" fit="cover" class="image-thumb" />
            <div class="image-info">
              <div class="image-name">{{ img.fileName }}</div>
              <div class="image-meta">{{ img.category }} · {{ formatFileSize(img.fileSize) }}</div>
              <div class="image-meta">{{ img.uploadedAt }}</div>
            </div>
          </div>
          <el-empty v-if="!resourceLoading && resourceList.length === 0" description="暂无素材" />
        </div>
        <el-pagination
          v-model:current-page="resourcePage"
          v-model:page-size="resourcePageSize"
          :total="resourceTotal"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 16px; justify-content: flex-end"
          @current-change="loadResources"
          @size-change="loadResources"
        />
      </el-tab-pane>

      <!-- Tab 4: 音频库 -->
      <el-tab-pane label="音频库" name="audio">
        <div class="resource-header">
          <el-select v-model="audioUploadCategory" placeholder="全部分类" style="width: 180px">
            <el-option label="全部分类" value="" />
            <el-option label="场景背景音" value="scene_bgm" />
            <el-option label="悬疑" value="mystery" />
            <el-option label="历史" value="history" />
            <el-option label="家庭" value="family" />
            <el-option label="情侣" value="couple" />
            <el-option label="团队" value="team" />
            <el-option label="其他" value="other" />
          </el-select>
          <el-upload
            :show-file-list="false"
            :before-upload="handleBeforeAudioUpload"
            :http-request="handleAudioUploadRequest"
            accept="audio/*"
          >
            <el-button type="primary">上传音频</el-button>
          </el-upload>
        </div>
        <div class="image-grid" v-loading="audioLoading">
          <div v-for="audio in audioList" :key="audio.audioId" class="image-card">
            <div class="audio-card-preview">
              <span class="audio-icon-large">&#9835;</span>
            </div>
            <div class="image-info">
              <div class="image-name">{{ audio.fileName }}</div>
              <div class="image-meta">{{ audio.category }} · {{ formatFileSize(audio.fileSize) }}</div>
              <div class="image-meta">{{ audio.uploadedAt }}</div>
              <audio :src="audio.url" controls class="audio-player-mini" />
            </div>
          </div>
          <el-empty v-if="!audioLoading && audioList.length === 0" description="暂无音频素材" />
        </div>
        <el-pagination
          v-model:current-page="audioPage"
          v-model:page-size="audioPageSize"
          :total="audioTotal"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 16px; justify-content: flex-end"
          @current-change="loadAudioResources"
          @size-change="loadAudioResources"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type UploadRequestOptions } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getAdminList, createAdmin, updateAdmin, deleteAdmin, getAIConfig, updateAIConfig, uploadImage, getImageResources, uploadAudio, getAudioResources } from '@/api/settings'
import type { AdminAccount, AIConfig, ImageResource, AudioResource } from '@/types'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const activeTab = ref('admin')

// --- 管理员管理 ---
const adminLoading = ref(false)
const adminList = ref<AdminAccount[]>([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const createFormRef = ref<FormInstance>()

const createForm = reactive({
  username: '',
  password: '',
  nickname: '',
  role: 'admin' as string
})

const createRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const editForm = reactive({
  adminId: '',
  nickname: '',
  role: '' as string
})

async function loadAdminList() {
  if (!isSuperAdmin.value) return
  adminLoading.value = true
  try {
    const res = await getAdminList()
    adminList.value = res.data.data.list
  } catch {
    // 非超管无权限，静默处理
  } finally {
    adminLoading.value = false
  }
}

async function handleCreateAdmin() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    await createAdmin(createForm)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    Object.assign(createForm, { username: '', password: '', nickname: '', role: 'admin' })
    loadAdminList()
  } catch {
    ElMessage.error('创建失败')
  }
}

function openEditDialog(row: AdminAccount) {
  editForm.adminId = row.adminId
  editForm.nickname = row.nickname
  editForm.role = row.role
  showEditDialog.value = true
}

async function handleEditAdmin() {
  try {
    await updateAdmin(editForm.adminId, { nickname: editForm.nickname, role: editForm.role })
    ElMessage.success('更新成功')
    showEditDialog.value = false
    loadAdminList()
  } catch {
    ElMessage.error('更新失败')
  }
}

async function toggleAdminStatus(row: AdminAccount) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  try {
    await updateAdmin(row.adminId, { status: newStatus })
    ElMessage.success(newStatus === 'active' ? '已启用' : '已禁用')
    loadAdminList()
  } catch {
    ElMessage.error('操作失败')
  }
}

// --- AI 配置 ---
const aiLoading = ref(false)
const aiConfigForm = reactive<AIConfig>({
  llmProvider: '',
  llmModel: '',
  llmApiKey: '',
  llmTemperature: 0.7,
  llmMaxTokens: 2048,
  imageProvider: '',
  imageModel: '',
  imageApiKey: '',
  imageDefaultStyle: '',
  imageDefaultSize: '',
  imageNegativePrompt: ''
})

async function loadAIConfig() {
  aiLoading.value = true
  try {
    const res = await getAIConfig()
    Object.assign(aiConfigForm, res.data.data)
  } finally {
    aiLoading.value = false
  }
}

async function handleSaveAIConfig() {
  try {
    await updateAIConfig(aiConfigForm)
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  }
}

// --- 素材库 ---
const resourceLoading = ref(false)
const resourceList = ref<ImageResource[]>([])
const resourcePage = ref(1)
const resourcePageSize = ref(12)
const resourceTotal = ref(0)
const uploadCategory = ref('')

async function loadResources() {
  resourceLoading.value = true
  try {
    const res = await getImageResources({
      page: resourcePage.value,
      pageSize: resourcePageSize.value,
      category: uploadCategory.value || undefined
    })
    resourceList.value = res.data.data.list
    resourceTotal.value = res.data.data.total
  } catch {
    resourceList.value = []
    resourceTotal.value = 0
  } finally {
    resourceLoading.value = false
  }
}

watch(uploadCategory, () => {
  resourcePage.value = 1
  loadResources()
})

function handleBeforeUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

async function handleUploadRequest(options: UploadRequestOptions) {
  try {
    const res = await uploadImage(options.file as File, uploadCategory.value || undefined)
    if (res.data.code === 0) {
      ElMessage.success('上传成功')
      loadResources()
    } else {
      ElMessage.error(res.data.message || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// --- 音频库 ---
const audioLoading = ref(false)
const audioList = ref<AudioResource[]>([])
const audioPage = ref(1)
const audioPageSize = ref(12)
const audioTotal = ref(0)
const audioUploadCategory = ref('')

async function loadAudioResources() {
  audioLoading.value = true
  try {
    const res = await getAudioResources({
      page: audioPage.value,
      pageSize: audioPageSize.value,
      category: audioUploadCategory.value || undefined
    })
    audioList.value = res.data.data.list
    audioTotal.value = res.data.data.total
  } catch {
    audioList.value = []
    audioTotal.value = 0
  } finally {
    audioLoading.value = false
  }
}

watch(audioUploadCategory, () => {
  audioPage.value = 1
  loadAudioResources()
})

function handleBeforeAudioUpload(file: File) {
  if (!file.type.startsWith('audio/')) {
    ElMessage.error('只能上传音频文件')
    return false
  }
  return true
}

async function handleAudioUploadRequest(options: UploadRequestOptions) {
  try {
    const res = await uploadAudio(options.file as File, audioUploadCategory.value || undefined)
    if (res.data.code === 0) {
      ElMessage.success('上传成功')
      loadAudioResources()
    } else {
      ElMessage.error(res.data.message || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  }
}

onMounted(() => {
  loadAdminList()
  loadAIConfig()
  loadResources()
  loadAudioResources()
})
</script>

<style scoped>
.settings-view {
  padding: 20px;
}
.action-bar {
  margin-bottom: 16px;
}
.resource-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.image-card {
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.image-thumb {
  width: 100%;
  height: 160px;
}
.image-info {
  padding: 8px;
}
.image-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.image-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.audio-card-preview {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #2a4a38, #152618);
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-icon-large {
  font-size: 48px;
  color: #7ec87b;
  opacity: 0.7;
}

.audio-player-mini {
  width: 100%;
  height: 32px;
  margin-top: 6px;
}
</style>
