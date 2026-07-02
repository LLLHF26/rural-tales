<!-- AR 扫描 —— ArUco标记检测 + 3D模型叠加 + 道具收集 -->
<template>
  <view class="ar-ui-overlay">
    <!-- 平台不支持提示 -->
    <view class="ar-error-mask" v-if="platformError">
      <text class="ar-error-text">{{ platformError }}</text>
      <view class="ar-close-btn" @tap="closePage">返回</view>
    </view>

    <!-- 标记检测状态 -->
    <view class="ar-status-bar" v-if="arReady && !markerFound && !arError && !platformError">
      <text class="ar-status-hint">请对准 ArUco 标记</text>
      <view class="ar-status-dot"></view>
    </view>

    <!-- 错误提示 -->
    <view class="ar-error-mask" v-if="arError && !platformError">
      <text class="ar-error-text">{{ arError }}</text>
      <view class="ar-retry-btn" @tap="retryAR">重试</view>
      <view class="ar-close-btn" @tap="closePage">返回</view>
    </view>

    <!-- 顶栏 -->
    <view class="ar-topbar" v-if="!arError && !platformError">
      <view class="ar-back" @tap="closePage"><text class="ar-back-icon">&#x2713;</text></view>
      <text class="ar-title">{{ arData?.title || 'AR 扫描' }}</text>
      <view class="ar-topbar-right" />
    </view>

    <!-- 底栏 -->
    <view class="ar-bottombar" v-if="!arError && !platformError">
      <text class="ar-hint-text" v-if="statusText">{{ statusText }}</text>
      <view class="ar-collect-btn" v-if="markerFound" @tap="collectItem">
        收集道具
      </view>
    </view>

    <!-- 加载遮罩 -->
    <view class="ar-loading-mask" v-if="loading">
      <text class="ar-loading-text">{{ collecting ? '提交中…' : '加载中…' }}</text>
    </view>
  </view>
</template>

<script>
import { arApi, playApi } from '@/utils/api.js'
import { BASE_URL_RAW } from '@/utils/config.js'

let sceneRoot = null
let cameraStream = null
let videoEl = null
let _destroyed = false
let _savedViewportContent = null
let _savedBodyOverflow = null
let _savedHtmlOverflow = null
let _savedBodyCssText = null
let _savedHtmlCssText = null
let _savedBodyClassName = null

export default {
  data() {
    return {
      progressId: '',
      taskId: '',
      nodeId: '',
      arData: null,
      arMode: '',
      arReady: false,
      markerFound: false,
      loading: false,
      collecting: false,
      arError: '',
      statusText: '启动中…',
      platformError: '',
      _timer: null
    }
  },
  onLoad(options) {
    if (typeof document === 'undefined') {
      this.platformError = 'AR功能仅支持浏览器H5环境，请在手机浏览器中打开'
      return
    }
    this._active = true
    this.progressId = options.progressId || ''
    this.taskId = options.taskId || ''
    this.nodeId = options.nodeId || ''
    this.loadARResource()
  },
  onUnload() {
    this._active = false
    this.destroyAR()
    if (this._timer) { clearTimeout(this._timer); this._timer = null }
  },
  methods: {
    async loadARResource() {
      try {
        const res = await arApi.getResource(Number(this.taskId))
        this.arData = res
        this.arMode = (res?.arType === 'npc_model' && res?.arucoId != null) ? 'model' : 'camera'
      } catch (e) {
        this.arMode = 'camera'
      }
      this.$nextTick(() => this.startAR())
    },

    startAR() {
      if (this.arMode === 'model') {
        this.startModelAR()
      } else {
        this.startCameraMode()
      }
    },

    async startModelAR() {
      try {
        _destroyed = false
        this.statusText = '加载 AR 引擎…'

        const vp = document.querySelector('meta[name="viewport"]')
        _savedViewportContent = vp ? vp.getAttribute('content') : null
        _savedBodyOverflow = document.body.style.overflow
        _savedHtmlOverflow = document.documentElement.style.overflow
        _savedBodyCssText = document.body.style.cssText
        _savedHtmlCssText = document.documentElement.style.cssText
        _savedBodyClassName = document.body.className

        await this.loadScript('https://aframe.io/releases/1.2.0/aframe.min.js')
        await this.loadScript('https://cdn.jsdelivr.net/npm/ar.js@2.2.2/aframe/build/aframe-ar.js')

        if (!this._active) return

        this.statusText = '初始化场景…'

        const arucoId = this.arData.arucoId != null ? this.arData.arucoId : 1
        let pattUrl = BASE_URL_RAW + '/static/markers/marker_' + arucoId + '.patt'
        if (this.arData.pattContent) {
          try {
            pattUrl = 'data:text/plain;base64,' + btoa(this.arData.pattContent)
          } catch (e) {}
        }

        let markerContent = ''
        if (this.arData.modelUrl) {
          markerContent = '<a-entity gltf-model="url(' + this.arData.modelUrl + ')" scale="0.5 0.5 0.5" position="0 0 0"></a-entity>'
        } else {
          markerContent = '<a-box position="0 0.5 0" material="color: #FF9800; roughness: 0.3"></a-box>'
        }

        sceneRoot = document.createElement('div')
        sceneRoot.id = '__ar_scene_root__'
        sceneRoot.innerHTML = [
          '<a-scene',
          '  renderer="alpha: true; antialias: true"',
          '  arjs="sourceType: webcam; patternRatio: 0.5; debugUIEnabled: false;"',
          '>',
          '  <a-marker type="pattern" url="' + pattUrl + '">',
          '    ' + markerContent,
          '  </a-marker>',
          '  <a-entity camera></a-entity>',
          '</a-scene>'
        ].join('\n')
        document.body.appendChild(sceneRoot)

        await this.wait(600)

        const scene = sceneRoot.querySelector('a-scene')
        const bind = () => {
          if (!this._active) return
          const marker = sceneRoot.querySelector('a-marker')
          if (marker) {
            marker.addEventListener('markerFound', () => {
              this.markerFound = true
              this.statusText = ''
            })
            marker.addEventListener('markerLost', () => {
              this.markerFound = false
              this.statusText = '未检测到标记'
            })
          }
          this.arReady = true
          this.statusText = '未检测到标记'
        }

        if (scene && scene.hasLoaded) {
          bind()
        } else if (scene) {
          scene.addEventListener('loaded', bind)
        }

        this._timer = setTimeout(() => {
          if (this._active && !this.arReady) {
            this.arError = 'AR 初始化超时，请检查相机权限'
            this.destroyAR()
          }
        }, 15000)
      } catch (e) {
        console.error('AR启动失败:', e)
        this.destroyAR()
        this.arMode = 'camera'
        this.startCameraMode()
      }
    },

    async startCameraMode() {
      try {
        _destroyed = false
        this.statusText = '启动相机…'

        sceneRoot = document.createElement('div')
        sceneRoot.id = '__ar_scene_root__'
        document.body.appendChild(sceneRoot)

        videoEl = document.createElement('video')
        videoEl.setAttribute('autoplay', '')
        videoEl.setAttribute('muted', '')
        videoEl.setAttribute('playsinline', '')
        videoEl.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:1;'
        sceneRoot.appendChild(videoEl)

        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        })
        videoEl.srcObject = cameraStream
        await videoEl.play()

        this.markerFound = true
        this.arReady = true
        this.statusText = ''
      } catch (e) {
        console.error('相机启动失败:', e)
        if (e.name === 'NotAllowedError') {
          this.arError = '相机权限被拒绝，请在浏览器设置中允许'
        } else if (e.name === 'NotFoundError') {
          this.arError = '未检测到相机设备'
        } else {
          this.arError = '相机启动失败'
        }
        this.destroyAR()
      }
    },

    destroyAR() {
      if (typeof document === 'undefined') return
      if (_destroyed) return
      _destroyed = true
      if (cameraStream) {
        try { cameraStream.getTracks().forEach(t => t.stop()) } catch (e) {}
        cameraStream = null
      }
      videoEl = null
      if (sceneRoot) {
        try { sceneRoot.remove() } catch (e) {}
        sceneRoot = null
      }
      const old = document.getElementById('__ar_scene_root__')
      if (old) { try { old.remove() } catch (e) {} }

      // 恢复 body className（A-Frame 添加了 a-fullscreen 等类）
      if (_savedBodyClassName !== null) {
        document.body.className = _savedBodyClassName
        _savedBodyClassName = null
      }

      // 恢复 body/html 内联样式
      if (_savedBodyCssText !== null) {
        document.body.style.cssText = _savedBodyCssText
        _savedBodyCssText = null
      } else {
        document.body.style.overflow = _savedBodyOverflow || ''
      }
      if (_savedHtmlCssText !== null) {
        document.documentElement.style.cssText = _savedHtmlCssText
        _savedHtmlCssText = null
      } else {
        document.documentElement.style.overflow = _savedHtmlOverflow || ''
      }
      _savedBodyOverflow = null
      _savedHtmlOverflow = null

      // 激进恢复 viewport：移除旧标签并重新创建，强制浏览器重新解析
      if (_savedViewportContent !== null) {
        const oldVp = document.querySelector('meta[name="viewport"]')
        if (oldVp) {
          try { oldVp.remove() } catch (e) {}
        }
        const newVp = document.createElement('meta')
        newVp.name = 'viewport'
        newVp.content = _savedViewportContent
        document.head.appendChild(newVp)
        _savedViewportContent = null
      }

      // 移除 A-Frame 注入的 style 标签
      document.querySelectorAll('style').forEach(s => {
        const txt = s.textContent || ''
        if (txt.includes('a-scene') || txt.includes('a-canvas') || txt.includes('a-entity') || txt.includes('a-fullscreen') || txt.includes('.a-body') || txt.includes('a-assets')) {
          try { s.remove() } catch (e) {}
        }
      })

      document.querySelectorAll('a-scene canvas, .a-canvas').forEach(c => {
        try { c.remove() } catch (e) {}
      })

      // 强制重新计算根字体大小（uni-app 响应式布局核心）
      // 先触发重排，确保 clientWidth 正确反映恢复后的 viewport
      void document.body.offsetHeight
      const clientWidth = document.documentElement.clientWidth
      if (clientWidth > 0) {
        document.documentElement.style.fontSize = clientWidth / 375 * 20 + 'px'
      }

      // 派发 resize 事件，触发 uni-app 和其他监听器重新计算布局
      try {
        window.dispatchEvent(new Event('resize'))
      } catch (e) {}

      this.arReady = false
      this.markerFound = false
    },

    loadScript(src) {
      return new Promise((resolve, reject) => {
        const exist = document.querySelector('script[src="' + src + '"]')
        if (exist) {
          if (exist.dataset.loaded === '1') return resolve()
          exist.addEventListener('load', () => resolve())
          exist.addEventListener('error', () => reject(new Error('加载失败: ' + src)))
          return
        }
        const s = document.createElement('script')
        s.src = src
        s.onload = () => { s.dataset.loaded = '1'; resolve() }
        s.onerror = () => reject(new Error('加载失败: ' + src))
        document.head.appendChild(s)
      })
    },

    wait(ms) {
      return new Promise(r => setTimeout(r, ms))
    },

    retryAR() {
      this.arError = ''
      this.arReady = false
      this.markerFound = false
      this.destroyAR()
      this.startAR()
    },

    async collectItem() {
      if (this.loading) return
      this.loading = true
      this.collecting = true
      try {
        const result = await playApi.arCollect(
          this.progressId,
          Number(this.taskId),
          this.arData?.overlayContent?.itemId || String(this.taskId),
          Number(this.nodeId)
        )
        if (result.success) {
          uni.showToast({ title: '获得：' + (result.item?.name || '道具'), icon: 'success' })
          this.notifyPrevPage(result)
          setTimeout(() => uni.navigateBack(), 1200)
        }
      } catch (e) {
        uni.showToast({ title: '收集失败', icon: 'none' })
      } finally {
        this.loading = false
        this.collecting = false
      }
    },

    notifyPrevPage(result) {
      const pages = getCurrentPages()
      const prev = pages[pages.length - 2]
      if (prev) {
        if (prev.markTaskDoneFromAR) {
          prev.markTaskDoneFromAR(this.taskId, result.item, result.nextNodeId)
        }
        if (prev.notifyTaskComplete) {
          prev.notifyTaskComplete(this.arData?.title || 'AR扫描')
        }
        if (prev.loadNodeAndUpdate) {
          prev.loadNodeAndUpdate()
        }
      }
    },

    closePage() {
      this._active = false
      this.destroyAR()
      uni.navigateBack()
    }
  }
}
</script>

<style>
#__ar_scene_root__ {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 998;
  background: #000;
}
#__ar_scene_root__ a-scene {
  position: absolute;
  top: 0; left: 0;
  width: 100% !important;
  height: 100% !important;
}
</style>

<style lang="scss" scoped>
.ar-ui-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
  pointer-events: none;
}
.ar-topbar, .ar-bottombar, .ar-status-bar, .ar-error-mask, .ar-loading-mask,
.ar-collect-btn, .ar-back, .ar-retry-btn, .ar-close-btn {
  pointer-events: auto;
}

.ar-error-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
  gap: 32rpx;
}
.ar-error-text {
  color: rgba(255,255,255,0.85);
  font-size: 28rpx;
  text-align: center;
  padding: 0 40rpx;
}
.ar-retry-btn {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: #fff;
  padding: 18rpx 60rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
}
.ar-close-btn {
  color: rgba(255,255,255,0.5);
  font-size: 26rpx;
  padding: 12rpx 32rpx;
  border: 1rpx solid rgba(255,255,255,0.3);
  border-radius: 32rpx;
}

.ar-status-bar {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.ar-status-hint {
  color: rgba(255,255,255,0.85);
  font-size: 28rpx;
}
.ar-status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #FF9800;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

.ar-topbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 0 24rpx;
  padding-top: env(safe-area-inset-top);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
  z-index: 20;
}
.ar-back {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ar-back-icon { font-size: 28rpx; color: #fff; }
.ar-title { font-size: 30rpx; color: #fff; font-weight: 500; }
.ar-topbar-right { width: 56rpx; }

.ar-bottombar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  z-index: 20;
}
.ar-hint-text { font-size: 24rpx; color: rgba(255,255,255,0.7); margin-bottom: 12rpx; }
.ar-collect-btn {
  width: 100%;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: #fff;
  border: none;
  border-radius: 32rpx;
  padding: 22rpx 0;
  font-size: 30rpx;
  font-weight: 600;
  animation: glow 2s ease-in-out infinite;
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 16rpx rgba(255,152,0,0.4); }
  50% { box-shadow: 0 0 32rpx rgba(255,152,0,0.8); }
}

.ar-loading-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}
.ar-loading-text { font-size: 28rpx; color: #fff; }
</style>
