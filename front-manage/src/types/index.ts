// ============================================================
// 全局类型定义
// ============================================================

// --- 通用响应 ---
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedData<T> {
  total: number
  page: number
  pageSize: number
  list: T[]
}

export interface ListData<T> {
  list: T[]
}

// --- 认证 ---
export interface AdminInfo {
  adminId: string
  username: string
  nickname: string
  avatar: string
  role: 'super_admin' | 'admin'
  lastLoginAt?: string
}

export interface LoginResult {
  token: string
  expireAt: string
  admin: AdminInfo
}

// --- 仪表盘 ---
export interface DashboardOverview {
  villageCount: number
  scriptCount: number
  publishedScriptCount: number
  userCount: number
  todayExperienceCount: number
  todayOnlineCount: number
  avgRating: number
  totalExperienceCount: number
}

export interface TrendItem {
  date: string
  count: number
}

export interface DashboardTrend {
  dailyActive: TrendItem[]
  dailyComplete: TrendItem[]
}

export interface HotScript {
  scriptId: string
  title: string
  villageName: string
  experienceCount: number
  rating: number
  completionRate: number
}

// --- 乡村 ---
export interface Village {
  villageId: string
  name: string
  description: string
  coverImage: string
  lat: number
  lng: number
  address: string
  tags: string[]
  createdAt: string
  updatedAt?: string
}

export interface VillageListItem extends Village {
  spotCount: number
  cultureCount: number
  scriptCount: number
}

export interface VillageSpot {
  spotId: string
  name: string
  lat: number
  lng: number
  description: string
  images: string[]
  sortOrder: number
}

export type CultureType = 'history' | 'intangible' | 'legend'

export interface VillageCulture {
  cultureId: string
  villageId: string
  type: CultureType
  title: string
  content: string
}

// --- 剧本 ---
export type ScriptType = 'mystery' | 'history' | 'family'
export type ScriptStatus = 'draft' | 'published' | 'offline'
export type NodeType = 'dialogue' | 'task_hub' | 'ending'
export type TriggerType = 'gps' | 'auto' | 'manual'
export type TaskType = 'gps_checkin' | 'puzzle' | 'photo' | 'choice' | 'ar_scan'
export type ARResourceType = 'recognition_image' | 'collectable' | 'npc_model'

export interface ScriptListItem {
  scriptId: string
  title: string
  coverImage: string
  villageName: string
  type: ScriptType
  typeLabel: string
  difficulty: number
  estimatedDuration: number
  status: ScriptStatus
  rating: number
  experienceCount: number
  chapterCount: number
  nodeCount: number
  updatedAt: string
}

export interface BranchOption {
  id: string
  label: string
  nextNodeId: string
}

export interface NodeConfig {
  nextNodes: string[]
  hasBranch: boolean
  branchPrompt?: string
  branchOptions?: BranchOption[]
}

export interface RewardItem {
  itemId: string
  name: string
  icon: string
  description: string
  type: 'clue' | 'key' | 'tool'
}

export interface TaskDef {
  taskId: string
  type: TaskType
  title: string
  description: string
  answer: string | null
  retryHint: string | null
  rewardItem: RewardItem | null
  targetLat: number | null
  targetLng: number | null
  targetRadius: number
  arResourceId: string | null
}

export interface ScriptNode {
  nodeId: string
  title: string
  type: NodeType
  sceneImage: string | null
  sceneAudio: string | null
  triggerType: TriggerType
  triggerLat: number | null
  triggerLng: number | null
  triggerRadius: number
  dialoguePrompt: string | null
  npcId: string | null
  config: NodeConfig
  sortOrder: number
  tasks: TaskDef[]
}

export interface ScriptChapter {
  chapterId: string
  title: string
  sortOrder: number
  nodes: ScriptNode[]
}

export interface KnowledgeItem {
  topic: string
  content: string
  unlockCondition: string
}

export interface ScriptNPC {
  npcId: string
  name: string
  avatar: string
  role: string
  age: number
  personality: string
  description: string
  systemPrompt: string
  knowledgeBase: KnowledgeItem[]
  greeting: string
}

export interface ScriptEnding {
  endingId: string
  title: string
  description: string
  endingImage: string | null
  conditionDesc: string
}

export interface ScriptDetail {
  scriptId: string
  villageId: string
  villageName: string
  title: string
  coverImage: string
  type: ScriptType
  difficulty: number
  estimatedDuration: number
  storyline: string
  status: ScriptStatus
  chapters: ScriptChapter[]
  npcs: ScriptNPC[]
  endings: ScriptEnding[]
  createdAt: string
  updatedAt: string
}

export interface ARResource {
  resourceId: string
  nodeId: string
  type: ARResourceType
  name: string
  markerUrl: string
  markerPreview: string
  arucoId: number | null
  modelUrl: string | null
  overlayContent: any
  createdAt: string
}

// --- AI 生成 ---
export interface GenerateScriptParams {
  villageId: number
  type: ScriptType
  difficulty: number
  estimatedDuration: number
  extraRequirement?: string
}

export interface GenerateSceneImageParams {
  scriptId: string
  description: string
  style?: string
  aspectRatio?: '16:9' | '4:3' | '1:1'
}

export interface GenerateNPCPortraitParams {
  scriptId: string
  name: string
  gender: 'male' | 'female'
  age: number
  appearance: string
  personality?: string
  style?: string
}

export interface ImageTaskResult {
  taskId: string
  status: string
  images: { url: string }[]
}

// --- 用户 ---
export interface UserListItem {
  userId: string
  nickname: string
  avatar: string
  phone: string
  experienceCount: number
  completedCount: number
  createdAt: string
}

export interface UserDetail {
  userId: string
  nickname: string
  avatar: string
  phone: string
  experienceCount: number
  completedCount: number
  ratingCount: number
  createdAt: string
}

export interface UserProgress {
  progressId: string
  scriptId: string
  scriptTitle: string
  villageName: string
  status: 'playing' | 'completed'
  completedNodeCount: number
  totalNodeCount: number
  duration: number
  endingTitle: string
  startedAt: string
  completedAt: string | null
}

export interface ChatLogItem {
  npcName: string
  role: 'user' | 'npc'
  content: string
  createdAt: string
}

export interface ProgressDetail {
  progressId: string
  scriptTitle: string
  status: string
  completedNodeIds: string[]
  completedTaskIds: string[]
  items: any[]
  chatLogs: ChatLogItem[]
  startedAt: string
  completedAt: string | null
}

// --- 数据分析 ---
export interface ScriptAnalytics {
  scriptId: string
  title: string
  experienceCount: number
  completedCount: number
  completionRate: number
  avgDuration: number
  avgRating: number
  ratingCount: number
}

export interface NodeFunnelItem {
  nodeId: string
  title: string
  enterCount: number
  completeCount: number
  rate: number
}

export interface TaskStatItem {
  taskId: string
  title: string
  type: TaskType
  attemptCount: number
  passCount: number
  passRate: number
  avgAttempts: number
  avgDurationSeconds: number
}

export interface UserProfile {
  totalUsers: number
  activeUsers7d: number
  activeUsers30d: number
  scriptTypeDistribution: Record<string, number>
  avgScriptPerUser: number
  avgRatingPerUser: number
}

export interface RatingItem {
  ratingId: string
  userId: string
  userNickname: string
  scriptId: string
  scriptTitle: string
  rating: number
  createdAt: string
}

// --- 系统设置 ---
export interface AdminAccount {
  adminId: string
  username: string
  nickname: string
  role: 'super_admin' | 'admin'
  status: 'active' | 'disabled'
  lastLoginAt: string
  createdAt: string
}

export interface AIConfig {
  llmProvider: string
  llmModel: string
  llmApiKey: string
  llmTemperature: number
  llmMaxTokens: number
  imageProvider: string
  imageModel: string
  imageApiKey: string
  imageDefaultStyle: string
  imageDefaultSize: string
  imageNegativePrompt: string
}

export interface ImageResource {
  imageId: string
  url: string
  category: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

export interface AudioResource {
  audioId: string
  url: string
  category: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

// --- 通用查询参数 ---
export interface PageParams {
  page?: number
  pageSize?: number
}

export interface VillageListParams extends PageParams {
  keyword?: string
}

export interface ScriptListParams extends PageParams {
  villageId?: string
  type?: ScriptType
  status?: ScriptStatus
  keyword?: string
}

export interface UserListParams extends PageParams {
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface RatingListParams extends PageParams {
  scriptId?: string
  rating?: number
}

export interface ResourceListParams extends PageParams {
  category?: string
}

// --- 枚举映射 ---
export const DIFFICULTY_MAP: Record<number, string> = {
  1: '入门',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '挑战'
}

export const SCRIPT_TYPE_MAP: Record<string, string> = {
  mystery: '悬疑解谜',
  history: '历史文化',
  family: '亲子探险',
  couple: '情侣',
  team: '团建'
}

export const SCRIPT_STATUS_MAP: Record<ScriptStatus, string> = {
  draft: '草稿',
  published: '已发布',
  offline: '已下架'
}

export const TASK_TYPE_MAP: Record<TaskType, string> = {
  gps_checkin: '位置签到',
  puzzle: '解谜答题',
  photo: '拍照打卡',
  choice: '选择决策',
  ar_scan: 'AR扫描'
}

export const NODE_TYPE_MAP: Record<NodeType, string> = {
  dialogue: '对话',
  task_hub: '任务中心',
  ending: '结局'
}

export const CULTURE_TYPE_MAP: Record<CultureType, string> = {
  history: '历史',
  intangible: '非遗',
  legend: '传说'
}

export const AR_RESOURCE_TYPE_MAP: Record<ARResourceType, string> = {
  recognition_image: '识别图',
  collectable: '收集品',
  npc_model: 'NPC模型'
}

// --- AI 生成结果 ---
export interface ScriptGenerated {
  scriptId: string
  title: string
  type: ScriptType
  villageName: string
  difficulty: number
  estimatedDuration: number
  storyline: string
  chapterCount: number
  npcCount: number
  endingCount: number
}
