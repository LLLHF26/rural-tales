<!-- c:\Users\黄泽民\Desktop\vue\front-client\components\nav-bar.vue -->
<template>
  <view class="nav-bar" :style="navBarStyle">
    <view class="nav-bar-inner" :style="innerStyle">
      <view class="nav-left" @tap="handleBack" v-if="showBack">
        <text class="nav-back-icon">←</text>
      </view>
      <view class="nav-title">{{ title }}</view>
      <view class="nav-right" :style="rightStyle">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '' },
    showBack: { type: Boolean, default: false },
    bgColor: { type: String, default: '' }
  },
  data() {
    return {
      statusBarHeight: 20,
      menuButtonHeight: 32,
      menuButtonTop: 0
    }
  },
  computed: {
    navBarStyle() {
      const style = { paddingTop: this.statusBarHeight + 'px' }
      if (this.bgColor) {
        style.background = this.bgColor
      }
      return style
    },
    innerStyle() {
      if (this.menuButtonHeight > 0) {
        return { height: this.menuButtonHeight + 'px' }
      }
      return {}
    },
    rightStyle() {
      // 胶囊按钮右边距，保持右侧内容不被遮挡
      if (this.menuButtonTop > 0) {
        return { paddingRight: '10rpx' }
      }
      return {}
    }
  },
  mounted() {
    const info = uni.getSystemInfoSync()
    this.statusBarHeight = info.statusBarHeight || 20
    // #ifdef MP-WEIXIN
    try {
      const menuButton = uni.getMenuButtonBoundingClientRect()
      this.menuButtonHeight = menuButton.height
      this.menuButtonTop = menuButton.top
    } catch (e) {}
    // #endif
  },
  methods: {
    handleBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-bar {
  background: linear-gradient(135deg, #5C7A5C 0%, #3D5A3D 100%);
  padding-bottom: 16rpx;
}
.nav-bar-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 30rpx;
}
.nav-left {
  position: absolute;
  left: 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-back-icon {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
}
.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
}
.nav-right {
  position: absolute;
  right: 30rpx;
}
</style>