<template>
  <div class="script-editor" v-loading="pageLoading">
    <!-- ==================== 顶部工具栏（暗底装饰条） ==================== -->
    <div class="top-bar">
      <div class="top-left">
        <el-button text class="back-btn" @click="router.back()">
          <AppIcon name="arrowLeft" :size="18" />
        </el-button>
        <div class="top-title-section">
          <div class="top-title-row">
            <template v-if="isNew">
              <h2>新建剧本</h2>
            </template>
            <template v-else-if="scriptDetail">
              <input
                v-model="scriptDetail.title"
                class="script-title-input"
                placeholder="剧本名称"
                @blur="handleSaveTitle"
              />
            </template>
            <template v-if="scriptDetail">
              <el-tag
                :type="statusTagType"
                size="large"
                class="status-tag"
              >
                {{ SCRIPT_STATUS_MAP[scriptDetail.status] || '' }}
              </el-tag>
            </template>
          </div>
          <div class="top-meta" v-if="scriptDetail && !isNew">
            <span class="meta-item">所属乡村：<b>{{ scriptDetail.villageName }}</b></span>
            <el-divider direction="vertical" />
            <span class="meta-item">类型：<b>{{ SCRIPT_TYPE_MAP[scriptDetail.type] }}</b></span>
          </div>
        </div>
      </div>
      <div class="top-actions">
        <el-dropdown @command="handleStatusChange" style="margin-right:8px">
          <el-button>
            变更状态 <AppIcon name="arrowDown" :size="12" style="margin-left:4px;vertical-align:middle" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(label, key) in SCRIPT_STATUS_MAP"
                :key="key"
                :command="key"
                :disabled="scriptDetail?.status === key"
              >
                {{ label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button class="btn-ink" @click="openBasicInfoDialog" v-if="!isNew">保存基本信息</el-button>
        <el-button class="btn-celadon" @click="openBasicInfoDialog" v-if="isNew">创建剧本</el-button>
        <el-button text style="color:var(--tea-100)" @click="router.push('/script/list')">返回列表</el-button>
      </div>
    </div>

    <!-- ==================== 主体三栏布局 ==================== -->
    <div class="main-body">
      <!-- 左侧：章节树管理 -->
      <div class="left-panel" :class="{ collapsed: leftCollapsed }">
        <div class="left-header">
          <span v-show="!leftCollapsed" class="map-title"><AppIcon name="chapterMap" :size="16" style="margin-right:6px" />章节管理</span>
          <el-button text @click="leftCollapsed = !leftCollapsed" class="collapse-btn">
            <AppIcon :name="leftCollapsed ? 'expand' : 'fold'" :size="16" />
          </el-button>
        </div>
        <div class="left-tree" v-show="!leftCollapsed">
          <el-tree
            ref="treeRef"
            :data="treeData"
            node-key="id"
            default-expand-all
            highlight-current
            :props="{ class: treeNodeClassFn }"
            @node-click="handleTreeNodeClick"
          >
            <template #default="{ data }">
              <div
                class="tree-node-content"
                :class="{
                  'node-dialogue': !data.isChapter && data.nodeType === 'dialogue',
                  'node-task-hub': !data.isChapter && data.nodeType === 'task_hub',
                  'node-ending': !data.isChapter && data.nodeType === 'ending',
                }"
              >
                <span class="tree-node-icon">
                  <template v-if="data.isChapter"><AppIcon name="folder" :size="14" class="btn-icon" /></template>
                  <template v-else-if="data.nodeType === 'dialogue'"><AppIcon name="dialogue" :size="14" class="btn-icon" /></template>
                  <template v-else-if="data.nodeType === 'task_hub'"><AppIcon name="taskHub" :size="14" class="btn-icon" /></template>
                  <template v-else-if="data.nodeType === 'ending'"><AppIcon name="ending" :size="14" class="btn-icon" /></template>
                  <template v-else><AppIcon name="document" :size="14" class="btn-icon" /></template>
                </span>
                <div class="tree-node-info">
                  <span class="tree-node-label" :class="{ 'is-chapter': data.isChapter }">
                    {{ data.label }}
                  </span>
                  <span v-if="data.npcName && !data.isChapter" class="tree-node-npc">
                    {{ data.npcName }}
                  </span>
                </div>
                <span v-if="data.isChapter" class="tree-node-count">
                  ({{ data.children?.length || 0 }})
                </span>
                <span class="tree-node-actions" @click.stop>
                  <el-button
                    v-if="data.isChapter"
                    text
                    size="small"
                    @click="openNodeDialog(data)"
                    title="新增节点"
                  >
                    <AppIcon name="plus" :size="14" class="btn-icon" />
                  </el-button>
                  <el-button
                    text
                    size="small"
                    :type="data.isChapter ? '' : 'danger'"
                    @click="data.isChapter ? handleDeleteChapter(data) : handleDeleteNode(data)"
                    title="删除"
                  >
                    <AppIcon name="delete" :size="14" class="btn-icon" />
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
          <div class="tree-add-chapter">
            <el-button class="btn-celadon" size="small" style="width:100%" @click="openChapterDialog()">
              <AppIcon name="plus" :size="14" class="btn-icon" /> 新增章节
            </el-button>
          </div>
        </div>
      </div>

      <!-- 中间：剧本树状结构 -->
      <div class="center-panel">
        <div class="outline-header">
          <span class="outline-title"><AppIcon name="chapterMap" :size="16" style="margin-right:6px" />剧本结构总览</span>
        </div>
        <div class="outline-tree">
          <div class="tree-diagram">
            <template v-for="ch in scriptDetail?.chapters" :key="ch.chapterId">
              <div class="tree-chapter">
                <!-- 章节标题栏 -->
                <div class="chapter-bar">
                  <span class="chapter-icon"><AppIcon name="folder" :size="16" /></span>
                  <span class="chapter-title">{{ ch.title }}</span>
                  <span class="chapter-meta">{{ ch.nodes?.length || 0 }}节点</span>
                </div>

                <!-- 连线：竖线从章节中心落到节点横线 -->
                <div class="vline-drop" v-if="ch.nodes?.length"></div>

                <!-- 节点卡片行（inline-flex 使横线精确对齐） -->
                <div class="chapter-nodes" v-if="ch.nodes?.length">
                  <div
                    v-for="n in ch.nodes"
                    :key="n.nodeId"
                    class="node-card"
                    :class="{
                      'node-card-dialogue': n.type === 'dialogue',
                      'node-card-taskhub': n.type === 'task_hub',
                      'node-card-ending': n.type === 'ending',
                      'node-card-selected': currentNode?.nodeId === n.nodeId
                    }"
                    @click="handleTreeNodeClick({ isChapter: false, nodeId: n.nodeId, chapterId: ch.chapterId } as any)"
                  >
                    <div class="node-card-header">
                      <span class="node-card-type-icon">
                        <AppIcon v-if="n.type === 'dialogue'" name="dialogue" :size="14" />
                        <AppIcon v-else-if="n.type === 'task_hub'" name="taskHub" :size="14" />
                        <AppIcon v-else-if="n.type === 'ending'" name="ending" :size="14" />
                        <AppIcon v-else name="document" :size="14" />
                      </span>
                      <span class="node-card-type-label">{{ NODE_TYPE_MAP[n.type] || n.type }}</span>
                    </div>
                    <div class="node-card-title">{{ n.title }}</div>
                    <div class="node-card-footer">
                      <span v-if="n.tasks?.length" class="node-badge task-badge">
                        <AppIcon name="taskHub" :size="10" /> {{ n.tasks.length }}任务
                      </span>
                      <span v-if="n.config?.hasBranch" class="node-badge branch-badge">
                        <AppIcon name="branch" :size="10" /> 分支
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 空章节 -->
                <div class="chapter-nodes-empty" v-else>
                  <span>暂无节点，请在左侧树中新增</span>
                </div>
              </div>
            </template>

            <!-- 无章节 -->
            <div class="tree-diagram-empty" v-if="!scriptDetail?.chapters?.length">
              <AppIcon name="folder" :size="36" />
              <span>请在左侧新增章节开始构建剧本</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：属性面板（360px，分组折叠） -->
      <div class="right-panel" v-if="currentNode">
        <div class="panel-scroll">
          <el-collapse v-model="activeCollapse" class="property-collapse">
            <!-- 面板1：节点属性 -->
            <el-collapse-item title=" 节点属性" name="basic">
              <el-form
                ref="nodeBasicFormRef"
                :model="nodeBasicForm"
                label-width="80px"
                label-position="top"
                class="compact-form"
                size="small"
              >
                <el-form-item label="标题">
                  <el-input v-model="nodeBasicForm.title" />
                </el-form-item>
                <el-form-item label="类型">
                  <el-select v-model="nodeBasicForm.type" style="width:100%">
                    <el-option
                      v-for="(label, key) in NODE_TYPE_MAP"
                      :key="key"
                      :label="label"
                      :value="key"
                    />
                  </el-select>
                </el-form-item>
                <el-row :gutter="8">
                  <el-col :span="12">
                    <el-form-item label="场景图">
                      <div class="media-actions">
                        <el-upload
                          :show-file-list="false"
                          :before-upload="beforeImageUpload"
                          :http-request="(ops:any) => uploadAndSet(ops.file, 'sceneImage', (url) => { nodeBasicForm.sceneImage = url })"
                          accept="image/*"
                        >
                          <el-button :loading="imageUploading['sceneImage']" type="primary" size="small">上传</el-button>
                        </el-upload>
                        <AiImageBtn placeholder="描绘场景图，如：古村石桥，月光下..." @generated="url => nodeBasicForm.sceneImage = url" />
                        <ImageLibraryPicker @select="url => nodeBasicForm.sceneImage = url" />
                      </div>
                      <div v-if="nodeBasicForm.sceneImage" class="media-preview">
                        <img :src="nodeBasicForm.sceneImage" />
                        <el-button link type="danger" size="small" @click="nodeBasicForm.sceneImage = ''">移除</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="背景音">
                      <div class="media-actions">
                        <AudioLibraryPicker @select="url => nodeBasicForm.sceneAudio = url" />
                      </div>
                      <div v-if="nodeBasicForm.sceneAudio" class="media-preview">
                        <audio :src="nodeBasicForm.sceneAudio" controls />
                        <el-button link type="danger" size="small" @click="nodeBasicForm.sceneAudio = ''">移除</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="触发方式">
                  <el-radio-group v-model="nodeBasicForm.triggerType">
                    <el-radio value="gps">GPS定位</el-radio>
                    <el-radio value="auto">自动触发</el-radio>
                    <el-radio value="manual">手动触发</el-radio>
                  </el-radio-group>
                </el-form-item>
                <template v-if="nodeBasicForm.triggerType === 'gps'">
                  <el-row :gutter="8">
                    <el-col :span="12">
                      <el-form-item label="经度">
                        <el-input-number
                          v-model="nodeBasicForm.triggerLng"
                          :precision="6"
                          style="width:100%"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="纬度">
                        <el-input-number
                          v-model="nodeBasicForm.triggerLat"
                          :precision="6"
                          style="width:100%"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="触发半径(米)">
                    <el-input-number
                      v-model="nodeBasicForm.triggerRadius"
                      :min="1"
                      style="width:100%"
                      controls-position="right"
                    />
                  </el-form-item>
                </template>
                <el-form-item label="关联NPC">
                  <el-select
                    v-model="nodeBasicForm.npcId"
                    style="width:100%"
                    clearable
                    filterable
                    placeholder="选择NPC"
                  >
                    <el-option
                      v-for="npc in npcList"
                      :key="npc.npcId"
                      :label="`${npc.name} (${npc.role})`"
                      :value="npc.npcId"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="AI开场提示词" class="ai-field">
                  <div class="ai-input-wrap">
                    <el-input
                      v-model="nodeBasicForm.dialoguePrompt"
                      type="textarea"
                      :rows="3"
                      placeholder="NPC开场对话提示词"
                      maxlength="500"
                      show-word-limit
                    />
                    <el-button
                      size="small"
                      text
                      type="warning"
                      class="ai-btn"
                      @click="handleAIGenerate('dialoguePrompt')"
                    ><AppIcon name="wand" :size="12" class="btn-icon" /> AI</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </el-collapse-item>

            <!-- 面板2：分支配置 -->
            <el-collapse-item title=" 分支配置" name="branch">
              <el-form label-width="80px" label-position="top" class="compact-form" size="small">
                <el-form-item label="启用分支">
                  <el-switch v-model="branchForm.hasBranch" class="celadon-switch" />
                </el-form-item>
                <template v-if="branchForm.hasBranch">
                  <el-form-item label="分支提示词" class="ai-field">
                    <div class="ai-input-wrap">
                      <el-input
                        v-model="branchForm.branchPrompt"
                        type="textarea"
                        :rows="2"
                        placeholder="AI分支生成提示词"
                      />
                      <el-button
                        size="small"
                        text
                        type="warning"
                        class="ai-btn"
                        @click="handleAIGenerate('branchPrompt')"
                      ><AppIcon name="wand" :size="12" class="btn-icon" /> AI</el-button>
                    </div>
                  </el-form-item>
                  <el-form-item label="分支选项">
                    <div class="branch-options-list">
                      <div
                        v-for="(opt, idx) in branchForm.branchOptions"
                        :key="idx"
                        class="branch-option-row"
                      >
                        <el-input
                          v-model="opt.id"
                          placeholder="选项ID"
                          size="small"
                        />
                        <el-input
                          v-model="opt.label"
                          placeholder="选项文本"
                          size="small"
                        />
                        <el-select
                          v-model="opt.nextNodeId"
                          placeholder="下一节点"
                          size="small"
                          filterable
                          style="width:130px"
                        >
                          <el-option
                            v-for="n in allNodes"
                            :key="n.nodeId"
                            :label="n.title"
                            :value="n.nodeId"
                          />
                        </el-select>
                        <el-button
                          type="danger"
                          size="small"
                          text
                          @click="branchForm.branchOptions.splice(idx, 1)"
                        >
                          <AppIcon name="delete" :size="14" class="btn-icon" />
                        </el-button>
                      </div>
                      <el-button
                        class="btn-celadon"
                        size="small"
                        text
                        @click="addBranchOption"
                      >
                        <AppIcon name="plus" :size="14" class="btn-icon" /> 添加分支
                      </el-button>
                    </div>
                  </el-form-item>
                </template>
                <el-form-item>
                  <el-button class="btn-ink" size="small" @click="saveNodeBranch" style="width:100%">
                    <AppIcon name="save" :size="14" class="btn-icon" /> 保存分支
                  </el-button>
                </el-form-item>
              </el-form>
            </el-collapse-item>

            <!-- 面板3：任务管理 -->
            <el-collapse-item title=" 任务管理" name="tasks">
              <div class="task-section">
                <div class="section-header">
                  <span>关联任务 ({{ currentNode.tasks?.length || 0 }})</span>
                  <el-button size="small" class="btn-celadon" text @click="openTaskDialog()">
                    <AppIcon name="plus" :size="14" class="btn-icon" />
                  </el-button>
                </div>
                <el-table
                  :data="currentNode.tasks"
                  border
                  size="small"
                  max-height="300"
                  style="width:100%"
                >
                  <el-table-column label="类型" width="80">
                    <template #default="{ row }">
                      <el-tag size="small" type="info">
                        {{ TASK_TYPE_MAP[row.type as TaskType] }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="title" label="标题" min-width="100" show-overflow-tooltip />
                  <el-table-column label="操作" width="110" fixed="right">
                    <template #default="{ row }">
                      <div class="manage-card-actions">
                        <button class="btn-link" @click="openTaskDialog(row)">编辑</button>
                        <button class="btn-link danger" @click="handleDeleteTask(row)">删除</button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-collapse-item>

            <!-- 保存节点按钮 -->
            <div style="padding: 8px 0 0;">
              <button class="btn-celadon btn-action" @click="saveNodeBasic">
                <AppIcon name="save" :size="14" /> 保存节点
              </button>
            </div>
          </el-collapse>

          <!-- 底部固定操作栏 -->
          <div class="panel-footer">
            <button class="btn-ink-danger btn-action" @click="handleDeleteNode(currentNode)">
              <AppIcon name="delete" :size="14" /> 删除节点
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：剧本管理面板（始终展开） -->
      <div class="right-panel" v-else-if="!isNew">
        <div class="panel-scroll">
          <div class="quick-panel">
            <h4 class="quick-title"><AppIcon name="book" :size="16" class="btn-icon" /> 剧本管理</h4>

            <!-- 剧本操作 -->
            <div class="action-group row">
              <button class="btn-ink btn-action" @click="openBasicInfoDialog">
                <AppIcon name="edit" :size="14" /> 编辑
              </button>
              <button class="btn-ink-danger btn-action" @click="handleDeleteScript">
                <AppIcon name="cross" :size="14" /> 删除
              </button>
            </div>

            <el-divider />

            <!-- 内容管理 -->
            <div class="action-group">
              <div class="section-label">内容管理</div>

              <!-- NPC 管理 -->
              <button class="btn-ink btn-action" @click="npcExpanded = !npcExpanded">
                <AppIcon name="npc" :size="14" /> NPC管理 ({{ npcList.length }})
                <AppIcon :name="npcExpanded ? 'arrowUp' : 'arrowDown'" :size="12" style="margin-left:auto" />
              </button>
              <div v-if="npcExpanded" class="expand-section">
                <div class="expand-header">
                  <span>NPC 列表 ({{ npcList.length }})</span>
                  <button class="btn-link" @click="openNPCDialog()"><AppIcon name="plus" :size="12" /> 新增</button>
                </div>
                <div v-for="npc in npcList" :key="npc.npcId" class="manage-card">
                  <div class="manage-card-info">
                    <el-avatar :src="npc.avatar" :size="36">{{ npc.name[0] }}</el-avatar>
                    <div class="manage-card-text">
                      <div class="manage-card-name">{{ npc.name }}</div>
                      <div class="manage-card-role">{{ npc.role }}</div>
                    </div>
                  </div>
                  <div class="manage-card-actions">
                    <button class="btn-link" @click="openNPCDialog(npc)">编辑</button>
                    <button class="btn-link danger" @click="handleDeleteNPC(npc)">删除</button>
                  </div>
                </div>
                <el-empty v-if="npcList.length === 0" description="暂无NPC" :image-size="48" />
              </div>

              <!-- 结局管理 -->
              <button class="btn-celadon btn-action" @click="endingExpanded = !endingExpanded">
                <AppIcon name="ending" :size="14" /> 结局管理 ({{ endingList.length }})
                <AppIcon :name="endingExpanded ? 'arrowUp' : 'arrowDown'" :size="12" style="margin-left:auto" />
              </button>
              <div v-if="endingExpanded" class="expand-section">
                <div class="expand-header">
                  <span>结局列表 ({{ endingList.length }})</span>
                  <button class="btn-link" @click="openEndingDialog()"><AppIcon name="plus" :size="12" /> 新增</button>
                </div>
                <div v-for="ed in endingList" :key="ed.endingId" class="manage-card">
                  <div class="manage-card-info">
                    <div class="manage-card-text">
                      <div class="manage-card-name">{{ ed.title }}</div>
                      <div class="manage-card-desc">{{ ed.description }}</div>
                    </div>
                  </div>
                  <div class="manage-card-actions">
                    <button class="btn-link" @click="openEndingDialog(ed)">编辑</button>
                    <button class="btn-link danger" @click="handleDeleteEnding(ed)">删除</button>
                  </div>
                </div>
                <el-empty v-if="endingList.length === 0" description="暂无结局" :image-size="48" />
              </div>

              <!-- AR 资源管理 -->
              <button class="btn-action btn-action-default" @click="arManageVisible = true">
                <AppIcon name="ar" :size="14" /> AR资源管理 ({{ arResourceList.length }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：新建剧本引导 -->
      <div class="right-panel" v-else-if="isNew">
        <div class="panel-scroll">
          <div class="quick-panel">
            <h4 class="quick-title"><AppIcon name="scriptEditor" :size="18" class="btn-icon" /> 创建你的剧本</h4>
            <p class="quick-desc">第一步：填写剧本基本信息</p>
            <el-button
              class="btn-ink"
              size="small"
              style="width:100%;margin-bottom:12px"
              @click="openBasicInfoDialog"
            >
              <AppIcon name="edit" :size="14" class="btn-icon" /> 填写基本信息
            </el-button>
            <p class="quick-desc">创建完成后即可：</p>
            <div class="guide-tips" style="text-align:left;margin-top:8px">
              <div class="guide-tip">
                <span><AppIcon name="folder" :size="14" class="btn-icon" /> 章节管理</span> — 组织剧本的故事结构
              </div>
              <div class="guide-tip">
                <span><AppIcon name="dialogue" :size="14" class="btn-icon" /> 节点编辑</span> — 设置对话、任务与结局
              </div>
              <div class="guide-tip">
                <span><AppIcon name="npc" :size="14" class="btn-icon" /> NPC塑造</span> — 创建角色并配置AI对话
              </div>
              <div class="guide-tip">
                <span><AppIcon name="ending" :size="14" class="btn-icon" /> 结局设计</span> — 设定故事的多重结局
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：剧本基本信息 ==================== -->
    <el-dialog
      v-model="basicInfoDialogVisible"
      :title="isNew ? '创建剧本' : '编辑剧本基本信息'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="basicInfoFormRef" :model="basicInfoForm" :rules="basicInfoRules" label-width="100px">
        <el-form-item label="剧本标题" required>
          <el-input v-model="basicInfoForm.title" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="剧本类型">
              <el-select v-model="basicInfoForm.type" style="width:100%">
                <el-option
                  v-for="(label, key) in SCRIPT_TYPE_MAP"
                  :key="key"
                  :label="label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属乡村" prop="villageId">
              <el-select v-model="basicInfoForm.villageId" style="width:100%">
                <el-option
                  v-for="v in villageList"
                  :key="v.villageId"
                  :label="v.name"
                  :value="v.villageId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="难度">
              <el-select v-model="basicInfoForm.difficulty" style="width:100%">
                <el-option v-for="(label, key) in DIFFICULTY_MAP" :key="Number(key)" :label="label" :value="Number(key)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计时长(分钟)">
              <el-input-number v-model="basicInfoForm.estimatedDuration" :min="1" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="封面图">
          <div style="display:flex;align-items:center;gap:10px">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :http-request="(ops:any) => uploadAndSet(ops.file, 'coverImage', (url) => { basicInfoForm.coverImage = url })"
              accept="image/*"
            >
              <el-button :loading="imageUploading['coverImage']" type="primary" size="small">上传封面图</el-button>
            </el-upload>
            <img v-if="basicInfoForm.coverImage" :src="basicInfoForm.coverImage" style="width:100px;height:64px;object-fit:cover;border-radius:6px;border:1px solid var(--tea-200)" />
            <el-button v-if="basicInfoForm.coverImage" link type="danger" size="small" @click="basicInfoForm.coverImage = ''">移除</el-button>
            <AiImageBtn placeholder="描绘剧本封面图..." @generated="url => basicInfoForm.coverImage = url" />
            <ImageLibraryPicker @select="url => basicInfoForm.coverImage = url" />
          </div>
        </el-form-item>
        <el-form-item label="故事主线">
          <el-input v-model="basicInfoForm.storyline" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="basicInfoDialogVisible = false">取消</el-button>
        <el-button class="btn-ink" @click="saveBasicInfo" :loading="basicSaving">保存</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 弹窗：章节编辑 ==================== -->
    <el-dialog
      v-model="chapterDialogVisible"
      :title="chapterEditing ? '编辑章节' : '新增章节'"
      width="460px"
      destroy-on-close
    >
      <el-form ref="chapterFormRef" :model="chapterForm" label-width="80px">
        <el-form-item label="章节标题" required>
          <el-input v-model="chapterForm.title" placeholder="输入章节标题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button class="btn-ink" @click="saveChapter" :loading="chapterSaving">保存</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 弹窗：新增节点 ==================== -->
    <el-dialog
      v-model="nodeDialogVisible"
      title="新增节点"
      width="460px"
      destroy-on-close
    >
      <el-form ref="nodeDialogFormRef" :model="nodeDialogForm" label-width="80px">
        <el-form-item label="节点标题" required>
          <el-input v-model="nodeDialogForm.title" placeholder="输入节点标题" />
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select v-model="nodeDialogForm.type" style="width:100%">
            <el-option
              v-for="(label, key) in NODE_TYPE_MAP"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nodeDialogVisible = false">取消</el-button>
        <el-button class="btn-ink" @click="createNodeInChapter" :loading="nodeSaving">创建</el-button>
      </template>
    </el-dialog>


    <!-- NPC 编辑弹窗 -->
    <el-dialog
      v-model="npcDialogVisible"
      :title="npcEditing ? '编辑NPC' : '新增NPC'"
      width="680px"
      destroy-on-close
    >
      <el-form ref="npcFormRef" :model="npcForm" label-width="100px" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="名称" required>
              <el-input v-model="npcForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色定位" required>
              <el-input v-model="npcForm.role" placeholder="例如: 村长、导游" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input-number v-model="npcForm.age" :min="1" :max="120" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性格">
              <el-input v-model="npcForm.personality" placeholder="例如: 热情、神秘" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input v-model="npcForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="头像">
          <div style="display:flex;align-items:center;gap:10px">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :http-request="(ops:any) => uploadAndSet(ops.file, 'npcAvatar', (url) => { npcForm.avatar = url })"
              accept="image/*"
            >
              <el-button :loading="imageUploading['npcAvatar']" type="primary" size="small">上传头像</el-button>
            </el-upload>
            <img v-if="npcForm.avatar" :src="npcForm.avatar" style="width:64px;height:64px;object-fit:cover;border-radius:50%;border:1px solid var(--tea-200)" />
            <el-button v-if="npcForm.avatar" link type="danger" size="small" @click="npcForm.avatar = ''">移除</el-button>
            <AiImageBtn placeholder="描绘NPC头像，如：慈祥的村长，白发长须..." @generated="url => npcForm.avatar = url" />
            <ImageLibraryPicker @select="url => npcForm.avatar = url" />
          </div>
        </el-form-item>
        <el-form-item label="SystemPrompt (必填)" class="ai-field">
          <div class="ai-input-wrap">
            <el-input
              v-model="npcForm.systemPrompt"
              type="textarea"
              :rows="4"
              placeholder="AI系统提示词，定义NPC行为"
            />
            <el-button
              size="small"
              text
              type="warning"
              class="ai-btn"
              @click="handleAIGenerate('npcSystemPrompt')"
            >✨ AI</el-button>
          </div>
        </el-form-item>
        <el-form-item label="开场白 (greeting)">
          <el-input v-model="npcForm.greeting" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="知识库">
          <div class="knowledge-list">
            <div
              v-for="(item, idx) in npcForm.knowledgeBase"
              :key="idx"
              class="knowledge-row"
            >
              <el-input v-model="item.topic" placeholder="主题" size="small" />
              <el-input v-model="item.content" placeholder="内容" size="small" />
              <el-input v-model="item.unlockCondition" placeholder="解锁条件" size="small" />
              <el-button type="danger" text size="small" @click="npcForm.knowledgeBase.splice(idx, 1)">
                <AppIcon name="delete" :size="14" class="btn-icon" />
              </el-button>
            </div>
            <el-button class="btn-celadon" text size="small" @click="addKnowledgeItem">
              <AppIcon name="plus" :size="14" class="btn-icon" /> 添加知识项
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="npcDialogVisible = false">取消</el-button>
        <el-button class="btn-ink" @click="saveNPC" :loading="npcSaving">保存</el-button>
      </template>
    </el-dialog>


    <!-- 结局编辑弹窗 -->
    <el-dialog
      v-model="endingDialogVisible"
      :title="endingEditing ? '编辑结局' : '新增结局'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="endingFormRef" :model="endingForm" label-width="110px" label-position="top">
        <el-form-item label="标题" required>
          <el-input v-model="endingForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="endingForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="达成条件描述">
          <el-input v-model="endingForm.conditionDesc" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="配图">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :http-request="(ops:any) => uploadAndSet(ops.file, 'endingImage', (url) => { endingForm.endingImage = url })"
              accept="image/*"
            >
              <el-button :loading="imageUploading['endingImage']" type="primary" size="small">上传</el-button>
            </el-upload>
            <img v-if="endingForm.endingImage" :src="endingForm.endingImage" style="width:60px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--tea-200)" />
            <el-button v-if="endingForm.endingImage" link type="danger" size="small" @click="endingForm.endingImage = ''">移除</el-button>
            <AiImageBtn placeholder="描绘结局配图..." @generated="url => endingForm.endingImage = url" />
            <ImageLibraryPicker @select="url => endingForm.endingImage = url" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="endingDialogVisible = false">取消</el-button>
        <el-button class="btn-ink" @click="saveEnding" :loading="endingSaving">保存</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 弹窗：AR 资源管理 ==================== -->
    <el-dialog
      v-model="arManageVisible"
      title="AR 资源管理"
      width="800px"
      destroy-on-close
    >
      <div class="section-header">
        <span>AR资源列表 ({{ arResourceList.length }})</span>
        <el-button class="btn-ink" size="small" @click="openARDialog()">
          <AppIcon name="plus" :size="14" class="btn-icon" /> 新增AR资源
        </el-button>
      </div>
      <el-table :data="arResourceList" border stripe size="small">
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ AR_RESOURCE_TYPE_MAP[row.type as ARResourceType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nodeId" label="关联节点" width="120" show-overflow-tooltip />
        <el-table-column prop="arucoId" label="ArUco" width="70" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.arucoId" type="success" size="small" effect="dark">{{ row.arucoId }}</el-tag>
            <span v-else style="color:#999">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="markerUrl" label="标记URL" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.markerUrl || '—' }}</span>
            <el-tag v-if="row.type === 'npc_model'" type="success" size="small" effect="plain" style="margin-left:4px">自动</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;justify-content:center;gap:8px">
              <el-button text type="primary" size="small" @click="arManageVisible = false; openARDialog(row)">
                编辑
              </el-button>
              <el-button text type="danger" size="small" @click="handleDeleteAR(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="arResourceList.length === 0" description="暂无AR资源" />
    </el-dialog>

    <!-- AR资源编辑弹窗 -->
    <el-dialog
      v-model="arDialogVisible"
      :title="arEditing ? '编辑AR资源' : '新增AR资源'"
      width="560px"
      destroy-on-close
      @closed="arManageVisible = true"
    >
      <el-form ref="arFormRef" :model="arForm" label-width="110px" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="名称" required>
              <el-input v-model="arForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" required>
              <el-select v-model="arForm.type" style="width:100%">
                <el-option
                  v-for="(label, key) in AR_RESOURCE_TYPE_MAP"
                  :key="key"
                  :label="label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="关联节点">
          <el-select v-model="arForm.nodeId" style="width:100%" clearable filterable>
            <el-option
              v-for="n in allNodes"
              :key="n.nodeId"
              :label="n.title"
              :value="n.nodeId"
            />
          </el-select>
        </el-form-item>
        <!-- npc_model：3D模型 + 自动标记 -->
        <template v-if="arForm.type === 'npc_model'">
          <el-form-item label="ArUco 标记">
            <el-alert
              v-if="arEditing"
              type="success"
              :closable="false"
              show-icon
              style="margin-bottom:0"
            >
              <template #title>
                自动生成 — ArUco ID: <b>#{{ editingArId }}</b>
              </template>
              标记图已保存为 <code>/static/markers/marker_{{ editingArId }}.png</code>
            </el-alert>
            <el-alert v-else type="info" :closable="false" show-icon style="margin-bottom:0">
              <template #title>保存后自动生成 ArUco 标记</template>
              系统将为该资源分配唯一 ArUco ID 并生成识别标记图
            </el-alert>
          </el-form-item>
          <el-form-item label="3D模型URL">
            <el-input v-model="arForm.modelUrl" placeholder="GLB/GLTF 模型地址（可选）" />
            <span style="font-size:11px;color:#999">不填则使用默认立方体+光环</span>
          </el-form-item>
        </template>

        <!-- recognition_image / collectable：手动上传标记图 -->
        <template v-else>
          <el-form-item label="识别标记图">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <el-upload
                :show-file-list="false"
                :before-upload="beforeImageUpload"
                :http-request="(ops:any) => uploadAndSet(ops.file, 'markerUrl', (url) => { arForm.markerUrl = url })"
                accept="image/*"
              >
                <el-button :loading="imageUploading['markerUrl']" type="primary" size="small">上传</el-button>
              </el-upload>
              <img v-if="arForm.markerUrl" :src="arForm.markerUrl" style="width:60px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--tea-200)" />
              <el-button v-if="arForm.markerUrl" link type="danger" size="small" @click="arForm.markerUrl = ''">移除</el-button>
              <AiImageBtn placeholder="描绘AR标记图..." @generated="url => arForm.markerUrl = url" />
            </div>
            <span style="font-size:11px;color:#999">用于图像匹配识别的目标图片</span>
          </el-form-item>
        </template>

        <el-form-item label="采集描述 (JSON)">
          <el-input
            v-model="arForm.overlayContent"
            type="textarea"
            :rows="3"
            placeholder='{"title":"道具名称","text":"道具描述","collectHint":"对准目标拍摄"}'
          />
          <span style="font-size:11px;color:#999">可选，显示在AR扫描页面上的文字信息</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="arDialogVisible = false">取消</el-button>
        <el-button class="btn-ink" @click="saveAR" :loading="arSaving">保存</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 弹窗：任务编辑 ==================== -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="taskEditing ? '编辑任务' : '新增任务'"
      width="620px"
      destroy-on-close
    >
      <el-form ref="taskFormRef" :model="taskForm" label-width="110px" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="任务标题" required>
              <el-input v-model="taskForm.title" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" required>
              <el-select v-model="taskForm.type" style="width:100%">
                <el-option
                  v-for="(label, key) in TASK_TYPE_MAP"
                  :key="key"
                  :label="label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任务描述">
          <el-input v-model="taskForm.description" type="textarea" :rows="2" />
        </el-form-item>

        <!-- 奖励道具 -->
        <el-divider content-position="left">奖励道具</el-divider>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="道具ID">
              <el-input v-model="taskForm.rewardItem.itemId" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="道具名称">
              <el-input v-model="taskForm.rewardItem.name" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="道具类型">
              <el-select v-model="taskForm.rewardItem.type" size="small" style="width:100%">
                <el-option label="线索" value="clue" />
                <el-option label="钥匙" value="key" />
                <el-option label="工具" value="tool" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="道具图标">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <el-upload
                  :show-file-list="false"
                  :before-upload="beforeImageUpload"
                  :http-request="(ops:any) => uploadAndSet(ops.file, 'rewardIcon', (url) => { taskForm.rewardItem.icon = url })"
                  accept="image/*"
                >
                  <el-button :loading="imageUploading['rewardIcon']" type="primary" size="small">上传</el-button>
                </el-upload>
                <img v-if="taskForm.rewardItem.icon" :src="taskForm.rewardItem.icon" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--tea-200)" />
                <el-button v-if="taskForm.rewardItem.icon" link type="danger" size="small" @click="taskForm.rewardItem.icon = ''">移除</el-button>
                <AiImageBtn placeholder="描绘道具图标...如：金色钥匙" @generated="url => taskForm.rewardItem.icon = url" />
                <ImageLibraryPicker @select="url => taskForm.rewardItem.icon = url" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道具描述">
              <el-input v-model="taskForm.rewardItem.description" size="small" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- puzzle 类型额外字段 -->
        <template v-if="taskForm.type === 'puzzle'">
          <el-divider content-position="left">解谜配置</el-divider>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="答案" required>
                <el-input v-model="taskForm.answer" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="答错提示">
                <el-input v-model="taskForm.retryHint" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- gps_checkin / ar_scan 类型地理位置字段 -->
        <template v-if="taskForm.type === 'gps_checkin' || taskForm.type === 'ar_scan'">
          <el-divider content-position="left">目标位置</el-divider>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="目标纬度">
                <el-input-number
                  v-model="taskForm.targetLat"
                  :precision="6"
                  style="width:100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="目标经度">
                <el-input-number
                  v-model="taskForm.targetLng"
                  :precision="6"
                  style="width:100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="半径(米)">
                <el-input-number
                  v-model="taskForm.targetRadius"
                  :min="1"
                  style="width:100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- ar_scan 额外字段 -->
        <template v-if="taskForm.type === 'ar_scan'">
          <el-divider content-position="left">AR关联</el-divider>
          <el-form-item label="AR资源ID">
            <el-select v-model="taskForm.arResourceId" style="width:100%" clearable filterable>
              <el-option
                v-for="ar in arResourceList"
                :key="ar.resourceId"
                :label="ar.name"
                :value="ar.resourceId"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button class="btn-ink" @click="saveTask" :loading="taskSaving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { uploadImage } from '@/api/settings'
import AiImageBtn from '@/components/common/AiImageBtn.vue'
import ImageLibraryPicker from '@/components/common/ImageLibraryPicker.vue'
import AudioLibraryPicker from '@/components/common/AudioLibraryPicker.vue'
import type {
  ScriptDetail, ScriptChapter, ScriptNode, ScriptNPC, ScriptEnding,
  TaskDef, ARResource, NodeType, TriggerType, TaskType, ARResourceType,
  ScriptType, ScriptStatus, BranchOption, KnowledgeItem, RewardItem,
  VillageListItem
} from '@/types'

// ==================== 图片上传 ====================
const imageUploading = reactive<Record<string, boolean>>({})

function beforeImageUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

async function uploadAndSet(file: File, key: string, setter: (url: string) => void, category = 'script') {
  imageUploading[key] = true
  try {
    const res = await uploadImage(file, category)
    if (res.data.code === 0) {
      setter(res.data.data.url)
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.data.message || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    imageUploading[key] = false
  }
}
import {
  SCRIPT_TYPE_MAP, SCRIPT_STATUS_MAP, DIFFICULTY_MAP, NODE_TYPE_MAP, TASK_TYPE_MAP, AR_RESOURCE_TYPE_MAP
} from '@/types'
import {
  getScriptDetail, createScript, updateScript, updateScriptStatus, deleteScript,
  createChapter, updateChapter, deleteChapter,
  createNode, updateNode, deleteNode,
  getNPCs, createNPC, updateNPC, deleteNPC,
  getEndings, createEnding, updateEnding, deleteEnding,
  createTask, updateTask, deleteTask,
  getARResources, createARResource, updateARResource, deleteARResource
} from '@/api/script'
import { getVillageList } from '@/api/village'
import { generateSceneImage, generateNPCPortrait, generateImage } from '@/api/ai'

// ==================== 路由 ====================
const route = useRoute()
const router = useRouter()
const scriptId = computed(() => route.params.id as string)
const isNew = computed(() => !scriptId.value || scriptId.value === 'new')

// 解析 AI 生成导入数据
const importedData = ref<any>(null)
if (route.query.data) {
  try {
    importedData.value = JSON.parse(decodeURIComponent(route.query.data as string))
  } catch { /* ignore */ }
}

// ==================== 基础状态 ====================
const pageLoading = ref(false)
const scriptDetail = ref<ScriptDetail | null>(null)
const leftCollapsed = ref(false)
const activeCollapse = ref<string[]>(['basic', 'branch', 'tasks'])
const treeRef = ref()

// ==================== 数据列表 ====================
const npcList = ref<ScriptNPC[]>([])
const endingList = ref<ScriptEnding[]>([])
const arResourceList = ref<ARResource[]>([])
const villageList = ref<VillageListItem[]>([])

// ==================== 树结构 ====================
interface TreeNode {
  id: string
  label: string
  isChapter: boolean
  children?: TreeNode[]
  chapterId?: string
  nodeId?: string
  nodeType?: NodeType
  npcName?: string
  taskCount?: number
  hasBranch?: boolean
}

const treeData = computed<TreeNode[]>(() => {
  if (!scriptDetail.value) return []
  return scriptDetail.value.chapters.map(ch => ({
    id: 'ch_' + ch.chapterId,
    label: ch.title,
    isChapter: true,
    chapterId: ch.chapterId,
    children: ch.nodes.map(n => ({
      id: 'n_' + n.nodeId,
      label: n.title,
      isChapter: false,
      nodeId: n.nodeId,
      nodeType: n.type,
      chapterId: ch.chapterId,
      npcName: n.npcId ? (npcList.value.find(npc => npc.npcId === n.npcId)?.name || '') : '',
      taskCount: n.tasks?.length || 0,
      hasBranch: n.config?.hasBranch || false
    }))
  }))
})

const allNodes = computed<ScriptNode[]>(() => {
  if (!scriptDetail.value) return []
  return scriptDetail.value.chapters.flatMap(ch => ch.nodes)
})

const totalChapterCount = computed(() => scriptDetail.value?.chapters.length || 0)
const totalNodeCount = computed(() => allNodes.value.length)

// ==================== 树节点自定义类名 ====================
function treeNodeClassFn(data: TreeNode) {
  if (data.isChapter) return 'tree-chapter-node'
  return 'tree-script-node'
}

// ==================== 当前选中节点 ====================
const currentNode = ref<ScriptNode | null>(null)

const currentNPC = computed(() => {
  if (!currentNode.value?.npcId || !npcList.value.length) return null
  return npcList.value.find(n => n.npcId === currentNode.value!.npcId) || null
})

const triggerTypeLabel = computed(() => {
  if (!currentNode.value) return ''
  switch (currentNode.value.triggerType) {
    case 'gps': return 'GPS定位触发'
    case 'auto': return '自动触发'
    case 'manual': return '手动触发'
    default: return ''
  }
})

function findNodeInData(nodeId: string): ScriptNode | null {
  if (!scriptDetail.value) return null
  for (const ch of scriptDetail.value.chapters) {
    const found = ch.nodes.find(n => n.nodeId === nodeId)
    if (found) return found
  }
  return null
}

function findChapterInData(chapterId: string): ScriptChapter | null {
  if (!scriptDetail.value) return null
  return scriptDetail.value.chapters.find(ch => ch.chapterId === chapterId) || null
}

function getNodeTitleById(nodeId: string): string {
  const node = allNodes.value.find(n => n.nodeId === nodeId)
  return node?.title || nodeId
}

// ==================== 树操作：点击 ====================
function handleChapterClick(_ch: any) {
  // 点击章节卡片，不触发编辑，节点行始终可见
}

function nodeX(total: number, index: number): string {
  if (total <= 1) return '50%'
  const pct = (index / (total - 1)) * 100
  return pct + '%'
}

function handleTreeNodeClick(data: TreeNode) {
  if (data.isChapter) return
  if (!data.nodeId) return
  const node = findNodeInData(data.nodeId)
  if (node) {
    currentNode.value = { ...node }
    loadNodeForms(node)
  }
}

// ==================== 节点基本信息表单 ====================
const nodeBasicForm = reactive({
  title: '',
  type: 'dialogue' as NodeType,
  sceneImage: '',
  sceneAudio: '',
  triggerType: 'auto' as TriggerType,
  triggerLat: null as number | null,
  triggerLng: null as number | null,
  triggerRadius: 50,
  npcId: '',
  dialoguePrompt: ''
})

const nodeBasicFormRef = ref()

function loadNodeForms(node: ScriptNode) {
  nodeBasicForm.title = node.title
  nodeBasicForm.type = node.type
  nodeBasicForm.sceneImage = node.sceneImage || ''
  nodeBasicForm.sceneAudio = node.sceneAudio || ''
  nodeBasicForm.triggerType = node.triggerType
  nodeBasicForm.triggerLat = node.triggerLat
  nodeBasicForm.triggerLng = node.triggerLng
  nodeBasicForm.triggerRadius = node.triggerRadius
  nodeBasicForm.npcId = node.npcId || ''
  nodeBasicForm.dialoguePrompt = node.dialoguePrompt || ''

  branchForm.hasBranch = node.config.hasBranch
  branchForm.branchPrompt = node.config.branchPrompt || ''
  branchForm.branchOptions = node.config.branchOptions
    ? node.config.branchOptions.map(b => ({ ...b }))
    : []
}

async function saveNodeBasic() {
  if (!currentNode.value) return
  try {
    await updateNode(scriptId.value, currentNode.value.nodeId, {
      title: nodeBasicForm.title,
      type: nodeBasicForm.type,
      sceneImage: nodeBasicForm.sceneImage || null,
      sceneAudio: nodeBasicForm.sceneAudio || null,
      triggerType: nodeBasicForm.triggerType,
      triggerLat: nodeBasicForm.triggerType === 'gps' ? nodeBasicForm.triggerLat : null,
      triggerLng: nodeBasicForm.triggerType === 'gps' ? nodeBasicForm.triggerLng : null,
      triggerRadius: nodeBasicForm.triggerRadius,
      npcId: nodeBasicForm.npcId || null,
      dialoguePrompt: nodeBasicForm.dialoguePrompt || null
    })
    ElMessage.success('节点信息已保存')
    await refreshChapters()
    const updated = findNodeInData(currentNode.value.nodeId)
    if (updated) {
      currentNode.value = { ...updated }
    }
  } catch {
    ElMessage.error('保存失败')
  }
}

// ==================== 分支配置表单 ====================
const branchForm = reactive({
  hasBranch: false,
  branchPrompt: '',
  branchOptions: [] as BranchOption[]
})

function addBranchOption() {
  branchForm.branchOptions.push({ id: '', label: '', nextNodeId: '' })
}

async function saveNodeBranch() {
  if (!currentNode.value) return
  try {
    await updateNode(scriptId.value, currentNode.value.nodeId, {
      config: {
        nextNodes: branchForm.hasBranch
          ? branchForm.branchOptions.map(b => b.nextNodeId).filter(Boolean)
          : [],
        hasBranch: branchForm.hasBranch,
        branchPrompt: branchForm.branchPrompt || undefined,
        branchOptions: branchForm.hasBranch ? branchForm.branchOptions : []
      }
    })
    ElMessage.success('分支配置已保存')
    await refreshChapters()
    const updated = findNodeInData(currentNode.value.nodeId)
    if (updated) {
      currentNode.value = { ...updated }
    }
  } catch {
    ElMessage.error('保存失败')
  }
}

// ==================== AI 生成占位 ====================
function handleAIGenerate(field: string) {
  console.log('[AI生成] 触发字段:', field)
  ElMessage.info(`AI生成功能即将上线 - 字段: ${field}`)
}

// ==================== 剧本基本信息弹窗 ====================
const basicInfoDialogVisible = ref(false)
const basicSaving = ref(false)
const basicInfoFormRef = ref<FormInstance>()
const basicInfoRules: FormRules = {
  title: [{ required: true, message: '请输入剧本标题', trigger: 'blur' }],
  villageId: [{ required: true, message: '请选择所属乡村', trigger: 'change' }],
  type: [{ required: true, message: '请选择剧本类型', trigger: 'change' }],
}
const basicInfoForm = reactive({
  title: '',
  type: 'mystery' as ScriptType,
  villageId: '',
  difficulty: 3,
  estimatedDuration: 60,
  coverImage: '',
  storyline: ''
})

function openBasicInfoDialog() {
  if (isNew.value) {
    const imp = importedData.value
    basicInfoForm.title = imp?.title || '新建剧本'
    basicInfoForm.type = imp?.type || 'mystery'
    basicInfoForm.villageId = imp?.villageId ? String(imp.villageId) : ((route.query.villageId as string) || '')
    basicInfoForm.difficulty = imp?.difficulty ?? 3
    basicInfoForm.estimatedDuration = imp?.estimatedDuration ?? 60
    basicInfoForm.coverImage = ''
    basicInfoForm.storyline = imp?.storyline || ''
  } else if (scriptDetail.value) {
    basicInfoForm.title = scriptDetail.value.title
    basicInfoForm.type = scriptDetail.value.type
    basicInfoForm.villageId = scriptDetail.value.villageId
    basicInfoForm.difficulty = scriptDetail.value.difficulty
    basicInfoForm.estimatedDuration = scriptDetail.value.estimatedDuration
    basicInfoForm.coverImage = scriptDetail.value.coverImage || ''
    basicInfoForm.storyline = scriptDetail.value.storyline || ''
  }
  basicInfoDialogVisible.value = true
}

async function saveBasicInfo() {
  const valid = await basicInfoFormRef.value?.validate().catch(() => false)
  if (!valid) return
  basicSaving.value = true
  try {
    if (isNew.value) {
      const res = await createScript({ ...basicInfoForm })
      if (res.data.code === 0) {
        const newScriptId = res.data.data.scriptId
        ElMessage.success('剧本创建成功')
        basicInfoDialogVisible.value = false
        if (importedData.value) {
          try {
            await importGeneratedContent(newScriptId)
            ElMessage.success('AI 剧本内容已全部导入')
          } catch {
            ElMessage.warning('剧本框架已创建，部分内容导入失败，请手动补充')
          }
          importedData.value = null
        }
        await router.replace('/script/editor/' + newScriptId)
        await loadAllData()
        await Promise.all([refreshNPCs(), refreshEndings(), refreshAR()])
      } else {
        ElMessage.error(res.data.message || '创建失败')
      }
    } else {
      await updateScript(scriptId.value, { ...basicInfoForm })
      ElMessage.success('基本信息已保存')
      basicInfoDialogVisible.value = false
      await loadAllData()
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    basicSaving.value = false
  }
}

async function importGeneratedContent(newScriptId: string) {
  const data = importedData.value
  if (!data) return

  // 1. 导入章节和节点（先不管分支配置）
  const chapters = data.chapters || []
  const titleToNodeId: Record<string, string> = {}
  const pendingBranches: { nodeId: string; config: any }[] = []
  const pendingNpcNodes: { nodeId: string; npcName: string }[] = []
  const createdNodes: { nodeId: string; node: any }[] = []
  const createdTasks: { taskId: string; task: any }[] = []

  for (let ci = 0; ci < chapters.length; ci++) {
    const ch = chapters[ci]
    const chRes = await createChapter(newScriptId, {
      title: ch.title || `第${ci + 1}章`,
      sortOrder: ch.sortOrder ?? ci + 1
    })
    const chapterId = chRes.data.data.chapterId

    const nodes = ch.nodes || []
    for (let ni = 0; ni < nodes.length; ni++) {
      const nd = nodes[ni]
      const rawConfig = nd.config || { nextNodes: [], hasBranch: false, branchPrompt: '', branchOptions: [] }

      // 创建节点时暂不填分支配置（等所有节点创建后再回填ID）
      const nodeRes = await createNode(newScriptId, chapterId, {
        title: nd.title || `节点${ni + 1}`,
        type: nd.type || 'dialogue',
        triggerType: nd.triggerType || 'auto',
        triggerLat: nd.triggerLat ?? null,
        triggerLng: nd.triggerLng ?? null,
        triggerRadius: nd.triggerRadius ?? 50,
        dialoguePrompt: nd.dialoguePrompt || '',
        config: { nextNodes: [], hasBranch: false, branchPrompt: '', branchOptions: [] },
        sortOrder: ni + 1
      })
      const nodeId = nodeRes.data.data.nodeId
      titleToNodeId[nd.title] = nodeId
      createdNodes.push({ nodeId, node: nd })

      // 保存分支配置，待所有节点创建后再回填
      if (rawConfig.hasBranch) {
        pendingBranches.push({ nodeId, config: rawConfig })
      }

      // 记录待关联 NPC 的节点
      if (nd.npcName) {
        pendingNpcNodes.push({ nodeId, npcName: nd.npcName })
      }

      // 导入任务
      const tasks = nd.tasks || []
      for (let ti = 0; ti < tasks.length; ti++) {
        const tk = tasks[ti]
        const taskRes = await createTask(newScriptId, nodeId, {
          type: tk.type || 'puzzle',
          title: tk.title || `任务${ti + 1}`,
          description: tk.description || '',
          answer: tk.answer || null,
          retryHint: tk.retryHint || null,
          targetLat: tk.targetLat ?? null,
          targetLng: tk.targetLng ?? null,
          targetRadius: tk.targetRadius ?? 30,
          rewardItem: tk.rewardItem || null
        })
        if (tk.rewardItem?.name) {
          createdTasks.push({ taskId: taskRes.data.data.taskId, task: tk })
        }
      }
    }
  }

  // 1.5 回填分支配置：将标题引用转换为真实 nodeId
  for (const { nodeId, config } of pendingBranches) {
    const resolvedNextNodes: string[] = (config.nextNodes || [])
      .map((t: string) => titleToNodeId[t])
      .filter(Boolean)
    const resolvedOptions = (config.branchOptions || []).map((opt: any) => ({
      ...opt,
      nextNodeId: titleToNodeId[opt.nextNodeId] || opt.nextNodeId
    }))
    await updateNode(newScriptId, nodeId, {
      config: {
        nextNodes: resolvedNextNodes,
        hasBranch: true,
        branchPrompt: config.branchPrompt || '',
        branchOptions: resolvedOptions
      }
    })
  }

  // 2. 导入 NPC
  const npcs = data.npcs || []
  const createdNpcs: { npcId: string; npc: any }[] = []
  for (const npc of npcs) {
    try {
      const res = await createNPC(newScriptId, {
        name: npc.name || '未命名NPC',
        avatar: npc.avatar || '',
        role: npc.role || '伙伴',
        age: npc.age ?? 30,
        personality: npc.personality || '',
        description: npc.description || '',
        systemPrompt: npc.systemPrompt || '你是一个友善的角色，请根据你的性格与玩家互动，分享你所知道的故事和知识。',
        knowledgeBase: npc.knowledgeBase || [],
        greeting: npc.greeting || '你好！',
        appearance: npc.appearance || '',
        gender: npc.gender || 'male'
      })
      createdNpcs.push({ npcId: res.data.data.npcId, npc })
    } catch {
      // 单个NPC创建失败不影响后续
    }
  }

  // 2.5 回填节点 NPC 关联：将 npcName 映射为真实 npcId
  if (pendingNpcNodes.length > 0) {
    const nameToNpcId: Record<string, string> = {}
    for (const { npcId, npc } of createdNpcs) {
      nameToNpcId[npc.name] = npcId
    }
    for (const { nodeId, npcName } of pendingNpcNodes) {
      const npcId = nameToNpcId[npcName]
      if (npcId) {
        try {
          await updateNode(newScriptId, nodeId, { npcId: parseInt(npcId) })
          // 同步更新本地数据
          if (scriptDetail.value?.chapters) {
            for (const ch of scriptDetail.value.chapters) {
              const node = ch.nodes?.find(n => n.nodeId === nodeId)
              if (node) {
                node.npcId = parseInt(npcId)
                break
              }
            }
          }
        } catch {
          // 单个关联失败不影响后续
        }
      }
    }
  }

  // 3. 导入结局
  const endings = data.endings || []
  const createdEndings: { endingId: string; ending: any }[] = []
  for (const ed of endings) {
    try {
      const res = await createEnding(newScriptId, {
        title: ed.title || '结局',
        description: ed.description || '',
        conditionDesc: ed.conditionDesc || '',
        endingImage: ed.endingImage || null
      })
      createdEndings.push({ endingId: res.data.data.endingId, ending: ed })
    } catch {
      // 单个结局创建失败不影响后续
    }
  }

  // 4. 后台自动生成 NPC 头像、场景图、道具图标、结局配图
  autoGenerateImages(newScriptId, createdNpcs, createdNodes, createdTasks, createdEndings)
}

// ==================== 自动生成图片 ====================
function autoGenerateImages(
  scriptId: string,
  npcs: { npcId: string; npc: any }[],
  nodes: { nodeId: string; node: any }[],
  tasks: { taskId: string; task: any }[],
  endings: { endingId: string; ending: any }[]
) {
  setTimeout(async () => {
    let completed = 0
    let total = 0
    const NOTIFY_ID = 'auto-gen-images'

    function notifyProgress() {
      ElNotification({
        id: NOTIFY_ID,
        title: 'AI 图片生成中',
        message: `进度：${completed}/${total}`,
        type: 'info',
        duration: 3000,
        position: 'top-right'
      })
    }

    // 收集所有需要生成的图片任务
    const imgTasks: (() => Promise<void>)[] = []

    for (const { npcId, npc } of npcs) {
      const appearance = npc.appearance || npc.description || ''
      if (!appearance) continue
      imgTasks.push(async () => {
        try {
          const res = await generateNPCPortrait({
            scriptId,
            name: npc.name || 'NPC',
            gender: npc.gender || 'male',
            age: npc.age ?? 30,
            appearance,
            personality: npc.personality || '',
            style: 'game_art'
          }, true)
          if (res.data?.code === 0) {
            const url = res.data?.data?.images?.[0]?.url
            if (url) {
              await updateNPC(scriptId, npcId, { avatar: url }).catch(() => {})
              const localNpc = scriptDetail.value?.npcs?.find(n => n.npcId === npcId)
              if (localNpc) localNpc.avatar = url
            }
          }
        } catch { /* skip */ }
        completed++
        notifyProgress()
      })
    }

    for (const { nodeId, node } of nodes) {
      const prompt = node.dialoguePrompt || ''
      if (!prompt) continue
      imgTasks.push(async () => {
        try {
          const res = await generateSceneImage({
            scriptId,
            description: prompt,
            style: 'realistic',
            aspectRatio: '16:9'
          }, true)
          if (res.data?.code === 0) {
            const url = res.data?.data?.images?.[0]?.url
            if (url) {
              await updateNode(scriptId, nodeId, { sceneImage: url }).catch(() => {})
              for (const ch of scriptDetail.value?.chapters || []) {
                const localNode = ch.nodes?.find(n => n.nodeId === nodeId)
                if (localNode) { localNode.sceneImage = url; break }
              }
            }
          }
        } catch { /* skip */ }
        completed++
        notifyProgress()
      })
    }

    for (const { taskId, task } of tasks) {
      const reward = task.rewardItem
      if (!reward?.name) continue
      imgTasks.push(async () => {
        try {
          const desc = reward.description || reward.name
          const res = await generateImage({ prompt: `游戏道具图标，${reward.name}，${desc}，简洁风格，纯色背景`, style: 'game_art' }, true)
          if (res.data?.code === 0) {
            const url = res.data?.data?.url
            if (url) {
              await updateTask(scriptId, taskId, { rewardItem: { ...reward, icon: url } }).catch(() => {})
            }
          }
        } catch { /* skip */ }
        completed++
        notifyProgress()
      })
    }

    for (const { endingId, ending } of endings) {
      const desc = ending.description || ending.title || ''
      if (!desc) continue
      imgTasks.push(async () => {
        try {
          const res = await generateSceneImage({
            scriptId,
            description: `结局场景：${desc}`,
            style: 'realistic',
            aspectRatio: '16:9'
          }, true)
          if (res.data?.code === 0) {
            const url = res.data?.data?.images?.[0]?.url
            if (url) {
              await updateEnding(scriptId, endingId, { endingImage: url }).catch(() => {})
              // 直接更新本地数据
              const localEnding = scriptDetail.value?.endings?.find(e => e.endingId === endingId)
              if (localEnding) localEnding.endingImage = url
              const inList = endingList.value.find(e => e.endingId === endingId)
              if (inList) inList.endingImage = url
            }
          }
        } catch { /* skip */ }
        completed++
        notifyProgress()
      })
    }

    total = imgTasks.length
    if (total === 0) return

    // 显示初始进度
    notifyProgress()

    // 每次最多 2 个并发，避免浏览器连接池耗尽
    const CONCURRENCY = 2
    for (let i = 0; i < total; i += CONCURRENCY) {
      const batch = imgTasks.slice(i, i + CONCURRENCY)
      await Promise.allSettled(batch.map(fn => fn()))
    }

    // 关闭进度通知，显示完成
    ElNotification.close(NOTIFY_ID)
    setTimeout(() => {
      ElNotification({
        title: '图片生成完成',
        message: `成功生成 ${completed}/${total} 张图片，请刷新页面查看`,
        type: 'success',
        duration: 3000,
        position: 'top-right'
      })
    }, 300)
  }, 0)
}

// ==================== 删除剧本 ====================
async function handleDeleteScript() {
  try {
    await ElMessageBox.confirm(
      '删除剧本将同时删除所有章节、节点、NPC 和结局数据，此操作不可恢复。确定继续？',
      '删除剧本',
      { type: 'error', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    await deleteScript(scriptId.value)
    ElMessage.success('剧本已删除')
    router.push('/script/list')
  } catch {
    // 用户取消
  }
}

// ==================== 剧本标题内联保存 ====================
async function handleSaveTitle() {
  if (!scriptDetail.value || isNew.value) return
  try {
    await updateScript(scriptId.value, { title: scriptDetail.value.title })
  } catch {
    // silent
  }
}

// ==================== 状态变更 ====================
const statusTagType = computed(() => {
  if (!scriptDetail.value) return 'info'
  switch (scriptDetail.value.status) {
    case 'published': return 'success'
    case 'offline': return 'danger'
    default: return 'warning'
  }
})

async function handleStatusChange(status: string) {
  try {
    await ElMessageBox.confirm(
      `确定要将剧本状态变更为「${SCRIPT_STATUS_MAP[status as ScriptStatus]}」吗？`,
      '状态变更',
      { type: 'warning' }
    )
    await updateScriptStatus(scriptId.value, status as ScriptStatus)
    ElMessage.success('状态已变更')
    if (scriptDetail.value) {
      scriptDetail.value.status = status as ScriptStatus
    }
  } catch {
    // 用户取消
  }
}

// ==================== 章节弹窗 ====================
const chapterDialogVisible = ref(false)
const chapterSaving = ref(false)
const chapterEditing = ref(false)
const editingChapterId = ref('')
const chapterFormRef = ref()
const chapterForm = reactive({ title: '' })

function openChapterDialog(node?: TreeNode) {
  chapterDialogVisible.value = true
  if (node && node.isChapter && node.chapterId) {
    chapterEditing.value = true
    editingChapterId.value = node.chapterId
    chapterForm.title = node.label
  } else {
    chapterEditing.value = false
    editingChapterId.value = ''
    chapterForm.title = ''
  }
}

async function saveChapter() {
  if (!chapterForm.title.trim()) {
    ElMessage.warning('请输入章节标题')
    return
  }
  chapterSaving.value = true
  try {
    if (chapterEditing.value) {
      await updateChapter(scriptId.value, editingChapterId.value, { title: chapterForm.title })
      ElMessage.success('章节已更新')
    } else {
      await createChapter(scriptId.value, { title: chapterForm.title })
      ElMessage.success('章节已创建')
    }
    chapterDialogVisible.value = false
    await refreshChapters()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    chapterSaving.value = false
  }
}

async function handleDeleteChapter(node: TreeNode) {
  if (!node.chapterId) return
  const ch = findChapterInData(node.chapterId)
  if (!ch) return
  try {
    await ElMessageBox.confirm(
      `确定要删除章节「${ch.title}」吗？该章节下的所有节点也将被删除。`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteChapter(scriptId.value, node.chapterId)
    ElMessage.success('章节已删除')
    await refreshChapters()
    if (currentNode.value && allNodes.value.findIndex(n => n.nodeId === currentNode.value!.nodeId) === -1) {
      currentNode.value = null
    }
  } catch {
    // 用户取消
  }
}

// ==================== 节点新增弹窗 ====================
const nodeDialogVisible = ref(false)
const nodeSaving = ref(false)
const nodeDialogFormRef = ref()
const nodeDialogForm = reactive({
  title: '',
  type: 'dialogue' as NodeType
})
const nodeTargetChapterId = ref('')

function openNodeDialog(chapterNode: TreeNode) {
  nodeDialogVisible.value = true
  nodeDialogForm.title = ''
  nodeDialogForm.type = 'dialogue'
  nodeTargetChapterId.value = chapterNode.chapterId || ''
}

async function createNodeInChapter() {
  if (!nodeDialogForm.title.trim()) {
    ElMessage.warning('请输入节点标题')
    return
  }
  nodeSaving.value = true
  try {
    await createNode(scriptId.value, nodeTargetChapterId.value, {
      title: nodeDialogForm.title,
      type: nodeDialogForm.type,
      triggerType: 'auto',
      config: { nextNodes: [], hasBranch: false, branchOptions: [] }
    } as any)
    ElMessage.success('节点已创建')
    nodeDialogVisible.value = false
    await refreshChapters()
  } catch {
    ElMessage.error('创建失败')
  } finally {
    nodeSaving.value = false
  }
}

async function handleDeleteNode(data: TreeNode | ScriptNode) {
  const nodeId = 'nodeId' in data ? (data as ScriptNode).nodeId : (data as TreeNode).nodeId
  const label = 'label' in data ? (data as TreeNode).label : (data as ScriptNode).title
  if (!nodeId) return
  try {
    await ElMessageBox.confirm(
      `确定要删除节点「${label}」吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteNode(scriptId.value, nodeId)
    ElMessage.success('节点已删除')
    if (currentNode.value?.nodeId === nodeId) {
      currentNode.value = null
    }
    await refreshChapters()
  } catch {
    // 用户取消
  }
}

// ==================== NPC 管理弹窗 ====================
const npcExpanded = ref(false)
const endingExpanded = ref(false)
const npcDialogVisible = ref(false)
const npcSaving = ref(false)
const npcEditing = ref(false)
const editingNpcId = ref('')
const npcFormRef = ref()
const npcForm = reactive<{
  name: string
  role: string
  age: number
  personality: string
  description: string
  avatar: string
  systemPrompt: string
  greeting: string
  knowledgeBase: KnowledgeItem[]
}>({
  name: '',
  role: '',
  age: 30,
  personality: '',
  description: '',
  avatar: '',
  systemPrompt: '',
  greeting: '',
  knowledgeBase: []
})

function openNPCDialog(npc?: ScriptNPC) {
  npcDialogVisible.value = true
  if (npc) {
    npcEditing.value = true
    editingNpcId.value = npc.npcId
    npcForm.name = npc.name
    npcForm.role = npc.role
    npcForm.age = npc.age
    npcForm.personality = npc.personality
    npcForm.description = npc.description || ''
    npcForm.avatar = npc.avatar || ''
    npcForm.systemPrompt = npc.systemPrompt
    npcForm.greeting = npc.greeting || ''
    npcForm.knowledgeBase = npc.knowledgeBase
      ? npc.knowledgeBase.map(k => ({ ...k }))
      : []
  } else {
    npcEditing.value = false
    editingNpcId.value = ''
    npcForm.name = ''
    npcForm.role = ''
    npcForm.age = 30
    npcForm.personality = ''
    npcForm.description = ''
    npcForm.avatar = ''
    npcForm.systemPrompt = ''
    npcForm.greeting = ''
    npcForm.knowledgeBase = []
  }
}

function addKnowledgeItem() {
  npcForm.knowledgeBase.push({ topic: '', content: '', unlockCondition: '' })
}

async function saveNPC() {
  if (!npcForm.name || !npcForm.role) {
    ElMessage.warning('请填写NPC名称和角色定位')
    return
  }
  if (!npcForm.systemPrompt) {
    ElMessage.warning('System Prompt 为必填项')
    return
  }
  npcSaving.value = true
  try {
    const data = { ...npcForm, knowledgeBase: npcForm.knowledgeBase.filter(k => k.topic) }
    if (npcEditing.value) {
      await updateNPC(scriptId.value, editingNpcId.value, data)
      ElMessage.success('NPC已更新')
    } else {
      await createNPC(scriptId.value, data)
      ElMessage.success('NPC已创建')
    }
    npcDialogVisible.value = false
    await refreshNPCs()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    npcSaving.value = false
  }
}

async function handleDeleteNPC(npc: ScriptNPC) {
  try {
    await ElMessageBox.confirm(
      `确定要删除NPC「${npc.name}」吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteNPC(scriptId.value, npc.npcId)
    ElMessage.success('NPC已删除')
    await refreshNPCs()
  } catch {
    // 用户取消
  }
}

// ==================== 结局管理弹窗 ====================
const endingDialogVisible = ref(false)
const endingSaving = ref(false)
const endingEditing = ref(false)
const editingEndingId = ref('')
const endingFormRef = ref()
const endingForm = reactive({
  title: '',
  description: '',
  endingImage: '',
  conditionDesc: '',
})

function openEndingDialog(ending?: ScriptEnding) {
  endingDialogVisible.value = true
  if (ending) {
    endingEditing.value = true
    editingEndingId.value = ending.endingId
    endingForm.title = ending.title
    endingForm.description = ending.description || ''
    endingForm.endingImage = ending.endingImage || ''
    endingForm.conditionDesc = ending.conditionDesc
  } else {
    endingEditing.value = false
    editingEndingId.value = ''
    endingForm.title = ''
    endingForm.description = ''
    endingForm.endingImage = ''
    endingForm.conditionDesc = ''
  }
}

async function saveEnding() {
  if (!endingForm.title) {
    ElMessage.warning('请输入结局标题')
    return
  }
  endingSaving.value = true
  try {
    if (endingEditing.value) {
      await updateEnding(scriptId.value, editingEndingId.value, { ...endingForm })
      ElMessage.success('结局已更新')
    } else {
      await createEnding(scriptId.value, { ...endingForm })
      ElMessage.success('结局已创建')
    }
    endingDialogVisible.value = false
    await refreshEndings()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    endingSaving.value = false
  }
}

async function handleDeleteEnding(ending: ScriptEnding) {
  try {
    await ElMessageBox.confirm(
      `确定要删除结局「${ending.title}」吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteEnding(scriptId.value, ending.endingId)
    ElMessage.success('结局已删除')
    await refreshEndings()
  } catch {
    // 用户取消
  }
}

// ==================== AR资源管理弹窗 ====================
const arManageVisible = ref(false)
const arDialogVisible = ref(false)
const arSaving = ref(false)
const arEditing = ref(false)
const editingArId = ref('')
const arFormRef = ref()
const arForm = reactive({
  name: '',
  type: 'recognition_image' as ARResourceType,
  nodeId: '',
  markerUrl: '',
  markerPreview: '',
  modelUrl: '',
  overlayContent: ''
})

function openARDialog(ar?: ARResource) {
  arDialogVisible.value = true
  if (ar) {
    arEditing.value = true
    editingArId.value = ar.resourceId
    arForm.name = ar.name
    arForm.type = ar.type
    arForm.nodeId = ar.nodeId || ''
    arForm.markerUrl = ar.markerUrl
    arForm.markerPreview = ar.markerPreview || ''
    arForm.modelUrl = ar.modelUrl || ''
    arForm.overlayContent = ar.overlayContent
      ? (typeof ar.overlayContent === 'string' ? ar.overlayContent : JSON.stringify(ar.overlayContent, null, 2))
      : ''
  } else {
    arEditing.value = false
    editingArId.value = ''
    arForm.name = ''
    arForm.type = 'recognition_image'
    arForm.nodeId = ''
    arForm.markerUrl = ''
    arForm.markerPreview = ''
    arForm.modelUrl = ''
    arForm.overlayContent = ''
  }
}

async function saveAR() {
  if (!arForm.name) {
    ElMessage.warning('请输入AR资源名称')
    return
  }
  arSaving.value = true
  try {
    let overlayContent: any = null
    if (arForm.overlayContent.trim()) {
      try {
        overlayContent = JSON.parse(arForm.overlayContent)
      } catch {
        ElMessage.warning('Overlay内容JSON格式不正确')
        arSaving.value = false
        return
      }
    }
    const data = {
      name: arForm.name,
      type: arForm.type,
      nodeId: arForm.nodeId || undefined,
      markerUrl: arForm.markerUrl,
      markerPreview: arForm.markerPreview || undefined,
      modelUrl: arForm.modelUrl || undefined,
      overlayContent
    }
    if (arEditing.value) {
      await updateARResource(scriptId.value, editingArId.value, data)
      ElMessage.success('AR资源已更新')
    } else {
      await createARResource(scriptId.value, data)
      ElMessage.success('AR资源已创建')
    }
    arDialogVisible.value = false
    await refreshAR()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    arSaving.value = false
  }
}

async function handleDeleteAR(ar: ARResource) {
  try {
    await ElMessageBox.confirm(
      `确定要删除AR资源「${ar.name}」吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteARResource(scriptId.value, ar.resourceId)
    ElMessage.success('AR资源已删除')
    await refreshAR()
  } catch {
    // 用户取消
  }
}

// ==================== 任务弹窗 ====================
const taskDialogVisible = ref(false)
const taskSaving = ref(false)
const taskEditing = ref(false)
const editingTaskId = ref('')
const taskFormRef = ref()
const taskForm: {
  title: string
  type: string
  description: string
  answer: string
  retryHint: string
  rewardItem: { itemId: string; name: string; icon: string; description: string; type: string }
  targetLat: number | null
  targetLng: number | null
  targetRadius: number
  arResourceId: string
} = reactive({
  title: '',
  type: 'puzzle',
  description: '',
  answer: '',
  retryHint: '',
  rewardItem: { itemId: '', name: '', icon: '', description: '', type: 'clue' },
  targetLat: null,
  targetLng: null,
  targetRadius: 50,
  arResourceId: ''
})

function openTaskDialog(task?: TaskDef) {
  taskDialogVisible.value = true
  if (task) {
    taskEditing.value = true
    editingTaskId.value = task.taskId
    taskForm.title = task.title
    taskForm.type = task.type
    taskForm.description = task.description || ''
    taskForm.answer = task.answer || ''
    taskForm.retryHint = task.retryHint || ''
    taskForm.rewardItem = task.rewardItem
      ? { ...task.rewardItem }
      : { itemId: '', name: '', icon: '', description: '', type: 'clue' }
    taskForm.targetLat = task.targetLat
    taskForm.targetLng = task.targetLng
    taskForm.targetRadius = task.targetRadius || 50
    taskForm.arResourceId = task.arResourceId || ''
  } else {
    taskEditing.value = false
    editingTaskId.value = ''
    taskForm.title = ''
    taskForm.type = 'puzzle'
    taskForm.description = ''
    taskForm.answer = ''
    taskForm.retryHint = ''
    taskForm.rewardItem = { itemId: '', name: '', icon: '', description: '', type: 'clue' }
    taskForm.targetLat = null
    taskForm.targetLng = null
    taskForm.targetRadius = 50
    taskForm.arResourceId = ''
  }
}

async function saveTask() {
  if (!taskForm.title) {
    ElMessage.warning('请输入任务标题')
    return
  }
  if (!currentNode.value) return
  taskSaving.value = true
  try {
    const hasReward = taskForm.rewardItem.itemId || taskForm.rewardItem.name
    const data: Partial<TaskDef> = {
      type: taskForm.type as TaskType,
      title: taskForm.title,
      description: taskForm.description || undefined,
      answer: taskForm.type === 'puzzle' ? taskForm.answer : undefined,
      retryHint: taskForm.type === 'puzzle' ? (taskForm.retryHint || undefined) : undefined,
      rewardItem: hasReward ? { ...taskForm.rewardItem } as RewardItem : undefined,
      targetLat: (taskForm.type === 'gps_checkin' || taskForm.type === 'ar_scan') ? taskForm.targetLat : undefined,
      targetLng: (taskForm.type === 'gps_checkin' || taskForm.type === 'ar_scan') ? taskForm.targetLng : undefined,
      targetRadius: taskForm.targetRadius,
      arResourceId: taskForm.type === 'ar_scan' ? (taskForm.arResourceId || undefined) : undefined
    }

    if (taskEditing.value) {
      await updateTask(scriptId.value, editingTaskId.value, data)
      ElMessage.success('任务已更新')
    } else {
      await createTask(scriptId.value, currentNode.value.nodeId, data)
      ElMessage.success('任务已创建')
    }
    taskDialogVisible.value = false
    await refreshChapters()
    const updated = findNodeInData(currentNode.value.nodeId)
    if (updated) {
      currentNode.value = { ...updated }
      loadNodeForms(updated)
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    taskSaving.value = false
  }
}

async function handleDeleteTask(task: TaskDef) {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务「${task.title}」吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteTask(scriptId.value, task.taskId)
    ElMessage.success('任务已删除')
    await refreshChapters()
    if (currentNode.value) {
      const updated = findNodeInData(currentNode.value.nodeId)
      if (updated) {
        currentNode.value = { ...updated }
        loadNodeForms(updated)
      }
    }
  } catch {
    // 用户取消
  }
}

// ==================== 数据加载 ====================
async function loadAllData() {
  if (isNew.value) return
  pageLoading.value = true
  try {
    const res = await getScriptDetail(scriptId.value)
    scriptDetail.value = res.data.data
    // 同时填充 NPC/结局列表（scriptDetail 已包含完整数据）
    npcList.value = res.data.data?.npcs || []
    endingList.value = res.data.data?.endings || []
  } catch {
    ElMessage.error('加载剧本数据失败')
  } finally {
    pageLoading.value = false
  }
}

async function refreshChapters() {
  if (isNew.value) return
  try {
    const res = await getScriptDetail(scriptId.value)
    scriptDetail.value = res.data.data
  } catch {
    // silent
  }
}

async function refreshNPCs() {
  if (isNew.value) return
  try {
    const res = await getNPCs(scriptId.value)
    npcList.value = res.data.data?.list || []
  } catch {
    // silent
  }
}

async function refreshEndings() {
  if (isNew.value) return
  try {
    const res = await getEndings(scriptId.value)
    endingList.value = res.data.data?.list || []
  } catch {
    // silent
  }
}

async function refreshAR() {
  if (isNew.value) return
  try {
    const res = await getARResources(scriptId.value)
    arResourceList.value = res.data.data?.list || []
  } catch {
    // silent
  }
}

async function loadVillages() {
  try {
    const res = await getVillageList({ pageSize: 999 })
    villageList.value = res.data.data?.list || []
  } catch {
    // silent
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  // 从 AI 剧本工坊导入：自动创建脚本 + 导入全部内容
  if (isNew.value && importedData.value) {
    const data = importedData.value
    pageLoading.value = true
    try {
      const res = await createScript({
        title: data.title || 'AI生成剧本',
        type: data.type || 'mystery',
        villageId: String(data.villageId || ''),
        difficulty: data.difficulty ?? 3,
        estimatedDuration: data.estimatedDuration ?? 60,
        coverImage: '',
        storyline: data.storyline || ''
      })
      if (res.data.code === 0) {
        const newScriptId = res.data.data.scriptId
        await importGeneratedContent(newScriptId)
        importedData.value = null
        await router.replace('/script/editor/' + newScriptId)
        ElMessage.success('AI 剧本已全部导入，共 ' + data.chapterCount + ' 章、' + data.npcCount + ' 位NPC、' + data.endingCount + ' 个结局')
        await loadAllData()
        await Promise.all([refreshNPCs(), refreshEndings(), refreshAR()])
        await loadVillages()
        pageLoading.value = false
        return
      } else {
        ElMessage.error(res.data.message || '导入失败')
      }
    } catch {
      ElMessage.error('导入失败，请检查网络后重试')
    } finally {
      pageLoading.value = false
    }
  }

  if (!isNew.value) {
    await loadAllData()
    await Promise.all([
      refreshNPCs(),
      refreshEndings(),
      refreshAR()
    ])
  }
  await loadVillages()
})
</script>

<style scoped>
.script-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--main-bg);
  overflow: hidden;
}

/* ====== 顶部工具栏（暗底装饰条） ====== */
.top-bar {
  background: linear-gradient(135deg, var(--bamboo-800) 0%, var(--ink-800) 100%);
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  color: var(--tea-100);
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.back-btn {
  color: var(--tea-200);
  font-size: 18px;
}

.top-title-section {
  min-width: 0;
}

.top-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-title-row h2 {
  margin: 0;
  font-size: 20px;
  color: var(--tea-50);
  font-weight: 600;
  letter-spacing: 1px;
}

.script-title-input {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--tea-50);
  font-size: 20px;
  font-weight: 600;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Serif SC', serif;
  outline: none;
  padding: 2px 4px;
  letter-spacing: 1px;
  width: 300px;
  transition: border-color 0.2s;
}

.script-title-input:focus {
  border-bottom-color: var(--bamboo-400);
}

.script-title-input::placeholder {
  color: var(--tea-400);
  opacity: 0.6;
}

.status-tag {
  flex-shrink: 0;
}

.top-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
  gap: 4px;
  font-size: 13px;
  color: var(--tea-300);
}

.meta-item b {
  color: var(--tea-100);
  font-weight: 500;
}

.top-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

/* ====== 主体三栏 ====== */
.main-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ====== 左侧面板：章节树（220px） ====== */
.left-panel {
  width: 220px;
  background: var(--tea-50);
  border-right: 1px solid var(--tea-300);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s;
}

.left-panel.collapsed {
  width: 44px;
}

.left-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 8px;
  border-bottom: 1px solid var(--tea-200);
  background: var(--tea-100);
}

.left-toolbar {
  padding: 8px;
}

.map-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-800);
  letter-spacing: 1px;
}

.collapse-btn {
  color: var(--ink-500);
}

.left-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px;
}

/* 自定义树节点 */
.tree-node-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px 4px 8px;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  transition: background 0.15s;
  border-left: 3px solid transparent;
}

.tree-node-content:hover {
  background: var(--bamboo-50);
}

.tree-node-content.node-dialogue {
  border-left-color: var(--bamboo-500);
}

.tree-node-content.node-task-hub {
  border-left-color: var(--accent-gold);
}

.tree-node-content.node-ending {
  border-left-color: var(--sprout-400);
}

.tree-node-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tree-node-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.tree-node-label {
  font-size: 13px;
  color: var(--ink-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-label.is-chapter {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-800);
}

.tree-node-npc {
  font-size: 11px;
  color: var(--ink-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-count {
  font-size: 11px;
  color: var(--ink-400);
  flex-shrink: 0;
}

.tree-node-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 4px;
}

.badge-task {
  font-size: 10px;
  color: var(--bamboo-600);
  background: var(--bamboo-50);
  padding: 1px 5px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.badge-branch {
  font-size: 10px;
  color: var(--accent-gold);
  background: rgba(196, 115, 79, 0.1);
  padding: 1px 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.tree-node-actions {
  display: none;
  gap: 2px;
  flex-shrink: 0;
}

.tree-node-content:hover .tree-node-actions {
  display: flex;
}

.tree-add-chapter {
  padding: 8px;
  border-top: 1px solid var(--tea-200);
}

/* ====== 中间面板：古村地图视觉区 ====== */
.center-panel {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: var(--card-bg, #fff);
  position: relative;
  display: flex;
  flex-direction: column;
}

.outline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--tea-200);
  background: var(--tea-50);
  flex-shrink: 0;
}

.outline-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-800);
  letter-spacing: 1px;
}

.outline-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* ===== 可视化树状结构图 ===== */
.tree-diagram {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  min-height: 100%;
}

.tree-diagram-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  color: var(--ink-400);
  font-size: 14px;
}

/* --- 章节块 --- */
.tree-chapter {
  width: 100%;
  max-width: 900px;
  margin-bottom: 40px;
  text-align: center;
}

.tree-chapter:last-child {
  margin-bottom: 24px;
}

/* --- 章节标题栏 --- */
.chapter-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 0;
}

.chapter-bar .chapter-icon {
  color: var(--bamboo-500);
  display: flex;
  align-items: center;
}

.chapter-bar .chapter-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink-800);
}

.chapter-bar .chapter-meta {
  font-size: 12px;
  color: var(--ink-400);
  background: var(--tea-50);
  padding: 2px 10px;
  border-radius: 10px;
}

/* --- CSS 树连线 --- */
.vline-drop {
  width: 1.5px;
  height: 24px;
  background: var(--tea-300);
  margin: 0 auto;
}

/* --- 节点行：inline-flex 让横线精确对齐节点 --- */
.chapter-nodes {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  padding-top: 12px;
  position: relative;
  margin: 0 auto;
}

/* 横线：从第一个节点中心到最后一个节点中心 */
.chapter-nodes::before {
  content: '';
  position: absolute;
  top: 0;
  left: 86px;
  right: 86px;
  height: 1.5px;
  background: var(--tea-300);
}

/* --- 节点卡片 --- */
.node-card {
  width: 172px;
  background: var(--card-bg, #fff);
  border: 1.5px solid var(--tea-200);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  flex-shrink: 0;
}

/* 竖线：从卡片中心向上连接到横线 */
.node-card::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  height: 12px;
  background: var(--tea-300);
}

.node-card:hover {
  border-color: var(--bamboo-400);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(92, 48, 32, 0.1);
}

.node-card-dialogue {
  border-left: 3px solid var(--bamboo-500);
}

.node-card-taskhub {
  border-left: 3px solid var(--accent-gold);
}

.node-card-ending {
  border-left: 3px solid var(--sprout-400);
}

.node-card-selected {
  border-color: var(--bamboo-400) !important;
  background: var(--bamboo-50) !important;
  box-shadow: 0 0 0 2px rgba(126, 184, 160, 0.3);
}

.node-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.node-card-type-icon {
  display: flex;
  align-items: center;
}

.node-card-dialogue .node-card-type-icon { color: var(--bamboo-600); }
.node-card-taskhub .node-card-type-icon { color: var(--accent-gold); }
.node-card-ending .node-card-type-icon { color: var(--sprout-500); }

.node-card-type-label {
  font-size: 11px;
  color: var(--ink-400);
  font-weight: 600;
}

.node-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-800);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
}

.node-card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.node-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.task-badge {
  color: var(--bamboo-600);
  background: var(--bamboo-50);
}

.branch-badge {
  color: var(--accent-gold);
  background: rgba(196, 115, 79, 0.1);
}

/* --- 空章节 --- */
.chapter-nodes-empty {
  text-align: center;
  padding: 16px 0;
  font-size: 13px;
  color: var(--ink-400);
}

/* 地图卡片 */
.map-card {
  max-width: 680px;
  margin: 0 auto;
  padding: 28px 32px;
}

.map-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--tea-200);
}

.map-card-icon {
  font-size: 42px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bamboo-50);
  border-radius: 12px;
  flex-shrink: 0;
}

.map-card-title {
  margin: 0 0 4px 0;
  font-size: 22px;
  color: var(--ink-800);
  font-weight: 700;
  letter-spacing: 1px;
}

.map-card-type {
  font-size: 13px;
  color: var(--ink-500);
}

.map-card-scene {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--tea-300);
}

.map-card-scene img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.map-card-npc {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bamboo-50);
  border-radius: 10px;
  margin-bottom: 20px;
}

.map-card-npc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.map-card-npc-name {
  font-weight: 600;
  color: var(--ink-800);
  font-size: 15px;
}

.map-card-npc-role {
  font-size: 12px;
  color: var(--ink-500);
}

.map-card-branches {
  margin-bottom: 20px;
}

.branch-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-700);
  margin-bottom: 10px;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--sprout-50);
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--ink-700);
  border-left: 3px solid var(--sprout-400);
}

.branch-arrow {
  color: var(--sprout-500);
  flex-shrink: 0;
}

.branch-next {
  margin-left: auto;
  font-size: 11px;
  color: var(--ink-500);
}

.map-card-stats {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--tea-200);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 20px;
  background: var(--tea-100);
  border-radius: 8px;
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--ink-500);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--bamboo-600);
  font-family: 'Georgia', 'Noto Serif SC', serif;
}

/* 引导区 */
.map-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.guide-content {
  text-align: center;
  max-width: 500px;
}

.guide-icon {
  font-size: 72px;
  margin-bottom: 16px;
}

.guide-content h3 {
  font-size: 22px;
  color: var(--ink-800);
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: 2px;
}

.guide-hint {
  font-size: 15px;
  color: var(--ink-600);
  margin-bottom: 24px;
}

.guide-tips {
  text-align: left;
  display: inline-block;
  margin-bottom: 24px;
}

.guide-tip {
  font-size: 13px;
  color: var(--ink-600);
  padding: 6px 0;
}

.guide-tip span {
  font-weight: 600;
  color: var(--ink-800);
}

.guide-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 13px;
  color: var(--ink-500);
}

/* ====== 右侧面板：属性面板（360px） ====== */
.right-panel {
  width: 360px;
  background: var(--card-bg);
  border-left: 1px solid var(--tea-200);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.property-collapse {
  border: none;
}

.property-collapse :deep(.el-collapse-item__header) {
  background: var(--tea-100);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-800);
  border: none;
  margin-bottom: 4px;
}

.property-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}

.property-collapse :deep(.el-collapse-item__content) {
  padding: 12px 8px;
}

.compact-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.compact-form :deep(.el-form-item__label) {
  font-size: 12px;
  padding-bottom: 2px;
  color: var(--ink-600);
}

/* AI 按钮样式 */
.ai-field :deep(.el-form-item__content) {
  position: relative;
}

.ai-input-wrap {
  position: relative;
  width: 100%;
}

.ai-btn {
  position: absolute;
  right: 4px;
  top: 4px;
  font-size: 12px;
  opacity: 0.8;
  z-index: 1;
}

.ai-btn:hover {
  opacity: 1;
  color: var(--accent-gold);
}

/* 分支选项列表 */
.branch-options-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.branch-option-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.branch-option-row .el-input,
.branch-option-row .el-select {
  flex: 1;
}

/* 任务区域 */
.task-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-700);
}

/* 底部固定操作栏 */
.panel-footer {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--tea-200);
}

/* 快速入口面板 */
.quick-panel {
  padding: 16px;
}

.quick-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-800);
  margin: 0 0 16px 0;
  letter-spacing: 1px;
}

.quick-desc {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 6px 0;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  flex-direction: column;
}

/* 剧本管理面板操作项 */
.action-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
}

.action-group.row {
  flex-direction: row;
}

.action-group.row .btn-action {
  flex: 1;
  min-width: 0;
}

.section-label {
  font-size: 12px;
  color: var(--ink-400);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 9px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
  border: none;
  color: #fff;
}

.btn-action-default {
  color: var(--ink-700);
  border: 1px solid var(--tea-300);
  background: var(--tea-50);
}

.btn-action-default:hover {
  background: var(--tea-100);
  border-color: var(--tea-400);
}

.btn-ink-danger {
  background: linear-gradient(135deg, #c0392b, #a93226);
  border: none;
  color: #fff;
  box-shadow: 0 2px 8px rgba(192, 57, 43, 0.2);
}

.btn-ink-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(192, 57, 43, 0.35);
}

/* 展开区块 */
.expand-section {
  padding: 8px 0;
  border-top: 1px solid var(--tea-200);
  animation: fadeIn 0.25s ease;
}

.expand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--ink-500);
}

/* 管理卡片 */
.manage-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--tea-100);
  gap: 8px;
}

.manage-card:last-child {
  border-bottom: none;
}

.manage-card-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.manage-card-text {
  min-width: 0;
}

.manage-card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-700);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.manage-card-role {
  font-size: 11px;
  color: var(--ink-500);
}

.manage-card-desc {
  font-size: 11px;
  color: var(--ink-500);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.manage-card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* 链接按钮 */
.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border: none;
  background: transparent;
  color: var(--bamboo-600);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-link:hover {
  background: var(--bamboo-50);
  color: var(--bamboo-700);
}

.btn-link.danger {
  color: #c0392b;
}

.btn-link.danger:hover {
  background: #fdf0ef;
  color: #a93226;
}

/* NPC卡片 */
.npc-card {
  border-radius: var(--card-radius);
}

.npc-card-inner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.npc-card-info {
  flex: 1;
  min-width: 0;
}

.npc-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--ink-800);
}

.npc-role {
  font-size: 12px;
  color: var(--bamboo-500);
  margin-top: 2px;
}

.npc-personality {
  font-size: 11px;
  color: var(--ink-500);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.npc-card-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

/* 知识库 */
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.knowledge-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.knowledge-row .el-input {
  flex: 1;
  min-width: 0;
}

/* 青瓷色开关 */
.celadon-switch :deep(.el-switch__core) {
  --el-switch-on-color: var(--sprout-400);
  --el-switch-off-color: var(--tea-300);
}

/* el树全局覆盖 */
:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node__content) {
  padding: 2px 4px;
  height: auto;
  min-height: 32px;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--bamboo-50);
}

:deep(.el-tree-node__expand-icon) {
  color: var(--ink-400);
}

/* 章节节点样式 */
:deep(.tree-chapter-node > .el-tree-node__content) {
  font-weight: 700;
  color: var(--ink-800);
}

/* 滚动条 */
.outline-tree::-webkit-scrollbar,
.panel-scroll::-webkit-scrollbar,
.center-panel::-webkit-scrollbar {
  width: 4px;
}

.outline-tree::-webkit-scrollbar-track,
.panel-scroll::-webkit-scrollbar-track,
.center-panel::-webkit-scrollbar-track {
  background: transparent;
}

.outline-tree::-webkit-scrollbar-thumb,
.panel-scroll::-webkit-scrollbar-thumb,
.center-panel::-webkit-scrollbar-thumb {
  background: var(--tea-300);
  border-radius: 2px;
}

/* 节点属性：媒体操作按钮 */
.media-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.media-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.media-preview img {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--tea-200);
}

.media-preview audio {
  width: 160px;
  height: 30px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .right-panel {
    width: 300px;
  }
  .left-panel {
    width: 200px;
  }
}
</style>
