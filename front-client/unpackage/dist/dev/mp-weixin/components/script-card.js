"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    data: { type: Object, required: true }
  },
  emits: ["click"]
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.data.coverImage,
    b: $props.data.typeLabel
  }, $props.data.typeLabel ? {
    c: common_vendor.t($props.data.typeLabel)
  } : {}, {
    d: common_vendor.t($props.data.title),
    e: $props.data.brief
  }, $props.data.brief ? {
    f: common_vendor.t($props.data.brief)
  } : {}, {
    g: common_vendor.t($props.data.rating),
    h: common_vendor.t($props.data.estimatedDuration),
    i: common_vendor.f(5, (i, k0, i0) => {
      return {
        a: i,
        b: i <= $props.data.difficulty ? "#4CAF50" : "#E0E0E0"
      };
    }),
    j: common_vendor.o(($event) => _ctx.$emit("click"))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f64c4164"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/script-card.js.map
