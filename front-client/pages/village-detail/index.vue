<template>
  <view class="detail-page">
    <view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="header-title">村庄详情</text>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll" v-if="village">
      <image class="cover" :src="village.coverImage" mode="aspectFill" />

      <view class="info-section">
        <view class="name-row">
          <text class="name">{{ village.name }}</text>
          <view class="script-badge" @tap="goScripts">
            <text class="badge-num">{{ village.scriptCount }}</text>
            <text class="badge-label">个剧本</text>
          </view>
        </view>

        <view class="tags-row" v-if="village.tags && village.tags.length">
          <text class="tag" v-for="t in village.tags" :key="t">{{ t }}</text>
        </view>

        <view class="desc" v-if="village.description">{{ village.description }}</view>
        <view class="address" v-if="village.address">
          <text class="addr-icon">📍</text>
          <text class="addr-text">{{ village.address }}</text>
        </view>
      </view>

      <view class="section" v-if="village.spots && village.spots.length">
        <view class="section-header">
          <text class="section-title">📍 打卡点</text>
        </view>
        <view class="spot-list">
          <view class="spot-item" v-for="sp in village.spots" :key="sp.spotId">
            <view class="spot-marker">📍</view>
            <view class="spot-info">
              <text class="spot-name">{{ sp.name }}</text>
              <text class="spot-desc" v-if="sp.description">{{ sp.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section" v-if="village.cultures && village.cultures.length">
        <view class="section-header">
          <text class="section-title">📚 文化故事</text>
        </view>
        <view class="culture-list">
          <view class="culture-item" v-for="c in village.cultures" :key="c.cultureId">
            <view class="culture-badge">{{ c.typeLabel }}</view>
            <text class="culture-title">{{ c.title }}</text>
            <text class="culture-content" v-if="c.content">{{ c.content }}</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="village.scripts && village.scripts.length">
        <view class="section-header flex-between">
          <text class="section-title">推荐剧本</text>
          <text class="section-more" @tap="goScripts">全部 ›</text>
        </view>
        <script-card v-for="item in village.scripts" :key="item.scriptId" :data="item" @click="goScriptDetail(item.scriptId)" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import ScriptCard from '@/components/script-card.vue'
import { villageApi } from '@/utils/api.js'

export default {
  components: { ScriptCard },
  data() {
    return {
      village: null,
      statusBarHeight: 20
    }
  },
  mounted() {
    const info = uni.getSystemInfoSync()
    this.statusBarHeight = info.statusBarHeight || 20
  },
  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ delta: 1 })
    },
    async loadDetail(id) {
      try {
        const data = await villageApi.getDetail(id)
        this.village = data
      } catch (e) { /* fallback */ }
    },
    goScripts() {
      getApp().globalData.villageId = this.village.villageId
      uni.switchTab({ url: '/pages/script-list/index' })
    },
    goScriptDetail(id) {
      uni.navigateTo({ url: `/pages/script-detail/index?id=${id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #F5F6F0;
}
.custom-header {
  background: linear-gradient(135deg, #5C7A5C 0%, #3D5A3D 100%);
  padding-bottom: 20rpx;
}
.header-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 30rpx;
}
.back-btn {
  position: absolute;
  left: 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
}
.header-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
}
.page-scroll {
  height: calc(100vh - 108rpx);
}
.cover {
  width: 100%;
  height: 400rpx;
}
.info-section {
  padding: 32rpx 30rpx;
  background: #fff;
  margin-bottom: 24rpx;
}
.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.name {
  font-size: 40rpx;
  font-weight: 700;
  color: #2E3D2E;
}
.script-badge {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  background: #E8F5E8;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  &:active { opacity: 0.7; }
}
.badge-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #5C7A5C;
}
.badge-label {
  font-size: 22rpx;
  color: #8FA88F;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.tag {
  font-size: 22rpx;
  color: #5C7A5C;
  background: #E8F5E8;
  padding: 6rpx 18rpx;
  border-radius: 8rpx;
}
.desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.7;
  margin-bottom: 20rpx;
}
.address {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.addr-icon {
  font-size: 26rpx;
}
.addr-text {
  font-size: 26rpx;
  color: #888;
}
.section {
  padding: 0 30rpx;
  margin-bottom: 36rpx;
}
.section-header {
  margin-bottom: 24rpx;
}
.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #3D5A3D;
}
.section-more {
  font-size: 26rpx;
  color: #8FA88F;
}
.spot-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.spot-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.spot-marker {
  font-size: 32rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}
.spot-info {
  flex: 1;
}
.spot-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E3D2E;
  display: block;
  margin-bottom: 8rpx;
}
.spot-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}
.culture-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.culture-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.culture-badge {
  display: inline-block;
  font-size: 22rpx;
  color: #6B8E6B;
  background: #E8F5E8;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}
.culture-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E3D2E;
  display: block;
  margin-bottom: 10rpx;
}
.culture-content {
  font-size: 26rpx;
  color: #888;
  line-height: 1.7;
}
</style>
