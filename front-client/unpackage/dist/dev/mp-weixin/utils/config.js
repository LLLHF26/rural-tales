"use strict";
var _a;
const hostname = typeof window !== "undefined" && ((_a = window.location) == null ? void 0 : _a.hostname) || "localhost";
const BASE_URL = `http://${hostname}:8000/v1`;
const BASE_URL_RAW = `http://${hostname}:8000`;
exports.BASE_URL = BASE_URL;
exports.BASE_URL_RAW = BASE_URL_RAW;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/config.js.map
