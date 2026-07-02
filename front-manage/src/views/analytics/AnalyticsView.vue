<template>
  <div class="analytics-view">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Tab 1: 剧本数据概览 -->
      <el-tab-pane label="剧本数据概览" name="overview">
        <div class="filter-bar">
          <el-select v-model="villageFilter" placeholder="按乡村筛选" clearable style="width: 220px" @change="loadOverview">
            <el-option v-for="v in villageList" :key="v.villageId" :label="v.name" :value="v.villageId" />
          </el-select>
        </div>
        <el-table :data="overviewList" stripe border style="width: 100%" v-loading="overviewLoading">
          <el-table-column prop="title" label="剧本名" min-width="140" />
          <el-table-column prop="experienceCount" label="体验人次" width="100" />
          <el-table-column prop="completedCount" label="完成数" width="90" />
          <el-table-column label="完成率" width="160">
            <template #default="{ row }">
              <el-progress :percentage="Math.round(row.completionRate * 100)" :stroke-width="14" :text-inside="true" />
            </template>
          </el-table-column>
          <el-table-column label="平均耗时(分钟)" width="120">
            <template #default="{ row }">{{ row.avgDuration.toFixed(1) }}</template>
          </el-table-column>
          <el-table-column label="平均评分" width="160">
            <template #default="{ row }">
              <el-rate v-model="row.avgRating" disabled allow-half :max="5" />
            </template>
          </el-table-column>
          <el-table-column prop="ratingCount" label="评价人数" width="90" />
        </el-table>
      </el-tab-pane>

      <!-- Tab 2: 节点漏斗 -->
      <el-tab-pane label="节点漏斗" name="funnel">
        <div class="filter-bar">
          <el-select v-model="funnelScriptId" placeholder="选择剧本" clearable style="width: 220px" @change="loadFunnel">
            <el-option v-for="s in scriptOptions" :key="s.scriptId" :label="s.title" :value="s.scriptId" />
          </el-select>
        </div>
        <div v-if="funnelChartData.length" style="height: 320px; margin-bottom: 20px">
          <v-chart :option="funnelChartOption" autoresize />
        </div>
        <el-table :data="funnelData" stripe border v-loading="funnelLoading">
          <el-table-column prop="title" label="节点名" min-width="140" />
          <el-table-column prop="enterCount" label="进入人数" width="100" />
          <el-table-column prop="completeCount" label="完成人数" width="100" />
          <el-table-column label="通过率" width="160">
            <template #default="{ row }">
              <el-progress :percentage="Math.round(row.rate * 100)" :stroke-width="14" :text-inside="true" />
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab 3: 游客画像 -->
      <el-tab-pane label="游客画像" name="profile">
        <div class="profile-cards" v-loading="profileLoading">
          <el-card shadow="hover">
            <div class="stat-value">{{ profileData.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </el-card>
          <el-card shadow="hover">
            <div class="stat-value">{{ profileData.activeUsers7d }}</div>
            <div class="stat-label">7日活跃</div>
          </el-card>
          <el-card shadow="hover">
            <div class="stat-value">{{ profileData.activeUsers30d }}</div>
            <div class="stat-label">30日活跃</div>
          </el-card>
          <el-card shadow="hover">
            <div class="stat-value">{{ profileData.avgScriptPerUser }}</div>
            <div class="stat-label">人均剧本数</div>
          </el-card>
          <el-card shadow="hover">
            <div class="stat-value">{{ profileData.avgRatingPerUser }}</div>
            <div class="stat-label">人均评分</div>
          </el-card>
        </div>
        <div style="height: 360px">
          <v-chart :option="pieChartOption" autoresize />
        </div>
      </el-tab-pane>

      <!-- Tab 4: 评分列表 -->
      <el-tab-pane label="评分列表" name="ratings">
        <div class="filter-bar">
          <el-select v-model="ratingScriptId" placeholder="选择剧本" clearable style="width: 220px" @change="loadRatings">
            <el-option v-for="s in scriptOptions" :key="s.scriptId" :label="s.title" :value="s.scriptId" />
          </el-select>
          <el-select v-model="ratingValue" placeholder="评分筛选" clearable style="width: 120px; margin-left: 12px" @change="loadRatings">
            <el-option v-for="n in 5" :key="n" :label="`${n} 星`" :value="n" />
          </el-select>
        </div>
        <el-table :data="ratingsList" stripe border v-loading="ratingsLoading">
          <el-table-column prop="userNickname" label="用户昵称" min-width="120" />
          <el-table-column prop="scriptTitle" label="剧本名" min-width="140" />
          <el-table-column label="评分" width="160">
            <template #default="{ row }">
              <el-rate v-model="row.rating" disabled :max="5" />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="评价时间" width="180" />
        </el-table>
        <el-pagination
          v-model:current-page="ratingPage"
          v-model:page-size="ratingPageSize"
          :total="ratingTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 16px; justify-content: flex-end"
          @current-change="loadRatings"
          @size-change="loadRatings"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import VChart from 'vue-echarts'
import { getScriptsOverview, getNodeFunnel, getUserProfile, getRatings } from '@/api/analytics'
import { getScriptList } from '@/api/script'
import { getVillageList } from '@/api/village'
import type { ScriptAnalytics, NodeFunnelItem, UserProfile, RatingItem } from '@/types'
import { SCRIPT_TYPE_MAP } from '@/types'

const activeTab = ref('overview')

// --- 剧本数据概览 ---
const overviewLoading = ref(false)
const overviewList = ref<ScriptAnalytics[]>([])
const villageFilter = ref<string>('')
const villageList = ref<{ villageId: string; name: string }[]>([])

async function loadVillages() {
  const res = await getVillageList({ page: 1, pageSize: 100 })
  villageList.value = res.data.data.list.map(v => ({ villageId: v.villageId, name: v.name }))
}

async function loadOverview() {
  overviewLoading.value = true
  try {
    const res = await getScriptsOverview(villageFilter.value || undefined)
    overviewList.value = res.data.data.list
  } finally {
    overviewLoading.value = false
  }
}

// --- 节点漏斗 ---
const funnelLoading = ref(false)
const funnelScriptId = ref('')
const funnelData = ref<NodeFunnelItem[]>([])
const scriptOptions = ref<{ scriptId: string; title: string }[]>([])

async function loadScriptOptions() {
  const res = await getScriptList({ page: 1, pageSize: 200 })
  scriptOptions.value = res.data.data.list.map(s => ({ scriptId: s.scriptId, title: s.title }))
}

async function loadFunnel() {
  if (!funnelScriptId.value) {
    funnelData.value = []
    return
  }
  funnelLoading.value = true
  try {
    const res = await getNodeFunnel(funnelScriptId.value)
    funnelData.value = res.data.data.nodes
  } finally {
    funnelLoading.value = false
  }
}

const funnelChartData = computed(() =>
  funnelData.value.map(item => ({ name: item.title, value: item.enterCount }))
)

const funnelChartOption = computed(() => ({
  title: { text: '节点漏斗图', left: 'center' },
  tooltip: { trigger: 'item', formatter: '{b}: {c}人' },
  series: [{
    type: 'funnel',
    left: '10%',
    width: '80%',
    data: funnelChartData.value,
    label: { show: true, position: 'inside' },
    itemStyle: { borderColor: '#fff', borderWidth: 1 }
  }]
}))

// --- 游客画像 ---
const profileLoading = ref(false)
const profileData = reactive<UserProfile>({
  totalUsers: 0,
  activeUsers7d: 0,
  activeUsers30d: 0,
  scriptTypeDistribution: {},
  avgScriptPerUser: 0,
  avgRatingPerUser: 0
})

async function loadProfile() {
  profileLoading.value = true
  try {
    const res = await getUserProfile()
    Object.assign(profileData, res.data.data)
  } finally {
    profileLoading.value = false
  }
}

const pieChartOption = computed(() => {
  const dist = profileData.scriptTypeDistribution
  const data = Object.entries(dist)
    .filter(([_, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      name: SCRIPT_TYPE_MAP[key as keyof typeof SCRIPT_TYPE_MAP] || key,
      value
    }))
  return {
    title: { text: '剧本类型偏好分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { orient: 'horizontal', bottom: 10, left: 'center' },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '45%'],
      data,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        lineHeight: 18,
      },
      labelLine: {
        length: 30,
        length2: 50,
        smooth: true,
      },
      avoidLabelOverlap: true,
    }]
  }
})

// --- 评分列表 ---
const ratingsLoading = ref(false)
const ratingsList = ref<RatingItem[]>([])
const ratingScriptId = ref<string>('')
const ratingValue = ref<number | undefined>(undefined)
const ratingPage = ref(1)
const ratingPageSize = ref(10)
const ratingTotal = ref(0)

async function loadRatings() {
  ratingsLoading.value = true
  try {
    const res = await getRatings({
      page: ratingPage.value,
      pageSize: ratingPageSize.value,
      scriptId: ratingScriptId.value || undefined,
      rating: ratingValue.value || undefined
    })
    ratingsList.value = res.data.data.list
    ratingTotal.value = res.data.data.total
  } finally {
    ratingsLoading.value = false
  }
}

onMounted(() => {
  loadOverview()
  loadVillages()
  loadScriptOptions()
  loadProfile()
  loadRatings()
})
</script>

<style scoped>
.analytics-view {
  padding: 20px;
}
.filter-bar {
  margin-bottom: 16px;
}
.profile-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.profile-cards .el-card {
  flex: 1;
  text-align: center;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-primary);
}
.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 进度条内文字改为黑色 */
:deep(.el-progress-bar__innerText) {
  color: #000 !important;
}
:deep(.el-progress__text) {
  color: #000 !important;
}
</style>
