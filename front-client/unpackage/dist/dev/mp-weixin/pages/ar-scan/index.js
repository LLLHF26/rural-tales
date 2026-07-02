"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const utils_config = require("../../utils/config.js");
let sceneRoot = null;
let cameraStream = null;
let videoEl = null;
let _destroyed = false;
let _savedViewportContent = null;
let _savedBodyOverflow = null;
let _savedHtmlOverflow = null;
let _savedBodyCssText = null;
let _savedHtmlCssText = null;
let _savedBodyClassName = null;
const _sfc_main = {
  data() {
    return {
      progressId: "",
      taskId: "",
      nodeId: "",
      arData: null,
      arMode: "",
      arReady: false,
      markerFound: false,
      loading: false,
      collecting: false,
      arError: "",
      statusText: "启动中…",
      platformError: "",
      _timer: null
    };
  },
  onLoad(options) {
    if (typeof document === "undefined") {
      this.platformError = "AR功能仅支持浏览器H5环境，请在手机浏览器中打开";
      return;
    }
    this._active = true;
    this.progressId = options.progressId || "";
    this.taskId = options.taskId || "";
    this.nodeId = options.nodeId || "";
    this.loadARResource();
  },
  onUnload() {
    this._active = false;
    this.destroyAR();
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  },
  methods: {
    async loadARResource() {
      try {
        const res = await utils_api.arApi.getResource(Number(this.taskId));
        this.arData = res;
        this.arMode = (res == null ? void 0 : res.arType) === "npc_model" && (res == null ? void 0 : res.arucoId) != null ? "model" : "camera";
      } catch (e) {
        this.arMode = "camera";
      }
      this.$nextTick(() => this.startAR());
    },
    startAR() {
      if (this.arMode === "model") {
        this.startModelAR();
      } else {
        this.startCameraMode();
      }
    },
    async startModelAR() {
      try {
        _destroyed = false;
        this.statusText = "加载 AR 引擎…";
        const vp = document.querySelector('meta[name="viewport"]');
        _savedViewportContent = vp ? vp.getAttribute("content") : null;
        _savedBodyOverflow = document.body.style.overflow;
        _savedHtmlOverflow = document.documentElement.style.overflow;
        _savedBodyCssText = document.body.style.cssText;
        _savedHtmlCssText = document.documentElement.style.cssText;
        _savedBodyClassName = document.body.className;
        await this.loadScript("https://aframe.io/releases/1.2.0/aframe.min.js");
        await this.loadScript("https://cdn.jsdelivr.net/npm/ar.js@2.2.2/aframe/build/aframe-ar.js");
        if (!this._active)
          return;
        this.statusText = "初始化场景…";
        const arucoId = this.arData.arucoId != null ? this.arData.arucoId : 1;
        let pattUrl = utils_config.BASE_URL_RAW + "/static/markers/marker_" + arucoId + ".patt";
        if (this.arData.pattContent) {
          try {
            pattUrl = "data:text/plain;base64," + btoa(this.arData.pattContent);
          } catch (e) {
          }
        }
        let markerContent = "";
        if (this.arData.modelUrl) {
          markerContent = '<a-entity gltf-model="url(' + this.arData.modelUrl + ')" scale="0.5 0.5 0.5" position="0 0 0"></a-entity>';
        } else {
          markerContent = '<a-box position="0 0.5 0" material="color: #FF9800; roughness: 0.3"></a-box>';
        }
        sceneRoot = document.createElement("div");
        sceneRoot.id = "__ar_scene_root__";
        sceneRoot.innerHTML = [
          "<a-scene",
          '  renderer="alpha: true; antialias: true"',
          '  arjs="sourceType: webcam; patternRatio: 0.5; debugUIEnabled: false;"',
          ">",
          '  <a-marker type="pattern" url="' + pattUrl + '">',
          "    " + markerContent,
          "  </a-marker>",
          "  <a-entity camera></a-entity>",
          "</a-scene>"
        ].join("\n");
        document.body.appendChild(sceneRoot);
        await this.wait(600);
        const scene = sceneRoot.querySelector("a-scene");
        const bind = () => {
          if (!this._active)
            return;
          const marker = sceneRoot.querySelector("a-marker");
          if (marker) {
            marker.addEventListener("markerFound", () => {
              this.markerFound = true;
              this.statusText = "";
            });
            marker.addEventListener("markerLost", () => {
              this.markerFound = false;
              this.statusText = "未检测到标记";
            });
          }
          this.arReady = true;
          this.statusText = "未检测到标记";
        };
        if (scene && scene.hasLoaded) {
          bind();
        } else if (scene) {
          scene.addEventListener("loaded", bind);
        }
        this._timer = setTimeout(() => {
          if (this._active && !this.arReady) {
            this.arError = "AR 初始化超时，请检查相机权限";
            this.destroyAR();
          }
        }, 15e3);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/ar-scan/index.vue:197", "AR启动失败:", e);
        this.destroyAR();
        this.arMode = "camera";
        this.startCameraMode();
      }
    },
    async startCameraMode() {
      try {
        _destroyed = false;
        this.statusText = "启动相机…";
        sceneRoot = document.createElement("div");
        sceneRoot.id = "__ar_scene_root__";
        document.body.appendChild(sceneRoot);
        videoEl = document.createElement("video");
        videoEl.setAttribute("autoplay", "");
        videoEl.setAttribute("muted", "");
        videoEl.setAttribute("playsinline", "");
        videoEl.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:1;";
        sceneRoot.appendChild(videoEl);
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
        videoEl.srcObject = cameraStream;
        await videoEl.play();
        this.markerFound = true;
        this.arReady = true;
        this.statusText = "";
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/ar-scan/index.vue:231", "相机启动失败:", e);
        if (e.name === "NotAllowedError") {
          this.arError = "相机权限被拒绝，请在浏览器设置中允许";
        } else if (e.name === "NotFoundError") {
          this.arError = "未检测到相机设备";
        } else {
          this.arError = "相机启动失败";
        }
        this.destroyAR();
      }
    },
    destroyAR() {
      if (typeof document === "undefined")
        return;
      if (_destroyed)
        return;
      _destroyed = true;
      if (cameraStream) {
        try {
          cameraStream.getTracks().forEach((t) => t.stop());
        } catch (e) {
        }
        cameraStream = null;
      }
      videoEl = null;
      if (sceneRoot) {
        try {
          sceneRoot.remove();
        } catch (e) {
        }
        sceneRoot = null;
      }
      const old = document.getElementById("__ar_scene_root__");
      if (old) {
        try {
          old.remove();
        } catch (e) {
        }
      }
      if (_savedBodyClassName !== null) {
        document.body.className = _savedBodyClassName;
        _savedBodyClassName = null;
      }
      if (_savedBodyCssText !== null) {
        document.body.style.cssText = _savedBodyCssText;
        _savedBodyCssText = null;
      } else {
        document.body.style.overflow = _savedBodyOverflow || "";
      }
      if (_savedHtmlCssText !== null) {
        document.documentElement.style.cssText = _savedHtmlCssText;
        _savedHtmlCssText = null;
      } else {
        document.documentElement.style.overflow = _savedHtmlOverflow || "";
      }
      _savedBodyOverflow = null;
      _savedHtmlOverflow = null;
      if (_savedViewportContent !== null) {
        const oldVp = document.querySelector('meta[name="viewport"]');
        if (oldVp) {
          try {
            oldVp.remove();
          } catch (e) {
          }
        }
        const newVp = document.createElement("meta");
        newVp.name = "viewport";
        newVp.content = _savedViewportContent;
        document.head.appendChild(newVp);
        _savedViewportContent = null;
      }
      document.querySelectorAll("style").forEach((s) => {
        const txt = s.textContent || "";
        if (txt.includes("a-scene") || txt.includes("a-canvas") || txt.includes("a-entity") || txt.includes("a-fullscreen") || txt.includes(".a-body") || txt.includes("a-assets")) {
          try {
            s.remove();
          } catch (e) {
          }
        }
      });
      document.querySelectorAll("a-scene canvas, .a-canvas").forEach((c) => {
        try {
          c.remove();
        } catch (e) {
        }
      });
      void document.body.offsetHeight;
      const clientWidth = document.documentElement.clientWidth;
      if (clientWidth > 0) {
        document.documentElement.style.fontSize = clientWidth / 375 * 20 + "px";
      }
      try {
        window.dispatchEvent(new Event("resize"));
      } catch (e) {
      }
      this.arReady = false;
      this.markerFound = false;
    },
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const exist = document.querySelector('script[src="' + src + '"]');
        if (exist) {
          if (exist.dataset.loaded === "1")
            return resolve();
          exist.addEventListener("load", () => resolve());
          exist.addEventListener("error", () => reject(new Error("加载失败: " + src)));
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => {
          s.dataset.loaded = "1";
          resolve();
        };
        s.onerror = () => reject(new Error("加载失败: " + src));
        document.head.appendChild(s);
      });
    },
    wait(ms) {
      return new Promise((r) => setTimeout(r, ms));
    },
    retryAR() {
      this.arError = "";
      this.arReady = false;
      this.markerFound = false;
      this.destroyAR();
      this.startAR();
    },
    async collectItem() {
      var _a, _b, _c;
      if (this.loading)
        return;
      this.loading = true;
      this.collecting = true;
      try {
        const result = await utils_api.playApi.arCollect(
          this.progressId,
          Number(this.taskId),
          ((_b = (_a = this.arData) == null ? void 0 : _a.overlayContent) == null ? void 0 : _b.itemId) || String(this.taskId),
          Number(this.nodeId)
        );
        if (result.success) {
          common_vendor.index.showToast({ title: "获得：" + (((_c = result.item) == null ? void 0 : _c.name) || "道具"), icon: "success" });
          this.notifyPrevPage(result);
          setTimeout(() => common_vendor.index.navigateBack(), 1200);
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "收集失败", icon: "none" });
      } finally {
        this.loading = false;
        this.collecting = false;
      }
    },
    notifyPrevPage(result) {
      var _a;
      const pages = getCurrentPages();
      const prev = pages[pages.length - 2];
      if (prev) {
        if (prev.markTaskDoneFromAR) {
          prev.markTaskDoneFromAR(this.taskId, result.item, result.nextNodeId);
        }
        if (prev.notifyTaskComplete) {
          prev.notifyTaskComplete(((_a = this.arData) == null ? void 0 : _a.title) || "AR扫描");
        }
        if (prev.loadNodeAndUpdate) {
          prev.loadNodeAndUpdate();
        }
      }
    },
    closePage() {
      this._active = false;
      this.destroyAR();
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: $data.platformError
  }, $data.platformError ? {
    b: common_vendor.t($data.platformError),
    c: common_vendor.o((...args) => $options.closePage && $options.closePage(...args))
  } : {}, {
    d: $data.arReady && !$data.markerFound && !$data.arError && !$data.platformError
  }, $data.arReady && !$data.markerFound && !$data.arError && !$data.platformError ? {} : {}, {
    e: $data.arError && !$data.platformError
  }, $data.arError && !$data.platformError ? {
    f: common_vendor.t($data.arError),
    g: common_vendor.o((...args) => $options.retryAR && $options.retryAR(...args)),
    h: common_vendor.o((...args) => $options.closePage && $options.closePage(...args))
  } : {}, {
    i: !$data.arError && !$data.platformError
  }, !$data.arError && !$data.platformError ? {
    j: common_vendor.o((...args) => $options.closePage && $options.closePage(...args)),
    k: common_vendor.t(((_a = $data.arData) == null ? void 0 : _a.title) || "AR 扫描")
  } : {}, {
    l: !$data.arError && !$data.platformError
  }, !$data.arError && !$data.platformError ? common_vendor.e({
    m: $data.statusText
  }, $data.statusText ? {
    n: common_vendor.t($data.statusText)
  } : {}, {
    o: $data.markerFound
  }, $data.markerFound ? {
    p: common_vendor.o((...args) => $options.collectItem && $options.collectItem(...args))
  } : {}) : {}, {
    q: $data.loading
  }, $data.loading ? {
    r: common_vendor.t($data.collecting ? "提交中…" : "加载中…")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-29bee293"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ar-scan/index.js.map
