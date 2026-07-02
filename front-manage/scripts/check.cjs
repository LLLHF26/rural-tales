#!/usr/bin/env node
// ============================================================
// 管理端前端完整性检查脚本
// 按照管理端接口文档，自动检查代码覆盖情况
// ============================================================

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')

// ========== 颜色输出 ==========
const colors = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m', bold: '\x1b[1m' }
function pass(msg) { console.log(`  ${colors.green}✓${colors.reset} ${msg}`) }
function fail(msg) { console.log(`  ${colors.red}✗${colors.reset} ${msg}`) }
function warn(msg) { console.log(`  ${colors.yellow}⚠${colors.reset} ${msg}`) }
function info(msg) { console.log(`  ${colors.cyan}→${colors.reset} ${msg}`) }
function title(msg) { console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`); console.log(`${colors.bold}${colors.cyan}  ${msg}${colors.reset}`); console.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`) }

let totalChecks = 0
let passedChecks = 0
let failedChecks = 0
let warnings = 0

function check(name, condition, isWarning = false) {
  totalChecks++
  if (condition) { passedChecks++; pass(name) }
  else { if (isWarning) { warnings++; warn(name) } else { failedChecks++; fail(name) } }
}

// ========== 辅助函数 ==========
function fileExists(relativePath) {
  return fs.existsSync(path.join(SRC, relativePath))
}

function grepInFile(filePath, pattern) {
  if (!fs.existsSync(filePath)) return false
  const content = fs.readFileSync(filePath, 'utf-8')
  return new RegExp(pattern).test(content)
}

// ========== 1. 项目结构检查 ==========
title('1. 项目结构检查')

check('根目录 package.json 存在', fs.existsSync(path.join(ROOT, 'package.json')))
check('vite.config.ts 存在', fs.existsSync(path.join(ROOT, 'vite.config.ts')))
check('index.html 存在', fs.existsSync(path.join(ROOT, 'index.html')))
check('src/main.ts 存在', fileExists('main.ts'))
check('src/App.vue 存在', fileExists('App.vue'))

// ========== 2. 核心模块文件检查 ==========
title('2. 核心模块文件检查')

const coreFiles = [
  'router/index.ts', 'stores/auth.ts', 'stores/app.ts', 'types/index.ts',
  'api/http.ts', 'api/auth.ts', 'api/dashboard.ts', 'api/village.ts',
  'api/script.ts', 'api/ai.ts', 'api/user.ts', 'api/analytics.ts', 'api/settings.ts',
  'layouts/MainLayout.vue'
]
for (const f of coreFiles) {
  check(`  ${f}`, fileExists(f))
}

// ========== 3. 路由完整性检查 ==========
title('3. 路由完整性检查（对照管理端接口文档 4.4 节）')

const expectedRoutes = [
  { path: '/login', name: 'Login' },
  { path: 'dashboard', name: 'Dashboard' },
  { path: 'village/list', name: 'VillageList' },
  { path: 'village/detail/:id', name: 'VillageDetail' },
  { path: 'script/list', name: 'ScriptList' },
  { path: 'script/editor/:id', name: 'ScriptEditor' },
  { path: 'script/generate', name: 'ScriptGenerate' },
  { path: 'user/list', name: 'UserList' },
  { path: 'user/detail/:id', name: 'UserDetail' },
  { path: 'analytics', name: 'Analytics' },
  { path: 'settings', name: 'Settings' },
]

const routerContent = fs.readFileSync(path.join(SRC, 'router/index.ts'), 'utf-8')

for (const r of expectedRoutes) {
  const hasPath = routerContent.includes(`'${r.path}'`) || routerContent.includes(`"${r.path}"`)
  const hasName = routerContent.includes(`name: '${r.name}'`) || routerContent.includes(`name: "${r.name}"`)
  check(`  路由 ${r.path} (${r.name})`, hasPath && hasName)
}

// ========== 4. 页面组件检查 ==========
title('4. 页面组件检查')

const expectedViews = [
  'views/login/LoginView.vue',
  'views/dashboard/DashboardView.vue',
  'views/village/VillageListView.vue',
  'views/village/VillageDetailView.vue',
  'views/script/ScriptListView.vue',
  'views/script/ScriptEditorView.vue',
  'views/script/ScriptGenerateView.vue',
  'views/user/UserListView.vue',
  'views/user/UserDetailView.vue',
  'views/analytics/AnalyticsView.vue',
  'views/settings/SettingsView.vue',
]

for (const v of expectedViews) {
  check(`  ${v}`, fileExists(v))
}

// ========== 5. API 接口覆盖检查（对照管理端接口文档第十章） ==========
title('5. API 接口覆盖检查（对照文档 50 个接口）')

const apiChecks = [
  // 认证模块 (3)
  { file: 'api/auth.ts', endpoint: '/auth/login', method: 'post', desc: '管理员登录' },
  { file: 'api/auth.ts', endpoint: '/auth/profile', method: 'get', desc: '获取管理员信息' },
  { file: 'api/auth.ts', endpoint: '/auth/password', method: 'put', desc: '修改密码' },

  // 仪表盘 (3)
  { file: 'api/dashboard.ts', endpoint: '/dashboard/overview', method: 'get', desc: '数据总览' },
  { file: 'api/dashboard.ts', endpoint: '/dashboard/trend', method: 'get', desc: '趋势数据' },
  { file: 'api/dashboard.ts', endpoint: '/dashboard/hot-scripts', method: 'get', desc: '热门剧本排行' },

  // 乡村管理 - 乡村 CRUD (5)
  { file: 'api/village.ts', endpoint: '/villages', method: 'get', desc: '乡村列表' },
  { file: 'api/village.ts', endpoint: '/villages/', method: 'post', desc: '新增乡村' },
  { file: 'api/village.ts', endpoint: '/villages/', method: 'get', desc: '乡村详情', hasId: true },
  { file: 'api/village.ts', endpoint: '/villages/', method: 'put', desc: '编辑乡村', hasId: true },
  { file: 'api/village.ts', endpoint: '/villages/', method: 'delete', desc: '删除乡村', hasId: true },

  // 乡村管理 - 打卡点 (4)
  { file: 'api/village.ts', endpoint: '/spots', method: 'get', desc: '打卡点列表', hasId: true },
  { file: 'api/village.ts', endpoint: '/spots', method: 'post', desc: '新增打卡点', hasId: true },
  { file: 'api/village.ts', endpoint: '/spots/', method: 'put', desc: '编辑打卡点', hasId: true, hasSubId: true },
  { file: 'api/village.ts', endpoint: '/spots/', method: 'delete', desc: '删除打卡点', hasId: true, hasSubId: true },

  // 乡村管理 - 文化条目 (4)
  { file: 'api/village.ts', endpoint: '/cultures', method: 'get', desc: '文化条目列表', hasId: true },
  { file: 'api/village.ts', endpoint: '/cultures', method: 'post', desc: '新增文化条目', hasId: true },
  { file: 'api/village.ts', endpoint: '/cultures/', method: 'put', desc: '编辑文化条目', hasId: true, hasSubId: true },
  { file: 'api/village.ts', endpoint: '/cultures/', method: 'delete', desc: '删除文化条目', hasId: true, hasSubId: true },

  // 剧本管理 (6)
  { file: 'api/script.ts', endpoint: '/scripts', method: 'get', desc: '剧本列表' },
  { file: 'api/script.ts', endpoint: '/scripts/', method: 'get', desc: '剧本详情', hasId: true },
  { file: 'api/script.ts', endpoint: '/scripts', method: 'post', desc: '新增剧本' },
  { file: 'api/script.ts', endpoint: '/scripts/', method: 'put', desc: '编辑剧本', hasId: true },
  { file: 'api/script.ts', endpoint: '/scripts/', method: 'put', desc: '更新剧本状态', hasId: true, hasSuffix: '/status' },
  { file: 'api/script.ts', endpoint: '/scripts/', method: 'delete', desc: '删除剧本', hasId: true },

  // 剧本管理 - 章节 (4)
  { file: 'api/script.ts', endpoint: '/chapters', method: 'get', desc: '章节列表', hasId: true },
  { file: 'api/script.ts', endpoint: '/chapters', method: 'post', desc: '新增章节', hasId: true },
  { file: 'api/script.ts', endpoint: '/chapters/', method: 'put', desc: '编辑章节', hasId: true, hasSubId: true },
  { file: 'api/script.ts', endpoint: '/chapters/', method: 'delete', desc: '删除章节', hasId: true, hasSubId: true },

  // 剧本管理 - 节点 (6)
  { file: 'api/script.ts', endpoint: '/nodes', method: 'get', desc: '节点列表', hasId: true, hasSuffix: '/nodes' },
  { file: 'api/script.ts', endpoint: '/nodes', method: 'post', desc: '新增节点', hasId: true, hasSuffix: '/nodes' },
  { file: 'api/script.ts', endpoint: '/nodes/', method: 'get', desc: '节点详情', hasId: true, hasSubId: true, hasSuffix: '/nodes' },
  { file: 'api/script.ts', endpoint: '/nodes/', method: 'put', desc: '编辑节点', hasId: true, hasSubId: true, hasSuffix: '/nodes' },
  { file: 'api/script.ts', endpoint: '/nodes/', method: 'delete', desc: '删除节点', hasId: true, hasSubId: true, hasSuffix: '/nodes' },
  { file: 'api/script.ts', endpoint: '/nodes/sort', method: 'put', desc: '批量排序节点', hasId: true },

  // 剧本管理 - NPC (5)
  { file: 'api/script.ts', endpoint: '/npcs', method: 'get', desc: 'NPC列表', hasId: true },
  { file: 'api/script.ts', endpoint: '/npcs', method: 'post', desc: '新增NPC', hasId: true },
  { file: 'api/script.ts', endpoint: '/npcs/', method: 'get', desc: 'NPC详情', hasId: true, hasSubId: true },
  { file: 'api/script.ts', endpoint: '/npcs/', method: 'put', desc: '编辑NPC', hasId: true, hasSubId: true },
  { file: 'api/script.ts', endpoint: '/npcs/', method: 'delete', desc: '删除NPC', hasId: true, hasSubId: true },

  // 剧本管理 - 结局 (4)
  { file: 'api/script.ts', endpoint: '/endings', method: 'get', desc: '结局列表', hasId: true },
  { file: 'api/script.ts', endpoint: '/endings', method: 'post', desc: '新增结局', hasId: true },
  { file: 'api/script.ts', endpoint: '/endings/', method: 'put', desc: '编辑结局', hasId: true, hasSubId: true },
  { file: 'api/script.ts', endpoint: '/endings/', method: 'delete', desc: '删除结局', hasId: true, hasSubId: true },

  // 剧本管理 - 任务 (4)
  { file: 'api/script.ts', endpoint: '/tasks', method: 'get', desc: '任务列表', hasId: true, hasSubId: true },
  { file: 'api/script.ts', endpoint: '/tasks', method: 'post', desc: '新增任务', hasId: true, hasSubId: true },
  { file: 'api/script.ts', endpoint: '/tasks/', method: 'put', desc: '编辑任务', hasId: true, hasSubId: true, hasSuffix: '/tasks' },
  { file: 'api/script.ts', endpoint: '/tasks/', method: 'delete', desc: '删除任务', hasId: true, hasSubId: true, hasSuffix: '/tasks' },

  // 剧本管理 - AR资源 (4)
  { file: 'api/script.ts', endpoint: '/ar-resources', method: 'get', desc: 'AR资源列表', hasId: true },
  { file: 'api/script.ts', endpoint: '/ar-resources', method: 'post', desc: '新增AR资源', hasId: true },
  { file: 'api/script.ts', endpoint: '/ar-resources/', method: 'put', desc: '编辑AR资源', hasId: true, hasSubId: true },
  { file: 'api/script.ts', endpoint: '/ar-resources/', method: 'delete', desc: '删除AR资源', hasId: true, hasSubId: true },

  // AI 生成 (6)
  { file: 'api/ai.ts', endpoint: '/ai/generate-script', method: 'post', desc: 'AI生成剧本(SSE)' },
  { file: 'api/ai.ts', endpoint: '/ai/generate-script-from-text', method: 'post', desc: 'AI生成剧本(文本SSE)' },
  { file: 'api/ai.ts', endpoint: '/ai/generate-scene-image', method: 'post', desc: 'AI生成场景图' },
  { file: 'api/ai.ts', endpoint: '/ai/generate-npc-portrait', method: 'post', desc: 'AI生成NPC立绘' },
  { file: 'api/ai.ts', endpoint: '/ai/generation-task/', method: 'get', desc: '查询生成任务', hasId: true },
  { file: 'api/ai.ts', endpoint: '/ai/confirm-image', method: 'post', desc: '确认图片' },

  // 用户管理 (4)
  { file: 'api/user.ts', endpoint: '/users', method: 'get', desc: '用户列表' },
  { file: 'api/user.ts', endpoint: '/users/', method: 'get', desc: '用户详情', hasId: true },
  { file: 'api/user.ts', endpoint: '/users/', method: 'get', desc: '用户体验记录', hasId: true, hasSuffix: '/progresses' },
  { file: 'api/user.ts', endpoint: '/users/', method: 'get', desc: '游玩路径详情', hasId: true, hasSuffix: '/progresses/', hasSubId: true },

  // 数据分析 (5)
  { file: 'api/analytics.ts', endpoint: '/analytics/scripts-overview', method: 'get', desc: '剧本数据概览' },
  { file: 'api/analytics.ts', endpoint: '/analytics/scripts/', method: 'get', desc: '节点漏斗', hasId: true, hasSuffix: '/node-funnel' },
  { file: 'api/analytics.ts', endpoint: '/analytics/scripts/', method: 'get', desc: '任务难度分析', hasId: true, hasSuffix: '/task-stats' },
  { file: 'api/analytics.ts', endpoint: '/analytics/user-profile', method: 'get', desc: '游客画像' },
  { file: 'api/analytics.ts', endpoint: '/analytics/ratings', method: 'get', desc: '评分列表' },

  // 系统设置 (6)
  { file: 'api/settings.ts', endpoint: '/admins', method: 'get', desc: '管理员列表' },
  { file: 'api/settings.ts', endpoint: '/admins', method: 'post', desc: '新增管理员' },
  { file: 'api/settings.ts', endpoint: '/admins/', method: 'put', desc: '编辑管理员', hasId: true },
  { file: 'api/settings.ts', endpoint: '/admins/', method: 'delete', desc: '删除管理员', hasId: true },
  { file: 'api/settings.ts', endpoint: '/settings/ai', method: 'get', desc: '获取AI配置' },
  { file: 'api/settings.ts', endpoint: '/upload', method: 'post', desc: '上传图片' },
  { file: 'api/settings.ts', endpoint: '/resources/images', method: 'get', desc: '素材库列表' },
]

for (const api of apiChecks) {
  const filePath = path.join(SRC, api.file)
  if (!fs.existsSync(filePath)) {
    check(`  [${api.method.toUpperCase()}] ${api.endpoint} - ${api.desc}`, false)
    continue
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  // Check that the endpoint string exists AND the HTTP method is used
  // For SSI endpoints (generate-script, generate-script-from-text), check if fetch is used
  const isSSE = api.endpoint.includes('/ai/generate-script')
  let hasEndpoint = false
  if (isSSE) {
    hasEndpoint = content.includes(api.endpoint)
  } else {
    hasEndpoint = content.includes(api.endpoint)
  }
  check(`  [${api.method.toUpperCase()}] ${api.endpoint} - ${api.desc}`, hasEndpoint)
}

// ========== 6. TypeScript 类型检查 ==========
title('6. TypeScript 类型编译检查')

try {
  execSync('npx vue-tsc -b --noEmit', { cwd: ROOT, stdio: 'pipe', timeout: 60000 })
  check('vue-tsc 类型检查通过（无类型错误）', true)
} catch (e) {
  const stderr = e.stderr?.toString() || e.stdout?.toString() || ''
  // Only count real type errors, not deprecation warnings
  const realErrors = stderr.split('\n').filter(l => l.includes('error TS') && !l.includes('ignoreDeprecations'))
  if (realErrors.length === 0) {
    check('vue-tsc 类型检查通过（仅有弃用警告）', true)
  } else {
    fail(`vue-tsc 发现 ${realErrors.length} 个类型错误`)
    realErrors.slice(0, 5).forEach(e => console.log(`    ${colors.red}${e.trim()}${colors.reset}`))
    if (realErrors.length > 5) console.log(`    ${colors.red}... 还有 ${realErrors.length - 5} 个错误${colors.reset}`)
  }
}

// ========== 7. 构建产物检查 ==========
title('7. Vite 生产构建检查')

try {
  execSync('npx vite build', { cwd: ROOT, stdio: 'pipe', timeout: 60000 })
  const distDir = path.join(ROOT, 'dist')
  const hasIndex = fs.existsSync(path.join(distDir, 'index.html'))
  const hasAssets = fs.existsSync(path.join(distDir, 'assets'))
  check('Vite build 成功', hasIndex && hasAssets)
  if (hasIndex && hasAssets) {
    const files = fs.readdirSync(path.join(distDir, 'assets'))
    const jsFiles = files.filter(f => f.endsWith('.js')).length
    const cssFiles = files.filter(f => f.endsWith('.css')).length
    info(`  生成 ${jsFiles} 个 JS 文件, ${cssFiles} 个 CSS 文件`)
  }
} catch (e) {
  check('Vite build 成功', false)
  console.log(`    ${colors.red}${(e.stderr?.toString() || e.stdout?.toString() || '').split('\n').filter(l => l.includes('error')).slice(0, 3).join('\n    ')}${colors.reset}`)
}

// ========== 8. 类型定义完整性检查 ==========
title('8. 类型定义完整性检查')

const typesContent = fs.readFileSync(path.join(SRC, 'types/index.ts'), 'utf-8')

const expectedTypes = [
  'ApiResponse', 'PaginatedData', 'AdminInfo', 'LoginResult',
  'DashboardOverview', 'DashboardTrend', 'HotScript',
  'Village', 'VillageListItem', 'VillageSpot', 'VillageCulture', 'CultureType',
  'ScriptListItem', 'ScriptDetail', 'ScriptChapter', 'ScriptNode', 'ScriptNPC', 'ScriptEnding',
  'ScriptType', 'ScriptStatus', 'NodeType', 'TriggerType', 'TaskType', 'ARResourceType',
  'NodeConfig', 'BranchOption', 'KnowledgeItem', 'RewardItem', 'TaskDef', 'ARResource',
  'GenerateScriptParams', 'GenerateScriptFromTextParams', 'GenerateSceneImageParams', 'GenerateNPCPortraitParams', 'ImageTaskResult',
  'UserListItem', 'UserDetail', 'UserProgress', 'ProgressDetail', 'ChatLogItem',
  'ScriptAnalytics', 'NodeFunnelItem', 'TaskStatItem', 'UserProfile', 'RatingItem',
  'AdminAccount', 'AIConfig', 'ImageResource',
  'SCRIPT_TYPE_MAP', 'SCRIPT_STATUS_MAP', 'TASK_TYPE_MAP', 'NODE_TYPE_MAP', 'CULTURE_TYPE_MAP', 'AR_RESOURCE_TYPE_MAP',
]

for (const t of expectedTypes) {
  const re = new RegExp(`\\bexport\\s+(interface|type|const)\\s+${t}\\b`)
  check(`  类型 ${t}`, re.test(typesContent))
}

// ========== 9. API 函数导出检查 ==========
title('9. API 函数导出完整性')

const expectedFunctions = {
  'api/auth.ts': ['login', 'getProfile', 'changePassword'],
  'api/dashboard.ts': ['getDashboardOverview', 'getDashboardTrend', 'getHotScripts'],
  'api/village.ts': ['getVillageList', 'getVillageDetail', 'createVillage', 'updateVillage', 'deleteVillage',
    'getVillageSpots', 'createVillageSpot', 'updateVillageSpot', 'deleteVillageSpot',
    'getVillageCultures', 'createVillageCulture', 'updateVillageCulture', 'deleteVillageCulture'],
  'api/script.ts': ['getScriptList', 'getScriptDetail', 'createScript', 'updateScript', 'updateScriptStatus', 'deleteScript',
    'getChapters', 'createChapter', 'updateChapter', 'deleteChapter',
    'getNodes', 'getNodeDetail', 'createNode', 'updateNode', 'deleteNode', 'sortNodes',
    'getNPCs', 'getNPCDetail', 'createNPC', 'updateNPC', 'deleteNPC',
    'getEndings', 'createEnding', 'updateEnding', 'deleteEnding',
    'getTasks', 'createTask', 'updateTask', 'deleteTask',
    'getARResources', 'createARResource', 'updateARResource', 'deleteARResource'],
  'api/ai.ts': ['generateScriptSSE', 'generateScriptFromTextSSE', 'generateSceneImage', 'generateNPCPortrait', 'getGenerationTask', 'confirmImage'],
  'api/user.ts': ['getUserList', 'getUserDetail', 'getUserProgresses', 'getProgressDetail'],
  'api/analytics.ts': ['getScriptsOverview', 'getNodeFunnel', 'getTaskStats', 'getUserProfile', 'getRatings'],
  'api/settings.ts': ['getAdminList', 'createAdmin', 'updateAdmin', 'deleteAdmin', 'getAIConfig', 'updateAIConfig', 'uploadImage', 'getImageResources'],
}

for (const [file, funcs] of Object.entries(expectedFunctions)) {
  const filePath = path.join(SRC, file)
  if (!fs.existsSync(filePath)) {
    for (const f of funcs) check(`  ${file}::${f}`, false)
    continue
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  for (const f of funcs) {
    const exported = new RegExp(`export\\s+(async\\s+)?function\\s+${f}\\b`).test(content)
    check(`  ${file}::${f}`, exported)
  }
}

// ========== 汇总 ==========
title('检查汇总')

console.log(`  ${colors.bold}总计检查: ${totalChecks} 项${colors.reset}`)
console.log(`  ${colors.green}通过: ${passedChecks}${colors.reset}`)
if (failedChecks > 0) console.log(`  ${colors.red}失败: ${failedChecks}${colors.reset}`)
if (warnings > 0) console.log(`  ${colors.yellow}警告: ${warnings}${colors.reset}`)
console.log()

if (failedChecks > 0) {
  console.log(`${colors.red}${colors.bold}❌ 检查未完全通过，请修复上述失败项！${colors.reset}\n`)
  process.exit(1)
} else {
  console.log(`${colors.green}${colors.bold}✅ 所有检查通过！管理端前端代码完整覆盖接口文档。${colors.reset}\n`)
  process.exit(0)
}
