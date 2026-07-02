<!-- c:\Users\黄泽民\Desktop\vue\front-client\pages\script-list\index.vue -->
<template>
  <view class="list-page">
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input v-model="keyword" placeholder="搜索剧本..." confirm-type="search" @confirm="onSearch" />
        <text class="search-clear" v-if="keyword" @tap="clearSearch">✕</text>
      </view>
      <view class="search-btn" @tap="onSearch">搜索</view>
    </view>

    <view class="filter-bar">
      <view class="filter-item" :class="{ active: currentSort === 'hot' }" @tap="changeSort('hot')">热门</view>
      <view class="filter-item" :class="{ active: currentSort === 'newest' }" @tap="changeSort('newest')">最新</view>
      <view class="filter-item" :class="{ active: currentSort === 'rating' }" @tap="changeSort('rating')">高分</view>
      <view class="filter-item" :class="{ active: !!currentType }" @tap="showTypePicker = true">
        {{ currentTypeLabel || '类型' }}
        <text class="filter-arrow">▾</text>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="list-scroll-inner">
        <script-card v-for="item in list" :key="item.scriptId" :data="item" @click="goDetail(item.scriptId)" />
        <view class="status-text" v-if="loading">加载中…</view>
        <view class="status-text" v-if="!loading && list.length === 0">暂无剧本</view>
        <view class="status-text" v-if="noMore">— 没有更多了 —</view>
      </view>
    </scroll-view>

    <view v-if="showTypePicker" class="popup-overlay" @tap="showTypePicker = false">
      <view class="popup-panel" @tap.stop>
        <view class="popup-header flex-between">
          <text class="popup-title">选择类型</text>
          <text class="popup-close" @tap="showTypePicker = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="type-option" :class="{ active: currentType === '' }" @tap="selectType('')">全部</view>
          <view class="type-option" :class="{ active: currentType === 'mystery' }" @tap="selectType('mystery')">🔍 悬疑解谜</view>
          <view class="type-option" :class="{ active: currentType === 'history' }" @tap="selectType('history')">📜 历史文化</view>
          <view class="type-option" :class="{ active: currentType === 'family' }" @tap="selectType('family')">👨‍👩‍👧 亲子互动</view>
          <view class="type-option" :class="{ active: currentType === 'couple' }" @tap="selectType('couple')">💑 情侣探险</view>
          <view class="type-option" :class="{ active: currentType === 'team' }" @tap="selectType('team')">👥 团队协作</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ScriptCard from '@/components/script-card.vue'
import { scriptApi } from '@/utils/api.js'

export default {
  components: { ScriptCard },
  data() {
    return {
      keyword: '',
      currentSort: 'hot',
      currentType: '',
      currentTypeLabel: '类型',
      currentVillageId: null,
      showTypePicker: false,
      list: [],
      page: 1,
      total: 0,
      loading: false,
      refreshing: false,
      noMore: false
    }
  },
  onLoad() {
    this.loadList()
  },
  onShow() {
    const type = getApp().globalData.scriptType
    const villageId = getApp().globalData.villageId
    if (type) {
      this.currentType = type
      const labels = { mystery: '悬疑解谜', history: '历史文化', family: '亲子互动', couple: '情侣探险', team: '团队协作' }
      this.currentTypeLabel = labels[type] || '类型'
      getApp().globalData.scriptType = null
    }
    if (villageId) {
      this.currentVillageId = villageId
      getApp().globalData.villageId = null
    }
    if (type || villageId) {
      this.page = 1
      this.loadList(true)
    }
  },
  methods: {
    async loadList(isRefresh) {
      if (this.loading) return
      if (isRefresh) { this.page = 1; this.noMore = false }
      this.loading = true
      try {
        const data = await scriptApi.getList({
          page: this.page,
          pageSize: 10,
          sort: this.currentSort,
          type: this.currentType || undefined,
          villageId: this.currentVillageId || undefined,
          keyword: this.keyword || undefined
        })
        this.list = isRefresh || this.page === 1 ? data.list : [...this.list, ...data.list]
        this.total = data.total
        this.noMore = this.list.length >= this.total
      } catch (e) {} finally { this.loading = false }
    },
    loadMore() {
      if (this.loading || this.noMore) return
      this.page++
      this.loadList()
    },
    async onRefresh() {
      this.refreshing = true
      this.page = 1
      await this.loadList(true)
      this.refreshing = false
    },
    changeSort(sort) {
      if (this.currentSort === sort) return
      this.currentSort = sort
      this.page = 1
      this.loadList(true)
    },
    selectType(type) {
      this.currentType = type
      const labels = { mystery: '悬疑解谜', history: '历史文化', family: '亲子互动', couple: '情侣探险', team: '团队协作' }
      this.currentTypeLabel = type ? labels[type] : '类型'
      this.showTypePicker = false
      this.page = 1
      this.loadList(true)
    },
    onSearch() {
      this.page = 1
      this.loadList(true)
    },
    clearSearch() {
      this.keyword = ''
      this.page = 1
      this.loadList(true)
    },
    goDetail(id) { uni.navigateTo({ url: `/pages/script-detail/index?id=${id}` }) }
  }
}
</script>

<style lang="scss" scoped>
.list-page {
  height: 100%;
  width: 100%;
  background: #F5F6F0;
  display: flex;
  flex-direction: column;
}
.search-bar {
  padding: 24rpx 30rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 44rpx;
  padding: 18rpx 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  input { flex: 1; font-size: 28rpx; margin-left: 14rpx; color: #333; }
}
.search-icon { font-size: 30rpx; opacity: 0.5; flex-shrink: 0; }
.search-clear {
  font-size: 26rpx;
  color: #B0B0B0;
  padding: 6rpx;
  margin-left: 8rpx;
  flex-shrink: 0;
}
.search-btn {
  flex-shrink: 0;
  background: #5C7A5C;
  color: #fff;
  font-size: 28rpx;
  padding: 18rpx 32rpx;
  border-radius: 44rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 12rpx rgba(92,122,92,0.3);
  &:active { opacity: 0.85; }
}
.filter-bar {
  display: flex;
  padding: 0 30rpx 24rpx;
  gap: 16rpx;
}
.filter-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  background: #fff;
  padding: 16rpx 0;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  transition: all 0.2s ease;
  &.active { background: #5C7A5C; color: #fff; font-weight: 500; }
}
.filter-arrow {
  font-size: 20rpx;
  margin-left: 6rpx;
}
.list-scroll {
  flex: 1;
  height: 0;
}
.list-scroll-inner {
  padding: 0 30rpx;
}
.status-text {
  text-align: center;
  padding: 48rpx 0;
  color: #B0B0B0;
  font-size: 26rpx;
}
.popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}
.popup-panel {
  width: 100%;
  background: #fff;
  border-radius: 36rpx 36rpx 0 0;
  padding: 36rpx 30rpx 48rpx;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.popup-header { margin-bottom: 32rpx; }
.popup-title { font-size: 34rpx; font-weight: 600; color: #3D5A3D; }
.popup-close { font-size: 36rpx; color: #B0B0B0; padding: 8rpx; }
.type-option {
  padding: 28rpx 32rpx;
  font-size: 28rpx;
  color: #555;
  border-radius: 16rpx;
  margin-bottom: 14rpx;
  background: #F5F6F0;
  transition: all 0.2s ease;
  &.active { background: #6B8E6B; color: #fff; }
}
</style>