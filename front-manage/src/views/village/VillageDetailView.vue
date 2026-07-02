<template>
  <div class="village-detail-view" v-loading="pageLoading">
    <!-- Banner -->
    <div class="banner">
      <img v-if="village?.coverImage" :src="village.coverImage" alt="" class="banner-img" />
      <div v-else class="banner-fallback">
        <div class="fallback-mountains">
          <div class="mountain m1"></div>
          <div class="mountain m2"></div>
          <div class="mountain m3"></div>
        </div>
      </div>
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <div class="banner-info">
          <h1 class="banner-name">{{ village?.name || '加载中...' }}</h1>
          <div class="tag-group banner-tags">
            <el-tag
              v-for="(tag, i) in (village?.tags || [])"
              :key="i"
              size="small"
              effect="dark"
              class="banner-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="banner-address">{{ village?.address || '' }}</div>
        </div>
        <div class="banner-actions">
          <el-button text @click="$router.back()" class="btn-back">← 返回列表</el-button>
          <el-button v-if="!editing" class="btn-celadon" @click="$router.push('/script/editor/new?villageId=' + village.villageId)">
            <AppIcon name="scriptEditor" :size="14" class="btn-icon" />
            <span>新建剧本</span>
          </el-button>
          <el-button v-if="!editing" class="btn-ink" @click="enterEditMode">
            <AppIcon name="edit" :size="14" class="btn-icon" />
            <span>编辑</span>
          </el-button>
          <template v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="saveEdit">保存</el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 基本信息 -->
      <el-tab-pane :label="`📋 基本信息`" name="info">
        <template v-if="editing">
          <el-form ref="formRef" :model="editForm" :rules="formRules" label-width="80px" class="edit-form">
            <el-form-item label="名称" prop="name">
              <el-input v-model="editForm.name" placeholder="请输入乡村名称" />
            </el-form-item>
            <el-form-item label="介绍" prop="description">
              <el-input v-model="editForm.description" type="textarea" :rows="4" placeholder="请输入介绍" />
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
                  v-if="editForm.coverImage"
                  :src="editForm.coverImage"
                  alt=""
                  style="width: 100px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid var(--tea-200);"
                />
                <el-button v-if="editForm.coverImage" link type="danger" size="small" @click="editForm.coverImage = ''">移除</el-button>
                <AiImageBtn placeholder="描绘乡村封面图，如：江南水乡古村落，青山绿水..." @generated="url => editForm.coverImage = url" />
              </div>
            </el-form-item>
            <el-form-item label="坐标">
              <div style="display: flex; gap: 12px; width: 100%; margin-bottom: 8px">
                <el-input-number v-model="editForm.lng" :precision="6" :step="0.0001" :min="-180" :max="180" placeholder="经度" style="flex: 1" />
                <el-input-number v-model="editForm.lat" :precision="6" :step="0.0001" :min="-90" :max="90" placeholder="纬度" style="flex: 1" />
              </div>
              <MapPicker v-model:lng="editForm.lng" v-model:lat="editForm.lat" />
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input v-model="editForm.address" placeholder="请输入详细地址" />
            </el-form-item>
            <el-form-item label="标签">
              <el-select v-model="editForm.tags" multiple filterable allow-create default-first-option placeholder="选择或输入标签" style="width: 100%">
                <el-option v-for="tag in presetTags" :key="tag" :label="tag" :value="tag" />
              </el-select>
            </el-form-item>
          </el-form>
        </template>
        <template v-else>
          <el-empty v-if="!village" description="未找到乡村数据" />
          <el-descriptions v-else :column="2" border class="info-desc">
            <el-descriptions-item label="名称">
              {{ village.name }}
              <AppIcon name="editPen" :size="14" class="desc-edit-icon" @click="enterEditMode" />
            </el-descriptions-item>
            <el-descriptions-item label="地址">
              {{ village.address || '—' }}
              <AppIcon name="editPen" :size="14" class="desc-edit-icon" @click="enterEditMode" />
            </el-descriptions-item>
            <el-descriptions-item label="封面图URL" :span="2">
              <a v-if="village.coverImage" :href="village.coverImage" target="_blank" class="cover-link">{{ village.coverImage }}</a>
              <span v-else>—</span>
              <AppIcon name="editPen" :size="14" class="desc-edit-icon" @click="enterEditMode" />
            </el-descriptions-item>
            <el-descriptions-item label="纬度">
              {{ village.lat }}
              <AppIcon name="editPen" :size="14" class="desc-edit-icon" @click="enterEditMode" />
            </el-descriptions-item>
            <el-descriptions-item label="经度">
              {{ village.lng }}
              <AppIcon name="editPen" :size="14" class="desc-edit-icon" @click="enterEditMode" />
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <div class="tag-group">
                <el-tag v-for="(tag, i) in village.tags" :key="i" effect="plain" class="info-tag">{{ tag }}</el-tag>
                <span v-if="!village.tags || village.tags.length === 0" style="color: var(--ink-500)">—</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="介绍" :span="2">
              <div class="info-desc-text">{{ village.description || '—' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(village.createdAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-tab-pane>

      <!-- 打卡点 -->
      <el-tab-pane :label="`📍 打卡点 (${spotList.length})`" name="spots">
        <div class="toolbar">
          <el-input
            v-model="spotSearch"
            placeholder="搜索打卡点名称..."
            clearable
            style="width: 220px"
          >
            <template #prefix><AppIcon name="search" :size="14" /></template>
          </el-input>
          <div class="toolbar-spacer" />
          <el-button class="btn-celadon" @click="handleAddSpot">
            <AppIcon name="plus" :size="14" class="btn-icon" />
            <span>新增打卡点</span>
          </el-button>
        </div>
        <el-row v-loading="spotsLoading" :gutter="16">
          <el-col
            v-for="spot in filteredSpots"
            :key="spot.spotId"
            :xs="24"
            :sm="12"
            :md="8"
          >
            <div class="scroll-card">
              <div class="spot-card-inner">
                <div class="spot-thumb">
                  <img v-if="spot.images && spot.images.length" :src="spot.images[0]" alt="" class="spot-thumb-img" />
                  <div v-else class="spot-thumb-fallback">📍</div>
                </div>
                <div class="spot-info">
                  <div class="spot-name">{{ spot.name }}</div>
                  <div class="spot-coords">{{ spot.lng.toFixed(6) }}, {{ spot.lat.toFixed(6) }}</div>
                  <div class="spot-desc-preview">{{ truncate(spot.description, 60) }}</div>
                </div>
              </div>
              <div class="spot-actions">
                <el-button link class="btn-edit-link" size="small" @click="handleEditSpot(spot)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteSpot(spot)">删除</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-if="!spotsLoading && spotList.length === 0" description="暂无打卡点" />
      </el-tab-pane>

      <!-- 文化条目 -->
      <el-tab-pane :label="`📚 文化条目 (${cultureList.length})`" name="cultures">
        <div class="toolbar">
          <div class="toolbar-spacer" />
          <el-button class="btn-celadon" @click="handleAddCulture">
            <AppIcon name="plus" :size="14" class="btn-icon" />
            <span>新增文化条目</span>
          </el-button>
        </div>
        <el-table v-loading="culturesLoading" :data="cultureList" stripe border style="width: 100%">
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-tag effect="plain">{{ CULTURE_TYPE_MAP[row.type as CultureType] || row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <el-table-column label="内容预览" min-width="280" show-overflow-tooltip>
            <template #default="{ row }">
              {{ truncate(row.content, 50) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button link class="btn-edit-link" size="small" @click="handleEditCulture(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteCulture(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无文化条目" />
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 打卡点对话框 -->
    <el-dialog
      v-model="spotDialogVisible"
      :title="spotDialogMode === 'create' ? '新增打卡点' : '编辑打卡点'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="spotFormRef" :model="spotForm" :rules="spotFormRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="spotForm.name" placeholder="请输入打卡点名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="spotForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload
              :show-file-list="false"
              :before-upload="spotImageBeforeUpload"
              :http-request="spotImageUploadRequest"
              accept="image/*"
            >
              <el-button :loading="spotImageUploading" type="primary" size="small">上传图片</el-button>
            </el-upload>
            <img
              v-if="spotForm.imageUrl"
              :src="spotForm.imageUrl"
              alt=""
              style="width: 100px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid var(--tea-200);"
            />
            <el-button v-if="spotForm.imageUrl" link type="danger" size="small" @click="spotForm.imageUrl = ''">移除</el-button>
            <AiImageBtn placeholder="描绘打卡点图片，如：村口古树下，阳光透过枝叶..." @generated="url => spotForm.imageUrl = url" />
          </div>
        </el-form-item>
        <el-form-item label="坐标">
          <div style="display: flex; gap: 12px; width: 100%; margin-bottom: 8px">
            <el-input-number v-model="spotForm.lng" :precision="6" :step="0.0001" :min="-180" :max="180" placeholder="经度" style="flex: 1" />
            <el-input-number v-model="spotForm.lat" :precision="6" :step="0.0001" :min="-90" :max="90" placeholder="纬度" style="flex: 1" />
          </div>
          <MapPicker v-model:lng="spotForm.lng" v-model:lat="spotForm.lat" />
        </el-form-item>
        <el-form-item label="半径" prop="radius">
          <el-input-number v-model="spotForm.radius" :min="0" :step="10" placeholder="打卡半径(米)" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="spotDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="spotSubmitting" @click="submitSpot">确定</el-button>
      </template>
    </el-dialog>

    <!-- 文化条目对话框 -->
    <el-dialog
      v-model="cultureDialogVisible"
      :title="cultureDialogMode === 'create' ? '新增文化条目' : '编辑文化条目'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="cultureFormRef" :model="cultureForm" :rules="cultureFormRules" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="cultureForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option
              v-for="(label, value) in CULTURE_TYPE_MAP"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="cultureForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="cultureForm.content" type="textarea" :rows="6" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cultureDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="cultureSubmitting" @click="submitCulture">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { uploadImage } from '@/api/settings'
import MapPicker from '@/components/map/MapPicker.vue'
import AiImageBtn from '@/components/common/AiImageBtn.vue'
import {
  getVillageDetail,
  updateVillage,
  getVillageSpots,
  createVillageSpot,
  updateVillageSpot,
  deleteVillageSpot,
  getVillageCultures,
  createVillageCulture,
  updateVillageCulture,
  deleteVillageCulture
} from '@/api/village'
import type { Village, VillageSpot, VillageCulture, CultureType } from '@/types'
import { CULTURE_TYPE_MAP } from '@/types'

const route = useRoute()
const router = useRouter()
const villageId = String(route.params.id)

// 预设标签
const presetTags = [
  '古村落', '山水田园', '非遗传承', '红色文化',
  '民俗体验', '生态农业', '温泉养生', '古镇老街'
]

// 截断工具
const truncate = (str: string, len: number) => {
  if (!str) return '—'
  return str.length > len ? str.slice(0, len) + '...' : str
}

const formatDateTime = (iso: string) => {
  if (!iso) return '—'
  // 数据库为 UTC 时间，转为本地时间显示
  const d = new Date(iso + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ===== 页面加载 =====
const pageLoading = ref(false)
const village = ref<Village | null>(null)

const fetchDetail = async () => {
  pageLoading.value = true
  try {
    const res = await getVillageDetail(villageId)
    if (res.data.code === 0 && res.data.data) {
      village.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    pageLoading.value = false
  }
}

// ===== 编辑模式 =====
const editing = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
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
      editForm.coverImage = res.data.data.url
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

interface EditForm {
  name: string
  description: string
  coverImage: string
  lat: number
  lng: number
  address: string
  tags: string[]
}

const editForm = reactive<EditForm>({
  name: '',
  description: '',
  coverImage: '',
  lat: 0,
  lng: 0,
  address: '',
  tags: []
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入乡村名称', trigger: 'blur' }]
}

const enterEditMode = () => {
  if (!village.value) return
  Object.assign(editForm, {
    name: village.value.name,
    description: village.value.description || '',
    coverImage: village.value.coverImage || '',
    lat: village.value.lat,
    lng: village.value.lng,
    address: village.value.address || '',
    tags: [...(village.value.tags || [])]
  })
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const saveEdit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const res = await updateVillage(villageId, { ...editForm })
    if (res.data.code === 0) {
      ElMessage.success('保存成功')
      editing.value = false
      await fetchDetail()
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

// ===== Tabs =====
const activeTab = ref('info')

// ===== 打卡点 =====
const spotsLoading = ref(false)
const spotList = ref<VillageSpot[]>([])
const spotSearch = ref('')

const filteredSpots = computed(() => {
  if (!spotSearch.value) return spotList.value
  const kw = spotSearch.value.toLowerCase()
  return spotList.value.filter(s => s.name.toLowerCase().includes(kw))
})

const fetchSpots = async () => {
  spotsLoading.value = true
  try {
    const res = await getVillageSpots(villageId)
    if (res.data.code === 0 && res.data.data) {
      spotList.value = res.data.data.list || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    spotsLoading.value = false
  }
}

const spotDialogVisible = ref(false)
const spotDialogMode = ref<'create' | 'edit'>('create')
const spotSubmitting = ref(false)
const spotImageUploading = ref(false)
const spotFormRef = ref<FormInstance>()
const editingSpotId = ref<string>('')

function spotImageBeforeUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

async function spotImageUploadRequest(options: any) {
  spotImageUploading.value = true
  try {
    const res = await uploadImage(options.file, 'spot')
    if (res.data.code === 0) {
      spotForm.imageUrl = res.data.data.url
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(res.data.message || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    spotImageUploading.value = false
  }
}

interface SpotForm {
  name: string
  description: string
  imageUrl: string
  lat: number
  lng: number
  radius: number
}

const defaultSpot: SpotForm = {
  name: '',
  description: '',
  imageUrl: '',
  lat: 0,
  lng: 0,
  radius: 50
}

const spotForm = reactive<SpotForm>({ ...defaultSpot })

const spotFormRules: FormRules = {
  name: [{ required: true, message: '请输入打卡点名称', trigger: 'blur' }]
}

const handleAddSpot = () => {
  spotDialogMode.value = 'create'
  Object.assign(spotForm, { ...defaultSpot })
  editingSpotId.value = ''
  spotDialogVisible.value = true
}

const handleEditSpot = (row: VillageSpot) => {
  spotDialogMode.value = 'edit'
  editingSpotId.value = row.spotId
  Object.assign(spotForm, {
    name: row.name,
    description: row.description || '',
    imageUrl: row.images && row.images.length ? row.images[0] : '',
    lat: row.lat,
    lng: row.lng,
    radius: 50
  })
  spotDialogVisible.value = true
}

const submitSpot = async () => {
  if (!spotFormRef.value) return
  try {
    await spotFormRef.value.validate()
  } catch {
    return
  }
  spotSubmitting.value = true
  try {
    const payload: Partial<VillageSpot> = {
      name: spotForm.name,
      description: spotForm.description,
      lat: spotForm.lat,
      lng: spotForm.lng,
      images: spotForm.imageUrl ? [spotForm.imageUrl] : [],
      sortOrder: 0
    }
    const res =
      spotDialogMode.value === 'create'
        ? await createVillageSpot(villageId, payload)
        : await updateVillageSpot(villageId, editingSpotId.value, payload)
    if (res.data.code === 0) {
      ElMessage.success(spotDialogMode.value === 'create' ? '新增成功' : '更新成功')
      spotDialogVisible.value = false
      fetchSpots()
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('操作失败')
  } finally {
    spotSubmitting.value = false
  }
}

const handleDeleteSpot = async (row: VillageSpot) => {
  try {
    await ElMessageBox.confirm(`确定要删除打卡点「${row.name}」吗？`, '删除确认', {
      type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消'
    })
  } catch {
    return
  }
  try {
    const res = await deleteVillageSpot(villageId, row.spotId)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchSpots()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}

// ===== 文化条目 =====
const culturesLoading = ref(false)
const cultureList = ref<VillageCulture[]>([])

const fetchCultures = async () => {
  culturesLoading.value = true
  try {
    const res = await getVillageCultures(villageId)
    if (res.data.code === 0 && res.data.data) {
      cultureList.value = res.data.data.list || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    culturesLoading.value = false
  }
}

const cultureDialogVisible = ref(false)
const cultureDialogMode = ref<'create' | 'edit'>('create')
const cultureSubmitting = ref(false)
const cultureFormRef = ref<FormInstance>()
const editingCultureId = ref<string>('')

interface CultureForm {
  type: CultureType | ''
  title: string
  content: string
}

const defaultCulture: CultureForm = {
  type: '',
  title: '',
  content: ''
}

const cultureForm = reactive<CultureForm>({ ...defaultCulture })

const cultureFormRules: FormRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const handleAddCulture = () => {
  cultureDialogMode.value = 'create'
  Object.assign(cultureForm, { ...defaultCulture })
  editingCultureId.value = ''
  cultureDialogVisible.value = true
}

const handleEditCulture = (row: VillageCulture) => {
  cultureDialogMode.value = 'edit'
  editingCultureId.value = row.cultureId
  Object.assign(cultureForm, {
    type: row.type,
    title: row.title,
    content: row.content
  })
  cultureDialogVisible.value = true
}

const submitCulture = async () => {
  if (!cultureFormRef.value) return
  try {
    await cultureFormRef.value.validate()
  } catch {
    return
  }
  cultureSubmitting.value = true
  try {
    const payload: Partial<VillageCulture> = {
      type: cultureForm.type as CultureType,
      title: cultureForm.title,
      content: cultureForm.content
    }
    const res =
      cultureDialogMode.value === 'create'
        ? await createVillageCulture(villageId, payload)
        : await updateVillageCulture(villageId, editingCultureId.value, payload)
    if (res.data.code === 0) {
      ElMessage.success(cultureDialogMode.value === 'create' ? '新增成功' : '更新成功')
      cultureDialogVisible.value = false
      fetchCultures()
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('操作失败')
  } finally {
    cultureSubmitting.value = false
  }
}

const handleDeleteCulture = async (row: VillageCulture) => {
  try {
    await ElMessageBox.confirm(`确定要删除文化条目「${row.title}」吗？`, '删除确认', {
      type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消'
    })
  } catch {
    return
  }
  try {
    const res = await deleteVillageCulture(villageId, row.cultureId)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchCultures()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}

// ===== 初始化 =====
onMounted(async () => {
  await fetchDetail()
  await Promise.all([fetchSpots(), fetchCultures()])
})
</script>

<style scoped>
.village-detail-view {
  min-height: 100vh;
}

/* --- Banner --- */
.banner {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bamboo-500), var(--bamboo-800));
  position: relative;
  overflow: hidden;
}

.fallback-mountains {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 80%;
}

.mountain {
  position: absolute;
  bottom: 0;
  border-radius: 40% 45% 0 0;
  opacity: 0.15;
}
.m1 {
  left: 5%;
  width: 35%;
  height: 70%;
  background: var(--ink-800);
}
.m2 {
  left: 30%;
  width: 45%;
  height: 85%;
  background: var(--ink-600);
}
.m3 {
  right: 5%;
  width: 30%;
  height: 60%;
  background: var(--ink-500);
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to top, rgba(30, 20, 10, 0.65), rgba(30, 20, 10, 0.1), transparent);
}

.banner-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  z-index: 2;
}

.banner-info {
  flex: 1;
}

.banner-name {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.banner-tags {
  margin-bottom: 6px;
}

.banner-tag {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
}

.banner-address {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.banner-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-back {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 14px;
}
.btn-back:hover {
  color: #fff !important;
}

.btn-ink {
  background: var(--ink-800) !important;
  border-color: var(--ink-800) !important;
  color: #fff !important;
}
.btn-ink:hover {
  background: var(--ink-600) !important;
  border-color: var(--ink-600) !important;
}

/* --- Tabs --- */
.detail-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(61, 50, 38, 0.06);
  margin: 16px 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.toolbar-spacer {
  flex: 1;
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

/* --- 基本信息描述 --- */
.info-desc {
  margin-top: 8px;
}

.desc-edit-icon {
  margin-left: 6px;
  color: var(--bamboo-500);
  cursor: pointer;
  font-size: 14px;
  vertical-align: middle;
}
.desc-edit-icon:hover {
  color: var(--bamboo-400);
}

.cover-link {
  color: var(--bamboo-500);
  text-decoration: none;
}
.cover-link:hover {
  color: var(--bamboo-400);
  text-decoration: underline;
}

.info-tag {
  background: var(--tea-100) !important;
  color: var(--bamboo-600) !important;
  border-color: var(--tea-300) !important;
}

.info-desc-text {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
  color: var(--ink-800);
}

.edit-form {
  max-width: 600px;
}

/* --- 打卡点卡片 --- */
.scroll-card {
  background: #fff;
  border-radius: 6px;
  border: 1px solid var(--tea-200);
  margin-bottom: 16px;
  transition: box-shadow 0.3s;
}
.scroll-card:hover {
  box-shadow: 0 4px 12px rgba(196, 115, 79, 0.12);
}

.spot-card-inner {
  display: flex;
  gap: 12px;
  padding: 12px;
}

.spot-thumb {
  width: 100px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.spot-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.spot-thumb-fallback {
  width: 100%;
  height: 100%;
  background: var(--tea-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.spot-info {
  flex: 1;
  min-width: 0;
}

.spot-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-800);
  margin-bottom: 4px;
}

.spot-coords {
  font-size: 12px;
  color: var(--ink-500);
  margin-bottom: 4px;
}

.spot-desc-preview {
  font-size: 12px;
  color: var(--ink-500);
  line-height: 1.5;
}

.spot-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 12px 8px;
  gap: 4px;
}

/* --- 地图占位 --- */
.map-placeholder {
  width: 100%;
  height: 150px;
  background: var(--tea-200);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--ink-500);
  margin-top: 8px;
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

:deep(.el-tabs__item.is-active) {
  color: var(--bamboo-500) !important;
}
:deep(.el-tabs__active-bar) {
  background-color: var(--bamboo-500) !important;
}

:deep(.el-descriptions__label) {
  background: var(--tea-100) !important;
  color: var(--ink-600) !important;
}

:deep(.el-tag) {
  border-radius: 4px;
}

/* 编辑按钮 —— 与删除按钮同风格（link），淡绿色 */
.btn-edit-link {
  color: var(--sprout-400) !important;
}
.btn-edit-link:hover {
  color: var(--sprout-300) !important;
}
</style>
