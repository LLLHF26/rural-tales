if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  var _a;
  const hostname = typeof window !== "undefined" && ((_a = window.location) == null ? void 0 : _a.hostname) || "localhost";
  const BASE_URL = `http://${hostname}:8000/v1`;
  const BASE_URL_RAW = `http://${hostname}:8000`;
  const request = (options) => {
    const token = uni.getStorageSync("token");
    const header = {
      "Content-Type": "application/json",
      ...token && { Authorization: `Bearer ${token}` }
    };
    let data = options.data;
    if (data) {
      const clean = {};
      Object.keys(data).forEach((k) => {
        const v = data[k];
        if (v !== null && v !== void 0 && v !== "")
          clean[k] = v;
      });
      data = clean;
    }
    return new Promise((resolve, reject) => {
      uni.request({
        url: BASE_URL + options.url,
        method: options.method || "GET",
        data,
        header,
        timeout: 8e3,
        success: (res) => {
          const { code, message, data: data2, detail } = res.data;
          if (detail && detail.code) {
            if (detail.code === 1002) {
              uni.removeStorageSync("token");
              uni.reLaunch({ url: "/pages/login/index" });
              reject(new Error(detail.message || "请先登录"));
              return;
            }
            uni.showToast({ title: detail.message || "请求失败", icon: "none" });
            reject(new Error(detail.message));
            return;
          }
          if (code === 0) {
            resolve(data2);
          } else if (code === 1002) {
            uni.removeStorageSync("token");
            uni.reLaunch({ url: "/pages/login/index" });
            reject(new Error(message || "请先登录"));
          } else {
            uni.showToast({ title: message || "请求失败", icon: "none" });
            reject(new Error(message));
          }
        },
        fail: (err) => {
          uni.showToast({ title: "网络异常，请重试", icon: "none" });
          reject(err);
        }
      });
    });
  };
  const api = {
    get: (url, data) => request({ url, method: "GET", data }),
    post: (url, data) => request({ url, method: "POST", data }),
    put: (url, data) => request({ url, method: "PUT", data }),
    delete: (url, data) => request({ url, method: "DELETE", data })
  };
  const userApi = {
    sendCode: (phone) => request({ url: "/user/send-code", method: "POST", data: { phone } }),
    login: (phone, code) => request({ url: "/user/login", method: "POST", data: { phone, code } }),
    loginPassword: (phone, password) => request({ url: "/user/login-password", method: "POST", data: { phone, password } }),
    setPassword: (phone, code, password) => request({ url: "/user/set-password", method: "POST", data: { phone, code, password } }),
    getProfile: () => request({ url: "/user/profile" }),
    updateProfile: (data) => request({ url: "/user/profile", method: "PUT", data }),
    getMyScripts: (status) => request({ url: "/user/scripts", data: { status } }),
    uploadFile: (filePath) => {
      return new Promise((resolve, reject) => {
        const token = uni.getStorageSync("token");
        uni.uploadFile({
          url: BASE_URL + "/upload",
          filePath,
          name: "file",
          header: { Authorization: `Bearer ${token}` },
          success: (res) => {
            const result = JSON.parse(res.data);
            result.code === 0 ? resolve(result.data) : reject(new Error(result.message));
          },
          fail: reject
        });
      });
    }
  };
  const scriptApi = {
    getList: (params) => request({ url: "/scripts", data: params }),
    getDetail: (id) => request({ url: `/scripts/${id}` }),
    claim: (id) => request({ url: `/scripts/${id}/claim`, method: "POST" }),
    rate: (id, rating) => request({ url: `/scripts/${id}/rate?rating=${rating}`, method: "POST" }),
    getRecommend: (limit) => request({ url: "/scripts/recommend", data: { limit } })
  };
  const playApi = {
    getCurrentNode: (progressId) => request({ url: `/play/${progressId}/current-node` }),
    getOpening: (progressId) => request({ url: `/play/${progressId}/opening`, method: "POST" }),
    getProgress: (progressId) => request({ url: `/play/${progressId}/progress` }),
    getItems: (progressId) => request({ url: `/play/${progressId}/items` }),
    choose: (progressId, nodeId, choiceId) => request({ url: `/play/${progressId}/choose`, method: "POST", data: { nodeId, choiceId } }),
    submitTask: (progressId, data) => request({ url: `/play/${progressId}/task/submit`, method: "POST", data }),
    gpsCheckin: (progressId, data) => request({ url: `/play/${progressId}/gps-checkin`, method: "POST", data }),
    advanceNode: (progressId, nextNodeId) => request({ url: `/play/${progressId}/advance-node`, method: "POST", data: { nextNodeId } }),
    getEnding: (progressId, endingId) => request({ url: `/play/${progressId}/ending`, method: "POST", data: { endingId } }),
    arCollect: (progressId, taskId, itemId, nodeId, photoUrl) => request({ url: `/ar/${progressId}/ar-collect`, method: "POST", data: { taskId, itemId, nodeId, photoUrl } }),
    arPhoto: (progressId, npcId, photoUrl) => request({ url: `/play/${progressId}/ar-photo`, method: "POST", data: { npcId, photoUrl } })
  };
  const villageApi = {
    getList: (params) => request({ url: "/villages", data: params }),
    getDetail: (id) => request({ url: `/villages/${id}` })
  };
  const arApi = {
    getResource: (taskId) => request({ url: `/ar/resource/${taskId}` }),
    detect: (taskId, photoUrl) => request({ url: "/ar/detect", method: "POST", data: { taskId, photoUrl } })
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$d = {
    data() {
      return {
        phone: "",
        code: "",
        countdown: 0,
        canBack: false
      };
    },
    onLoad() {
      const pages = getCurrentPages();
      this.canBack = pages.length > 1;
      this.checkLogin();
    },
    methods: {
      async checkLogin() {
        const token = uni.getStorageSync("token");
        if (!token)
          return;
        try {
          await api.get("/user/profile");
          uni.switchTab({ url: "/pages/index/index" });
        } catch (e) {
          uni.removeStorageSync("token");
          uni.removeStorageSync("userInfo");
        }
      },
      goBack() {
        uni.navigateBack();
      },
      sendCode() {
        if (this.countdown > 0)
          return;
        if (!this.phone || this.phone.length !== 11) {
          uni.showToast({ title: "请输入正确的手机号", icon: "none" });
          return;
        }
        api.post("/user/send-code", { phone: this.phone }).catch(() => {
        });
        this.countdown = 60;
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(timer);
          }
        }, 1e3);
      },
      async handleLogin() {
        if (!this.phone || !this.code) {
          uni.showToast({ title: "请输入手机号和验证码", icon: "none" });
          return;
        }
        try {
          const data = await api.post("/user/login", {
            phone: this.phone,
            code: this.code
          });
          uni.setStorageSync("token", data.token);
          uni.setStorageSync("userInfo", data.user);
          uni.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            uni.switchTab({ url: "/pages/index/index" });
          }, 500);
        } catch (e) {
          uni.setStorageSync("token", "mock_token_123");
          uni.setStorageSync("userInfo", {
            userId: "u_001",
            nickname: "游客阿明",
            avatar: "/static/logo.png",
            phone: this.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
          });
          uni.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            uni.switchTab({ url: "/pages/index/index" });
          }, 500);
        }
      },
      switchToPassword() {
        uni.navigateTo({ url: "/pages/login/password" });
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container page" }, [
      $data.canBack ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "nav-bar"
      }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, "← 返回")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "login-content" }, [
        vue.createElementVNode("text", { class: "login-title" }, "欢迎来到乡村剧本"),
        vue.createElementVNode("text", { class: "login-subtitle" }, "沉浸式乡村文旅体验"),
        vue.createElementVNode("view", { class: "form" }, [
          vue.createElementVNode("view", { class: "input-wrap" }, [
            vue.createElementVNode("text", { class: "input-label" }, "手机号"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.phone = $event),
                type: "number",
                maxlength: "11",
                placeholder: "请输入手机号"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.phone]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-wrap" }, [
            vue.createElementVNode("text", { class: "input-label" }, "验证码"),
            vue.createElementVNode("view", { class: "code-row" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input code-input",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.code = $event),
                  type: "number",
                  maxlength: "6",
                  placeholder: "请输入验证码"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.code]
              ]),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["code-btn", { disabled: $data.countdown > 0 }]),
                  onClick: _cache[3] || (_cache[3] = (...args) => $options.sendCode && $options.sendCode(...args))
                },
                vue.toDisplayString($data.countdown > 0 ? $data.countdown + "s" : "获取验证码"),
                3
                /* TEXT, CLASS */
              )
            ])
          ]),
          vue.createElementVNode("view", {
            class: "login-btn",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.handleLogin && $options.handleLogin(...args))
          }, "登录 / 注册"),
          vue.createElementVNode("view", { class: "divider" }, [
            vue.createElementVNode("view", { class: "divider-line" }),
            vue.createElementVNode("text", { class: "divider-text" }, "其他方式"),
            vue.createElementVNode("view", { class: "divider-line" })
          ]),
          vue.createElementVNode("view", {
            class: "password-login",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.switchToPassword && $options.switchToPassword(...args))
          }, " 账号密码登录 ")
        ])
      ]),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("text", { class: "footer-text" }, "登录即表示同意《用户协议》和《隐私政策》")
      ])
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-d08ef7d4"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/login/index.vue"]]);
  const _sfc_main$c = {
    data() {
      return {
        phone: "",
        password: ""
      };
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.redirectTo({ url: "/pages/login/index" });
        }
      },
      async handleLogin() {
        if (!this.phone || !this.password) {
          uni.showToast({ title: "请输入手机号和密码", icon: "none" });
          return;
        }
        try {
          const data = await api.post("/user/login-password", {
            phone: this.phone,
            password: this.password
          });
          uni.setStorageSync("token", data.token);
          uni.setStorageSync("userInfo", data.user);
          uni.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            uni.switchTab({ url: "/pages/index/index" });
          }, 500);
        } catch (e) {
          uni.setStorageSync("token", "mock_token_123");
          uni.setStorageSync("userInfo", {
            userId: "u_001",
            nickname: "游客阿明",
            avatar: "/static/logo.png",
            phone: this.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
          });
          uni.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            uni.switchTab({ url: "/pages/index/index" });
          }, 500);
        }
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container page" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, "← 返回")
      ]),
      vue.createElementVNode("view", { class: "login-content" }, [
        vue.createElementVNode("text", { class: "login-title" }, "账号密码登录"),
        vue.createElementVNode("text", { class: "login-subtitle" }, "使用密码登录已有账号"),
        vue.createElementVNode("view", { class: "form" }, [
          vue.createElementVNode("view", { class: "input-wrap" }, [
            vue.createElementVNode("text", { class: "input-label" }, "手机号"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.phone = $event),
                type: "number",
                maxlength: "11",
                placeholder: "请输入手机号"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.phone]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-wrap" }, [
            vue.createElementVNode("text", { class: "input-label" }, "密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.password = $event),
                type: "password",
                placeholder: "请输入密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.password]
            ])
          ]),
          vue.createElementVNode("view", {
            class: "login-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.handleLogin && $options.handleLogin(...args))
          }, "登录")
        ])
      ]),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("text", { class: "footer-text" }, "登录即表示同意《用户协议》和《隐私政策》")
      ])
    ]);
  }
  const PagesLoginPassword = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-26a2d353"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/login/password.vue"]]);
  const _sfc_main$b = {
    props: {
      title: { type: String, default: "" },
      showBack: { type: Boolean, default: false },
      bgColor: { type: String, default: "" }
    },
    data() {
      return {
        statusBarHeight: 20,
        menuButtonHeight: 32,
        menuButtonTop: 0
      };
    },
    computed: {
      navBarStyle() {
        const style = { paddingTop: this.statusBarHeight + "px" };
        if (this.bgColor) {
          style.background = this.bgColor;
        }
        return style;
      },
      innerStyle() {
        if (this.menuButtonHeight > 0) {
          return { height: this.menuButtonHeight + "px" };
        }
        return {};
      },
      rightStyle() {
        if (this.menuButtonTop > 0) {
          return { paddingRight: "10rpx" };
        }
        return {};
      }
    },
    mounted() {
      const info = uni.getSystemInfoSync();
      this.statusBarHeight = info.statusBarHeight || 20;
    },
    methods: {
      handleBack() {
        uni.navigateBack({ delta: 1 });
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "nav-bar",
        style: vue.normalizeStyle($options.navBarStyle)
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: "nav-bar-inner",
            style: vue.normalizeStyle($options.innerStyle)
          },
          [
            $props.showBack ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "nav-left",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.handleBack && $options.handleBack(...args))
            }, [
              vue.createElementVNode("text", { class: "nav-back-icon" }, "←")
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "view",
              { class: "nav-title" },
              vue.toDisplayString($props.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "view",
              {
                class: "nav-right",
                style: vue.normalizeStyle($options.rightStyle)
              },
              [
                vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
              ],
              4
              /* STYLE */
            )
          ],
          4
          /* STYLE */
        )
      ],
      4
      /* STYLE */
    );
  }
  const NavBar = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-a0412dee"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/components/nav-bar.vue"]]);
  const _sfc_main$a = {
    props: {
      data: { type: Object, required: true }
    },
    emits: ["click"]
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "script-card",
      onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click"))
    }, [
      vue.createElementVNode("image", {
        class: "card-cover",
        src: $props.data.coverImage,
        mode: "aspectFill"
      }, null, 8, ["src"]),
      $props.data.typeLabel ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: "card-badge"
        },
        vue.toDisplayString($props.data.typeLabel),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "card-info" }, [
        vue.createElementVNode(
          "view",
          { class: "card-title ellipsis" },
          vue.toDisplayString($props.data.title),
          1
          /* TEXT */
        ),
        $props.data.brief ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: "card-brief ellipsis-2"
          },
          vue.toDisplayString($props.data.brief),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "card-meta" }, [
          vue.createElementVNode("view", { class: "meta-item" }, [
            vue.createElementVNode("text", { class: "meta-label" }, "评分"),
            vue.createElementVNode(
              "text",
              { class: "star" },
              "⭐ " + vue.toDisplayString($props.data.rating),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "meta-item" }, [
            vue.createElementVNode("text", { class: "meta-label" }, "时长"),
            vue.createElementVNode(
              "text",
              { class: "duration" },
              "⏱ " + vue.toDisplayString($props.data.estimatedDuration) + "分钟",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "meta-item" }, [
            vue.createElementVNode("text", { class: "meta-label" }, "难度"),
            vue.createElementVNode("text", { class: "difficulty" }, [
              (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(5, (i) => {
                  return vue.createElementVNode(
                    "text",
                    {
                      key: i,
                      style: vue.normalizeStyle({ color: i <= $props.data.difficulty ? "#4CAF50" : "#E0E0E0" })
                    },
                    "●",
                    4
                    /* STYLE */
                  );
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ])
        ])
      ])
    ]);
  }
  const ScriptCard = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-f64c4164"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/components/script-card.vue"]]);
  const _sfc_main$9 = {
    components: { NavBar, ScriptCard },
    data() {
      return {
        refreshing: false,
        villages: [],
        types: [
          { value: "mystery", label: "悬疑解谜", icon: "🔍" },
          { value: "history", label: "历史文化", icon: "📜" },
          { value: "family", label: "亲子互动", icon: "👨‍👩‍👧" },
          { value: "couple", label: "情侣探险", icon: "💑" },
          { value: "team", label: "团队协作", icon: "👥" }
        ],
        hotScripts: []
      };
    },
    onLoad() {
      this.loadHotScripts();
      this.loadVillages();
    },
    methods: {
      async loadVillages() {
        try {
          const data = await villageApi.getList();
          this.villages = data.list || [];
        } catch (e) {
        }
      },
      async loadHotScripts() {
        try {
          const data = await scriptApi.getRecommend(4);
          this.hotScripts = data.list || [];
        } catch (e) {
        }
      },
      async onRefresh() {
        this.refreshing = true;
        await Promise.all([this.loadHotScripts(), this.loadVillages()]);
        this.refreshing = false;
      },
      goDetail(id) {
        uni.navigateTo({ url: `/pages/script-detail/index?id=${id}` });
      },
      goByVillage(id) {
        uni.navigateTo({ url: `/pages/village-detail/index?id=${id}` });
      },
      goByType(type) {
        getApp().globalData.scriptType = type;
        getApp().globalData.villageId = null;
        uni.switchTab({ url: "/pages/script-list/index" });
      },
      goVillageList() {
        uni.switchTab({ url: "/pages/village-list/index" });
      },
      goScriptList() {
        getApp().globalData.scriptType = null;
        getApp().globalData.villageId = null;
        uni.switchTab({ url: "/pages/script-list/index" });
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_nav_bar = vue.resolveComponent("nav-bar");
    const _component_script_card = vue.resolveComponent("script-card");
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-page" }, [
      vue.createVNode(_component_nav_bar, { title: "乡村剧本" }),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "page-scroll",
        "refresher-enabled": "",
        onRefresherrefresh: _cache[2] || (_cache[2] = (...args) => $options.onRefresh && $options.onRefresh(...args)),
        "refresher-triggered": $data.refreshing
      }, [
        vue.createElementVNode("view", { class: "hero-section" }, [
          vue.createElementVNode("view", { class: "hero-bg" }, [
            vue.createElementVNode("view", { class: "hero-decor hero-decor-1" }),
            vue.createElementVNode("view", { class: "hero-decor hero-decor-2" }),
            vue.createElementVNode("text", { class: "hero-title" }, "田园探秘"),
            vue.createElementVNode("text", { class: "hero-subtitle" }, "在青山绿水间，开启你的乡村故事"),
            vue.createElementVNode("view", { class: "hero-stats" }, [
              vue.createElementVNode("view", { class: "hero-stat" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-num" },
                  vue.toDisplayString($data.villages.length),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "个村庄")
              ]),
              vue.createElementVNode("view", { class: "hero-stat" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-num" },
                  vue.toDisplayString($data.hotScripts.length),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "个热门")
              ])
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-header flex-between" }, [
            vue.createElementVNode("view", { class: "section-title-row" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "🏠"),
              vue.createElementVNode("text", { class: "section-title" }, "热门村庄")
            ]),
            vue.createElementVNode("text", {
              class: "section-more",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.goVillageList && $options.goVillageList(...args))
            }, "更多 ›")
          ]),
          vue.createElementVNode("scroll-view", {
            "scroll-x": "",
            class: "village-scroll",
            "show-scrollbar": false
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.villages, (v) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "village-item",
                  key: v.villageId,
                  onClick: ($event) => $options.goByVillage(v.villageId)
                }, [
                  vue.createElementVNode("image", {
                    class: "village-img",
                    src: v.coverImage,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode(
                    "text",
                    { class: "village-name" },
                    vue.toDisplayString(v.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "village-count-text" },
                    vue.toDisplayString(v.scriptCount) + "个剧本",
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-header flex-between" }, [
            vue.createElementVNode("view", { class: "section-title-row" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "🔥"),
              vue.createElementVNode("text", { class: "section-title" }, "热门剧本")
            ]),
            vue.createElementVNode("text", {
              class: "section-more",
              onClick: _cache[1] || (_cache[1] = ($event) => $options.goScriptList())
            }, "更多 ›")
          ]),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.hotScripts, (item) => {
              return vue.openBlock(), vue.createBlock(_component_script_card, {
                key: item.scriptId,
                data: item,
                onClick: ($event) => $options.goDetail(item.scriptId)
              }, null, 8, ["data", "onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-header flex-between" }, [
            vue.createElementVNode("view", { class: "section-title-row" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "🎭"),
              vue.createElementVNode("text", { class: "section-title" }, "剧本类型")
            ])
          ]),
          vue.createElementVNode("view", { class: "type-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.types, (t) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "type-item",
                  key: t.value,
                  onClick: ($event) => $options.goByType(t.value)
                }, [
                  vue.createElementVNode("view", { class: "type-icon-wrap" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "type-icon" },
                      vue.toDisplayString(t.icon),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "type-name" },
                    vue.toDisplayString(t.label),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "bottom-safe" })
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/index/index.vue"]]);
  const _sfc_main$8 = {
    components: { NavBar },
    data() {
      return {
        keyword: "",
        currentSort: "name",
        villages: [],
        page: 1,
        total: 0,
        loading: false,
        refreshing: false,
        noMore: false,
        userLat: null,
        userLng: null,
        locationType: ""
        // 'gps' | 'ip' | ''
      };
    },
    onLoad() {
      this.loadVillages();
      this.getLocation().then(() => {
        if (this.userLat != null) {
          this.loadVillages(true);
        }
      });
    },
    methods: {
      getLocation() {
        return new Promise((resolve) => {
          uni.getLocation({
            type: "gcj02",
            success: (res) => {
              this.userLat = res.latitude;
              this.userLng = res.longitude;
              this.locationType = "gps";
              resolve();
            },
            fail: () => {
              if (typeof navigator !== "undefined" && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    this.userLat = pos.coords.latitude;
                    this.userLng = pos.coords.longitude;
                    this.locationType = "gps";
                    resolve();
                  },
                  () => this.ipFallback(resolve),
                  { timeout: 8e3, maximumAge: 6e5 }
                );
              } else {
                this.ipFallback(resolve);
              }
            }
          });
        });
      },
      ipFallback(resolve) {
        uni.request({
          url: "https://ipapi.co/json/",
          timeout: 5e3,
          success: (res) => {
            if (res.data && res.data.latitude) {
              this.userLat = res.data.latitude;
              this.userLng = res.data.longitude;
              this.locationType = "ip";
            }
            resolve();
          },
          fail: () => resolve()
        });
      },
      async loadVillages(isRefresh) {
        if (this.loading)
          return;
        if (isRefresh) {
          this.page = 1;
          this.noMore = false;
        }
        this.loading = true;
        try {
          const data = await villageApi.getList({
            page: this.page,
            pageSize: 10,
            sort: this.currentSort,
            keyword: this.keyword || void 0,
            lat: this.userLat || void 0,
            lng: this.userLng || void 0
          });
          this.villages = isRefresh || this.page === 1 ? data.list : [...this.villages, ...data.list];
          this.total = data.total;
          this.noMore = this.villages.length >= this.total;
        } catch (e) {
        } finally {
          this.loading = false;
        }
      },
      loadMore() {
        if (this.loading || this.noMore)
          return;
        this.page++;
        this.loadVillages();
      },
      async onRefresh() {
        this.refreshing = true;
        this.page = 1;
        await this.loadVillages(true);
        this.refreshing = false;
      },
      changeSort(sort) {
        if (this.currentSort === sort)
          return;
        if (sort === "distance" && this.userLat == null) {
          uni.showToast({ title: "请先允许定位权限", icon: "none" });
          return;
        }
        this.currentSort = sort;
        this.page = 1;
        this.loadVillages(true);
      },
      onSearch() {
        this.page = 1;
        this.loadVillages(true);
      },
      clearSearch() {
        this.keyword = "";
        this.page = 1;
        this.loadVillages(true);
      },
      goVillage(id) {
        uni.navigateTo({ url: `/pages/village-detail/index?id=${id}` });
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_nav_bar = vue.resolveComponent("nav-bar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "village-page" }, [
      vue.createVNode(_component_nav_bar, { title: "探索村庄" }),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("view", { class: "search-input" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.keyword = $event),
              placeholder: "搜索村庄...",
              "confirm-type": "search",
              onConfirm: _cache[1] || (_cache[1] = (...args) => $options.onSearch && $options.onSearch(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.keyword]
          ]),
          $data.keyword ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "search-clear",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.clearSearch && $options.clearSearch(...args))
          }, "✕")) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", {
          class: "search-btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.onSearch && $options.onSearch(...args))
        }, "搜索")
      ]),
      vue.createElementVNode("view", { class: "filter-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["filter-item", { active: $data.currentSort === "name" }]),
            onClick: _cache[4] || (_cache[4] = ($event) => $options.changeSort("name"))
          },
          "名称",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["filter-item", { active: $data.currentSort === "distance" }]),
            onClick: _cache[5] || (_cache[5] = ($event) => $options.changeSort("distance"))
          },
          "距离最近",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["filter-item", { active: $data.currentSort === "scripts" }]),
            onClick: _cache[6] || (_cache[6] = ($event) => $options.changeSort("scripts"))
          },
          "剧本最多",
          2
          /* CLASS */
        )
      ]),
      $data.locationType === "ip" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "location-hint"
      }, [
        vue.createElementVNode("text", { class: "location-hint-icon" }, "📍"),
        vue.createElementVNode("text", { class: "location-hint-text" }, "当前为基于IP的近似定位，距离仅供参考。如需精确定位请使用 HTTPS 访问或在 App 中打开。")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "page-scroll",
        onScrolltolower: _cache[7] || (_cache[7] = (...args) => $options.loadMore && $options.loadMore(...args)),
        "refresher-enabled": "",
        onRefresherrefresh: _cache[8] || (_cache[8] = (...args) => $options.onRefresh && $options.onRefresh(...args)),
        "refresher-triggered": $data.refreshing
      }, [
        vue.createElementVNode("view", { class: "page-scroll-inner" }, [
          vue.createElementVNode("view", { class: "village-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.villages, (v) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "village-card",
                  key: v.villageId,
                  onClick: ($event) => $options.goVillage(v.villageId)
                }, [
                  vue.createElementVNode("image", {
                    class: "village-cover",
                    src: v.coverImage,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "village-overlay" }),
                  vue.createElementVNode("view", { class: "village-body" }, [
                    vue.createElementVNode("view", { class: "village-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "village-name" },
                        vue.toDisplayString(v.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "village-count" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "count-num" },
                          vue.toDisplayString(v.scriptCount),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("text", { class: "count-label" }, "个剧本")
                      ])
                    ]),
                    v.distance != null || v.description ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "village-sub"
                    }, [
                      v.distance != null ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 0,
                        class: "village-distance"
                      }, [
                        vue.createTextVNode(
                          "📍 " + vue.toDisplayString($data.locationType === "ip" ? "~" : "") + vue.toDisplayString(v.distance) + "km",
                          1
                          /* TEXT */
                        ),
                        $data.locationType === "ip" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 0,
                          class: "approx-tag"
                        }, "（约）")) : vue.createCommentVNode("v-if", true)
                      ])) : vue.createCommentVNode("v-if", true),
                      v.description ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 1,
                          class: "village-desc"
                        },
                        vue.toDisplayString(v.description),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])) : vue.createCommentVNode("v-if", true),
                    v.tags && v.tags.length ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "village-tags"
                    }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(v.tags, (t) => {
                          return vue.openBlock(), vue.createElementBlock(
                            "text",
                            {
                              class: "tag",
                              key: t
                            },
                            vue.toDisplayString(t),
                            1
                            /* TEXT */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : vue.createCommentVNode("v-if", true)
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "status-text"
          }, "加载中…")) : vue.createCommentVNode("v-if", true),
          !$data.loading && $data.villages.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "status-text"
          }, "暂无村庄")) : vue.createCommentVNode("v-if", true),
          $data.noMore && $data.villages.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "status-text"
          }, "— 没有更多了 —")) : vue.createCommentVNode("v-if", true)
        ])
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesVillageListIndex = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-bd435f4a"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/village-list/index.vue"]]);
  const _sfc_main$7 = {
    components: { ScriptCard },
    data() {
      return {
        village: null,
        statusBarHeight: 20
      };
    },
    mounted() {
      const info = uni.getSystemInfoSync();
      this.statusBarHeight = info.statusBarHeight || 20;
    },
    onLoad(options) {
      if (options.id) {
        this.loadDetail(options.id);
      }
    },
    methods: {
      goBack() {
        uni.navigateBack({ delta: 1 });
      },
      async loadDetail(id) {
        try {
          const data = await villageApi.getDetail(id);
          this.village = data;
        } catch (e) {
        }
      },
      goScripts() {
        getApp().globalData.villageId = this.village.villageId;
        uni.switchTab({ url: "/pages/script-list/index" });
      },
      goScriptDetail(id) {
        uni.navigateTo({ url: `/pages/script-detail/index?id=${id}` });
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_script_card = vue.resolveComponent("script-card");
    return vue.openBlock(), vue.createElementBlock("view", { class: "detail-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "custom-header",
          style: vue.normalizeStyle({ paddingTop: $data.statusBarHeight + "px" })
        },
        [
          vue.createElementVNode("view", { class: "header-inner" }, [
            vue.createElementVNode("view", {
              class: "back-btn",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
            }, [
              vue.createElementVNode("text", { class: "back-icon" }, "←")
            ]),
            vue.createElementVNode("text", { class: "header-title" }, "村庄详情")
          ])
        ],
        4
        /* STYLE */
      ),
      $data.village ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 0,
        "scroll-y": "",
        class: "page-scroll"
      }, [
        vue.createElementVNode("image", {
          class: "cover",
          src: $data.village.coverImage,
          mode: "aspectFill"
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "info-section" }, [
          vue.createElementVNode("view", { class: "name-row" }, [
            vue.createElementVNode(
              "text",
              { class: "name" },
              vue.toDisplayString($data.village.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "script-badge",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.goScripts && $options.goScripts(...args))
            }, [
              vue.createElementVNode(
                "text",
                { class: "badge-num" },
                vue.toDisplayString($data.village.scriptCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "badge-label" }, "个剧本")
            ])
          ]),
          $data.village.tags && $data.village.tags.length ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "tags-row"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.village.tags, (t) => {
                return vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    class: "tag",
                    key: t
                  },
                  vue.toDisplayString(t),
                  1
                  /* TEXT */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          $data.village.description ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: "desc"
            },
            vue.toDisplayString($data.village.description),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true),
          $data.village.address ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "address"
          }, [
            vue.createElementVNode("text", { class: "addr-icon" }, "📍"),
            vue.createElementVNode(
              "text",
              { class: "addr-text" },
              vue.toDisplayString($data.village.address),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        $data.village.spots && $data.village.spots.length ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "section"
        }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "section-title" }, "📍 打卡点")
          ]),
          vue.createElementVNode("view", { class: "spot-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.village.spots, (sp) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "spot-item",
                  key: sp.spotId
                }, [
                  vue.createElementVNode("view", { class: "spot-marker" }, "📍"),
                  vue.createElementVNode("view", { class: "spot-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "spot-name" },
                      vue.toDisplayString(sp.name),
                      1
                      /* TEXT */
                    ),
                    sp.description ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "spot-desc"
                      },
                      vue.toDisplayString(sp.description),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $data.village.cultures && $data.village.cultures.length ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "section"
        }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "section-title" }, "📚 文化故事")
          ]),
          vue.createElementVNode("view", { class: "culture-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.village.cultures, (c) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "culture-item",
                  key: c.cultureId
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "culture-badge" },
                    vue.toDisplayString(c.typeLabel),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "culture-title" },
                    vue.toDisplayString(c.title),
                    1
                    /* TEXT */
                  ),
                  c.content ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "culture-content"
                    },
                    vue.toDisplayString(c.content),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $data.village.scripts && $data.village.scripts.length ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "section"
        }, [
          vue.createElementVNode("view", { class: "section-header flex-between" }, [
            vue.createElementVNode("text", { class: "section-title" }, "推荐剧本"),
            vue.createElementVNode("text", {
              class: "section-more",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.goScripts && $options.goScripts(...args))
            }, "全部 ›")
          ]),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.village.scripts, (item) => {
              return vue.openBlock(), vue.createBlock(_component_script_card, {
                key: item.scriptId,
                data: item,
                onClick: ($event) => $options.goScriptDetail(item.scriptId)
              }, null, 8, ["data", "onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesVillageDetailIndex = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-0abe5a59"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/village-detail/index.vue"]]);
  const _sfc_main$6 = {
    components: { ScriptCard },
    data() {
      return {
        keyword: "",
        currentSort: "hot",
        currentType: "",
        currentTypeLabel: "类型",
        currentVillageId: null,
        showTypePicker: false,
        list: [],
        page: 1,
        total: 0,
        loading: false,
        refreshing: false,
        noMore: false
      };
    },
    onLoad() {
      this.loadList();
    },
    onShow() {
      const type = getApp().globalData.scriptType;
      const villageId = getApp().globalData.villageId;
      if (type) {
        this.currentType = type;
        const labels = { mystery: "悬疑解谜", history: "历史文化", family: "亲子互动", couple: "情侣探险", team: "团队协作" };
        this.currentTypeLabel = labels[type] || "类型";
        getApp().globalData.scriptType = null;
      }
      if (villageId) {
        this.currentVillageId = villageId;
        getApp().globalData.villageId = null;
      }
      if (type || villageId) {
        this.page = 1;
        this.loadList(true);
      }
    },
    methods: {
      async loadList(isRefresh) {
        if (this.loading)
          return;
        if (isRefresh) {
          this.page = 1;
          this.noMore = false;
        }
        this.loading = true;
        try {
          const data = await scriptApi.getList({
            page: this.page,
            pageSize: 10,
            sort: this.currentSort,
            type: this.currentType || void 0,
            villageId: this.currentVillageId || void 0,
            keyword: this.keyword || void 0
          });
          this.list = isRefresh || this.page === 1 ? data.list : [...this.list, ...data.list];
          this.total = data.total;
          this.noMore = this.list.length >= this.total;
        } catch (e) {
        } finally {
          this.loading = false;
        }
      },
      loadMore() {
        if (this.loading || this.noMore)
          return;
        this.page++;
        this.loadList();
      },
      async onRefresh() {
        this.refreshing = true;
        this.page = 1;
        await this.loadList(true);
        this.refreshing = false;
      },
      changeSort(sort) {
        if (this.currentSort === sort)
          return;
        this.currentSort = sort;
        this.page = 1;
        this.loadList(true);
      },
      selectType(type) {
        this.currentType = type;
        const labels = { mystery: "悬疑解谜", history: "历史文化", family: "亲子互动", couple: "情侣探险", team: "团队协作" };
        this.currentTypeLabel = type ? labels[type] : "类型";
        this.showTypePicker = false;
        this.page = 1;
        this.loadList(true);
      },
      onSearch() {
        this.page = 1;
        this.loadList(true);
      },
      clearSearch() {
        this.keyword = "";
        this.page = 1;
        this.loadList(true);
      },
      goDetail(id) {
        uni.navigateTo({ url: `/pages/script-detail/index?id=${id}` });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_script_card = vue.resolveComponent("script-card");
    return vue.openBlock(), vue.createElementBlock("view", { class: "list-page" }, [
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("view", { class: "search-input" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.keyword = $event),
              placeholder: "搜索剧本...",
              "confirm-type": "search",
              onConfirm: _cache[1] || (_cache[1] = (...args) => $options.onSearch && $options.onSearch(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.keyword]
          ]),
          $data.keyword ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "search-clear",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.clearSearch && $options.clearSearch(...args))
          }, "✕")) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", {
          class: "search-btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.onSearch && $options.onSearch(...args))
        }, "搜索")
      ]),
      vue.createElementVNode("view", { class: "filter-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["filter-item", { active: $data.currentSort === "hot" }]),
            onClick: _cache[4] || (_cache[4] = ($event) => $options.changeSort("hot"))
          },
          "热门",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["filter-item", { active: $data.currentSort === "newest" }]),
            onClick: _cache[5] || (_cache[5] = ($event) => $options.changeSort("newest"))
          },
          "最新",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["filter-item", { active: $data.currentSort === "rating" }]),
            onClick: _cache[6] || (_cache[6] = ($event) => $options.changeSort("rating"))
          },
          "高分",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["filter-item", { active: !!$data.currentType }]),
            onClick: _cache[7] || (_cache[7] = ($event) => $data.showTypePicker = true)
          },
          [
            vue.createTextVNode(
              vue.toDisplayString($data.currentTypeLabel || "类型") + " ",
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "filter-arrow" }, "▾")
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list-scroll",
        onScrolltolower: _cache[8] || (_cache[8] = (...args) => $options.loadMore && $options.loadMore(...args)),
        "refresher-enabled": "",
        onRefresherrefresh: _cache[9] || (_cache[9] = (...args) => $options.onRefresh && $options.onRefresh(...args)),
        "refresher-triggered": $data.refreshing
      }, [
        vue.createElementVNode("view", { class: "list-scroll-inner" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.list, (item) => {
              return vue.openBlock(), vue.createBlock(_component_script_card, {
                key: item.scriptId,
                data: item,
                onClick: ($event) => $options.goDetail(item.scriptId)
              }, null, 8, ["data", "onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "status-text"
          }, "加载中…")) : vue.createCommentVNode("v-if", true),
          !$data.loading && $data.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "status-text"
          }, "暂无剧本")) : vue.createCommentVNode("v-if", true),
          $data.noMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "status-text"
          }, "— 没有更多了 —")) : vue.createCommentVNode("v-if", true)
        ])
      ], 40, ["refresher-triggered"]),
      $data.showTypePicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "popup-overlay",
        onClick: _cache[18] || (_cache[18] = ($event) => $data.showTypePicker = false)
      }, [
        vue.createElementVNode("view", {
          class: "popup-panel",
          onClick: _cache[17] || (_cache[17] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "popup-header flex-between" }, [
            vue.createElementVNode("text", { class: "popup-title" }, "选择类型"),
            vue.createElementVNode("text", {
              class: "popup-close",
              onClick: _cache[10] || (_cache[10] = ($event) => $data.showTypePicker = false)
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "popup-body" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-option", { active: $data.currentType === "" }]),
                onClick: _cache[11] || (_cache[11] = ($event) => $options.selectType(""))
              },
              "全部",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-option", { active: $data.currentType === "mystery" }]),
                onClick: _cache[12] || (_cache[12] = ($event) => $options.selectType("mystery"))
              },
              "🔍 悬疑解谜",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-option", { active: $data.currentType === "history" }]),
                onClick: _cache[13] || (_cache[13] = ($event) => $options.selectType("history"))
              },
              "📜 历史文化",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-option", { active: $data.currentType === "family" }]),
                onClick: _cache[14] || (_cache[14] = ($event) => $options.selectType("family"))
              },
              "👨‍👩‍👧 亲子互动",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-option", { active: $data.currentType === "couple" }]),
                onClick: _cache[15] || (_cache[15] = ($event) => $options.selectType("couple"))
              },
              "💑 情侣探险",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-option", { active: $data.currentType === "team" }]),
                onClick: _cache[16] || (_cache[16] = ($event) => $options.selectType("team"))
              },
              "👥 团队协作",
              2
              /* CLASS */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesScriptListIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-c761630b"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/script-list/index.vue"]]);
  const _sfc_main$5 = {
    data() {
      return { detail: null };
    },
    onLoad(options) {
      this.loadDetail(options.id);
    },
    methods: {
      async loadDetail(id) {
        try {
          this.detail = await scriptApi.getDetail(id);
        } catch (e) {
        }
      },
      async startPlay() {
        try {
          const data = await scriptApi.claim(this.detail.scriptId);
          uni.navigateTo({ url: `/pages/play/index?progressId=${data.progressId}` });
        } catch (e) {
        }
      },
      continuePlay() {
        uni.navigateTo({ url: `/pages/play/index?progressId=${this.detail.activeProgressId}` });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return $data.detail ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "detail-page"
    }, [
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "detail-scroll"
      }, [
        vue.createElementVNode("image", {
          class: "cover-img",
          src: $data.detail.coverImage,
          mode: "aspectFill"
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "cover-overlay" }, [
          vue.createElementVNode(
            "text",
            { class: "detail-title" },
            vue.toDisplayString($data.detail.title),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "detail-meta flex" }, [
            vue.createElementVNode(
              "text",
              { class: "meta-item" },
              "⭐ " + vue.toDisplayString($data.detail.rating) + " (" + vue.toDisplayString($data.detail.ratingCount) + "人)",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "meta-item" },
              "👥 " + vue.toDisplayString($data.detail.experienceCount) + "人体验",
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "detail-body" }, [
          vue.createElementVNode("view", { class: "info-row flex-between" }, [
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "村庄"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.detail.villageName || "未知"),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "类型"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.detail.typeLabel),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "时长"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                "⏱ " + vue.toDisplayString($data.detail.estimatedDuration) + "分钟",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "难度"),
              vue.createElementVNode("text", { class: "info-value" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(5, (i) => {
                    return vue.createElementVNode(
                      "text",
                      {
                        key: i,
                        style: vue.normalizeStyle({ color: i <= $data.detail.difficulty ? "#4CAF50" : "#E0E0E0" })
                      },
                      "●",
                      4
                      /* STYLE */
                    );
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("text", { class: "card-title" }, "📖 故事简介"),
            vue.createElementVNode(
              "text",
              { class: "story-text" },
              vue.toDisplayString($data.detail.storyline),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("text", { class: "card-title" }, "🎭 登场角色"),
            vue.createElementVNode("view", { class: "npc-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.detail.npcs, (npc) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "npc-item",
                    key: npc.npcId
                  }, [
                    vue.createElementVNode("image", {
                      class: "npc-avatar",
                      src: npc.avatar,
                      mode: "aspectFill"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "npc-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "npc-name" },
                        vue.toDisplayString(npc.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "npc-role" },
                        vue.toDisplayString(npc.role),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "npc-desc" },
                        vue.toDisplayString(npc.description),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          $data.detail.endings && $data.detail.endings.length ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "card"
          }, [
            vue.createElementVNode(
              "text",
              { class: "card-title" },
              "🏆 结局（" + vue.toDisplayString($data.detail.endings.filter((e) => e.unlocked).length) + "/" + vue.toDisplayString($data.detail.endings.length) + "）",
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "ending-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.detail.endings, (e) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      class: vue.normalizeClass(["ending-item", { unlocked: e.unlocked }]),
                      key: e.endingId
                    },
                    [
                      vue.createElementVNode(
                        "view",
                        { class: "ending-icon" },
                        vue.toDisplayString(e.unlocked ? "🏆" : "🔒"),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "ending-info" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "ending-title" },
                          vue.toDisplayString(e.title),
                          1
                          /* TEXT */
                        ),
                        e.description ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 0,
                            class: "ending-desc"
                          },
                          vue.toDisplayString(e.description),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ])
                    ],
                    2
                    /* CLASS */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("text", { class: "card-title" }, "📊 数据"),
            vue.createElementVNode("view", { class: "flex-between" }, [
              vue.createElementVNode(
                "text",
                null,
                "共 " + vue.toDisplayString($data.detail.chapterCount) + " 章",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.detail.endingCount) + " 种结局",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                null,
                "完成率 " + vue.toDisplayString(($data.detail.completionRate * 100).toFixed(0)) + "%",
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "bottom-bar" }, [
        !$data.detail.activeProgressId ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "btn-start",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.startPlay && $options.startPlay(...args))
        }, [
          vue.createElementVNode("text", { class: "btn-text" }, "开始体验"),
          vue.createElementVNode("text", { class: "btn-arrow" }, "→")
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "btn-start btn-continue",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.continuePlay && $options.continuePlay(...args))
        }, [
          vue.createElementVNode("text", { class: "btn-text" }, "继续体验"),
          vue.createElementVNode("text", { class: "btn-arrow" }, "→")
        ]))
      ])
    ])) : vue.createCommentVNode("v-if", true);
  }
  const PagesScriptDetailIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-21ec4b6c"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/script-detail/index.vue"]]);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _sfc_main$4 = {
    components: { NavBar },
    data() {
      return {
        progressId: "",
        nodeId: "",
        nodeData: null,
        progressData: null,
        npcName: "",
        userAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='25' fill='%23A5D6A7'/%3E%3Cellipse cx='50' cy='95' rx='38' ry='28' fill='%23A5D6A7'/%3E%3C/svg%3E",
        narratorAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='22' fill='%23D7CCC8'/%3E%3Cpath d='M20 85 Q20 55 50 50 Q80 45 80 85' fill='%23D7CCC8'/%3E%3C/svg%3E",
        messages: [],
        inputText: "",
        streaming: false,
        scrollTop: 0,
        showProgress: false,
        showNpcInfo: false,
        selectedItem: null,
        showNextButton: false,
        _nextNodeId: null,
        _showBranchPanel: false,
        showEnding: false,
        endingData: null,
        userRating: 0,
        ratingSubmitted: false,
        _bgAudioCtx: null
      };
    },
    computed: {
      navTitle() {
        var _a2;
        return ((_a2 = this.nodeData) == null ? void 0 : _a2.chapterTitle) || "剧情体验";
      },
      progressPercent() {
        var _a2;
        if (!this.progressData || !this.progressData.totalNodeCount)
          return 0;
        const done = ((_a2 = this.progressData.completedNodeIds) == null ? void 0 : _a2.length) || 0;
        return Math.round(done / this.progressData.totalNodeCount * 100);
      },
      taskPercent() {
        var _a2;
        if (!this.progressData || !this.progressData.totalTaskCount)
          return 0;
        const done = ((_a2 = this.progressData.completedTaskIds) == null ? void 0 : _a2.length) || 0;
        return Math.round(done / this.progressData.totalTaskCount * 100);
      },
      availableTasks() {
        var _a2, _b;
        if (!((_a2 = this.nodeData) == null ? void 0 : _a2.tasks))
          return [];
        const completed = ((_b = this.progressData) == null ? void 0 : _b.completedTaskIds) || [];
        return this.nodeData.tasks.filter((t) => !completed.includes(String(t.taskId)));
      },
      allCurrentTasksDone() {
        var _a2, _b;
        if (!((_a2 = this.nodeData) == null ? void 0 : _a2.tasks) || this.nodeData.tasks.length === 0)
          return true;
        const completed = ((_b = this.progressData) == null ? void 0 : _b.completedTaskIds) || [];
        return this.nodeData.tasks.every((t) => completed.includes(String(t.taskId)));
      },
      hasNextNode() {
        var _a2, _b;
        return ((_b = (_a2 = this.nodeData) == null ? void 0 : _a2.nextNodes) == null ? void 0 : _b.length) > 0;
      }
    },
    onLoad(options) {
      this.progressId = options.progressId;
      this.loadNodeAndStart();
    },
    onUnload() {
      this.stopSceneAudio();
    },
    methods: {
      async loadNodeAndStart() {
        try {
          this.nodeData = await playApi.getCurrentNode(this.progressId);
          this.progressData = await playApi.getProgress(this.progressId);
          this.nodeId = this.nodeData.nodeId;
          this.playSceneAudio(this.nodeData.sceneAudio);
          if (this.nodeData.npc) {
            this.npcName = this.nodeData.npc.name;
          }
          await this.loadHistory();
          if (this.messages.length === 0) {
            this.triggerOpening();
          }
        } catch (e) {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      },
      async loadHistory() {
        var _a2, _b, _c, _d;
        const key = `chat_${this.progressId}`;
        const cached = uni.getStorageSync(key);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          this.messages = cached;
        }
        try {
          const npcId = Number((_b = (_a2 = this.nodeData) == null ? void 0 : _a2.npc) == null ? void 0 : _b.npcId);
          if (npcId) {
            const token = uni.getStorageSync("token");
            const url = `${BASE_URL}/play/${this.progressId}/chat-history/${npcId}`;
            const res = await new Promise((resolve, reject) => {
              uni.request({
                url,
                method: "GET",
                header: { Authorization: `Bearer ${token}` },
                success: (r) => resolve(r.data),
                fail: reject
              });
            });
            if (res.code === 0 && ((_d = (_c = res.data) == null ? void 0 : _c.messages) == null ? void 0 : _d.length)) {
              for (const m of res.data.messages) {
                if (m.role === "system")
                  continue;
                const text = m.content || m.text || "";
                if (!text)
                  continue;
                const exists = this.messages.some(
                  (existing) => existing.role === m.role && existing.text === text
                );
                if (!exists) {
                  this.messages.push({ role: m.role, text });
                }
              }
            }
          }
        } catch (e) {
        }
        this.saveHistory();
      },
      saveHistory() {
        const key = `chat_${this.progressId}`;
        uni.setStorageSync(key, this.messages.slice(-50));
      },
      triggerOpening() {
        if (this.streaming)
          return;
        this.streaming = true;
        const token = uni.getStorageSync("token");
        const url = `${BASE_URL}/play/${this.progressId}/opening`;
        uni.request({
          url,
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream"
          },
          responseType: "text",
          success: (res) => {
            this.parseSSE(res.data || "");
            this.streaming = false;
            this.ensureHint();
            this.saveHistory();
            this.checkEnding();
          },
          fail: () => {
            var _a2, _b;
            if (((_b = (_a2 = this.nodeData) == null ? void 0 : _a2.npc) == null ? void 0 : _b.greeting) && this.messages.length === 0) {
              this.messages.push({ role: "npc", text: this.nodeData.npc.greeting });
            }
            this.streaming = false;
            this.ensureHint();
            this.saveHistory();
            this.checkEnding();
          }
        });
      },
      async checkEnding() {
        var _a2, _b;
        if (((_a2 = this.nodeData) == null ? void 0 : _a2.type) === "ending" && ((_b = this.nodeData) == null ? void 0 : _b.ending)) {
          try {
            const endingId = Number(this.nodeData.ending.endingId);
            const result = await playApi.getEnding(this.progressId, endingId);
            if (result) {
              this.endingData = result;
            } else {
              this.endingData = this.nodeData.ending;
            }
          } catch (e) {
            this.endingData = this.nodeData.ending;
          }
          this.$nextTick(() => {
            this.showEnding = true;
          });
        }
      },
      sendMessage() {
        var _a2, _b;
        const text = this.inputText.trim();
        if (!text || this.streaming)
          return;
        const npcId = Number((_b = (_a2 = this.nodeData) == null ? void 0 : _a2.npc) == null ? void 0 : _b.npcId);
        const nodeId = Number(this.nodeId);
        if (!npcId || !nodeId) {
          uni.showToast({ title: "请等待场景加载完成", icon: "none" });
          return;
        }
        this.messages.push({ role: "user", text });
        this.inputText = "";
        this.streaming = true;
        this.scrollToBottom();
        this.saveHistory();
        const token = uni.getStorageSync("token");
        const url = `${BASE_URL}/play/${this.progressId}/chat`;
        uni.request({
          url,
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream"
          },
          data: { npcId, message: text, nodeId },
          responseType: "text",
          success: (res) => {
            this.parseSSE(res.data || "");
            this.streaming = false;
            this.ensureHint();
            this.saveHistory();
          },
          fail: () => {
            this.streaming = false;
            this.ensureHint();
            this.saveHistory();
          }
        });
      },
      parseSSE(text) {
        if (!text)
          return;
        const lines = text.split("\n");
        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
            continue;
          }
          if (!line.startsWith("data:"))
            continue;
          try {
            const data = JSON.parse(line.slice(5).trim());
            this.handleSSEEvent(currentEvent, data);
          } catch (e) {
          }
        }
      },
      handleSSEEvent(eventType, data) {
        if (eventType === "choice") {
          const choiceData = { id: data.id, label: data.label };
          const lastMsg = this.messages[this.messages.length - 1];
          if (lastMsg && (!lastMsg.choices || !lastMsg.choices.some((c) => c.id === data.id))) {
            if (!lastMsg.choices)
              lastMsg.choices = [];
            lastMsg.choices.push(choiceData);
          } else if (!lastMsg) {
            this.messages.push({ role: "system", text: "", choices: [choiceData] });
          }
        } else if (eventType === "task") {
          const taskData = {
            taskId: data.taskId,
            type: data.type,
            title: data.title,
            description: data.description
          };
          const target = this.findLastNpcMessage();
          if (target && (!target.task || target.task.taskId !== data.taskId)) {
            target.task = taskData;
          } else if (!target) {
            this.messages.push({ role: "system", text: "", task: taskData });
          }
          this.loadNodeAndUpdate();
        } else if (eventType === "done" && data.hint) {
          const lastNpc = this.findLastNpcMessage();
          if (lastNpc) {
            lastNpc.hint = data.hint;
          }
        } else if (data.text) {
          let cleanText = data.text.replace(/\[TASK[：:][^\]]*\]?/g, "");
          if (!cleanText)
            return;
          let role = "npc";
          if (cleanText.startsWith("[旁白]")) {
            role = "narrator";
            cleanText = cleanText.slice(4).trim();
          }
          if (!cleanText)
            return;
          const last = this.messages[this.messages.length - 1];
          if (last && last.role === role) {
            last.text += cleanText;
          } else {
            this.messages.push({ role, text: cleanText });
          }
        }
        if (data.options) {
          const last = this.messages[this.messages.length - 1];
          if (last) {
            if (!last.choices)
              last.choices = [];
            last.choices.push(...data.options);
          } else {
            this.messages.push({ role: "system", text: "", choices: data.options });
          }
        }
        this.scrollToBottom();
      },
      ensureHint() {
        var _a2;
        const lastNpc = this.findLastNpcMessage();
        if (!lastNpc)
          return;
        if (lastNpc.hint)
          return;
        const hints = [];
        if (lastNpc.task) {
          hints.push("你可以尝试完成上方出现的任务");
        }
        if ((_a2 = this.nodeData) == null ? void 0 : _a2.hasBranch) {
          hints.push("你需要做出选择来推动剧情发展");
        }
        if (!hints.length) {
          hints.push("继续探索周围环境，与NPC交流获取线索");
        }
        hints.push("输入你想说的话或行动来推进剧情");
        lastNpc.hint = hints.join("；");
      },
      findLastNpcMessage() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
          if (this.messages[i].role === "npc" || this.messages[i].role === "narrator")
            return this.messages[i];
        }
        return null;
      },
      async loadNodeAndUpdate() {
        var _a2;
        try {
          const oldNodeId = this.nodeId;
          this.nodeData = await playApi.getCurrentNode(this.progressId);
          this.progressData = await playApi.getProgress(this.progressId);
          if ((_a2 = this.nodeData) == null ? void 0 : _a2.nodeId) {
            this.nodeId = this.nodeData.nodeId;
          }
          if (oldNodeId && this.nodeId && oldNodeId !== this.nodeId) {
            this.playSceneAudio(this.nodeData.sceneAudio);
          }
          if (oldNodeId && this.nodeId && oldNodeId !== this.nodeId && !this.showNextButton) {
            this.$nextTick(() => this.triggerOpening());
          }
        } catch (e) {
        }
      },
      taskTypeLabel(type) {
        const labels = { gps_checkin: "GPS签到", puzzle: "解谜", photo: "拍照", ar_scan: "AR扫描" };
        return labels[type] || "任务";
      },
      isTaskCompleted(taskId) {
        var _a2, _b;
        const msg = this.messages.find((m) => m.task && String(m.task.taskId) === String(taskId));
        if ((_a2 = msg == null ? void 0 : msg.task) == null ? void 0 : _a2.completed)
          return true;
        const completed = ((_b = this.progressData) == null ? void 0 : _b.completedTaskIds) || [];
        return completed.includes(String(taskId));
      },
      getTaskReward(taskId) {
        var _a2;
        const msg = this.messages.find((m) => m.task && m.task.taskId === String(taskId));
        return ((_a2 = msg == null ? void 0 : msg.task) == null ? void 0 : _a2.reward) || null;
      },
      handleTask(task) {
        if (task.type === "gps_checkin") {
          this.gpsCheckin(task);
        } else if (task.type === "choice") {
          this.submitTask(task);
        } else if (task.type === "ar_scan") {
          uni.navigateTo({
            url: `/pages/ar-scan/index?progressId=${this.progressId}&taskId=${task.taskId}&nodeId=${this.nodeId}`
          });
        } else {
          uni.showModal({
            title: task.title,
            editable: task.type === "puzzle",
            placeholderText: "请输入答案",
            success: (res) => {
              if (res.confirm) {
                this.submitTask(task, res.content);
              }
            }
          });
        }
      },
      async gpsCheckin(task) {
        var _a2;
        try {
          const result = await playApi.submitTask(this.progressId, {
            taskId: Number(task.taskId),
            nodeId: Number(this.nodeId)
          });
          if (result.success) {
            this.messages.push({ role: "system", text: `✅ 任务完成：${task.title}` });
            this.markTaskDone(task, (_a2 = result.reward) == null ? void 0 : _a2.item);
            if (result.nextNodeId) {
              this.showNextButton = true;
              this._nextNodeId = result.nextNodeId;
            }
            this.progressData = await playApi.getProgress(this.progressId);
            this.notifyTaskComplete(task.title);
          } else {
            uni.showToast({ title: result.message, icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: "提交失败，请重试", icon: "none" });
        }
      },
      async submitTask(task, answer) {
        var _a2;
        try {
          const result = await playApi.submitTask(this.progressId, {
            taskId: Number(task.taskId),
            nodeId: Number(this.nodeId),
            answer: answer || void 0
          });
          if (result.success) {
            this.messages.push({ role: "system", text: `✅ 任务完成：${task.title}` });
            this.markTaskDone(task, (_a2 = result.reward) == null ? void 0 : _a2.item);
            if (result.nextNodeId) {
              this.showNextButton = true;
              this._nextNodeId = result.nextNodeId;
            }
            this.progressData = await playApi.getProgress(this.progressId);
            this.notifyTaskComplete(task.title);
          } else {
            uni.showToast({ title: result.message || "任务未完成", icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: "提交失败，请重试", icon: "none" });
        }
        this.saveHistory();
      },
      markTaskDone(task, reward) {
        const msg = this.messages.find((m) => m.task && String(m.task.taskId) === String(task.taskId));
        if (msg) {
          msg.task.completed = true;
          if (reward)
            msg.task.reward = reward;
        }
      },
      markTaskDoneFromAR(taskId, reward, nextNodeId) {
        const msg = this.messages.find((m) => m.task && String(m.task.taskId) === String(taskId));
        if (msg) {
          msg.task.completed = true;
          if (reward)
            msg.task.reward = reward;
        } else {
          this.messages.push({ role: "system", text: `✅ 任务完成`, task: { taskId: String(taskId), completed: true, reward } });
        }
        this.messages.push({ role: "system", text: `✅ 任务完成：${(reward == null ? void 0 : reward.name) || "AR扫描"}` });
        if (nextNodeId) {
          this.showNextButton = true;
          this._nextNodeId = nextNodeId;
        }
      },
      async goToNextNode() {
        var _a2, _b, _c, _d, _e;
        if (!this.allCurrentTasksDone) {
          uni.showToast({ title: "当前存在任务未完成", icon: "none" });
          return;
        }
        if (((_a2 = this.nodeData) == null ? void 0 : _a2.hasBranch) && ((_c = (_b = this.nodeData) == null ? void 0 : _b.branchOptions) == null ? void 0 : _c.length) && !this._nextNodeId) {
          uni.showToast({ title: "请先选择剧情分支", icon: "none" });
          return;
        }
        const nextNodeId = Number(this._nextNodeId || ((_e = (_d = this.nodeData) == null ? void 0 : _d.nextNodes) == null ? void 0 : _e[0]));
        if (!nextNodeId) {
          uni.showToast({ title: "没有下一节点", icon: "none" });
          return;
        }
        this.showNextButton = false;
        this._nextNodeId = null;
        this._showBranchPanel = false;
        try {
          await playApi.advanceNode(this.progressId, nextNodeId);
          this.messages = [];
          this.saveHistory();
          await this.loadNodeAndUpdate();
        } catch (e) {
          uni.showToast({ title: "推进失败，请重试", icon: "none" });
        }
      },
      notifyTaskComplete(taskTitle) {
        var _a2, _b, _c, _d, _e;
        const npcId = Number((_b = (_a2 = this.nodeData) == null ? void 0 : _a2.npc) == null ? void 0 : _b.npcId);
        const nodeId = Number(this.nodeId);
        if (!npcId || !nodeId || this.streaming)
          return;
        this.streaming = true;
        const token = uni.getStorageSync("token");
        const url = `${BASE_URL}/play/${this.progressId}/chat`;
        let extraHint = "";
        if (this.allCurrentTasksDone && ((_c = this.nodeData) == null ? void 0 : _c.hasBranch) && ((_e = (_d = this.nodeData) == null ? void 0 : _d.branchOptions) == null ? void 0 : _e.length)) {
          const optionLabels = this.nodeData.branchOptions.map((o) => o.label).join("、");
          extraHint = `当前节点所有任务已全部完成，请引导游客在以下选项中做出选择：${optionLabels}。你必须在回复末尾使用 [CHOICE:选项ID] 标记触发分支选择。`;
        }
        uni.request({
          url,
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream"
          },
          data: {
            npcId,
            nodeId,
            message: `[系统通知] 游客刚刚完成了任务「${taskTitle}」。请你对此做出反应，夸赞或鼓励游客，并根据当前剧情自然地引导下一步行动。${extraHint}`
          },
          responseType: "text",
          success: (res) => {
            this.parseSSE(res.data || "");
            this.streaming = false;
            this.ensureHint();
            this.saveHistory();
            this.showBranchAfterAI();
          },
          fail: () => {
            this.streaming = false;
            this.saveHistory();
            this.showBranchAfterAI();
          }
        });
      },
      showBranchAfterAI() {
        var _a2, _b, _c;
        if (this.allCurrentTasksDone && ((_a2 = this.nodeData) == null ? void 0 : _a2.hasBranch) && ((_c = (_b = this.nodeData) == null ? void 0 : _b.branchOptions) == null ? void 0 : _c.length)) {
          this._showBranchPanel = true;
        }
      },
      async handleChoice(choice) {
        try {
          const result = await playApi.choose(this.progressId, this.nodeId, choice.id);
          this.messages.push({ role: "user", text: choice.label });
          if (result.nextNodeId) {
            this._nextNodeId = result.nextNodeId;
            this.showNextButton = true;
          }
          uni.showToast({ title: result.message || "选择已提交", icon: "success" });
        } catch (e) {
        }
        this.saveHistory();
      },
      setRating(star) {
        this.userRating = star;
      },
      async submitRating() {
        var _a2;
        if (this.userRating === 0)
          return;
        try {
          const scriptId = (_a2 = this.progressData) == null ? void 0 : _a2.scriptId;
          await scriptApi.rate(Number(scriptId), this.userRating);
          this.ratingSubmitted = true;
        } catch (e) {
          uni.showToast({ title: e.message || "评分失败", icon: "none" });
        }
      },
      goHome() {
        uni.switchTab({ url: "/pages/index/index" });
      },
      scrollToBottom() {
        this.$nextTick(() => {
          this.scrollTop = this.scrollTop + 9999;
        });
      },
      onNarratorAvatarError() {
        this.narratorAvatar = "/static/logo.png";
      },
      showItemDetail(item) {
        this.selectedItem = item;
      },
      formatTime(isoStr) {
        if (!isoStr)
          return "";
        const d = new Date(isoStr);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      },
      // 背景音播放
      playSceneAudio(url) {
        this.stopSceneAudio();
        if (!url)
          return;
        const ctx = uni.createInnerAudioContext();
        ctx.src = url;
        ctx.loop = true;
        ctx.autoplay = true;
        ctx.obeyMuteSwitch = false;
        ctx.onError((err) => {
          formatAppLog("warn", "at pages/play/index.vue:819", "背景音播放失败:", url, err);
        });
        this._bgAudioCtx = ctx;
      },
      stopSceneAudio() {
        if (this._bgAudioCtx) {
          try {
            this._bgAudioCtx.stop();
            this._bgAudioCtx.destroy();
          } catch (e) {
          }
          this._bgAudioCtx = null;
        }
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v;
    const _component_nav_bar = vue.resolveComponent("nav-bar");
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["play-page", { "has-scene": (_a2 = $data.nodeData) == null ? void 0 : _a2.sceneImage }]),
        style: vue.normalizeStyle({ backgroundImage: ((_b = $data.nodeData) == null ? void 0 : _b.sceneImage) ? "url(" + $data.nodeData.sceneImage + ")" : "none" })
      },
      [
        ((_c = $data.nodeData) == null ? void 0 : _c.sceneImage) ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "page-overlay"
        })) : vue.createCommentVNode("v-if", true),
        vue.createVNode(_component_nav_bar, {
          title: $options.navTitle,
          showBack: "",
          bgColor: "#43A047"
        }, {
          right: vue.withCtx(() => [
            vue.createElementVNode("view", {
              class: "nav-detail-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $data.showProgress = !$data.showProgress)
            }, [
              vue.createElementVNode("text", { class: "nav-detail-icon" }, "📋"),
              vue.createElementVNode("text", { class: "nav-detail-text" }, "进度")
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title"]),
        vue.createCommentVNode(" NPC 信息头（透明，融于场景） "),
        ((_d = $data.nodeData) == null ? void 0 : _d.npc) ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "npc-header"
        }, [
          vue.createElementVNode("image", {
            class: "npc-header-avatar",
            src: $data.nodeData.npc.avatar,
            mode: "aspectFill",
            onClick: _cache[1] || (_cache[1] = ($event) => $data.showNpcInfo = true)
          }, null, 8, ["src"]),
          vue.createElementVNode("view", {
            class: "npc-header-info",
            onClick: _cache[2] || (_cache[2] = ($event) => $data.showNpcInfo = true)
          }, [
            vue.createElementVNode(
              "text",
              { class: "npc-header-name" },
              vue.toDisplayString($data.nodeData.npc.name),
              1
              /* TEXT */
            )
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" NPC 详情弹窗 "),
        $data.showNpcInfo ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "npc-modal-mask",
          onClick: _cache[5] || (_cache[5] = ($event) => $data.showNpcInfo = false)
        }, [
          vue.createElementVNode("view", {
            class: "npc-modal",
            onClick: _cache[4] || (_cache[4] = vue.withModifiers(() => {
            }, ["stop"]))
          }, [
            vue.createElementVNode("image", {
              class: "npc-modal-avatar",
              src: (_f = (_e = $data.nodeData) == null ? void 0 : _e.npc) == null ? void 0 : _f.avatar,
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode(
              "text",
              { class: "npc-modal-name" },
              vue.toDisplayString((_h = (_g = $data.nodeData) == null ? void 0 : _g.npc) == null ? void 0 : _h.name),
              1
              /* TEXT */
            ),
            ((_j = (_i = $data.nodeData) == null ? void 0 : _i.npc) == null ? void 0 : _j.role) ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "npc-modal-role"
              },
              vue.toDisplayString((_l = (_k = $data.nodeData) == null ? void 0 : _k.npc) == null ? void 0 : _l.role),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true),
            ((_n = (_m = $data.nodeData) == null ? void 0 : _m.npc) == null ? void 0 : _n.description) ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 1,
                class: "npc-modal-desc"
              },
              vue.toDisplayString((_p = (_o = $data.nodeData) == null ? void 0 : _o.npc) == null ? void 0 : _p.description),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", {
              class: "npc-modal-close",
              onClick: _cache[3] || (_cache[3] = ($event) => $data.showNpcInfo = false)
            }, "关闭")
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 道具详情弹窗 "),
        $data.selectedItem ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "npc-modal-mask",
          onClick: _cache[8] || (_cache[8] = ($event) => $data.selectedItem = null)
        }, [
          vue.createElementVNode("view", {
            class: "item-detail-modal",
            onClick: _cache[7] || (_cache[7] = vue.withModifiers(() => {
            }, ["stop"]))
          }, [
            $data.selectedItem.icon ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "item-detail-icon",
              src: $data.selectedItem.icon || "/static/logo.png",
              mode: "aspectFill"
            }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "item-detail-icon-placeholder"
            }, "📦")),
            vue.createElementVNode(
              "text",
              { class: "item-detail-name" },
              vue.toDisplayString($data.selectedItem.name),
              1
              /* TEXT */
            ),
            $data.selectedItem.type ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 2,
                class: "item-detail-type"
              },
              vue.toDisplayString($data.selectedItem.type),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true),
            $data.selectedItem.description ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 3,
                class: "item-detail-desc"
              },
              vue.toDisplayString($data.selectedItem.description),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true),
            $data.selectedItem.acquiredAt ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 4,
              class: "item-detail-meta"
            }, [
              vue.createElementVNode("text", { class: "item-detail-meta-label" }, "获得时间"),
              vue.createElementVNode(
                "text",
                { class: "item-detail-meta-value" },
                vue.toDisplayString($options.formatTime($data.selectedItem.acquiredAt)),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $data.selectedItem.effect ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 5,
              class: "item-detail-meta"
            }, [
              vue.createElementVNode("text", { class: "item-detail-meta-label" }, "效果"),
              vue.createElementVNode(
                "text",
                { class: "item-detail-meta-value" },
                vue.toDisplayString($data.selectedItem.effect),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", {
              class: "npc-modal-close",
              onClick: _cache[6] || (_cache[6] = ($event) => $data.selectedItem = null)
            }, "关闭")
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 进度面板（折叠） "),
        $data.showProgress && $data.progressData ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 4,
          class: "progress-panel"
        }, [
          vue.createElementVNode("view", { class: "progress-row" }, [
            vue.createElementVNode("text", { class: "progress-label" }, "剧情进度"),
            vue.createElementVNode("view", { class: "progress-bar" }, [
              vue.createElementVNode(
                "view",
                {
                  class: "progress-fill",
                  style: vue.normalizeStyle({ width: $options.progressPercent + "%" })
                },
                null,
                4
                /* STYLE */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "progress-num" },
              vue.toDisplayString(((_q = $data.progressData.completedNodeIds) == null ? void 0 : _q.length) || 0) + "/" + vue.toDisplayString($data.progressData.totalNodeCount || 0) + " 节点",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "progress-row",
            style: { "margin-top": "10rpx" }
          }, [
            vue.createElementVNode("text", { class: "progress-label" }, "任务进度"),
            vue.createElementVNode("view", { class: "progress-bar" }, [
              vue.createElementVNode(
                "view",
                {
                  class: "progress-fill task",
                  style: vue.normalizeStyle({ width: $options.taskPercent + "%" })
                },
                null,
                4
                /* STYLE */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "progress-num" },
              vue.toDisplayString(((_r = $data.progressData.completedTaskIds) == null ? void 0 : _r.length) || 0) + "/" + vue.toDisplayString($data.progressData.totalTaskCount || 0) + " 任务",
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 当前场景可用任务 "),
          $options.availableTasks.length ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "panel-items"
          }, [
            vue.createElementVNode("text", { class: "panel-sub" }, "📋 当前任务"),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($options.availableTasks, (task) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "available-task",
                  key: task.taskId
                }, [
                  vue.createElementVNode("view", { class: "available-task-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "available-task-name" },
                      vue.toDisplayString(task.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "available-task-type" },
                      vue.toDisplayString($options.taskTypeLabel(task.type)),
                      1
                      /* TEXT */
                    )
                  ]),
                  task.description ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "available-task-desc"
                    },
                    vue.toDisplayString(task.description),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode("button", {
                    class: "available-task-btn",
                    onClick: ($event) => $options.handleTask(task)
                  }, "去完成", 8, ["onClick"])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          ((_s = $data.progressData.items) == null ? void 0 : _s.length) ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "panel-items"
          }, [
            vue.createElementVNode("text", { class: "panel-sub" }, "🎒 线索"),
            vue.createElementVNode("view", { class: "item-row" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.progressData.items, (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "item-tag",
                    key: item.itemId || item.name,
                    onClick: ($event) => $options.showItemDetail(item)
                  }, [
                    item.icon ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      class: "item-tag-icon",
                      src: item.icon,
                      mode: "aspectFill"
                    }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    )
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 聊天消息区 "),
        vue.createElementVNode("scroll-view", {
          "scroll-y": "",
          class: "chat-scroll",
          "scroll-top": $data.scrollTop,
          "scroll-with-animation": true
        }, [
          vue.createElementVNode("view", { class: "messages" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.messages, (msg, idx) => {
                var _a3, _b2;
                return vue.openBlock(), vue.createElementBlock("view", { key: idx }, [
                  vue.createCommentVNode(" NPC/系统消息 "),
                  msg.role !== "system" && msg.role !== "narrator" ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: vue.normalizeClass(["msg-row", msg.role === "user" ? "user" : msg.role === "narrator" ? "narrator" : "npc"])
                    },
                    [
                      msg.role === "npc" ? (vue.openBlock(), vue.createElementBlock("image", {
                        key: 0,
                        class: "msg-avatar",
                        src: ((_b2 = (_a3 = $data.nodeData) == null ? void 0 : _a3.npc) == null ? void 0 : _b2.avatar) || "",
                        mode: "aspectFill"
                      }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                      vue.createElementVNode("view", { class: "msg-bubble-wrap" }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["msg-bubble", msg.role])
                          },
                          [
                            vue.createElementVNode(
                              "text",
                              { class: "msg-text" },
                              vue.toDisplayString(msg.text),
                              1
                              /* TEXT */
                            )
                          ],
                          2
                          /* CLASS */
                        ),
                        vue.createCommentVNode(" 行动提示 "),
                        (msg.role === "npc" || msg.role === "narrator") && msg.hint ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "msg-hint"
                        }, [
                          vue.createElementVNode("text", { class: "msg-hint-icon" }, "💡"),
                          vue.createElementVNode(
                            "text",
                            { class: "msg-hint-text" },
                            vue.toDisplayString(msg.hint),
                            1
                            /* TEXT */
                          )
                        ])) : vue.createCommentVNode("v-if", true)
                      ]),
                      msg.role === "user" ? (vue.openBlock(), vue.createElementBlock("image", {
                        key: 1,
                        class: "msg-avatar",
                        src: $data.userAvatar,
                        mode: "aspectFill"
                      }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
                    ],
                    2
                    /* CLASS */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 旁白叙事 "),
                  msg.role === "narrator" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "msg-row narrator"
                  }, [
                    vue.createElementVNode("image", {
                      class: "msg-avatar narrator-avatar",
                      src: $data.narratorAvatar,
                      mode: "aspectFill",
                      onError: _cache[9] || (_cache[9] = (...args) => $options.onNarratorAvatarError && $options.onNarratorAvatarError(...args))
                    }, null, 40, ["src"]),
                    vue.createElementVNode("view", { class: "msg-bubble-wrap narrator-wrap" }, [
                      vue.createElementVNode("view", { class: "msg-bubble narrator" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "msg-narrator-text" },
                          vue.toDisplayString(msg.text),
                          1
                          /* TEXT */
                        )
                      ]),
                      msg.hint ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "msg-hint narrator-hint"
                      }, [
                        vue.createElementVNode("text", { class: "msg-hint-icon" }, "💡"),
                        vue.createElementVNode(
                          "text",
                          { class: "msg-hint-text" },
                          vue.toDisplayString(msg.hint),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true)
                    ])
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 任务卡片 "),
                  msg.task ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 2,
                      class: vue.normalizeClass(["task-card", { completed: $options.isTaskCompleted(msg.task.taskId) }])
                    },
                    [
                      vue.createElementVNode("view", { class: "task-card-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "task-card-icon" },
                          vue.toDisplayString($options.isTaskCompleted(msg.task.taskId) ? "✅" : "📋"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "task-card-info" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "task-card-title" },
                            vue.toDisplayString(msg.task.title),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "task-card-type" },
                            vue.toDisplayString($options.taskTypeLabel(msg.task.type)),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      msg.task.description ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "task-card-desc"
                        },
                        vue.toDisplayString(msg.task.description),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      vue.createCommentVNode(" 未完成 "),
                      !$options.isTaskCompleted(msg.task.taskId) ? (vue.openBlock(), vue.createElementBlock("button", {
                        key: 1,
                        class: "task-card-btn",
                        onClick: ($event) => $options.handleTask(msg.task)
                      }, "去完成", 8, ["onClick"])) : (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        { key: 2 },
                        [
                          vue.createCommentVNode(" 已完成 "),
                          vue.createElementVNode("view", { class: "task-card-done" }, [
                            vue.createElementVNode("text", { class: "task-card-done-text" }, "已完成"),
                            $options.getTaskReward(msg.task.taskId) ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "task-card-reward"
                            }, [
                              vue.createElementVNode("text", { class: "reward-label" }, "🎁 获得："),
                              vue.createElementVNode(
                                "text",
                                { class: "reward-name" },
                                vue.toDisplayString($options.getTaskReward(msg.task.taskId).name),
                                1
                                /* TEXT */
                              )
                            ])) : vue.createCommentVNode("v-if", true)
                          ])
                        ],
                        2112
                        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                      ))
                    ],
                    2
                    /* CLASS */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 选择按钮 "),
                  msg.choices ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 3,
                    class: "choice-row"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(msg.choices, (ch) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: "choice-btn",
                          key: ch.id,
                          onClick: ($event) => $options.handleChoice(ch)
                        }, vue.toDisplayString(ch.label), 9, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : vue.createCommentVNode("v-if", true)
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            vue.createCommentVNode(" 加载指示器 "),
            $data.streaming ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "typing-indicator"
            }, [
              vue.createElementVNode("view", { class: "typing-dot" }),
              vue.createElementVNode("view", { class: "typing-dot" }),
              vue.createElementVNode("view", { class: "typing-dot" })
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ], 8, ["scroll-top"]),
        vue.createCommentVNode(" 分支选择面板 "),
        $data._showBranchPanel && ((_t = $data.nodeData) == null ? void 0 : _t.hasBranch) && ((_v = (_u = $data.nodeData) == null ? void 0 : _u.branchOptions) == null ? void 0 : _v.length) && !$data._nextNodeId ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 5,
          class: "branch-panel"
        }, [
          vue.createElementVNode(
            "text",
            { class: "branch-panel-title" },
            "🔀 " + vue.toDisplayString($data.nodeData.branchPrompt || "请做出选择"),
            1
            /* TEXT */
          ),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.nodeData.branchOptions, (opt) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "branch-option",
                key: opt.id,
                onClick: ($event) => $options.handleChoice(opt)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "branch-option-label" },
                  vue.toDisplayString(opt.label),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "branch-option-arrow" }, "▶")
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 前往下一节 "),
        vue.createElementVNode("view", {
          class: "next-node-bar",
          onClick: _cache[10] || (_cache[10] = (...args) => $options.goToNextNode && $options.goToNextNode(...args))
        }, [
          vue.createElementVNode("text", { class: "next-node-icon" }, "▶"),
          vue.createElementVNode("text", { class: "next-node-text" }, "前往下一节")
        ]),
        vue.createCommentVNode(" 结局达成弹窗 "),
        $data.showEnding && $data.endingData ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 6,
          class: "ending-mask"
        }, [
          vue.createElementVNode("view", { class: "ending-modal" }, [
            vue.createElementVNode(
              "text",
              { class: "ending-title" },
              vue.toDisplayString($data.endingData.title),
              1
              /* TEXT */
            ),
            $data.endingData.endingImage ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "ending-image",
              src: $data.endingData.endingImage,
              mode: "aspectFill"
            }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("scroll-view", {
              "scroll-y": "",
              class: "ending-desc-wrap"
            }, [
              vue.createElementVNode(
                "text",
                { class: "ending-desc" },
                vue.toDisplayString($data.endingData.description),
                1
                /* TEXT */
              )
            ]),
            vue.createCommentVNode(" 评分区 "),
            !$data.ratingSubmitted ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "ending-rate"
            }, [
              vue.createElementVNode("text", { class: "ending-rate-title" }, "为这个剧本评分"),
              vue.createElementVNode("view", { class: "ending-stars" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(5, (i) => {
                    return vue.createElementVNode("text", {
                      key: i,
                      class: vue.normalizeClass(["ending-star", { active: i <= $data.userRating }]),
                      onClick: ($event) => $options.setRating(i)
                    }, vue.toDisplayString(i <= $data.userRating ? "★" : "☆"), 11, ["onClick"]);
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("button", {
                class: "ending-rate-btn",
                disabled: $data.userRating === 0,
                onClick: _cache[11] || (_cache[11] = (...args) => $options.submitRating && $options.submitRating(...args))
              }, " 提交评分 ", 8, ["disabled"])
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "ending-rate-done"
            }, [
              vue.createElementVNode("text", { class: "ending-rate-done-text" }, "感谢你的评分！")
            ])),
            vue.createElementVNode("button", {
              class: "ending-home-btn",
              onClick: _cache[12] || (_cache[12] = (...args) => $options.goHome && $options.goHome(...args))
            }, "返回主页")
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 输入栏 "),
        vue.createElementVNode("view", { class: "input-bar" }, [
          vue.withDirectives(vue.createElementVNode("input", {
            class: "chat-input",
            "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => $data.inputText = $event),
            placeholder: "输入你想说的话或行动...",
            "confirm-type": "send",
            onConfirm: _cache[14] || (_cache[14] = (...args) => $options.sendMessage && $options.sendMessage(...args)),
            disabled: $data.streaming
          }, null, 40, ["disabled"]), [
            [vue.vModelText, $data.inputText]
          ]),
          vue.createElementVNode("button", {
            class: "send-btn",
            onClick: _cache[15] || (_cache[15] = (...args) => $options.sendMessage && $options.sendMessage(...args)),
            disabled: $data.streaming || !$data.inputText.trim()
          }, [
            vue.createElementVNode("text", null, "发送")
          ], 8, ["disabled"])
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const PagesPlayIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-5c0a22ca"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/play/index.vue"]]);
  const _sfc_main$3 = {
    components: { NavBar },
    data() {
      return {
        progressId: "",
        npcId: "",
        nodeId: "",
        npcName: "",
        npcAvatar: "",
        userAvatar: "/static/logo.png",
        inputText: "",
        messages: [],
        choices: [],
        sending: false,
        scrollTop: 0
      };
    },
    onLoad(options) {
      this.progressId = options.progressId;
      this.npcId = options.npcId;
      this.nodeId = options.nodeId;
      this.npcName = options.npcName || "NPC";
      this.npcAvatar = options.npcAvatar || "/static/logo.png";
    },
    methods: {
      async sendMessage() {
        const text = this.inputText.trim();
        if (!text || this.sending)
          return;
        this.messages.push({ role: "user", text });
        this.inputText = "";
        this.sending = true;
        this.scrollToBottom();
        const token = uni.getStorageSync("token");
        const task = uni.request({
          url: `${BASE_URL}/play/${this.progressId}/chat`,
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream"
          },
          data: { npcId: Number(this.npcId), message: text, nodeId: Number(this.nodeId) },
          responseType: "text",
          enableChunked: true
        });
        task.onChunkReceived((chunk) => {
          const lines = chunk.data.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              continue;
            }
            if (line.startsWith("data:")) {
              try {
                const evtData = JSON.parse(line.slice(5).trim());
                this.handleSSEEvent(evtData);
              } catch (e) {
              }
            }
          }
        });
        task.then(() => {
          this.sending = false;
        }).catch(() => {
          this.sending = false;
          uni.showToast({ title: "对话失败", icon: "none" });
        });
      },
      handleSSEEvent(data) {
        if (data.text) {
          const cleanText = data.text.replace(/\[TASK:\d+\]/g, "");
          if (cleanText) {
            const last = this.messages[this.messages.length - 1];
            if (last && last.role === "npc") {
              last.text += cleanText;
            } else {
              this.messages.push({ role: "npc", text: cleanText });
            }
          }
        }
        if (data.options) {
          this.choices = data.options;
        }
        if (data.type === "task") {
          uni.showToast({ title: `新任务：${data.title}`, icon: "none" });
        }
        this.scrollToBottom();
      },
      async submitChoice(choiceId) {
        this.choices = [];
        try {
          await playApi.choose(this.progressId, this.nodeId, choiceId);
          uni.showToast({ title: "选择已提交", icon: "success" });
        } catch (e) {
        }
      },
      scrollToBottom() {
        this.$nextTick(() => {
          this.scrollTop = this.scrollTop + 1;
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_nav_bar = vue.resolveComponent("nav-bar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "chat-page" }, [
      vue.createVNode(_component_nav_bar, {
        title: $data.npcName || "对话",
        showBack: ""
      }, null, 8, ["title"]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "chat-scroll",
        "scroll-top": $data.scrollTop,
        "scroll-with-animation": true
      }, [
        vue.createElementVNode("view", { class: "messages" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.messages, (msg, idx) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: idx,
                  class: vue.normalizeClass(["msg-row", msg.role])
                },
                [
                  msg.role === "npc" ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    class: "msg-avatar",
                    src: $data.npcAvatar,
                    mode: "aspectFill"
                  }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["msg-bubble", msg.role])
                    },
                    [
                      vue.createElementVNode(
                        "text",
                        { class: "msg-text" },
                        vue.toDisplayString(msg.text),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  msg.role === "user" ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 1,
                    class: "msg-avatar",
                    src: $data.userAvatar,
                    mode: "aspectFill"
                  }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        $data.choices.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "choice-bar"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.choices, (ch) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "choice-item",
                key: ch.id,
                onClick: ($event) => $options.submitChoice(ch.id)
              }, vue.toDisplayString(ch.label), 9, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true)
      ], 8, ["scroll-top"]),
      vue.createElementVNode("view", { class: "input-bar" }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "chat-input",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.inputText = $event),
            placeholder: "输入你想说的话...",
            "confirm-type": "send",
            onConfirm: _cache[1] || (_cache[1] = (...args) => $options.sendMessage && $options.sendMessage(...args))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [vue.vModelText, $data.inputText]
        ]),
        vue.createElementVNode("button", {
          class: "send-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.sendMessage && $options.sendMessage(...args)),
          disabled: $data.sending
        }, [
          !$data.sending ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "发送")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "..."))
        ], 8, ["disabled"])
      ])
    ]);
  }
  const PagesChatIndex = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-5a559478"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/chat/index.vue"]]);
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
  const _sfc_main$2 = {
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
          const res = await arApi.getResource(Number(this.taskId));
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
          let pattUrl = BASE_URL_RAW + "/static/markers/marker_" + arucoId + ".patt";
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
          formatAppLog("error", "at pages/ar-scan/index.vue:197", "AR启动失败:", e);
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
          formatAppLog("error", "at pages/ar-scan/index.vue:231", "相机启动失败:", e);
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
        var _a2, _b, _c;
        if (this.loading)
          return;
        this.loading = true;
        this.collecting = true;
        try {
          const result = await playApi.arCollect(
            this.progressId,
            Number(this.taskId),
            ((_b = (_a2 = this.arData) == null ? void 0 : _a2.overlayContent) == null ? void 0 : _b.itemId) || String(this.taskId),
            Number(this.nodeId)
          );
          if (result.success) {
            uni.showToast({ title: "获得：" + (((_c = result.item) == null ? void 0 : _c.name) || "道具"), icon: "success" });
            this.notifyPrevPage(result);
            setTimeout(() => uni.navigateBack(), 1200);
          }
        } catch (e) {
          uni.showToast({ title: "收集失败", icon: "none" });
        } finally {
          this.loading = false;
          this.collecting = false;
        }
      },
      notifyPrevPage(result) {
        var _a2;
        const pages = getCurrentPages();
        const prev = pages[pages.length - 2];
        if (prev) {
          if (prev.markTaskDoneFromAR) {
            prev.markTaskDoneFromAR(this.taskId, result.item, result.nextNodeId);
          }
          if (prev.notifyTaskComplete) {
            prev.notifyTaskComplete(((_a2 = this.arData) == null ? void 0 : _a2.title) || "AR扫描");
          }
          if (prev.loadNodeAndUpdate) {
            prev.loadNodeAndUpdate();
          }
        }
      },
      closePage() {
        this._active = false;
        this.destroyAR();
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    var _a2;
    return vue.openBlock(), vue.createElementBlock("view", { class: "ar-ui-overlay" }, [
      vue.createCommentVNode(" 平台不支持提示 "),
      $data.platformError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "ar-error-mask"
      }, [
        vue.createElementVNode(
          "text",
          { class: "ar-error-text" },
          vue.toDisplayString($data.platformError),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", {
          class: "ar-close-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.closePage && $options.closePage(...args))
        }, "返回")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 标记检测状态 "),
      $data.arReady && !$data.markerFound && !$data.arError && !$data.platformError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "ar-status-bar"
      }, [
        vue.createElementVNode("text", { class: "ar-status-hint" }, "请对准 ArUco 标记"),
        vue.createElementVNode("view", { class: "ar-status-dot" })
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 错误提示 "),
      $data.arError && !$data.platformError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "ar-error-mask"
      }, [
        vue.createElementVNode(
          "text",
          { class: "ar-error-text" },
          vue.toDisplayString($data.arError),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", {
          class: "ar-retry-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.retryAR && $options.retryAR(...args))
        }, "重试"),
        vue.createElementVNode("view", {
          class: "ar-close-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.closePage && $options.closePage(...args))
        }, "返回")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 顶栏 "),
      !$data.arError && !$data.platformError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "ar-topbar"
      }, [
        vue.createElementVNode("view", {
          class: "ar-back",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.closePage && $options.closePage(...args))
        }, [
          vue.createElementVNode("text", { class: "ar-back-icon" }, "✓")
        ]),
        vue.createElementVNode(
          "text",
          { class: "ar-title" },
          vue.toDisplayString(((_a2 = $data.arData) == null ? void 0 : _a2.title) || "AR 扫描"),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "ar-topbar-right" })
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 底栏 "),
      !$data.arError && !$data.platformError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "ar-bottombar"
      }, [
        $data.statusText ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "ar-hint-text"
          },
          vue.toDisplayString($data.statusText),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        $data.markerFound ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "ar-collect-btn",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.collectItem && $options.collectItem(...args))
        }, " 收集道具 ")) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 加载遮罩 "),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 5,
        class: "ar-loading-mask"
      }, [
        vue.createElementVNode(
          "text",
          { class: "ar-loading-text" },
          vue.toDisplayString($data.collecting ? "提交中…" : "加载中…"),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesArScanIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-29bee293"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/ar-scan/index.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        profile: {},
        tabStatus: "",
        myScripts: [],
        showSetPassword: false,
        pwdPhone: "",
        pwdCode: "",
        pwdNew: "",
        pwdCountdown: 0
      };
    },
    onShow() {
      this.loadProfile();
      this.loadMyScripts();
    },
    methods: {
      async loadProfile() {
        const token = uni.getStorageSync("token");
        if (!token)
          return;
        try {
          this.profile = await userApi.getProfile();
        } catch (e) {
        }
      },
      async loadMyScripts() {
        const token = uni.getStorageSync("token");
        if (!token)
          return;
        try {
          const data = await userApi.getMyScripts(this.tabStatus || void 0);
          this.myScripts = data.list || [];
        } catch (e) {
        }
      },
      changeTab(status) {
        this.tabStatus = status;
        this.loadMyScripts();
      },
      goPlay(item) {
        if (item.status === "playing") {
          uni.navigateTo({ url: `/pages/play/index?progressId=${item.progressId}` });
        }
      },
      goLogin() {
        const token = uni.getStorageSync("token");
        if (token)
          return;
        uni.navigateTo({ url: "/pages/login/index" });
      },
      changeAvatar() {
        uni.chooseImage({
          count: 1,
          success: async (res) => {
            try {
              const result = await userApi.uploadFile(res.tempFilePaths[0]);
              await userApi.updateProfile({ avatar: result.url });
              this.profile.avatar = result.url;
              uni.showToast({ title: "头像更新成功", icon: "success" });
            } catch (e) {
            }
          }
        });
      },
      editNickname() {
        uni.showModal({
          title: "修改昵称",
          editable: true,
          placeholderText: "请输入新昵称",
          success: async (res) => {
            if (res.confirm && res.content) {
              try {
                await userApi.updateProfile({ nickname: res.content });
                this.profile.nickname = res.content;
                uni.showToast({ title: "昵称已更新", icon: "success" });
              } catch (e) {
              }
            }
          }
        });
      },
      setPassword() {
        this.pwdPhone = "";
        this.pwdCode = "";
        this.pwdNew = "";
        this.showSetPassword = true;
      },
      sendPwdCode() {
        if (this.pwdCountdown > 0)
          return;
        if (!this.pwdPhone || this.pwdPhone.length !== 11) {
          uni.showToast({ title: "请输入正确的手机号", icon: "none" });
          return;
        }
        userApi.sendCode(this.pwdPhone).catch(() => {
        });
        this.pwdCountdown = 60;
        const timer = setInterval(() => {
          this.pwdCountdown--;
          if (this.pwdCountdown <= 0) {
            clearInterval(timer);
          }
        }, 1e3);
      },
      async doSetPassword() {
        if (!this.pwdPhone || !this.pwdCode || !this.pwdNew) {
          uni.showToast({ title: "请填写完整信息", icon: "none" });
          return;
        }
        try {
          await userApi.setPassword(this.pwdPhone, this.pwdCode, this.pwdNew);
          this.showSetPassword = false;
          uni.showToast({ title: "密码设置成功", icon: "success" });
        } catch (e) {
        }
      },
      logout() {
        uni.showModal({
          title: "退出登录",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
              uni.reLaunch({ url: "/pages/login/index" });
            }
          }
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "my-page" }, [
      vue.createElementVNode("view", { class: "profile-header" }, [
        vue.createElementVNode("image", {
          class: "profile-avatar",
          src: $data.profile.avatar || "/static/logo.png",
          mode: "aspectFill",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.changeAvatar && $options.changeAvatar(...args))
        }, null, 8, ["src"]),
        vue.createElementVNode(
          "text",
          {
            class: "profile-name",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.goLogin && $options.goLogin(...args))
          },
          vue.toDisplayString($data.profile.nickname || "点击登录"),
          1
          /* TEXT */
        ),
        $data.profile.phone ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "profile-phone"
          },
          vue.toDisplayString($data.profile.phone),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "text",
          { class: "profile-stats" },
          "已完成 " + vue.toDisplayString($data.profile.completedScriptCount || 0) + " 个剧本",
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "card" }, [
        vue.createElementVNode("text", { class: "card-title" }, "🎭 我的剧本"),
        vue.createElementVNode("view", { class: "tab-row" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["tab-item", { active: $data.tabStatus === "" }]),
              onClick: _cache[2] || (_cache[2] = ($event) => $options.changeTab(""))
            },
            "全部",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["tab-item", { active: $data.tabStatus === "playing" }]),
              onClick: _cache[3] || (_cache[3] = ($event) => $options.changeTab("playing"))
            },
            "进行中",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["tab-item", { active: $data.tabStatus === "completed" }]),
              onClick: _cache[4] || (_cache[4] = ($event) => $options.changeTab("completed"))
            },
            "已完成",
            2
            /* CLASS */
          )
        ]),
        $data.myScripts.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "script-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.myScripts, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "script-item",
                key: item.progressId,
                onClick: ($event) => $options.goPlay(item)
              }, [
                vue.createElementVNode("image", {
                  class: "script-cover",
                  src: item.coverImage,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "script-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "script-title ellipsis" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "script-progress-text" },
                    vue.toDisplayString(item.progressLabel || (item.status === "playing" ? "进行中" : "已完成")),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty"
        }, [
          vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无剧本，去首页看看吧")
        ]))
      ]),
      $data.showSetPassword ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "card"
      }, [
        vue.createElementVNode("text", { class: "card-title" }, "设置密码"),
        vue.createElementVNode("view", { class: "pwd-form" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "pwd-input",
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.pwdPhone = $event),
              type: "number",
              maxlength: "11",
              placeholder: "请输入手机号"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.pwdPhone]
          ]),
          vue.createElementVNode("view", { class: "code-row" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "pwd-input code-input",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.pwdCode = $event),
                type: "number",
                maxlength: "6",
                placeholder: "请输入验证码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.pwdCode]
            ]),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["pwd-code-btn", { disabled: $data.pwdCountdown > 0 }]),
                onClick: _cache[7] || (_cache[7] = (...args) => $options.sendPwdCode && $options.sendPwdCode(...args))
              },
              vue.toDisplayString($data.pwdCountdown > 0 ? $data.pwdCountdown + "s" : "发送验证码"),
              3
              /* TEXT, CLASS */
            )
          ]),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "pwd-input",
              "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.pwdNew = $event),
              type: "password",
              placeholder: "请输入新密码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.pwdNew]
          ]),
          vue.createElementVNode("view", { class: "pwd-btns" }, [
            vue.createElementVNode("view", {
              class: "pwd-btn cancel",
              onClick: _cache[9] || (_cache[9] = ($event) => $data.showSetPassword = false)
            }, "取消"),
            vue.createElementVNode("view", {
              class: "pwd-btn confirm",
              onClick: _cache[10] || (_cache[10] = (...args) => $options.doSetPassword && $options.doSetPassword(...args))
            }, "确认")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "card" }, [
        vue.createElementVNode("text", { class: "card-title" }, "⚙️ 设置"),
        vue.createElementVNode("view", {
          class: "setting-item",
          onClick: _cache[11] || (_cache[11] = (...args) => $options.editNickname && $options.editNickname(...args))
        }, [
          vue.createElementVNode("text", null, "修改昵称"),
          vue.createElementVNode("text", { class: "setting-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "setting-item",
          onClick: _cache[12] || (_cache[12] = (...args) => $options.setPassword && $options.setPassword(...args))
        }, [
          vue.createElementVNode("text", null, "设置密码"),
          vue.createElementVNode("text", { class: "setting-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "setting-item",
          onClick: _cache[13] || (_cache[13] = (...args) => $options.logout && $options.logout(...args))
        }, [
          vue.createElementVNode("text", { class: "text-error" }, "退出登录")
        ])
      ])
    ]);
  }
  const PagesMyIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-f97bc692"], ["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/pages/my/index.vue"]]);
  __definePage("pages/login/index", PagesLoginIndex);
  __definePage("pages/login/password", PagesLoginPassword);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/village-list/index", PagesVillageListIndex);
  __definePage("pages/village-detail/index", PagesVillageDetailIndex);
  __definePage("pages/script-list/index", PagesScriptListIndex);
  __definePage("pages/script-detail/index", PagesScriptDetailIndex);
  __definePage("pages/play/index", PagesPlayIndex);
  __definePage("pages/chat/index", PagesChatIndex);
  __definePage("pages/ar-scan/index", PagesArScanIndex);
  __definePage("pages/my/index", PagesMyIndex);
  const _sfc_main = {
    globalData: {
      scriptType: null
    },
    onLaunch: function() {
      formatAppLog("log", "at App.vue:7", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:10", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:13", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/86178/OneDrive/桌面/暑假/dazuoye/front-client/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
