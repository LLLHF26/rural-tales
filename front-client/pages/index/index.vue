<template>
  <view class="home-page">
    <nav-bar title="乡村剧本"></nav-bar>

    <scroll-view scroll-y class="page-scroll" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view class="hero-section">
        <view class="hero-bg">
          <view class="hero-decor hero-decor-1"></view>
          <view class="hero-decor hero-decor-2"></view>
          <text class="hero-title">田园探秘</text>
          <text class="hero-subtitle">在青山绿水间，开启你的乡村故事</text>
          <view class="hero-stats">
            <view class="hero-stat">
              <text class="stat-num">{{ villages.length }}</text>
              <text class="stat-label">个村庄</text>
            </view>
            <view class="hero-stat">
              <text class="stat-num">{{ hotScripts.length }}</text>
              <text class="stat-label">个热门</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header flex-between">
          <view class="section-title-row">
            <text class="section-icon">🏠</text>
            <text class="section-title">热门村庄</text>
          </view>
          <text class="section-more" @tap="goVillageList">更多 ›</text>
        </view>
        <scroll-view scroll-x class="village-scroll" :show-scrollbar="false">
          <view class="village-item" v-for="v in villages" :key="v.villageId" @tap="goByVillage(v.villageId)">
            <image class="village-img" :src="v.coverImage" mode="aspectFill" />
            <text class="village-name">{{ v.name }}</text>
            <text class="village-count-text">{{ v.scriptCount }}个剧本</text>
          </view>
        </scroll-view>
      </view>

      <view class="section">
        <view class="section-header flex-between">
          <view class="section-title-row">
            <text class="section-icon">🔥</text>
            <text class="section-title">热门剧本</text>
          </view>
          <text class="section-more" @tap="goScriptList()">更多 ›</text>
        </view>
        <script-card v-for="item in hotScripts" :key="item.scriptId" :data="item" @click="goDetail(item.scriptId)" />
      </view>

      <view class="section">
        <view class="section-header flex-between">
          <view class="section-title-row">
            <text class="section-icon">🎭</text>
            <text class="section-title">剧本类型</text>
          </view>
        </view>
        <view class="type-grid">
          <view class="type-item" v-for="t in types" :key="t.value" @tap="goByType(t.value)">
            <view class="type-icon-wrap">
              <text class="type-icon">{{ t.icon }}</text>
            </view>
            <text class="type-name">{{ t.label }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script>
import NavBar from '@/components/nav-bar.vue'
import ScriptCard from '@/components/script-card.vue'
import { scriptApi, villageApi } from '@/utils/api.js'

export default {
  components: { NavBar, ScriptCard },
  data() {
    return {
      refreshing: false,
      villages: [],
      types: [
        { value: 'mystery', label: '悬疑解谜', icon: '🔍' },
        { value: 'history', label: '历史文化', icon: '📜' },
        { value: 'family', label: '亲子互动', icon: '👨‍👩‍👧' },
        { value: 'couple', label: '情侣探险', icon: '💑' },
        { value: 'team', label: '团队协作', icon: '👥' }
      ],
      hotScripts: []
    }
  },
  onLoad() {
    this.loadHotScripts()
    this.loadVillages()
  },
  methods: {
    async loadVillages() {
      try {
        const data = await villageApi.getList()
        this.villages = data.list || []
      } catch (e) { /* fallback */ }
    },
    async loadHotScripts() {
      try {
        const data = await scriptApi.getRecommend(4)
        this.hotScripts = data.list || []
      } catch (e) { /* fallback */ }
    },
    async onRefresh() {
      this.refreshing = true
      await Promise.all([this.loadHotScripts(), this.loadVillages()])
      this.refreshing = false
    },
    goDetail(id) { uni.navigateTo({ url: `/pages/script-detail/index?id=${id}` }) },
    goByVillage(id) { uni.navigateTo({ url: `/pages/village-detail/index?id=${id}` }) },
    goByType(type) {
      getApp().globalData.scriptType = type
      getApp().globalData.villageId = null
      uni.switchTab({ url: '/pages/script-list/index' })
    },
    goVillageList() { uni.switchTab({ url: '/pages/village-list/index' }) },
    goScriptList() {
      getApp().globalData.scriptType = null
      getApp().globalData.villageId = null
      uni.switchTab({ url: '/pages/script-list/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  height: 100%;
  overflow: hidden;
  background: #F5F6F0;
  display: flex;
  flex-direction: column;
}
.page-scroll {
  flex: 1;
  height: 0;
}
.hero-section {
  margin: 24rpx 30rpx;
}
.hero-bg {
  background: linear-gradient(160deg, #4A6A4A 0%, #3D5A3D 25%, #2E4A2E 55%, #1E3A1E 100%);
  border-radius: 28rpx;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
  overflow: hidden;
}
.hero-decor {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.hero-decor-1 {
  width: 240rpx;
  height: 240rpx;
  top: -80rpx;
  right: -60rpx;
}
.hero-decor-2 {
  width: 120rpx;
  height: 120rpx;
  bottom: -30rpx;
  left: -30rpx;
}
.hero-title {
  font-size: 52rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 10rpx;
  letter-spacing: 6rpx;
  position: relative;
  z-index: 1;
}
.hero-subtitle {
  font-size: 26rpx;
  color: rgba(255,255,255,0.6);
  position: relative;
  z-index: 1;
  letter-spacing: 2rpx;
}
.hero-stats {
  display: flex;
  gap: 48rpx;
  margin-top: 36rpx;
  position: relative;
  z-index: 1;
}
.hero-stat {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}
.stat-num {
  font-size: 40rpx;
  font-weight: 800;
  color: #fff;
}
.stat-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.6);
}
.section {
  padding: 0 30rpx;
  margin-bottom: 36rpx;
}
.section-header {
  margin-bottom: 24rpx;
}
.section-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.section-icon {
  font-size: 30rpx;
}
.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2E3D2E;
}
.section-more {
  font-size: 26rpx;
  color: #8FA88F;
}
.village-scroll {
  white-space: nowrap;
  padding-bottom: 8rpx;
}
.village-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 32rpx;
  width: 160rpx;
}
.village-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.1);
}
.village-name {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #2E3D2E;
  font-weight: 600;
}
.village-count-text {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #A0A0A0;
}
.type-grid {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}
.type-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 16rpx 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:active { transform: scale(0.95); box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1); }
}
.type-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  background: #F0F5EE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}
.type-icon {
  font-size: 36rpx;
}
.type-name {
  font-size: 24rpx;
  color: #5C7A5C;
  font-weight: 600;
}
.bottom-safe {
  height: 40rpx;
}
</style>
