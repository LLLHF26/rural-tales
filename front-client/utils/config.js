// 自动检测当前主机，后端固定端口 8000
const hostname = (typeof window !== 'undefined' && window.location?.hostname) || 'localhost'
export const BASE_URL = `http://${hostname}:8000/v1`
export const BASE_URL_RAW = `http://${hostname}:8000`
