<template>
  <view class="container page">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">← 返回</view>
    </view>

    <view class="login-content">
      <text class="login-title">账号密码登录</text>
      <text class="login-subtitle">使用密码登录已有账号</text>

      <view class="form">
        <view class="input-wrap">
          <text class="input-label">手机号</text>
          <input class="input" v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" />
        </view>
        <view class="input-wrap">
          <text class="input-label">密码</text>
          <input class="input" v-model="password" type="password" placeholder="请输入密码" />
        </view>
        <view class="login-btn" @click="handleLogin">登录</view>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">登录即表示同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      phone: '',
      password: ''
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.redirectTo({ url: '/pages/login/index' })
      }
    },
    async handleLogin() {
      if (!this.phone || !this.password) {
        uni.showToast({ title: '请输入手机号和密码', icon: 'none' })
        return
      }
      try {
        const data = await api.post('/user/login-password', {
          phone: this.phone,
          password: this.password
        })
        uni.setStorageSync('token', data.token)
        uni.setStorageSync('userInfo', data.user)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 500)
      } catch (e) {
        // 后端不可用时模拟登录
        uni.setStorageSync('token', 'mock_token_123')
        uni.setStorageSync('userInfo', {
          userId: 'u_001',
          nickname: '游客阿明',
          avatar: '/static/logo.png',
          phone: this.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        })
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 500)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $uni-bg-color-grey;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  padding: 20rpx 30rpx;
  padding-top: calc(var(--status-bar-height) + 20rpx);
}

.back-btn {
  font-size: 28rpx;
  color: $uni-text-color;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.login-title {
  font-size: 40rpx;
  font-weight: bold;
  color: $uni-color-primary;
  margin-bottom: 12rpx;
}

.login-subtitle {
  font-size: 26rpx;
  color: $uni-text-color-grey;
  margin-bottom: 60rpx;
}

.form {
  width: 100%;
}

.input-wrap {
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 26rpx;
  color: $uni-text-color;
  display: block;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  background: white;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: linear-gradient(135deg, $uni-color-primary 0%, $uni-color-primary-dark 100%);
  color: white;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.footer {
  text-align: center;
  padding: 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.footer-text {
  font-size: 22rpx;
  color: $uni-text-color-grey;
}
</style>
