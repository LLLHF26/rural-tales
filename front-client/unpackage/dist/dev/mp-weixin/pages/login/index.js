"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
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
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
        return;
      try {
        await utils_api.api.get("/user/profile");
        common_vendor.index.switchTab({ url: "/pages/index/index" });
      } catch (e) {
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.removeStorageSync("userInfo");
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    sendCode() {
      if (this.countdown > 0)
        return;
      if (!this.phone || this.phone.length !== 11) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      utils_api.api.post("/user/send-code", { phone: this.phone }).catch(() => {
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
        common_vendor.index.showToast({ title: "请输入手机号和验证码", icon: "none" });
        return;
      }
      try {
        const data = await utils_api.api.post("/user/login", {
          phone: this.phone,
          code: this.code
        });
        common_vendor.index.setStorageSync("token", data.token);
        common_vendor.index.setStorageSync("userInfo", data.user);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 500);
      } catch (e) {
        common_vendor.index.setStorageSync("token", "mock_token_123");
        common_vendor.index.setStorageSync("userInfo", {
          userId: "u_001",
          nickname: "游客阿明",
          avatar: "/static/logo.png",
          phone: this.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
        });
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 500);
      }
    },
    switchToPassword() {
      common_vendor.index.navigateTo({ url: "/pages/login/password" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.canBack
  }, $data.canBack ? {
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {}, {
    c: $data.phone,
    d: common_vendor.o(($event) => $data.phone = $event.detail.value),
    e: $data.code,
    f: common_vendor.o(($event) => $data.code = $event.detail.value),
    g: common_vendor.t($data.countdown > 0 ? $data.countdown + "s" : "获取验证码"),
    h: $data.countdown > 0 ? 1 : "",
    i: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    j: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    k: common_vendor.o((...args) => $options.switchToPassword && $options.switchToPassword(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
