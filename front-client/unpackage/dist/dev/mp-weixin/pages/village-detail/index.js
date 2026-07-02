"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const ScriptCard = () => "../../components/script-card.js";
const _sfc_main = {
  components: { ScriptCard },
  data() {
    return {
      village: null,
      statusBarHeight: 20
    };
  },
  mounted() {
    const info = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = info.statusBarHeight || 20;
  },
  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id);
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack({ delta: 1 });
    },
    async loadDetail(id) {
      try {
        const data = await utils_api.villageApi.getDetail(id);
        this.village = data;
      } catch (e) {
      }
    },
    goScripts() {
      getApp().globalData.villageId = this.village.villageId;
      common_vendor.index.switchTab({ url: "/pages/script-list/index" });
    },
    goScriptDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/script-detail/index?id=${id}` });
    }
  }
};
if (!Array) {
  const _component_script_card = common_vendor.resolveComponent("script-card");
  _component_script_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.statusBarHeight + "px",
    c: $data.village
  }, $data.village ? common_vendor.e({
    d: $data.village.coverImage,
    e: common_vendor.t($data.village.name),
    f: common_vendor.t($data.village.scriptCount),
    g: common_vendor.o((...args) => $options.goScripts && $options.goScripts(...args)),
    h: $data.village.tags && $data.village.tags.length
  }, $data.village.tags && $data.village.tags.length ? {
    i: common_vendor.f($data.village.tags, (t, k0, i0) => {
      return {
        a: common_vendor.t(t),
        b: t
      };
    })
  } : {}, {
    j: $data.village.description
  }, $data.village.description ? {
    k: common_vendor.t($data.village.description)
  } : {}, {
    l: $data.village.address
  }, $data.village.address ? {
    m: common_vendor.t($data.village.address)
  } : {}, {
    n: $data.village.spots && $data.village.spots.length
  }, $data.village.spots && $data.village.spots.length ? {
    o: common_vendor.f($data.village.spots, (sp, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(sp.name),
        b: sp.description
      }, sp.description ? {
        c: common_vendor.t(sp.description)
      } : {}, {
        d: sp.spotId
      });
    })
  } : {}, {
    p: $data.village.cultures && $data.village.cultures.length
  }, $data.village.cultures && $data.village.cultures.length ? {
    q: common_vendor.f($data.village.cultures, (c, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(c.typeLabel),
        b: common_vendor.t(c.title),
        c: c.content
      }, c.content ? {
        d: common_vendor.t(c.content)
      } : {}, {
        e: c.cultureId
      });
    })
  } : {}, {
    r: $data.village.scripts && $data.village.scripts.length
  }, $data.village.scripts && $data.village.scripts.length ? {
    s: common_vendor.o((...args) => $options.goScripts && $options.goScripts(...args)),
    t: common_vendor.f($data.village.scripts, (item, k0, i0) => {
      return {
        a: item.scriptId,
        b: common_vendor.o(($event) => $options.goScriptDetail(item.scriptId), item.scriptId),
        c: "0abe5a59-0-" + i0,
        d: common_vendor.p({
          data: item
        })
      };
    })
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0abe5a59"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/village-detail/index.js.map
