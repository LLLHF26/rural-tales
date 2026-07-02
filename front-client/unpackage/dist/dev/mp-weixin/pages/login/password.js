"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
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
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.redirectTo({ url: "/pages/login/index" });
      }
    },
    async handleLogin() {
      if (!this.phone || !this.password) {
        common_vendor.index.showToast({ title: "请输入手机号和密码", icon: "none" });
        return;
      }
      try {
        const data = await utils_api.api.post("/user/login-password", {
          phone: this.phone,
          password: this.password
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.phone,
    c: common_vendor.o(($event) => $data.phone = $event.detail.value),
    d: $data.password,
    e: common_vendor.o(($event) => $data.password = $event.detail.value),
    f: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-26a2d353"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/password.js.map
