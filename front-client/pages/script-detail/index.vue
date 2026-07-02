<!-- c:\Users\黄泽民\Desktop\vue\front-client\pages\script-detail\index.vue -->
<template>
  <view class="detail-page" v-if="detail">
    <scroll-view scroll-y class="detail-scroll">
      <image class="cover-img" :src="detail.coverImage" mode="aspectFill" />
      <view class="cover-overlay">
        <text class="detail-title">{{ detail.title }}</text>
        <view class="detail-meta flex">
          <text class="meta-item">⭐ {{ detail.rating }} ({{ detail.ratingCount }}人)</text>
          <text class="meta-item">👥 {{ detail.experienceCount }}人体验</text>
        </view>
      </view>

      <view class="detail-body">
        <view class="info-row flex-between">
          <view class="info-item">
            <text class="info-label">村庄</text>
            <text class="info-value">{{ detail.villageName || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">类型</text>
            <text class="info-value">{{ detail.typeLabel }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">时长</text>
            <text class="info-value">⏱ {{ detail.estimatedDuration }}分钟</text>
          </view>
          <view class="info-item">
            <text class="info-label">难度</text>
            <text class="info-value">
              <text v-for="i in 5" :key="i" :style="{ color: i <= detail.difficulty ? '#4CAF50' : '#E0E0E0' }">●</text>
            </text>
          </view>
        </view>

        <view class="card">
          <text class="card-title">📖 故事简介</text>
          <text class="story-text">{{ detail.storyline }}</text>
        </view>

        <view class="card">
          <text class="card-title">🎭 登场角色</text>
          <view class="npc-list">
            <view class="npc-item" v-for="npc in detail.npcs" :key="npc.npcId">
              <image class="npc-avatar" :src="npc.avatar" mode="aspectFill" />
              <view class="npc-info">
                <text class="npc-name">{{ npc.name }}</text>
                <text class="npc-role">{{ npc.role }}</text>
                <text class="npc-desc">{{ npc.description }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="card" v-if="detail.endings && detail.endings.length">
          <text class="card-title">🏆 结局（{{ detail.endings.filter(e => e.unlocked).length }}/{{ detail.endings.length }}）</text>
          <view class="ending-list">
            <view class="ending-item" v-for="e in detail.endings" :key="e.endingId" :class="{ unlocked: e.unlocked }">
              <view class="ending-icon">{{ e.unlocked ? '🏆' : '🔒' }}</view>
              <view class="ending-info">
                <text class="ending-title">{{ e.title }}</text>
                <text class="ending-desc" v-if="e.description">{{ e.description }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="card">
          <text class="card-title">📊 数据</text>
          <view class="flex-between">
            <text>共 {{ detail.chapterCount }} 章</text>
            <text>{{ detail.endingCount }} 种结局</text>
            <text>完成率 {{ (detail.completionRate * 100).toFixed(0) }}%</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="btn-start" @tap="startPlay" v-if="!detail.activeProgressId">
        <text class="btn-text">开始体验</text>
        <text class="btn-arrow">→</text>
      </view>
      <view class="btn-start btn-continue" @tap="continuePlay" v-else>
        <text class="btn-text">继续体验</text>
        <text class="btn-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script>
import { scriptApi } from '@/utils/api.js'

export default {
  data() {
    return { detail: null }
  },
  onLoad(options) {
    this.loadDetail(options.id)
  },
  methods: {
    async loadDetail(id) {
      try {
        this.detail = await scriptApi.getDetail(id)
      } catch (e) {}
    },
    async startPlay() {
      try {
        const data = await scriptApi.claim(this.detail.scriptId)
        uni.navigateTo({ url: `/pages/play/index?progressId=${data.progressId}` })
      } catch (e) {}
    },
    continuePlay() {
      uni.navigateTo({ url: `/pages/play/index?progressId=${this.detail.activeProgressId}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  height: 100%;
  background: #F1F8E9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.detail-scroll { flex: 1; height: 0; }
.cover-img {
  width: 100%;
  height: 500rpx;
}
.cover-overlay {
  background: linear-gradient(to top, #F1F8E9, transparent);
  padding: 40rpx 30rpx 20rpx;
  margin-top: -40rpx;
  position: relative;
}
.detail-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #2E7D32;
  display: block;
  margin-bottom: 12rpx;
}
.detail-meta {
  font-size: 24rpx;
  color: #66BB6A;
  .meta-item { margin-right: 30rpx; }
}
.detail-body {
  padding: 0 30rpx 30rpx;
}
.info-row {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(76,175,80,0.08);
}
.info-item {
  text-align: center;
  flex: 1;
}
.info-label {
  font-size: 22rpx;
  color: #A5D6A7;
  display: block;
  margin-bottom: 8rpx;
}
.info-value {
  font-size: 24rpx;
  color: #2E7D32;
  font-weight: 500;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(76,175,80,0.08);
}
.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E7D32;
  margin-bottom: 16rpx;
  display: block;
}
.story-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.8;
}
.npc-list {
  .npc-item {
    display: flex;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #E8F5E9;
    &:last-child { border-bottom: none; }
  }
}
.npc-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 3rpx solid #A5D6A7;
  margin-right: 20rpx;
}
.npc-info {
  flex: 1;
}
.npc-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E7D32;
  display: block;
}
.npc-role {
  font-size: 22rpx;
  color: #fff;
  background: #4CAF50;
  padding: 2rpx 14rpx;
  border-radius: 12rpx;
  display: inline-block;
  margin: 6rpx 0;
}
.npc-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
}
.ending-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.ending-item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  padding: 18rpx;
  border-radius: 14rpx;
  background: #F5F6F0;
  &.unlocked {
    background: #E8F5E9;
  }
}
.ending-icon {
  font-size: 32rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}
.ending-info {
  flex: 1;
}
.ending-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E7D32;
  display: block;
  margin-bottom: 4rpx;
}
.ending-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}
.ending-badge {
  margin-top: 8rpx;
}
.badge-text {
  font-size: 22rpx;
  color: #C8A84E;
  background: #FFF8E1;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
}
.bottom-bar {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.06);
  display: flex;
}
.btn-start {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #5C7A5C 0%, #3D5A3D 100%);
  border-radius: 48rpx;
  padding: 26rpx 0;
  box-shadow: 0 8rpx 24rpx rgba(61,90,61,0.35);
  &:active { opacity: 0.9; transform: scale(0.98); }
}
.btn-continue {
  background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
  box-shadow: 0 8rpx 24rpx rgba(76,175,80,0.35);
}
.btn-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4rpx;
}
.btn-arrow {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}
</style>