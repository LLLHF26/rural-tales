<!-- c:\Users\黄泽民\Desktop\vue\front-client\components\script-card.vue -->
<template>
  <view class="script-card" @tap="$emit('click')">
    <image class="card-cover" :src="data.coverImage" mode="aspectFill" />
    <view class="card-badge" v-if="data.typeLabel">{{ data.typeLabel }}</view>
    <view class="card-info">
      <view class="card-title ellipsis">{{ data.title }}</view>
      <view class="card-brief ellipsis-2" v-if="data.brief">{{ data.brief }}</view>
      <view class="card-meta">
        <view class="meta-item">
          <text class="meta-label">评分</text>
          <text class="star">⭐ {{ data.rating }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">时长</text>
          <text class="duration">⏱ {{ data.estimatedDuration }}分钟</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">难度</text>
          <text class="difficulty">
            <text v-for="i in 5" :key="i" :style="{ color: i <= data.difficulty ? '#4CAF50' : '#E0E0E0' }">●</text>
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: { type: Object, required: true }
  },
  emits: ['click']
}
</script>

<style lang="scss" scoped>
.script-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06);
  margin-bottom: 28rpx;
  position: relative;
  &:active { transform: scale(0.98); }
}
.card-cover {
  width: 100%;
  height: 300rpx;
}
.card-badge {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 8rpx;
  backdrop-filter: blur(8rpx);
}
.card-info {
  padding: 24rpx 28rpx 28rpx;
}
.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2E3D2E;
  margin-bottom: 12rpx;
}
.card-brief {
  font-size: 26rpx;
  color: #888;
  line-height: 1.6;
  margin-bottom: 18rpx;
}
.card-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}
.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}
.meta-label {
  font-size: 20rpx;
  color: #B0B0B0;
}
.star { font-size: 24rpx; color: #C8A84E; }
.duration { font-size: 24rpx; color: #888; }
</style>