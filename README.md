# 沉浸式乡村文旅剧本创作与智能导览系统

基于 AI 的乡村文旅剧本创作平台，结合 AR 增强现实技术，为游客提供沉浸式互动导览体验。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | FastAPI (Python 3.10+) |
| 数据库 | MySQL 8.0 + SQLAlchemy 2.0 (异步) |
| 缓存 | Redis |
| 移动端 | uni-app (Vue 3) → H5 |
| AR 引擎 | A-Frame 1.2.0 + AR.js |
| AI 服务 | DeepSeek (剧本/NPC对话) + 智谱 GLM (图片生成) |
| 地图 | 高德地图 API |
| 存储 | 阿里云 OSS |

## 功能模块

- **剧本创作** — AI 根据乡村文化背景自动生成多分支互动剧本
- **AR 扫描** — 基于 ArUco 标记的 3D 模型叠加，支持道具收集
- **NPC 对话** — AI 驱动的沉浸式角色对话，支持上下文记忆
- **智能导览** — 地图导航 + 任务节点触发
- **管理后台** — 剧本管理、数据分析、用户统计

## 项目结构

```
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/       # 管理端接口
│   │   │   └── mobile/      # 移动端接口
│   │   ├── models/          # 数据库模型
│   │   ├── services/        # 业务服务 (AI/OSS/地图)
│   │   └── utils/           # 工具函数
│   ├── static/              # 静态资源 (AR引擎/模型/标记)
│   └── tests/               # 测试用例
├── front-client/            # uni-app 移动端
│   ├── pages/
│   │   ├── ar-scan/         # AR 扫描页
│   │   └── play/            # 剧本游玩页
│   └── utils/               # API 封装
├── front-manage/            # 管理后台前端
└── 设计文档/                 # 需求/接口/数据库文档
```

## 快速开始

### 环境要求

- Python 3.10+
- MySQL 8.0+
- Redis 6.0+
- Node.js 18+

### 1. 克隆项目

```bash
git clone https://github.com/LLLHF26/2026_7_1.git
cd 2026_7_1
```

### 2. 后端配置

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 复制环境配置（填入实际密钥）
cp .env.example .env
```

### 3. 初始化数据库

```bash
mysql -u root -p < rural_tourism.sql
```

### 4. 启动后端

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. 启动移动端

```bash
cd front-client
npm install
npm run dev:h5
```

访问 http://localhost:8080 即可使用。

## 环境变量

复制 `backend/.env.example` 为 `backend/.env`，按需配置：

| 变量 | 说明 |
|------|------|
| `DB_*` | MySQL 数据库连接 |
| `REDIS_*` | Redis 连接 |
| `SCRIPT_LLM_*` | DeepSeek 剧本生成配置 |
| `CHAT_LLM_*` | DeepSeek NPC 对话配置 |
| `IMAGE_LLM_*` | 智谱 AI 图片生成配置 |
| `OSS_*` | 阿里云 OSS 存储配置 |
| `MAP_API_KEY` | 高德地图 API Key |

## License

MIT
