<template>
  <div class="village-list-view">
    <div class="page-title">🏘️ 乡村管理</div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索乡村名称..."
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <AppIcon name="search" :size="14" />
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">
        <AppIcon name="search" :size="14" class="btn-icon" />
        <span>搜索</span>
      </el-button>
      <el-button class="btn-celadon" @click="handleAdd">
        <AppIcon name="plus" :size="14" class="btn-icon" />
        <span>新增乡村</span>
      </el-button>
      <div class="search-bar-spacer" />
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button value="card">
          <AppIcon name="grid" :size="14" />
        </el-radio-button>
        <el-radio-button value="list">
          <AppIcon name="list" :size="14" />
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" v-loading="loading" class="card-grid">
      <el-row :gutter="16">
        <el-col
          v-for="item in tableData"
          :key="item.villageId"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <div class="village-card" @click="handleCardClick(item)">
            <!-- 封面区 -->
            <div class="card-cover">
              <img v-if="item.coverImage" :src="item.coverImage" alt="" class="cover-img" />
              <div v-else class="cover-fallback">{{ item.name?.charAt(0) || '村' }}</div>
            </div>
            <!-- 信息区 -->
            <div class="card-body">
              <div class="card-name">{{ item.name }}</div>
              <div class="card-address">{{ item.address || '暂无地址' }}</div>
              <div class="tag-group">
                <el-tag
                  v-for="(tag, i) in (item.tags || []).slice(0, 3)"
                  :key="i"
                  size="small"
                  effect="plain"
                  class="card-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="card-stats">
                <span>📍 {{ item.spotCount ?? 0 }}</span>
                <span>📚 {{ item.cultureCount ?? 0 }}</span>
                <span>📖 {{ item.scriptCount ?? 0 }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-if="!loading && tableData.length === 0" description="暂无乡村数据" />
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'">
      <el-table v-loading="loading" :data="tableData" stripe border style="width: 100%">
        <el-table-column label="封面" width="70">
          <template #default="{ row }">
            <img
              v-if="row.coverImage"
              :src="row.coverImage"
              alt=""
              style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px"
            />
            <span v-else style="color: var(--ink-500); font-size: 12px">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="spotCount" label="打卡点数" width="100" align="center" />
        <el-table-column prop="cultureCount" label="文化条目数" width="110" align="center" />
        <el-table-column prop="scriptCount" label="剧本数" width="90" align="center" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link class="btn-edit-link" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无乡村数据" />
        </template>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-center">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增乡村' : '编辑乡村'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入乡村名称" />
        </el-form-item>
        <el-form-item label="介绍" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入乡村介绍" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverImage">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload
              :show-file-list="false"
              :before-upload="coverBeforeUpload"
              :http-request="coverUploadRequest"
              accept="image/*"
            >
              <el-button :loading="coverUploading" type="primary" size="small">上传封面图</el-button>
            </el-upload>
            <img
              v-if="form.coverImage"
              :src="form.coverImage"
              alt=""
              style="width: 100px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid var(--tea-200);"
            />
            <el-button v-if="form.coverImage" link type="danger" size="small" @click="form.coverImage = ''">移除</el-button>
            <AiImageBtn placeholder="描绘乡村封面图..." @generated="url => form.coverImage = url" />
          </div>
        </el-form-item>
        <el-form-item label="坐标" prop="lat">
          <div style="display: flex; gap: 12px; width: 100%">
            <el-input-number
              v-model="form.lng"
              :precision="6"
              :step="0.0001"
              :min="-180"
              :max="180"
              placeholder="经度"
              style="flex: 1"
            />
            <el-input-number
              v-model="form.lat"
              :precision="6"
              :step="0.0001"
              :min="-90"
              :max="90"
              placeholder="纬度"
              style="flex: 1"
            />
          </div>
          <MapPicker v-model:lng="form.lng" v-model:lat="form.lat" style="height: 280px; margin-top: 8px" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in presetTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-text="启用"
            inactive-text="禁用"
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { uploadImage } from '@/api/settings'
import AiImageBtn from '@/components/common/AiImageBtn.vue'
import MapPicker from '@/components/map/MapPicker.vue'
import {
  getVillageList,
  createVillage,
  updateVillage,
  deleteVillage
} from '@/api/village'
import type { VillageListItem } from '@/types'

const router = useRouter()

// 视图模式
const viewMode = ref<'card' | 'list'>('card')

// 搜索
const searchKeyword = ref('')

// 表格数据
const loading = ref(false)
const tableData = ref<VillageListItem[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 预设标签
const presetTags = [
  '古村落', '山水田园', '非遗传承', '红色文化',
  '民俗体验', '生态农业', '温泉养生', '古镇老街'
]

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<string>('')
const coverUploading = ref(false)

function coverBeforeUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

async function coverUploadRequest(options: any) {
  coverUploading.value = true
  try {
    const res = await uploadImage(options.file, 'village')
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

interface VillageForm {
  name: string
  description: string
  coverImage: string
  lat: number
  lng: number
  address: string
  tags: string[]
  status: boolean
}

const defaultForm: VillageForm = {
  name: '',
  description: '',
  coverImage: '',
  lat: 0,
  lng: 0,
  address: '',
  tags: [],
  status: true
}

const form = reactive<VillageForm>({ ...defaultForm })

const formRules: FormRules = {
  name: [{ required: true, message: '请输入乡村名称', trigger: 'blur' }]
}

// 加载列表
const fetchList = async () => {
  loading.value = true
  try {
    const res = await getVillageList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    })
    if (res.data.code === 0 && res.data.data) {
      tableData.value = res.data.data.list
      pagination.total = res.data.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleAdd = () => {
  dialogMode.value = 'create'
  Object.assign(form, { ...defaultForm, tags: [] })
  editingId.value = ''
  dialogVisible.value = true
}

const handleEdit = (row: VillageListItem) => {
  dialogMode.value = 'edit'
  editingId.value = row.villageId
  Object.assign(form, {
    name: row.name,
    description: row.description || '',
    coverImage: row.coverImage || '',
    lat: row.lat,
    lng: row.lng,
    address: row.address || '',
    tags: [...(row.tags || [])],
    status: true
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      coverImage: form.coverImage,
      lat: form.lat,
      lng: form.lng,
      address: form.address,
      tags: form.tags
    }
    if (dialogMode.value === 'create') {
      const res = await createVillage(payload)
      if (res.data.code === 0) {
        ElMessage.success('新增成功')
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.data.message || '新增失败')
      }
    } else {
      const res = await updateVillage(editingId.value, payload)
      if (res.data.code === 0) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.data.message || '更新失败')
      }
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: VillageListItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除「${row.name}」吗？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  try {
    const res = await deleteVillage(row.villageId)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}

const handleCardClick = (item: VillageListItem) => {
  router.push('/village/detail/' + item.villageId)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.village-list-view {
  padding: 20px;
  min-height: 100vh;
}

/* --- 全局类 --- */
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--ink-800);
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar-spacer {
  flex: 1;
}

.btn-edit-link {
  color: var(--sprout-400) !important;
}
.btn-edit-link:hover {
  color: #6aa88d !important;
}

.btn-celadon {
  background: var(--sprout-400) !important;
  border-color: var(--sprout-400) !important;
  color: #fff !important;
}
.btn-celadon:hover {
  background: #6aa88d !important;
  border-color: #6aa88d !important;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* --- 卡片网格 --- */
.card-grid {
  margin-bottom: 20px;
}

.village-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 8px rgba(61, 50, 38, 0.08);
  margin-bottom: 16px;
}
.village-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(196, 115, 79, 0.18);
}

.card-cover {
  width: 100%;
  height: 140px;
  overflow: hidden;
  position: relative;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bamboo-400), var(--bamboo-700));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.card-body {
  padding: 12px 14px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-800);
  margin-bottom: 4px;
}

.card-address {
  font-size: 12px;
  color: var(--ink-500);
  margin-bottom: 8px;
}

.card-tag {
  background: var(--tea-100) !important;
  color: var(--bamboo-600) !important;
  border-color: var(--tea-300) !important;
}

.card-stats {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: var(--ink-500);
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--tea-200);
}

/* --- 分页 --- */
.pagination-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* --- 表单提示 --- */
.form-hint {
  font-size: 12px;
  color: var(--ink-500);
  margin-top: 4px;
}

/* --- Element Plus 主题覆盖 --- */
:deep(.el-button--primary) {
  background: var(--bamboo-500);
  border-color: var(--bamboo-500);
}
:deep(.el-button--primary:hover) {
  background: var(--bamboo-400);
  border-color: var(--bamboo-400);
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: var(--bamboo-500) !important;
}

:deep(.el-table) {
  background: #fff;
}

:deep(.el-radio-button__inner) {
  padding: 6px 12px;
}
</style>
