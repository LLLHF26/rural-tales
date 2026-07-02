<!-- c:\Users\黄泽民\Desktop\vue\front-client\pages\my\index.vue -->
<template>
  <view class="my-page">
    <view class="profile-header">
      <image class="profile-avatar" :src="profile.avatar || '/static/logo.png'" mode="aspectFill" @tap="changeAvatar" />
      <text class="profile-name" @tap="goLogin">{{ profile.nickname || '点击登录' }}</text>
      <text class="profile-phone" v-if="profile.phone">{{ profile.phone }}</text>
      <text class="profile-stats">已完成 {{ profile.completedScriptCount || 0 }} 个剧本</text>
    </view>

    <view class="card">
      <text class="card-title">🎭 我的剧本</text>
      <view class="tab-row">
        <text class="tab-item" :class="{ active: tabStatus === '' }" @tap="changeTab('')">全部</text>
        <text class="tab-item" :class="{ active: tabStatus === 'playing' }" @tap="changeTab('playing')">进行中</text>
        <text class="tab-item" :class="{ active: tabStatus === 'completed' }" @tap="changeTab('completed')">已完成</text>
      </view>
      <view class="script-list" v-if="myScripts.length > 0">
        <view class="script-item" v-for="item in myScripts" :key="item.progressId" @tap="goPlay(item)">
          <image class="script-cover" :src="item.coverImage" mode="aspectFill" />
          <view class="script-info">
            <text class="script-title ellipsis">{{ item.title }}</text>
            <text class="script-progress-text">{{ item.progressLabel || (item.status === 'playing' ? '进行中' : '已完成') }}</text>
          </view>
        </view>
      </view>
      <view class="empty" v-else>
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无剧本，去首页看看吧</text>
      </view>
    </view>

    <view class="card" v-if="showSetPassword">
      <text class="card-title">设置密码</text>
      <view class="pwd-form">
        <input class="pwd-input" v-model="pwdPhone" type="number" maxlength="11" placeholder="请输入手机号" />
        <view class="code-row">
          <input class="pwd-input code-input" v-model="pwdCode" type="number" maxlength="6" placeholder="请输入验证码" />
          <view class="pwd-code-btn" :class="{ disabled: pwdCountdown > 0 }" @tap="sendPwdCode">
            {{ pwdCountdown > 0 ? pwdCountdown + 's' : '发送验证码' }}
          </view>
        </view>
        <input class="pwd-input" v-model="pwdNew" type="password" placeholder="请输入新密码" />
        <view class="pwd-btns">
          <view class="pwd-btn cancel" @tap="showSetPassword = false">取消</view>
          <view class="pwd-btn confirm" @tap="doSetPassword">确认</view>
        </view>
      </view>
    </view>

    <view class="card">
      <text class="card-title">⚙️ 设置</text>
      <view class="setting-item" @tap="editNickname">
        <text>修改昵称</text>
        <text class="setting-arrow">›</text>
      </view>
      <view class="setting-item" @tap="setPassword">
        <text>设置密码</text>
        <text class="setting-arrow">›</text>
      </view>
      <view class="setting-item" @tap="logout">
        <text class="text-error">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { userApi } from '@/utils/api.js'

export default {
  data() {
    return {
      profile: {},
      tabStatus: '',
      myScripts: [],
      showSetPassword: false,
      pwdPhone: '',
      pwdCode: '',
      pwdNew: '',
      pwdCountdown: 0
    }
  },
  onShow() {
    this.loadProfile()
    this.loadMyScripts()
  },
  methods: {
    async loadProfile() {
      const token = uni.getStorageSync('token')
      if (!token) return
      try {
        this.profile = await userApi.getProfile()
      } catch (e) {}
    },
    async loadMyScripts() {
      const token = uni.getStorageSync('token')
      if (!token) return
      try {
        const data = await userApi.getMyScripts(this.tabStatus || undefined)
        this.myScripts = data.list || []
      } catch (e) {}
    },
    changeTab(status) {
      this.tabStatus = status
      this.loadMyScripts()
    },
    goPlay(item) {
      if (item.status === 'playing') {
        uni.navigateTo({ url: `/pages/play/index?progressId=${item.progressId}` })
      }
    },
    goLogin() {
      const token = uni.getStorageSync('token')
      if (token) return
      uni.navigateTo({ url: '/pages/login/index' })
    },
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          try {
            const result = await userApi.uploadFile(res.tempFilePaths[0])
            await userApi.updateProfile({ avatar: result.url })
            this.profile.avatar = result.url
            uni.showToast({ title: '头像更新成功', icon: 'success' })
          } catch (e) {}
        }
      })
    },
    editNickname() {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新昵称',
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              await userApi.updateProfile({ nickname: res.content })
              this.profile.nickname = res.content
              uni.showToast({ title: '昵称已更新', icon: 'success' })
            } catch (e) {}
          }
        }
      })
    },
    setPassword() {
      this.pwdPhone = ''
      this.pwdCode = ''
      this.pwdNew = ''
      this.showSetPassword = true
    },
    sendPwdCode() {
      if (this.pwdCountdown > 0) return
      if (!this.pwdPhone || this.pwdPhone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      userApi.sendCode(this.pwdPhone).catch(() => {})
      this.pwdCountdown = 60
      const timer = setInterval(() => {
        this.pwdCountdown--
        if (this.pwdCountdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    async doSetPassword() {
      if (!this.pwdPhone || !this.pwdCode || !this.pwdNew) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      try {
        await userApi.setPassword(this.pwdPhone, this.pwdCode, this.pwdNew)
        this.showSetPassword = false
        uni.showToast({ title: '密码设置成功', icon: 'success' })
      } catch (e) {}
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.reLaunch({ url: '/pages/login/index' })
          }
        }
      })
    }
  }
}
</script>

<style>
/* 覆盖 App.vue 全局的 overflow:hidden，允许本页滚动 */
page { overflow: auto; }
</style>
<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background: #F5F6F0;
  padding-bottom: 60rpx;
}
.profile-header {
  background: linear-gradient(135deg, #5C7A5C 0%, #3D5A3D 50%, #2E4A2E 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 30rpx 54rpx;
}
.profile-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255,255,255,0.5);
  margin-bottom: 22rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.15);
}
.profile-name {
  font-size: 38rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8rpx;
}
.profile-phone {
  font-size: 26rpx;
  color: rgba(255,255,255,0.7);
  margin-bottom: 14rpx;
}
.profile-stats {
  font-size: 24rpx;
  color: rgba(255,255,255,0.75);
  background: rgba(255,255,255,0.15);
  padding: 8rpx 28rpx;
  border-radius: 24rpx;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin: 20rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3D5A3D;
  margin-bottom: 22rpx;
  display: block;
}
.tab-row {
  display: flex;
  margin-bottom: 24rpx;
}
.tab-item {
  font-size: 26rpx;
  color: #666;
  padding: 10rpx 28rpx;
  border-radius: 24rpx;
  margin-right: 16rpx;
  background: #EEF2EB;
  transition: all 0.2s ease;
  &.active { background: #6B8E6B; color: #fff; }
}
.script-item {
  display: flex;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
  &:last-child { border-bottom: none; }
}
.script-cover {
  width: 120rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}
.script-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.script-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #2E3D2E;
  margin-bottom: 10rpx;
}
.script-progress-bar {
  height: 8rpx;
  background: #EEF2EB;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}
.script-progress-fill {
  height: 100%;
  background: linear-gradient(to right, #8FA88F, #6B8E6B);
  border-radius: 4rpx;
}
.script-progress-text {
  font-size: 22rpx;
  color: #A0A0A0;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}
.empty-icon { font-size: 56rpx; margin-bottom: 16rpx; opacity: 0.5; }
.empty-text { font-size: 26rpx; color: #B0B0B0; }
.setting-item {
  padding: 24rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #F0F0F0;
  transition: background 0.15s ease;
  &:last-child { border-bottom: none; }
  &:active { background: #F5F6F0; margin: 0 -28rpx; padding: 24rpx 28rpx; }
}
.setting-arrow { color: #B0B0B0; font-size: 32rpx; }
.text-error { color: #E57373; }
.pwd-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.pwd-input {
  height: 80rpx;
  background: #EEF2EB;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}
.pwd-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 8rpx;
}
.pwd-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.pwd-btn.cancel {
  background: #EEF2EB;
  color: #666;
}
.pwd-btn.confirm {
  background: linear-gradient(135deg, #6B8E6B, #5C7A5C);
  color: #fff;
}
.code-row {
  display: flex;
  gap: 20rpx;
}
.code-input {
  flex: 1;
}
.pwd-code-btn {
  padding: 0 24rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #6B8E6B;
  color: #fff;
  border-radius: 12rpx;
  font-size: 26rpx;
  white-space: nowrap;
}
.pwd-code-btn.disabled {
  background: #C0C0C0;
  color: #888;
}
</style>