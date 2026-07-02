<template>
  <div class="script-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索剧本标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="所属乡村">
          <el-select
            v-model="searchForm.villageId"
            placeholder="全部乡村"
            clearable
            filterable
            @change="handleSearch"
          >
            <el-option
              v-for="v in villageOptions"
              :key="v.villageId"
              :label="v.name"
              :value="v.villageId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="剧本类型">
          <el-select
            v-model="searchForm.type"
            placeholder="全部类型"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="(label, value) in SCRIPT_TYPE_MAP"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="(label, value) in SCRIPT_STATUS_MAP"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="openCreateDialog">新增剧本</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
            />
            <span v-else class="no-cover">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="villageName" label="所属乡村" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            {{ (SCRIPT_TYPE_MAP as Record<string, string>)[row.type] || row.type }}
          </template>
        </el-table-column>
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="difficultyTagType(row.difficulty)" size="small">
              {{ DIFFICULTY_MAP[row.difficulty] || row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时长" width="90">
          <template #default="{ row }">
            {{ row.estimatedDuration }} 分钟
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ (SCRIPT_STATUS_MAP as Record<string, string>)[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="80">
          <template #default="{ row }">
            {{ row.rating.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column label="体验人次" width="90">
          <template #default="{ row }">
            {{ row.experienceCount }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'published'"
              type="warning"
              size="small"
              @click="handleStatusChange(row, 'offline')"
            >
              下架
            </el-button>
            <el-button
              v-if="row.status === 'draft' || row.status === 'offline'"
              type="success"
              size="small"
              @click="handleStatusChange(row, 'published')"
            >
              发布
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 新增对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增剧本"
      width="560px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="所属乡村" prop="villageId">
          <el-select v-model="form.villageId" placeholder="请选择乡村" filterable style="width: 100%">
            <el-option
              v-for="v in villageOptions"
              :key="v.villageId"
              :label="v.name"
              :value="v.villageId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="剧本标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入剧本标题" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverImage">
          <div style="display:flex;align-items:center;gap:10px">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              :http-request="coverUploadRequest"
              accept="image/*"
            >
              <el-button :loading="coverUploading" type="primary" size="small">上传封面图</el-button>
            </el-upload>
            <img v-if="form.coverImage" :src="form.coverImage" style="width:100px;height:64px;object-fit:cover;border-radius:6px;border:1px solid var(--tea-200)" />
            <el-button v-if="form.coverImage" link type="danger" size="small" @click="form.coverImage = ''">移除</el-button>
            <AiImageBtn placeholder="描绘剧本封面图..." @generated="url => form.coverImage = url" />
          </div>
        </el-form-item>
        <el-form-item label="剧本类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option
              v-for="(label, value) in SCRIPT_TYPE_MAP"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty" style="width:100%">
            <el-option v-for="(label, key) in DIFFICULTY_MAP" :key="Number(key)" :label="label" :value="Number(key)" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计时长" prop="estimatedDuration">
          <el-input-number v-model="form.estimatedDuration" :min="1" /> 分钟
        </el-form-item>
        <el-form-item label="故事主线" prop="storyline">
          <el-input
            v-model="form.storyline"
            type="textarea"
            :rows="4"
            placeholder="请输入故事主线描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getScriptList, createScript, updateScriptStatus, deleteScript } from '@/api/script'
import { getVillageList } from '@/api/village'
import { uploadImage } from '@/api/settings'
import AiImageBtn from '@/components/common/AiImageBtn.vue'
import type { ScriptListItem, ScriptStatus } from '@/types'
import { SCRIPT_TYPE_MAP, SCRIPT_STATUS_MAP, DIFFICULTY_MAP } from '@/types'

function difficultyTagType(d: number): string {
  const types = ['', 'info', 'success', '', 'warning', 'danger']
  return types[d] || ''
}

// ==================== 图片上传 ====================
const coverUploading = ref(false)

function beforeCoverUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

async function coverUploadRequest(options: any) {
  coverUploading.value = true
  try {
    const res = await uploadImage(options.file, 'script')
    if (res.data.code === 0) {
      form.coverImage = res.data.data.url
      ElMessage.success('封面上传成功')
    } else {
      ElMessage.error(res.data.message || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    coverUploading.value = false
  }
}

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  villageId: '',
  type: '',
  status: ''
})

// 乡村下拉选项
const villageOptions = ref<{ villageId: string; name: string }[]>([])

// 表格数据
const tableData = ref<ScriptListItem[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 新增表单
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  villageId: '',
  title: '',
  coverImage: '',
  type: '',
  difficulty: 3,
  estimatedDuration: 60,
  storyline: ''
})

const formRules: FormRules = {
  villageId: [{ required: true, message: '请选择所属乡村', trigger: 'change' }],
  title: [{ required: true, message: '请输入剧本标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择剧本类型', trigger: 'change' }],
  difficulty: [{ required: true, message: '请设置难度', trigger: 'change' }],
  estimatedDuration: [{ required: true, message: '请输入预计时长', trigger: 'blur' }]
}

// 格式化时间
function formatTime(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 状态标签颜色
function statusTagType(status: ScriptStatus): 'info' | 'success' | 'danger' {
  if (status === 'published') return 'success'
  if (status === 'draft') return 'info'
  return 'danger'
}

// 加载乡村列表
async function loadVillages() {
  try {
    const res = await getVillageList({ pageSize: 999 })
    villageOptions.value = res.data.data.list
  } catch {
    // ignore
  }
}

// 获取列表
async function fetchList() {
  loading.value = true
  try {
    const res = await getScriptList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      villageId: searchForm.villageId || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status || undefined
    })
    const data = res.data.data
    tableData.value = data.list
    pagination.total = data.total
    pagination.page = data.page
    pagination.pageSize = data.pageSize
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1
  fetchList()
}

// 重置
function handleReset() {
  searchForm.keyword = ''
  searchForm.villageId = ''
  searchForm.type = ''
  searchForm.status = ''
  handleSearch()
}

// 编辑
function handleEdit(row: ScriptListItem) {
  router.push('/script/editor/' + row.scriptId)
}

// 状态变更
function handleStatusChange(row: ScriptListItem, targetStatus: ScriptStatus) {
  const actionText = targetStatus === 'published' ? '发布' : '下架'
  const title = targetStatus === 'published' ? '确认发布' : '确认下架'
  ElMessageBox.confirm(`确定要${actionText}剧本「${row.title}」吗？`, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateScriptStatus(row.scriptId, targetStatus)
      ElMessage.success(`${actionText}成功`)
      fetchList()
    } catch {
      // error handled by interceptor
    }
  })
}

// 删除
function handleDelete(row: ScriptListItem) {
  ElMessageBox.confirm(`确定要删除剧本「${row.title}」吗？删除后不可恢复。`, '确认删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteScript(row.scriptId)
      ElMessage.success('删除成功')
      fetchList()
    } catch {
      // error handled by interceptor
    }
  })
}

// 打开新增对话框
function openCreateDialog() {
  dialogVisible.value = true
}

// 重置表单
function resetForm() {
  form.villageId = ''
  form.title = ''
  form.coverImage = ''
  form.type = ''
  form.difficulty = 3
  form.estimatedDuration = 60
  form.storyline = ''
  formRef.value?.resetFields()
}

// 提交新增
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await createScript({
      villageId: form.villageId,
      title: form.title,
      coverImage: form.coverImage || undefined,
      type: form.type,
      difficulty: form.difficulty,
      estimatedDuration: form.estimatedDuration,
      storyline: form.storyline || undefined
    })
    ElMessage.success('剧本创建成功')
    dialogVisible.value = false
    fetchList()
  } catch {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadVillages()
  fetchList()
})
</script>

<style scoped>
.script-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card {
  margin-bottom: 0;
}

.no-cover {
  color: #999;
  font-size: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
