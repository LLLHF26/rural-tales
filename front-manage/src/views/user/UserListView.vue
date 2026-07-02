<template>
  <div class="user-list-view">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索昵称/手机号"
        clearable
        style="width: 280px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <AppIcon name="search" :size="14" />
        </template>
      </el-input>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="注册开始日期"
        end-placeholder="注册结束日期"
        value-format="YYYY-MM-DD"
        style="width: 280px"
      />
      <el-button type="primary" @click="handleSearch">
        <AppIcon name="search" :size="14" class="btn-icon" />
        <span>搜索</span>
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column label="头像" width="90" align="center">
        <template #default="{ row }">
          <el-avatar v-if="row.avatar" :src="row.avatar" :size="48" />
          <el-avatar v-else :size="48">
            <AppIcon name="user" :size="22" />
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" min-width="140" show-overflow-tooltip />
      <el-table-column label="手机号" width="150">
        <template #default="{ row }">
          {{ maskPhone(row.phone) }}
        </template>
      </el-table-column>
      <el-table-column prop="experienceCount" label="体验次数" width="110" align="center" />
      <el-table-column prop="completedCount" label="完成次数" width="110" align="center" />
      <el-table-column label="注册时间" width="180" align="center">
        <template #default="{ row }">
          {{ row.createdAt || '—' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserList } from '@/api/user'
import type { UserListItem } from '@/types'

const router = useRouter()

// 搜索
const searchKeyword = ref('')
const dateRange = ref<[string, string] | null>(null)

// 表格
const loading = ref(false)
const tableData = ref<UserListItem[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 手机号脱敏：中间4位替换为 ****
const maskPhone = (phone: string) => {
  if (!phone) return '—'
  if (phone.length >= 7) {
    return phone.slice(0, 3) + '****' + phone.slice(7)
  }
  return phone
}

// 加载列表
const fetchList = async () => {
  loading.value = true
  try {
    const params: {
      page: number
      pageSize: number
      keyword?: string
      startDate?: string
      endDate?: string
    } = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const res = await getUserList(params)
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

const handleReset = () => {
  searchKeyword.value = ''
  dateRange.value = null
  pagination.page = 1
  fetchList()
}

const handleViewDetail = (row: UserListItem) => {
  router.push('/user/detail/' + row.userId)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.user-list-view {
  padding: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
