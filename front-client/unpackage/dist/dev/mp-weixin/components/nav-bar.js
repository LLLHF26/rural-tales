"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
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
    const info = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = info.statusBarHeight || 20;
    try {
      const menuButton = common_vendor.index.getMenuButtonBoundingClientRect();
      this.menuButtonHeight = menuButton.height;
      this.menuButtonTop = menuButton.top;
    } catch (e) {
    }
  },
  methods: {
    handleBack() {
      common_vendor.index.navigateBack({ delta: 1 });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.showBack
  }, $props.showBack ? {
    b: common_vendor.o((...args) => $options.handleBack && $options.handleBack(...args))
  } : {}, {
    c: common_vendor.t($props.title),
    d: common_vendor.s($options.rightStyle),
    e: common_vendor.s($options.innerStyle),
    f: common_vendor.s($options.navBarStyle)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a0412dee"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/nav-bar.js.map
