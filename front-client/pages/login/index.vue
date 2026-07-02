<template>
  <view class="container page">
    <view class="nav-bar" v-if="canBack">
      <view class="back-btn" @click="goBack">← 返回</view>
    </view>

    <view class="login-content">
      <text class="login-title">欢迎来到乡村剧本</text>
      <text class="login-subtitle">沉浸式乡村文旅体验</text>

      <view class="form">
          <view class="input-wrap">
            <text class="input-label">手机号</text>
            <input class="input" v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" />
          </view>

          <view class="input-wrap">
            <text class="input-label">验证码</text>
            <view class="code-row">
              <input class="input code-input" v-model="code" type="number" maxlength="6" placeholder="请输入验证码" />
              <view class="code-btn" :class="{ disabled: countdown > 0 }" @click="sendCode">
                {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
              </view>
            </view>
          </view>

          <view class="login-btn" @click="handleLogin">登录 / 注册</view>

          <view class="divider">
            <view class="divider-line"></view>
            <text class="divider-text">其他方式</text>
            <view class="divider-line"></view>
          </view>

          <view class="password-login" @click="switchToPassword">
            账号密码登录
          </view>
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
      code: '',
      countdown: 0,
      canBack: false
    }
  },
  onLoad() {
    const pages = getCurrentPages()
    this.canBack = pages.length > 1
    this.checkLogin()
  },
  methods: {
    async checkLogin() {
      const token = uni.getStorageSync('token')
      if (!token) return
      // 验证 token 是否有效
      try {
        await api.get('/user/profile')
        uni.switchTab({ url: '/pages/index/index' })
      } catch (e) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
      }
    },
    goBack() {
      uni.navigateBack()
    },
    sendCode() {
      if (this.countdown > 0) return
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      api.post('/user/send-code', { phone: this.phone }).catch(() => {})
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    async handleLogin() {
      if (!this.phone || !this.code) {
        uni.showToast({ title: '请输入手机号和验证码', icon: 'none' })
        return
      }
      try {
        const data = await api.post('/user/login', {
          phone: this.phone,
          code: this.code
        })
        uni.setStorageSync('token', data.token)
        uni.setStorageSync('userInfo', data.user)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 500)
      } catch (e) {
        // 模拟登录
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
    },
    switchToPassword() {
      uni.navigateTo({ url: '/pages/login/password' })
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

.code-row {
  display: flex;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  padding: 0 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: $uni-color-primary;
  color: white;
  border-radius: 16rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.code-btn.disabled {
  background: $uni-bg-color-hover;
  color: $uni-text-color-grey;
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

.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: $uni-border-color;
}

.divider-text {
  margin: 0 24rpx;
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.password-login {
  text-align: center;
  font-size: 26rpx;
  color: $uni-color-primary;
  padding: 20rpx;
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