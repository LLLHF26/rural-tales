<template>
  <div class="user-detail-view">
    <!-- 顶部 -->
    <div class="page-header">
      <el-button @click="goBack">
        <AppIcon name="arrowLeft" :size="14" class="btn-icon" />
        <span>返回列表</span>
      </el-button>
      <h2 class="page-title">
        {{ user?.nickname || '用户详情' }}
        <el-tag v-if="user" type="info" size="small" effect="plain">userId: {{ user.userId }}</el-tag>
      </h2>
      <div class="header-spacer" />
    </div>

    <!-- 用户基本信息卡片 -->
    <el-card v-loading="detailLoading" class="info-card">
      <template #header>
        <span>基本信息</span>
      </template>
      <div v-if="user" class="info-content">
        <div class="avatar-wrapper">
          <el-avatar v-if="user.avatar" :src="user.avatar" :size="80" />
          <el-avatar v-else :size="80">
            <AppIcon name="user" :size="36" />
          </el-avatar>
        </div>
        <el-descriptions :column="2" border class="info-descriptions">
          <el-descriptions-item label="昵称">{{ user.nickname || '—' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ maskPhone(user.phone) }}</el-descriptions-item>
          <el-descriptions-item label="体验次数">
            <el-tag type="primary" effect="plain">{{ user.experienceCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="完成次数">
            <el-tag type="success" effect="plain">{{ user.completedCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评分次数">
            <el-tag type="warning" effect="plain">{{ user.ratingCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ user.createdAt || '—' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-empty v-else description="未找到用户数据" />
    </el-card>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="体验记录" name="progresses">
        <el-table
          v-loading="progressLoading"
          :data="progressList"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="scriptTitle" label="剧本名" min-width="160" show-overflow-tooltip />
          <el-table-column prop="villageName" label="村庄名" min-width="120" show-overflow-tooltip />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'info'" effect="plain">
                {{ row.status === 'completed' ? '已完成' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="完成节点/总节点" width="140" align="center">
            <template #default="{ row }">
              {{ row.completedNodeCount }} / {{ row.totalNodeCount }}
            </template>
          </el-table-column>
          <el-table-column label="耗时(分钟)" width="110" align="center">
            <template #default="{ row }">
              {{ formatDuration(row.duration) }}
            </template>
          </el-table-column>
          <el-table-column label="达成结局" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.endingTitle || '—' }}
            </template>
          </el-table-column>
          <el-table-column label="开始时间" width="170" align="center">
            <template #default="{ row }">
              {{ row.startedAt || '—' }}
            </template>
          </el-table-column>
          <el-table-column label="完成时间" width="170" align="center">
            <template #default="{ row }">
              {{ row.completedAt || '—' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="openProgressDetail(row.progressId)"
              >
                查看游玩路径
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 体验记录分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="progressPagination.page"
            v-model:page-size="progressPagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="progressPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="fetchProgresses"
            @current-change="fetchProgresses"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 游玩详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="游玩详情"
      width="720px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-loading="detailDialogLoading">
        <template v-if="progressDetail">
          <!-- 基本信息 -->
          <el-descriptions :column="2" border size="small" class="detail-descriptions">
            <el-descriptions-item label="剧本">{{ progressDetail.scriptTitle }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="progressDetail.status === 'completed' ? 'success' : 'info'" size="small">
                {{ progressDetail.status === 'completed' ? '已完成' : '进行中' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ progressDetail.startedAt || '—' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ progressDetail.completedAt || '—' }}</el-descriptions-item>
          </el-descriptions>

          <!-- 已完成节点 -->
          <div class="detail-section">
            <h4 class="section-title">已完成节点</h4>
            <div v-if="progressDetail.completedNodeIds?.length" class="tag-list">
              <el-tag
                v-for="nodeId in progressDetail.completedNodeIds"
                :key="nodeId"
                type="success"
                effect="plain"
                class="node-tag"
              >
                {{ nodeId }}
              </el-tag>
            </div>
            <span v-else class="text-muted">暂无已完成节点</span>
          </div>

          <!-- 已获得道具 -->
          <div class="detail-section">
            <h4 class="section-title">已获得道具</h4>
            <div v-if="progressDetail.items?.length" class="items-grid">
              <el-card
                v-for="(item, index) in progressDetail.items"
                :key="index"
                shadow="hover"
                class="item-card"
              >
                <div class="item-info">
                  <el-avatar v-if="item.icon" :src="item.icon" :size="36" shape="square" />
                  <div class="item-text">
                    <div class="item-name">{{ item.name || item.itemId || '道具' }}</div>
                    <div v-if="item.description" class="item-desc">{{ item.description }}</div>
                    <el-tag v-if="item.type" size="small" class="item-type-tag">
                      {{ item.type === 'clue' ? '线索' : item.type === 'key' ? '钥匙' : item.type === 'tool' ? '工具' : item.type }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </div>
            <span v-else class="text-muted">暂未获得道具</span>
          </div>

          <!-- NPC对话记录 -->
          <div class="detail-section">
            <h4 class="section-title">NPC对话记录</h4>
            <el-timeline v-if="progressDetail.chatLogs?.length">
              <el-timeline-item
                v-for="(log, index) in progressDetail.chatLogs"
                :key="index"
                :timestamp="log.createdAt || ''"
                placement="top"
                :type="log.role === 'user' ? 'primary' : 'success'"
              >
                <div class="chat-item">
                  <el-tag :type="log.role === 'user' ? '' : 'success'" size="small" effect="plain">
                    {{ log.role === 'user' ? user?.nickname || '用户' : log.npcName }}
                  </el-tag>
                  <p class="chat-content">{{ log.content }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
            <span v-else class="text-muted">暂无对话记录</span>
          </div>
        </template>
        <el-empty v-else-if="!detailDialogLoading" description="加载游玩详情失败" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserDetail, getUserProgresses, getProgressDetail } from '@/api/user'
import type { UserDetail, UserProgress, ProgressDetail } from '@/types'

const route = useRoute()
const router = useRouter()
const userId = String(route.params.id)

// 基本信息
const detailLoading = ref(false)
const user = ref<UserDetail | null>(null)

const fetchDetail = async () => {
  detailLoading.value = true
  try {
    const res = await getUserDetail(userId)
    if (res.data.code === 0 && res.data.data) {
      user.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    detailLoading.value = false
  }
}

const goBack = () => {
  router.push('/user/list')
}

// 手机号脱敏
const maskPhone = (phone: string) => {
  if (!phone) return '—'
  if (phone.length >= 7) {
    return phone.slice(0, 3) + '****' + phone.slice(7)
  }
  return phone
}

// 格式化耗时
const formatDuration = (minutes: number) => {
  if (minutes == null) return '—'
  return minutes + ' 分钟'
}

// Tabs
const activeTab = ref('progresses')

// 体验记录
const progressLoading = ref(false)
const progressList = ref<UserProgress[]>([])

const progressPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchProgresses = async () => {
  progressLoading.value = true
  try {
    const res = await getUserProgresses(userId, {
      page: progressPagination.page,
      pageSize: progressPagination.pageSize
    })
    if (res.data.code === 0 && res.data.data) {
      progressList.value = res.data.data.list
      progressPagination.total = res.data.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    progressLoading.value = false
  }
}

// 游玩详情弹窗
const detailDialogVisible = ref(false)
const detailDialogLoading = ref(false)
const progressDetail = ref<ProgressDetail | null>(null)

const openProgressDetail = async (progressId: string) => {
  detailDialogVisible.value = true
  detailDialogLoading.value = true
  progressDetail.value = null
  try {
    const res = await getProgressDetail(userId, progressId)
    if (res.data.code === 0 && res.data.data) {
      progressDetail.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    detailDialogLoading.value = false
  }
}

onMounted(async () => {
  await fetchDetail()
  await fetchProgresses()
})
</script>

<style scoped>
.user-detail-view {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-spacer {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-card {
  margin-bottom: 16px;
}

.info-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.info-descriptions {
  flex: 1;
}

.detail-tabs {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 游玩详情弹窗 */
.detail-descriptions {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.node-tag {
  margin: 0;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.item-card {
  background: #fafafa;
}

.item-card :deep(.el-card__body) {
  padding: 12px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-text {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.item-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-type-tag {
  margin-top: 4px;
}

.chat-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
}

.chat-content {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  word-break: break-all;
  flex: 1;
}

.text-muted {
  color: #909399;
  font-size: 13px;
}
</style>
