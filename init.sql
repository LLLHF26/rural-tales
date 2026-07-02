-- ============================================================
-- 沉浸式乡村文旅剧本创作与智能导览系统 —— 数据库初始化
-- MySQL 8.0+
-- 执行：mysql -u root -p < init.sql
-- ============================================================

-- ------------------------- 建库 -------------------------
CREATE DATABASE IF NOT EXISTS rural_tourism
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE rural_tourism;

-- ============================================================
-- 第一部分：建表
-- ============================================================

-- ------------------------- 1. 用户表 -------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    phone           VARCHAR(11)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    nickname        VARCHAR(50)     NOT NULL DEFAULT '',
    avatar          VARCHAR(500)    NOT NULL DEFAULT '',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ------------------------- 2. 管理员表 -------------------------
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username        VARCHAR(50)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    nickname        VARCHAR(50)     NOT NULL,
    avatar          VARCHAR(500)    NOT NULL DEFAULT '',
    role            ENUM('admin','super_admin') NOT NULL DEFAULT 'admin',
    status          ENUM('active','disabled')   NOT NULL DEFAULT 'active',
    last_login_at   DATETIME,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ------------------------- 3. 验证码表 -------------------------
DROP TABLE IF EXISTS verification_codes;
CREATE TABLE verification_codes (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    phone           VARCHAR(11)     NOT NULL,
    code            VARCHAR(10)     NOT NULL,
    expires_at      DATETIME        NOT NULL,
    used            TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_phone_code (phone, code),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码表';

-- ------------------------- 4. 乡村表 -------------------------
DROP TABLE IF EXISTS villages;
CREATE TABLE villages (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,
    cover_image     VARCHAR(500),
    lat             DECIMAL(10,7)   NOT NULL,
    lng             DECIMAL(10,7)   NOT NULL,
    address         VARCHAR(300),
    tags            JSON,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='乡村表';

-- ------------------------- 5. 打卡点表 -------------------------
DROP TABLE IF EXISTS village_spots;
CREATE TABLE village_spots (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    village_id      BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    lat             DECIMAL(10,7)   NOT NULL,
    lng             DECIMAL(10,7)   NOT NULL,
    description     TEXT,
    images          JSON,
    sort_order      INT UNSIGNED    NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_village (village_id),
    CONSTRAINT fk_spot_village FOREIGN KEY (village_id) REFERENCES villages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='乡村打卡点';

-- ------------------------- 6. 文化条目表 -------------------------
DROP TABLE IF EXISTS village_cultures;
CREATE TABLE village_cultures (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    village_id      BIGINT UNSIGNED NOT NULL,
    type            ENUM('history','intangible','legend') NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    content         TEXT,
    PRIMARY KEY (id),
    INDEX idx_village_type (village_id, type),
    CONSTRAINT fk_culture_village FOREIGN KEY (village_id) REFERENCES villages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='乡村文化条目';

-- ------------------------- 7. 剧本表 -------------------------
DROP TABLE IF EXISTS scripts;
CREATE TABLE scripts (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    village_id          BIGINT UNSIGNED NOT NULL,
    title               VARCHAR(200)    NOT NULL,
    cover_image         VARCHAR(500),
    type                ENUM('mystery','history','family','couple','team') NOT NULL,
    difficulty          TINYINT UNSIGNED NOT NULL,
    estimated_duration  INT UNSIGNED    NOT NULL,
    storyline           TEXT,
    status              ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
    rating_avg          DECIMAL(2,1)    NOT NULL DEFAULT 0,
    rating_count        INT UNSIGNED    NOT NULL DEFAULT 0,
    experience_count    INT UNSIGNED    NOT NULL DEFAULT 0,
    published_at        DATETIME,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_village_status (village_id, status),
    INDEX idx_type_status (type, status),
    INDEX idx_rating (rating_avg DESC),
    INDEX idx_experience (experience_count DESC),
    CONSTRAINT fk_script_village FOREIGN KEY (village_id) REFERENCES villages(id),
    CONSTRAINT chk_difficulty CHECK (difficulty >= 1 AND difficulty <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧本表';

-- ------------------------- 8. 剧本章节表 -------------------------
DROP TABLE IF EXISTS script_chapters;
CREATE TABLE script_chapters (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    script_id       BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    sort_order      INT UNSIGNED    NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_script_order (script_id, sort_order),
    CONSTRAINT fk_chapter_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧本章节';

-- ------------------------- 9. 剧本 NPC 表 -------------------------
DROP TABLE IF EXISTS script_npcs;
CREATE TABLE script_npcs (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    script_id       BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    avatar          VARCHAR(500),
    role            VARCHAR(50),
    age             INT UNSIGNED,
    personality     VARCHAR(200),
    description     TEXT,
    system_prompt   TEXT            NOT NULL,
    knowledge_base  JSON,
    greeting        VARCHAR(500),
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_script (script_id),
    CONSTRAINT fk_npc_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧本NPC';

-- ------------------------- 10. 剧情节点表 -------------------------
DROP TABLE IF EXISTS script_nodes;
CREATE TABLE script_nodes (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    script_id       BIGINT UNSIGNED NOT NULL,
    chapter_id      BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    type            ENUM('dialogue','task_hub','ending') NOT NULL,
    scene_image     VARCHAR(500),
    scene_audio     VARCHAR(500),
    trigger_type    ENUM('gps','auto','manual') NOT NULL DEFAULT 'auto',
    trigger_lat     DECIMAL(10,7),
    trigger_lng     DECIMAL(10,7),
    trigger_radius  INT UNSIGNED    NOT NULL DEFAULT 30,
    dialogue_prompt TEXT,
    npc_id          BIGINT UNSIGNED,
    config          JSON            NOT NULL,
    sort_order      INT UNSIGNED    NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_chapter (chapter_id),
    INDEX idx_script (script_id),
    INDEX idx_npc (npc_id),
    CONSTRAINT fk_node_chapter FOREIGN KEY (chapter_id) REFERENCES script_chapters(id) ON DELETE CASCADE,
    CONSTRAINT fk_node_script  FOREIGN KEY (script_id)  REFERENCES scripts(id) ON DELETE CASCADE,
    CONSTRAINT fk_node_npc     FOREIGN KEY (npc_id)     REFERENCES script_npcs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧情节点';

-- ------------------------- 11. 结局表 -------------------------
DROP TABLE IF EXISTS script_endings;
CREATE TABLE script_endings (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    script_id       BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    ending_image    VARCHAR(500),
    condition_desc  VARCHAR(500),
    PRIMARY KEY (id),
    INDEX idx_script (script_id),
    CONSTRAINT fk_ending_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结局表';

-- ------------------------- 12. AR 资源表 -------------------------
DROP TABLE IF EXISTS ar_resources;
CREATE TABLE ar_resources (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    script_id       BIGINT UNSIGNED NOT NULL,
    node_id         BIGINT UNSIGNED NOT NULL,
    type            ENUM('recognition_image','collectable','npc_model') NOT NULL,
    name            VARCHAR(200)    NOT NULL,
    marker_url      VARCHAR(500),
    marker_preview  VARCHAR(500),
    aruco_id        INT UNSIGNED,
    model_url       VARCHAR(500),
    overlay_content JSON,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_node (node_id),
    UNIQUE INDEX uk_aruco (aruco_id),
    CONSTRAINT fk_ar_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_node   FOREIGN KEY (node_id)   REFERENCES script_nodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AR资源';

-- ------------------------- 13. 任务表 -------------------------
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    script_id       BIGINT UNSIGNED NOT NULL,
    node_id         BIGINT UNSIGNED NOT NULL,
    type            ENUM('gps_checkin','puzzle','photo','choice','ar_scan') NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    answer          VARCHAR(500),
    retry_hint      VARCHAR(300),
    reward_item     JSON,
    target_lat      DECIMAL(10,7),
    target_lng      DECIMAL(10,7),
    target_radius   INT UNSIGNED    NOT NULL DEFAULT 30,
    ar_resource_id  BIGINT UNSIGNED,
    sort_order      INT UNSIGNED    NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_node (node_id),
    INDEX idx_script (script_id),
    CONSTRAINT fk_task_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_node   FOREIGN KEY (node_id)   REFERENCES script_nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_ar     FOREIGN KEY (ar_resource_id) REFERENCES ar_resources(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- ------------------------- 14. 剧本进度表 -------------------------
DROP TABLE IF EXISTS script_progresses;
CREATE TABLE script_progresses (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id             BIGINT UNSIGNED NOT NULL,
    script_id           BIGINT UNSIGNED NOT NULL,
    status              ENUM('playing','completed') NOT NULL DEFAULT 'playing',
    current_node_id     BIGINT UNSIGNED,
    completed_node_ids  JSON,
    completed_task_ids  JSON,
    completed_ending_id BIGINT UNSIGNED,
    items               JSON,
    started_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        DATETIME,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user (user_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_current_node (current_node_id),
    CONSTRAINT fk_progress_user   FOREIGN KEY (user_id)         REFERENCES users(id),
    CONSTRAINT fk_progress_script FOREIGN KEY (script_id)       REFERENCES scripts(id),
    CONSTRAINT fk_progress_node   FOREIGN KEY (current_node_id) REFERENCES script_nodes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧本进度';

-- ------------------------- 15. 对话记录表 -------------------------
DROP TABLE IF EXISTS chat_logs;
CREATE TABLE chat_logs (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    script_id       BIGINT UNSIGNED NOT NULL,
    progress_id     BIGINT UNSIGNED NOT NULL,
    npc_id          BIGINT UNSIGNED NOT NULL,
    node_id         BIGINT UNSIGNED,
    role            ENUM('user','npc') NOT NULL,
    content         TEXT            NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_progress_npc (progress_id, npc_id, created_at),
    INDEX idx_user_script (user_id, script_id),
    CONSTRAINT fk_chat_user     FOREIGN KEY (user_id)     REFERENCES users(id),
    CONSTRAINT fk_chat_script   FOREIGN KEY (script_id)   REFERENCES scripts(id),
    CONSTRAINT fk_chat_progress FOREIGN KEY (progress_id) REFERENCES script_progresses(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_npc      FOREIGN KEY (npc_id)      REFERENCES script_npcs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话记录';

-- ------------------------- 16. 评分表 -------------------------
DROP TABLE IF EXISTS ratings;
CREATE TABLE ratings (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    script_id       BIGINT UNSIGNED NOT NULL,
    rating          TINYINT UNSIGNED NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_script (user_id, script_id),
    INDEX idx_script (script_id),
    CONSTRAINT fk_rating_user   FOREIGN KEY (user_id)   REFERENCES users(id),
    CONSTRAINT fk_rating_script FOREIGN KEY (script_id) REFERENCES scripts(id),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分表';

-- ------------------------- 17. AR 合影表 -------------------------
DROP TABLE IF EXISTS ar_photos;
CREATE TABLE ar_photos (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    progress_id     BIGINT UNSIGNED NOT NULL,
    script_id       BIGINT UNSIGNED NOT NULL,
    npc_id          BIGINT UNSIGNED NOT NULL,
    photo_url       VARCHAR(500)    NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user (user_id),
    INDEX idx_progress (progress_id),
    CONSTRAINT fk_photo_user     FOREIGN KEY (user_id)     REFERENCES users(id),
    CONSTRAINT fk_photo_progress FOREIGN KEY (progress_id) REFERENCES script_progresses(id) ON DELETE CASCADE,
    CONSTRAINT fk_photo_script   FOREIGN KEY (script_id)   REFERENCES scripts(id),
    CONSTRAINT fk_photo_npc      FOREIGN KEY (npc_id)      REFERENCES script_npcs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AR合影';

-- ============================================================
-- 第二部分：开发环境初始数据
-- ============================================================

-- ------------------------- 管理员（密码：admin123）-------------------------
INSERT INTO admins (username, password_hash, nickname, role) VALUES
('admin', '$2b$12$fTBgAm0Wi9DA.zGPX.XxS.ESieUhAZAivgtAXEzd2rvsqZSwXSDx.', '超级管理员', 'super_admin');

-- ------------------------- 示例乡村 -------------------------
INSERT INTO villages (id, name, description, lat, lng, address, tags) VALUES
(1, '古樟村',
 '古樟村建于明洪武年间，因村口的八百年古樟树而得名。村内保存完好的明清古建筑群、传统制茶工艺，以及世代相传的"樟木雕"非遗技艺，构成了一幅生动的江南古村落画卷。',
 30.1234000, 120.5678000,
 '浙江省杭州市临安区古樟村',
 '["古村落","非遗","茶园","明清建筑"]');

-- ------------------------- 古樟村打卡点 -------------------------
INSERT INTO village_spots (village_id, name, lat, lng, description, sort_order) VALUES
(1, '村口古樟树',   30.1234000, 120.5678000, '八百年的古樟树，枝叶遮天蔽日，树下有一口古井', 1),
(1, '陈氏宗祠',     30.1241000, 120.5682000, '建于清乾隆年间的家族祠堂，牌匾密布',           2),
(1, '古井石碑',     30.1235000, 120.5679000, '古井旁立有一块刻字的石碑，碑文已斑驳不清',       3),
(1, '老茶坊',       30.1245000, 120.5675000, '传承百年的手工制茶作坊，茶香四溢',               4),
(1, '樟木雕工坊',   30.1239000, 120.5685000, '非遗樟木雕传承人的工作室，陈列精美木雕',         5),
(1, '半月塘',       30.1243000, 120.5680000, '村中心的半月形池塘，传说与风水有关',             6);

-- ------------------------- 古樟村文化条目 -------------------------
INSERT INTO village_cultures (village_id, type, title, content) VALUES
(1, 'history', '明初建村',
 '古樟村始建于明洪武十年（1377年），由陈氏先祖从福建迁居至此。村名源于村口一株树龄超八百年的古樟树，村民视其为风水树，世代守护。'),
(1, 'history', '抗日联络站',
 '1942年至1945年间，古樟村陈氏宗祠曾是浙东抗日游击队的秘密联络站。祠堂第三块牌匾后藏有暗格，用于传递情报。'),
(1, 'intangible', '樟木雕技艺',
 '古樟村樟木雕技艺始于明代，以樟木为材，雕刻花鸟虫鱼、人物故事。2010年入选省级非物质文化遗产。传承人陈师傅是第四代传人。'),
(1, 'intangible', '手工炒茶',
 '古樟村周边茶园百亩，村民世代以种茶制茶为生。其手工炒茶技艺讲究"抖、搭、捺、磨"四法，炒出的龙井茶色泽翠绿、香气清雅。'),
(1, 'legend', '古井藏宝传说',
 '传说清乾隆年间，村中大户陈百万为避战乱，将家传宝物沉入古井之中，并留下暗语："樟影入井三分处，祠堂牌匾第七行"。数百年来无人能解。'),
(1, 'legend', '半月塘风水',
 '村中半月塘相传为明代风水师所设计，形如半月，与村口古樟、祠堂正门构成一条直线。村民相信此布局可保村落风调雨顺、人丁兴旺。');

-- ------------------------- 示例剧本 -------------------------
INSERT INTO scripts (id, village_id, title, type, difficulty, estimated_duration, storyline, status) VALUES
(1, 1, '《古村迷踪》', 'mystery', 3, 90,
 '你收到一封来自古樟村的神秘邀请函。村中流传着一个传说：古井深处埋藏着乾隆年间陈百万的宝藏，而解开秘密的线索就藏在村子的各个角落。作为受邀的探秘者，你将在古樟村展开一场跨越数百年的寻宝之旅，与热情的村民交流，解开古老的谜题，揭开尘封的历史真相。',
 'published');

-- ------------------------- 示例剧本 NPC -------------------------
INSERT INTO script_npcs (id, script_id, name, role, age, personality, description, system_prompt, greeting) VALUES
(1, 1, '老村长', '引导者', 68, '热情淳朴、说话带方言习惯、喜欢引用老话',
 '古樟村的退休老村长，在村口生活了大半辈子，对村子的历史和每个角落都了如指掌。',
 '你是古樟村的老村长陈伯，68岁，性格热情淳朴，说话偶尔带两句方言。你对村子的历史、传说、每个角落的故事都了如指掌。你喜欢引用老话和谚语来点拨别人。你知道古井藏宝的传说，也知道祠堂暗格的秘密，但不会一次性全部告诉游客——你需要观察游客是否"有缘"。回复控制在100字以内，口语化，像个真正的村里老人。',
 '哟，远方来的客人！欢迎来到咱古樟村，我是这村的陈伯。看你这气质，是冲着咱村的传说来的吧？'),

(2, 1, '小芳', '伙伴', 23, '活泼好奇、热情善良、有点急性子',
 '返乡创业的大学生，在村里经营一家茶饮小店。对村里的传说充满好奇，喜欢收集各种线索。',
 '你是小芳，23岁，古樟村人，大学毕业后回村创业，在村口开了一家茶饮店。你对村里的历史和传说特别感兴趣，平时喜欢收集老一辈讲的故事。你性格活泼开朗，容易和人打成一片，但有时候有点急躁。你知道一些村里的八卦和零散线索，愿意和游客分享。回复控制在80字以内，用年轻人的口吻，偶尔用点网络用语。',
 '嗨！你就是那个来探秘的吧？我是小芳，在村口开了家茶饮店。我跟你说，这村子可有意思了，老村长那儿故事最多，你先去找他聊聊！'),

(3, 1, '陈木匠', '关键人物', 52, '沉默寡言、手艺精湛、心怀往事',
 '樟木雕非遗传承人，第四代传人。性格内敛，专心于木雕手艺，似乎知道一些不为人知的秘密。',
 '你是陈木匠，52岁，樟木雕非遗第四代传人。你性格沉默寡言，不擅与人交谈，更喜欢和木头打交道。你的家族世代守护着古樟村的一个秘密，但你不是随便什么人都告诉的。只有当游客完成了一定的任务、展现出了"诚意"，你才会松口。回复控制在60字以内，少说多做的风格，说话简短但有分量。',
 '……你是来看木雕的？这边请。');

-- ------------------------- 示例剧本章节 -------------------------
INSERT INTO script_chapters (id, script_id, title, sort_order) VALUES
(1, 1, '第一章 · 初入古村', 1),
(2, 1, '第二章 · 祠堂秘事', 2),
(3, 1, '第三章 · 古井探秘', 3),
(4, 1, '第四章 · 真相大白', 4);

-- ------------------------- 示例剧情节点 -------------------------
INSERT INTO script_nodes (id, script_id, chapter_id, title, type, trigger_type, trigger_lat, trigger_lng, trigger_radius, dialogue_prompt, npc_id, config, sort_order) VALUES
-- 第一章
(1, 1, 1, '村口迎接', 'dialogue', 'gps', 30.1234000, 120.5678000, 50,
 '游客来到古樟村村口，巨大的古樟树下站着一位白发老人。',
 1,
 '{"nextNodes":[2,3],"hasBranch":true,"branchPrompt":"老村长问你想先去祠堂看看，还是自由地在村里转转？","branchOptions":[{"id":"opt_a","label":"跟老村长去祠堂","nextNodeId":2},{"id":"opt_b","label":"先在村里自由转转","nextNodeId":3}]}',
 1),

(2, 1, 1, '祠堂探访', 'dialogue', 'auto', NULL, NULL, 30,
 '老村长带你走进陈氏宗祠，里面陈列着陈氏家族的牌位和匾额。',
 1,
 '{"nextNodes":[4],"hasBranch":false}',
 2),

(3, 1, 1, '偶遇小芳', 'dialogue', 'auto', NULL, NULL, 30,
 '你在村里闲逛时，遇到了正在茶饮店忙碌的小芳。',
 2,
 '{"nextNodes":[2],"hasBranch":false}',
 3),

-- 第二章
(4, 1, 2, '破译族谱密码', 'task_hub', 'auto', NULL, NULL, 30,
 '老村长拿出一本泛黄的陈氏族谱，其中藏有秘密。',
 1,
 '{"nextNodes":[5],"hasBranch":false}',
 1),

(5, 1, 2, '牌匾暗格', 'task_hub', 'auto', NULL, NULL, 30,
 '你注意到祠堂第三块牌匾的位置不太对劲……',
 1,
 '{"nextNodes":[6],"hasBranch":false}',
 2),

-- 第三章
(6, 1, 3, '古井迷踪', 'task_hub', 'gps', 30.1235000, 120.5679000, 30,
 '你来到古井旁，石碑上的文字似乎暗示着什么。',
 1,
 '{"nextNodes":[7,8],"hasBranch":true,"branchPrompt":"你选择自己解谜，还是去找陈木匠求助？","branchOptions":[{"id":"opt_a","label":"自己尝试解谜","nextNodeId":7},{"id":"opt_b","label":"找陈木匠帮忙","nextNodeId":8}]}',
 1),

(7, 1, 3, '独自解谜', 'task_hub', 'auto', NULL, NULL, 30,
 '你仔细观察古井和石碑，尝试解读暗语中的线索……',
 NULL,
 '{"nextNodes":[9],"hasBranch":false}',
 2),

(8, 1, 3, '陈木匠的往事', 'dialogue', 'auto', NULL, NULL, 30,
 '你来到樟木雕工坊，陈木匠正在专心雕刻……',
 3,
 '{"nextNodes":[9],"hasBranch":false}',
 3),

-- 第四章
(9, 1, 4, '宝藏真相', 'ending', 'auto', NULL, NULL, 30,
 '所有的线索汇聚在一起，你终于揭开了古井宝藏的秘密……',
 NULL,
 '{"nextNodes":[],"hasBranch":false}',
 1);

-- ------------------------- 示例任务 -------------------------
INSERT INTO tasks (id, script_id, node_id, type, title, description, answer, retry_hint, reward_item, target_lat, target_lng, target_radius, sort_order) VALUES
-- 节点1 村口迎接：GPS签到任务
(1, 1, 1, 'gps_checkin', '走进村口牌坊',
 '穿过村口的古牌坊，标志着你的旅程正式开始。',
 NULL, NULL,
 NULL,
 30.1234000, 120.5678000, 30, 1),

-- 节点4 破译族谱密码：谜题
(2, 1, 4, 'puzzle', '破译族谱密码',
 '老村长递给你一本泛黄的族谱。翻开第三页，发现一行奇怪的字："樟影入井三分处，祠堂牌匾第七行"。这些字似乎暗示着下一个线索的位置。请问"第七行"指的是什么？',
 '匾额', '注意祠堂里那些挂在高处的匾额……它们的排列有什么规律？',
 '{"itemId":"item_001","name":"族谱残页","icon":"/static/items/page.png","description":"记载着暗语的族谱残页","type":"clue"}',
 NULL, NULL, 30, 1),

-- 节点5 牌匾暗格：AR扫描任务
(3, 1, 5, 'ar_scan', '扫描祠堂牌匾',
 '你发现祠堂第三块牌匾后方似乎有暗格。用AR扫描牌匾，查看隐藏的信息。',
 NULL, NULL,
 '{"itemId":"item_002","name":"游击队密信","icon":"/static/items/letter.png","description":"一封泛黄的密信，记载着抗战时期的情报","type":"clue"}',
 30.1241000, 120.5682000, 15, 1),

-- 节点6 古井迷踪：GPS签到任务
(4, 1, 6, 'gps_checkin', '来到古井旁',
 '根据线索，你需要亲自来到古井旁查看。',
 NULL, NULL,
 NULL,
 30.1235000, 120.5679000, 20, 1),

-- 节点7 独自解谜：谜题
(5, 1, 7, 'puzzle', '解读古井暗语',
 '你站在古井旁，脑海中回荡着那句暗语："樟影入井三分处，祠堂牌匾第七行"。你想起了族谱中看到的"第七行"——祠堂牌匾第七块上的年份是？提示：陈氏宗祠正厅牌匾按年代排列，第七块匾额的落款年份就是古井的关键数字。',
 '乾隆四十八年', '再仔细数数祠堂正厅的牌匾，从左到右第七块。',
 '{"itemId":"item_003","name":"古井机关的密码","icon":"/static/items/code.png","description":"一块刻着数字的石板，是打开井底暗门的密码","type":"key"}',
 NULL, NULL, 30, 1),

-- 节点7 选择决策（剧情分支）
(6, 1, 7, 'choice', '寻找终极线索',
 '你获得了井底机关的密码，但需要找到井底暗门的具体入口。你选择从哪里入手？',
 NULL, NULL,
 NULL,
 NULL, NULL, 30, 2);

-- ------------------------- 示例结局 -------------------------
INSERT INTO script_endings (script_id, title, description, condition_desc) VALUES
(1, '真相大白',
 '你在古井深处找到了陈百万留下的家书和一枚田黄石印章。原来当年的"宝藏"并非金银，而是陈百万留给后人的一封家书和象征诚信的印章——他希望子孙后代记住：真正的财富是品行与传承。你带着这个发现回到村里，全村人为你举办了一场热闹的庆功宴。',
 '收集全部线索并解开古井谜题'),

(1, '半途而废',
 '你在祠堂找到了一些线索，但最终没能解开古井的秘密。不过你依然在古樟村度过了一段愉快的时光，品尝了小芳的手工茶，欣赏了陈木匠的精美木雕。宝藏的故事仍在风中流传，等待下一位有缘人。',
 '未能解开所有谜题',
 '匆匆过客'),

(1, '另有隐情',
 '通过陈木匠的叙述，你发现宝藏的秘密远比传说中复杂——陈百万当年并非将宝物沉入井中，而是用这笔财富暗中资助了当地的抗清义军。"宝藏"早已化作一段不为人知的家国故事。',
 '通过陈木匠路线完成剧本',
 '历史见证者');
