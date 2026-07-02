"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const NavBar = () => "../../components/nav-bar.js";
const ScriptCard = () => "../../components/script-card.js";
const _sfc_main = {
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
        const data = await utils_api.villageApi.getList();
        this.villages = data.list || [];
      } catch (e) {
      }
    },
    async loadHotScripts() {
      try {
        const data = await utils_api.scriptApi.getRecommend(4);
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
      common_vendor.index.navigateTo({ url: `/pages/script-detail/index?id=${id}` });
    },
    goByVillage(id) {
      common_vendor.index.navigateTo({ url: `/pages/village-detail/index?id=${id}` });
    },
    goByType(type) {
      getApp().globalData.scriptType = type;
      getApp().globalData.villageId = null;
      common_vendor.index.switchTab({ url: "/pages/script-list/index" });
    },
    goVillageList() {
      common_vendor.index.switchTab({ url: "/pages/village-list/index" });
    },
    goScriptList() {
      getApp().globalData.scriptType = null;
      getApp().globalData.villageId = null;
      common_vendor.index.switchTab({ url: "/pages/script-list/index" });
    }
  }
};
if (!Array) {
  const _component_nav_bar = common_vendor.resolveComponent("nav-bar");
  const _component_script_card = common_vendor.resolveComponent("script-card");
  (_component_nav_bar + _component_script_card)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      title: "乡村剧本"
    }),
    b: common_vendor.t($data.villages.length),
    c: common_vendor.t($data.hotScripts.length),
    d: common_vendor.o((...args) => $options.goVillageList && $options.goVillageList(...args)),
    e: common_vendor.f($data.villages, (v, k0, i0) => {
      return {
        a: v.coverImage,
        b: common_vendor.t(v.name),
        c: common_vendor.t(v.scriptCount),
        d: v.villageId,
        e: common_vendor.o(($event) => $options.goByVillage(v.villageId), v.villageId)
      };
    }),
    f: common_vendor.o(($event) => $options.goScriptList()),
    g: common_vendor.f($data.hotScripts, (item, k0, i0) => {
      return {
        a: item.scriptId,
        b: common_vendor.o(($event) => $options.goDetail(item.scriptId), item.scriptId),
        c: "1cf27b2a-1-" + i0,
        d: common_vendor.p({
          data: item
        })
      };
    }),
    h: common_vendor.f($data.types, (t, k0, i0) => {
      return {
        a: common_vendor.t(t.icon),
        b: common_vendor.t(t.label),
        c: t.value,
        d: common_vendor.o(($event) => $options.goByType(t.value), t.value)
      };
    }),
    i: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    j: $data.refreshing
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
