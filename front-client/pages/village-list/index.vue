<template>
  <view class="village-page">
    <nav-bar title="探索村庄"></nav-bar>

    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input v-model="keyword" placeholder="搜索村庄..." confirm-type="search" @confirm="onSearch" />
        <text class="search-clear" v-if="keyword" @tap="clearSearch">✕</text>
      </view>
      <view class="search-btn" @tap="onSearch">搜索</view>
    </view>

    <view class="filter-bar">
      <view class="filter-item" :class="{ active: currentSort === 'name' }" @tap="changeSort('name')">名称</view>
      <view class="filter-item" :class="{ active: currentSort === 'distance' }" @tap="changeSort('distance')">距离最近</view>
      <view class="filter-item" :class="{ active: currentSort === 'scripts' }" @tap="changeSort('scripts')">剧本最多</view>
    </view>

    <view class="location-hint" v-if="locationType === 'ip'">
      <text class="location-hint-icon">📍</text>
      <text class="location-hint-text">当前为基于IP的近似定位，距离仅供参考。如需精确定位请使用 HTTPS 访问或在 App 中打开。</text>
    </view>

    <scroll-view scroll-y class="page-scroll" @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="page-scroll-inner">
        <view class="village-grid">
        <view class="village-card" v-for="v in villages" :key="v.villageId" @tap="goVillage(v.villageId)">
          <image class="village-cover" :src="v.coverImage" mode="aspectFill" />
          <view class="village-overlay"></view>
          <view class="village-body">
            <view class="village-header">
              <text class="village-name">{{ v.name }}</text>
              <view class="village-count">
                <text class="count-num">{{ v.scriptCount }}</text>
                <text class="count-label">个剧本</text>
              </view>
            </view>
            <view class="village-sub" v-if="v.distance != null || v.description">
              <text class="village-distance" v-if="v.distance != null">📍 {{ locationType === 'ip' ? '~' : '' }}{{ v.distance }}km<text class="approx-tag" v-if="locationType === 'ip'">（约）</text></text>
              <text class="village-desc" v-if="v.description">{{ v.description }}</text>
            </view>
            <view class="village-tags" v-if="v.tags && v.tags.length">
              <text class="tag" v-for="t in v.tags" :key="t">{{ t }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="status-text" v-if="loading">加载中…</view>
      <view class="status-text" v-if="!loading && villages.length === 0">暂无村庄</view>
      <view class="status-text" v-if="noMore && villages.length > 0">— 没有更多了 —</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import NavBar from '@/components/nav-bar.vue'
import { villageApi } from '@/utils/api.js'

export default {
  components: { NavBar },
  data() {
    return {
      keyword: '',
      currentSort: 'name',
      villages: [],
      page: 1,
      total: 0,
      loading: false,
      refreshing: false,
      noMore: false,
      userLat: null,
      userLng: null,
      locationType: '' // 'gps' | 'ip' | ''
    }
  },
  onLoad() {
    this.loadVillages()
    this.getLocation().then(() => {
      if (this.userLat != null) {
        this.loadVillages(true)
      }
    })
  },
  methods: {
    getLocation() {
      return new Promise((resolve) => {
        // 1) uni-app 内置定位（支持原生 + H5 HTTPS）
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            this.userLat = res.latitude
            this.userLng = res.longitude
            this.locationType = 'gps'
            resolve()
          },
          fail: () => {
            // 2) 浏览器原生 geolocation（某些 H5 环境）
            if (typeof navigator !== 'undefined' && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  this.userLat = pos.coords.latitude
                  this.userLng = pos.coords.longitude
                  this.locationType = 'gps'
                  resolve()
                },
                () => this.ipFallback(resolve),
                { timeout: 8000, maximumAge: 600000 }
              )
            } else {
              this.ipFallback(resolve)
            }
          }
        })
      })
    },
    ipFallback(resolve) {
      uni.request({
        url: 'https://ipapi.co/json/',
        timeout: 5000,
        success: (res) => {
          if (res.data && res.data.latitude) {
            this.userLat = res.data.latitude
            this.userLng = res.data.longitude
            this.locationType = 'ip'
          }
          resolve()
        },
        fail: () => resolve()
      })
    },
    async loadVillages(isRefresh) {
      if (this.loading) return
      if (isRefresh) { this.page = 1; this.noMore = false }
      this.loading = true
      try {
        const data = await villageApi.getList({
          page: this.page,
          pageSize: 10,
          sort: this.currentSort,
          keyword: this.keyword || undefined,
          lat: this.userLat || undefined,
          lng: this.userLng || undefined
        })
        this.villages = isRefresh || this.page === 1 ? data.list : [...this.villages, ...data.list]
        this.total = data.total
        this.noMore = this.villages.length >= this.total
      } catch (e) { /* fallback */ } finally { this.loading = false }
    },
    loadMore() {
      if (this.loading || this.noMore) return
      this.page++
      this.loadVillages()
    },
    async onRefresh() {
      this.refreshing = true
      this.page = 1
      await this.loadVillages(true)
      this.refreshing = false
    },
    changeSort(sort) {
      if (this.currentSort === sort) return
      if (sort === 'distance' && this.userLat == null) {
        uni.showToast({ title: '请先允许定位权限', icon: 'none' })
        return
      }
      this.currentSort = sort
      this.page = 1
      this.loadVillages(true)
    },
    onSearch() {
      this.page = 1
      this.loadVillages(true)
    },
    clearSearch() {
      this.keyword = ''
      this.page = 1
      this.loadVillages(true)
    },
    goVillage(id) { uni.navigateTo({ url: `/pages/village-detail/index?id=${id}` }) }
  }
}
</script>

<style lang="scss" scoped>
.village-page {
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
.location-hint {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin: 0 0 16rpx;
  padding: 16rpx 22rpx;
  background: #FFF8E1;
  border-radius: 12rpx;
  border-left: 6rpx solid #FFC107;
}
.location-hint-icon {
  font-size: 24rpx;
  flex-shrink: 0;
}
.location-hint-text {
  font-size: 22rpx;
  color: #8D6E00;
  line-height: 1.5;
}
.page-scroll {
  flex: 1;
  height: 0;
}
.page-scroll-inner {
  padding: 0 30rpx;
}
.village-grid {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.village-card {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06);
  position: relative;
  &:active { transform: scale(0.98); }
}
.village-cover {
  width: 100%;
  height: 320rpx;
}
.village-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 320rpx;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.45) 100%);
}
.village-body {
  padding: 28rpx 30rpx 30rpx;
}
.village-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.village-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #2E3D2E;
}
.village-count {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}
.count-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #5C7A5C;
}
.count-label {
  font-size: 22rpx;
  color: #8FA88F;
}
.village-sub {
  margin-bottom: 18rpx;
}
.village-distance {
  font-size: 24rpx;
  color: #6B8E6B;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}
.approx-tag {
  font-size: 20rpx;
  color: #B0A060;
  font-weight: 400;
}
.village-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.village-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.tag {
  font-size: 22rpx;
  color: #5C7A5C;
  background: #E8F5E8;
  padding: 6rpx 18rpx;
  border-radius: 8rpx;
}
.status-text {
  text-align: center;
  padding: 48rpx 0;
  color: #B0B0B0;
  font-size: 26rpx;
}
</style>
