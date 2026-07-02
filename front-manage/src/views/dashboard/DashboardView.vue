<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-title"><AppIcon name="dashboard" :size="22" /> 运营总览</div>

    <!-- 今日概览卡片 -->
    <el-row :gutter="16" class="overview-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div v-loading="overviewLoading" class="scroll-card overview-card">
          <div class="card-body">
            <div class="card-icon-row">
              <AppIcon name="village" :size="22" />
              <span class="card-label">管辖乡村</span>
            </div>
            <div class="card-value">{{ overview.villageCount }}</div>
            <div class="card-trend">
              <span class="trend-tag static">已发布 {{ overview.publishedScriptCount }} 个剧本</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div v-loading="overviewLoading" class="scroll-card overview-card">
          <div class="card-body">
            <div class="card-icon-row">
              <AppIcon name="script" :size="22" />
              <span class="card-label">剧本总数</span>
            </div>
            <div class="card-value">{{ overview.scriptCount }}</div>
            <div class="card-trend">
              <span class="trend-tag static">评分 {{ overview.avgRating.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div v-loading="overviewLoading" class="scroll-card overview-card">
          <div class="card-body">
            <div class="card-icon-row">
              <AppIcon name="user" :size="22" />
              <span class="card-label">注册游客</span>
            </div>
            <div class="card-value">{{ overview.userCount }}</div>
            <div class="card-trend">
              <span class="trend-tag static">今日在线 {{ overview.todayOnlineCount }} 人</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div v-loading="overviewLoading" class="scroll-card overview-card">
          <div class="card-body">
            <div class="card-icon-row">
              <AppIcon name="experience" :size="22" />
              <span class="card-label">今日体验</span>
            </div>
            <div class="card-value">{{ overview.todayExperienceCount }}</div>
            <div class="card-trend">
              <span
                v-if="todayTrend !== null"
                :class="['trend-tag', todayTrend >= 0 ? 'up' : 'down']"
              >
                较昨日 {{ todayTrend >= 0 ? '+' : '' }}{{ todayTrend }}
              </span>
              <span v-else class="trend-tag static">累计 {{ overview.totalExperienceCount }} 人次</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 中间区域：趋势图 + 热门排行 -->
    <el-row :gutter="16" class="middle-row">
      <!-- 近7日趋势图 -->
      <el-col :xs="24" :md="15">
        <el-card v-loading="trendLoading" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title-text"><AppIcon name="analytics" :size="18" /> 近7日运营趋势</span>
            </div>
          </template>
          <v-chart
            v-if="trend.dailyActive.length > 0"
            :option="chartOption"
            autoresize
            style="height: 360px"
          />
          <el-empty v-else description="暂无趋势数据" />
        </el-card>
      </el-col>

      <!-- 热门剧本排行 -->
      <el-col :xs="24" :md="9">
        <el-card v-loading="hotLoading" class="rank-card">
          <template #header>
            <div class="card-header">
              <span class="card-title-text"><AppIcon name="trophy" :size="18" /> 热门剧本</span>
            </div>
          </template>
          <div v-if="hotScripts.length > 0" class="rank-list">
            <div
              v-for="(item, index) in hotScripts"
              :key="item.scriptId"
              class="rank-item"
            >
              <div class="rank-badge">
                <template v-if="index === 0">
                  <span class="badge gold">榜一</span>
                </template>
                <template v-else-if="index === 1">
                  <span class="badge silver">榜二</span>
                </template>
                <template v-else-if="index === 2">
                  <span class="badge bronze">榜三</span>
                </template>
                <template v-else>
                  <span class="badge normal">{{ index + 1 }}</span>
                </template>
              </div>
              <div class="rank-info">
                <div class="rank-title">{{ item.title }}</div>
                <div class="rank-meta">
                  <span class="meta-item">
                    {{ item.villageName }}
                  </span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">
                    {{ item.experienceCount }} 人次
                  </span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item rating">
                    ★ {{ item.rating.toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无热门剧本" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import VChart from 'vue-echarts'
import { getDashboardOverview, getDashboardTrend, getHotScripts } from '@/api/dashboard'
import type { DashboardOverview, DashboardTrend, HotScript } from '@/types'

// ==================== 加载状态（每个区域独立） ====================
const overviewLoading = ref(true)
const trendLoading = ref(true)
const hotLoading = ref(true)

// ==================== 数据 ====================

const overview = reactive<DashboardOverview>({
  villageCount: 0,
  scriptCount: 0,
  publishedScriptCount: 0,
  userCount: 0,
  todayExperienceCount: 0,
  todayOnlineCount: 0,
  avgRating: 0,
  totalExperienceCount: 0
})

const trend = reactive<DashboardTrend>({
  dailyActive: [],
  dailyComplete: []
})

const hotScripts = ref<HotScript[]>([])

// ==================== 计算：今日体验较昨日趋势 ====================

const todayTrend = computed<number | null>(() => {
  const items = trend.dailyComplete
  if (items.length < 2) return null
  const today = items[items.length - 1].count
  const yesterday = items[items.length - 2].count
  return today - yesterday
})

// ==================== ECharts 配置 ====================

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: { color: 'var(--ink-500)' }
    },
    backgroundColor: '#ffffff',
    borderColor: 'var(--tea-300)',
    textStyle: {
      color: 'var(--ink-700)',
      fontSize: 13
    }
  },
  legend: {
    data: ['日活跃用户', '日完成剧本数'],
    top: 0,
    textStyle: {
      color: 'var(--ink-600)',
      fontSize: 13
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: '40px',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: trend.dailyActive.map((item) => item.date.slice(5)),
    boundaryGap: true,
    axisLine: {
      lineStyle: { color: 'var(--tea-300)' }
    },
    axisTick: { show: false },
    axisLabel: {
      color: 'var(--ink-500)',
      fontSize: 12
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '活跃用户',
      nameTextStyle: {
        color: 'var(--ink-500)',
        fontSize: 12
      },
      axisLabel: {
        color: 'var(--ink-500)',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'var(--tea-200)',
          type: 'dashed'
        }
      }
    },
    {
      type: 'value',
      name: '完成剧本数',
      nameTextStyle: {
        color: 'var(--ink-500)',
        fontSize: 12
      },
      axisLabel: {
        color: 'var(--ink-500)',
        fontSize: 12
      },
      splitLine: { show: false }
    }
  ],
  series: [
    {
      name: '日活跃用户',
      type: 'bar',
      yAxisIndex: 0,
      data: trend.dailyActive.map((item) => item.count),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#7ec87b' },
          { offset: 1, color: 'rgba(126,200,123,0.25)' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '40%',
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#94e3a3' },
            { offset: 1, color: 'rgba(148,227,163,0.25)' }
          ])
        }
      }
    },
    {
      name: '日完成剧本数',
      type: 'line',
      yAxisIndex: 1,
      data: trend.dailyComplete.map((item) => item.count),
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#5b8c5a'
      },
      lineStyle: {
        color: '#5b8c5a',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(91,140,90,0.20)' },
          { offset: 1, color: 'rgba(91,140,90,0.02)' }
        ])
      }
    }
  ]
}))

// ==================== 数据加载 ====================

async function loadOverview() {
  overviewLoading.value = true
  try {
    const res = await getDashboardOverview()
    Object.assign(overview, res.data.data)
  } finally {
    overviewLoading.value = false
  }
}

async function loadTrend() {
  trendLoading.value = true
  try {
    const res = await getDashboardTrend(7)
    Object.assign(trend, res.data.data)
  } finally {
    trendLoading.value = false
  }
}

async function loadHotScripts() {
  hotLoading.value = true
  try {
    const res = await getHotScripts(10)
    hotScripts.value = res.data.data.list
  } finally {
    hotLoading.value = false
  }
}

onMounted(() => {
  loadOverview()
  loadTrend()
  loadHotScripts()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
}

/* ========== 概览卡片行 ========== */
.overview-row {
  margin-bottom: var(--section-gap);
}

/* 卷轴式概览卡片 */
.overview-card {
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 16px;
  overflow: visible;             /* 确保图标投影不被裁剪 */
}
.overview-card .card-body {
  overflow: visible;
}
.overview-card :deep(.app-icon) {
  filter: none !important;
  opacity: 1 !important;
  backface-visibility: visible;
  -webkit-backface-visibility: visible;
}
.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(45, 74, 50, 0.1);
}

.overview-card .card-icon-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.overview-card .card-label {
  font-size: 13px;
  color: var(--ink-500);
  letter-spacing: 0.5px;
}

.overview-card .card-value {
  font-size: 36px;
  font-weight: 700;
  font-family: 'Georgia', 'Noto Serif SC', serif;
  color: var(--ink-800);
  line-height: 1.2;
  margin-bottom: 10px;
}

.overview-card .card-trend {
  display: flex;
  align-items: center;
}

/* 趋势标签 */
.trend-tag {
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.trend-tag.up {
  color: var(--sprout-600);
}
.trend-tag.down {
  color: var(--accent-red);
}
.trend-tag.static {
  color: var(--ink-500);
}

/* ========== 中间行 ========== */
.middle-row {
  margin-bottom: var(--section-gap);
}

/* ========== 趋势图卡片 ========== */
.chart-card {
  margin-bottom: var(--section-gap);
}

/* ========== 热门排行卡片 ========== */
.rank-card {
  margin-bottom: var(--section-gap);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title-text {
  font-weight: 600;
  font-size: 15px;
  color: var(--ink-800);
}

/* ========== 排名列表 ========== */
.rank-list {
  display: flex;
  flex-direction: column;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--tea-200);
  transition: background 0.2s;
}
.rank-item:last-child {
  border-bottom: none;
}
.rank-item:hover {
  background: var(--tea-50);
}

/* 排名徽章 */
.rank-badge {
  flex-shrink: 0;
  width: 44px;
  text-align: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
}

.badge.gold {
  background: linear-gradient(135deg, #faf0d7, #e8d5a0);
  color: var(--accent-gold);
  border: 1px solid #e8d5a0;
  box-shadow: 0 2px 6px rgba(184, 134, 11, 0.2);
  font-size: 12px;
}

.badge.silver {
  background: linear-gradient(135deg, #f3f4f6, #d1d5db);
  color: #6b7280;
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.15);
  font-size: 12px;
}

.badge.bronze {
  background: linear-gradient(135deg, #fef3e2, #e5c8a0);
  color: #b87333;
  border: 1px solid #e5c8a0;
  box-shadow: 0 2px 6px rgba(184, 115, 51, 0.15);
  font-size: 12px;
}

.badge.normal {
  background: var(--tea-100);
  color: var(--ink-500);
  border: 1px solid var(--tea-300);
  font-size: 14px;
}

/* 排名信息 */
.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.rank-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-500);
}

.meta-item {
  white-space: nowrap;
}

.meta-divider {
  color: var(--tea-400);
}

.meta-item.rating {
  color: var(--accent-gold);
  font-weight: 600;
}

/* ========== ECharts tooltip 国风配色覆盖 ========== */
:deep(.chart-card .el-card__body) {
  padding: 8px 16px 16px;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .overview-card .card-value {
    font-size: 28px;
  }
  .rank-badge {
    width: 36px;
  }
  .badge {
    width: 30px;
    height: 30px;
    font-size: 11px;
  }
}
</style>
