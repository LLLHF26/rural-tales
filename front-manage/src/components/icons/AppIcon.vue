<template>
  <span class="app-icon" :class="`icon-${name}`" :style="{ fontSize: size + 'px' }">

    <!-- ================================================================ -->
    <!--  导航类                                                        -->
    <!-- ================================================================ -->

    <!-- dashboard: 仪表盘 -->
    <svg v-if="name === 'dashboard'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-dashboard" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-dashboard" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-dashboard" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-dashboard"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-dashboard)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-dashboard)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#d4a5a5" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#b0b8d8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <rect x="18" y="18" width="12" height="12" rx="3" fill="url(#jade-dashboard)" filter="url(#sh-dashboard)"/>
      <rect x="18" y="18" width="12" height="3" rx="1" fill="#ffffff" fill-opacity="0.25"/>
      <rect x="18" y="33" width="12" height="12" rx="3" fill="url(#jade-dashboard)" filter="url(#sh-dashboard)" opacity="0.7"/>
      <rect x="18" y="33" width="12" height="3" rx="1" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="33" y="18" width="12" height="12" rx="3" fill="url(#jade-dashboard)" filter="url(#sh-dashboard)" opacity="0.7"/>
      <rect x="33" y="18" width="12" height="3" rx="1" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="33" y="33" width="12" height="12" rx="3" fill="url(#jade-dashboard)" filter="url(#sh-dashboard)"/>
      <rect x="33" y="33" width="12" height="3" rx="1" fill="#ffffff" fill-opacity="0.25"/>
    </svg>

    <!-- analytics: 数据统计 -->
    <svg v-else-if="name === 'analytics'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-analytics" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-analytics" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-analytics" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-analytics"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-analytics)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-analytics)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#e0b898" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#a8c8b8" opacity="0.9"/>
      <path d="M51 7 Q55 3 57 9 Q53 11 51 7Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="17" y="36" width="8" height="14" rx="3.5" fill="url(#jade-analytics)" filter="url(#sh-analytics)" opacity="0.68"/>
      <rect x="17" y="36" width="8" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.2"/>
      <rect x="28" y="28" width="8" height="22" rx="3.5" fill="url(#jade-analytics)" filter="url(#sh-analytics)" opacity="0.85"/>
      <rect x="28" y="28" width="8" height="3.5" rx="1.5" fill="#ffffff" fill-opacity="0.25"/>
      <rect x="39" y="20" width="8" height="30" rx="3.5" fill="url(#jade-analytics)" filter="url(#sh-analytics)"/>
      <rect x="39" y="20" width="8" height="4" rx="2" fill="#ffffff" fill-opacity="0.3"/>
      <rect x="14" y="50" width="36" height="2.5" rx="1.2" fill="#5b8c5a" opacity="0.5"/>
    </svg>

    <!-- village: 乡村管理 — 2.5D 中式田园村居 -->
    <svg v-else-if="name === 'village'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-village" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-village" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="houseTop-village" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d4c8a0"/><stop offset="50%" stop-color="#c4b080"/><stop offset="100%" stop-color="#a08860"/></linearGradient>
        <linearGradient id="houseWall-village" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0ead8"/><stop offset="70%" stop-color="#e8dcc8"/><stop offset="100%" stop-color="#d0c4a8"/></linearGradient>
        <linearGradient id="mount-village" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#689868"/><stop offset="50%" stop-color="#4a7a48"/><stop offset="100%" stop-color="#305a30"/></linearGradient>
        <linearGradient id="treeGrad-village" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#90d890"/><stop offset="40%" stop-color="#6ab86a"/><stop offset="100%" stop-color="#3a6a38"/></linearGradient>
        <linearGradient id="glass-village" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-village"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
        <filter id="shLight-village"><feDropShadow dx="1" dy="1.5" stdDeviation="1.5" flood-color="#081208" flood-opacity="0.35"/></filter>
      </defs>
      <!-- 底板 -->
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-village)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <!-- 顶部玻璃光效 -->
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-village)"/>
      <!-- 左缎带小锦旗 -->
      <path d="M7 18 L15 21 L7 24Z" fill="#e8b4a0" opacity="0.9"/>
      <!-- 右缎带小锦旗 -->
      <path d="M57 18 L49 21 L57 24Z" fill="#a0c8d8" opacity="0.9"/>
      <!-- 右下竹叶点缀 -->
      <path d="M51 10 Q55 6 57 12 Q53 14 51 10Z" fill="#7ec87b" opacity="0.5"/>
      <!-- 远景山脉1 -->
      <path d="M12 44 Q20 24 30 34 Q36 26 44 32 Q52 22 58 38V46H12Z" fill="url(#mount-village)" filter="url(#shLight-village)" opacity="0.5"/>
      <!-- 远景山脉2 -->
      <path d="M10 44 Q22 28 34 38 Q42 30 50 36 Q56 28 60 40V46H10Z" fill="url(#mount-village)" filter="url(#shLight-village)" opacity="0.35"/>
      <!-- 左侧树木 -->
      <rect x="14" y="28" width="2.5" height="16" rx="1" fill="url(#treeGrad-village)" opacity="0.85"/>
      <circle cx="15.5" cy="27" r="5" fill="url(#treeGrad-village)" filter="url(#shLight-village)" opacity="0.9"/>
      <circle cx="12" cy="31" r="4" fill="url(#treeGrad-village)" opacity="0.8"/>
      <circle cx="19" cy="30" r="3.5" fill="url(#treeGrad-village)" opacity="0.75"/>
      <!-- 右后树木 -->
      <rect x="48" y="30" width="2" height="14" rx="1" fill="url(#treeGrad-village)" opacity="0.7"/>
      <circle cx="49" cy="29" r="4" fill="url(#treeGrad-village)" filter="url(#shLight-village)" opacity="0.8"/>
      <!-- 主屋: 墙体 -->
      <rect x="23" y="34" width="18" height="16" rx="2" fill="url(#houseWall-village)" filter="url(#sh-village)"/>
      <rect x="23" y="34" width="18" height="16" rx="2" stroke="#b89868" stroke-width="0.6" fill="none" opacity="0.4"/>
      <!-- 主屋顶: 飞檐 -->
      <path d="M20 36 L32 24 L44 36 L42 36 L32 27 L22 36Z" fill="url(#houseTop-village)" filter="url(#shLight-village)"/>
      <path d="M20 36 L32 24 L44 36" stroke="#8a7050" stroke-width="0.5" fill="none" opacity="0.45"/>
      <!-- 屋顶高光 -->
      <path d="M27 30 L32 27 L37 30" stroke="#f0e8d0" stroke-width="0.6" fill="none" opacity="0.4"/>
      <!-- 门 -->
      <rect x="28" y="40" width="8" height="10" rx="3" fill="#5a3a1a" opacity="0.55" filter="url(#shLight-village)"/>
      <rect x="28" y="40" width="8" height="3.5" rx="1.5" fill="#f0ead8" fill-opacity="0.2"/>
      <!-- 窗1 -->
      <rect x="24.5" y="36" width="4.5" height="4" rx="1" fill="#5a3a1a" opacity="0.4"/>
      <rect x="24.5" y="36" width="4.5" height="1.5" rx="0.5" fill="#f0ead8" fill-opacity="0.15"/>
      <!-- 窗2 -->
      <rect x="35" y="36" width="4.5" height="4" rx="1" fill="#5a3a1a" opacity="0.4"/>
      <rect x="35" y="36" width="4.5" height="1.5" rx="0.5" fill="#f0ead8" fill-opacity="0.15"/>
      <!-- 门前石径 -->
      <path d="M32 50 Q30 54 32 58" stroke="#b8a080" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.5"/>
      <!-- 墙顶高光装饰条 -->
      <rect x="23" y="34" width="18" height="2" rx="1" fill="#ffffff" fill-opacity="0.15"/>
      <!-- 左前竹丛 -->
      <rect x="16" y="36" width="1.5" height="14" rx="0.8" fill="#5b8c5a" opacity="0.7"/>
      <circle cx="17" cy="35" r="3" fill="#7ec87b" opacity="0.65"/>
      <circle cx="14.5" cy="37" r="2.5" fill="#7ec87b" opacity="0.55"/>
      <!-- 烟囱 -->
      <rect x="25" y="26" width="3" height="5" rx="0.5" fill="#c8b898" opacity="0.55"/>
      <path d="M26.5 24 Q28 21 26.5 20" stroke="#ffffff" stroke-width="0.8" fill="none" stroke-linecap="round" opacity="0.2"/>
    </svg>

    <!-- script: 剧本列表 -->
    <svg v-else-if="name === 'script'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-script" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-script" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0e0b0"/><stop offset="50%" stop-color="#d4c890"/><stop offset="100%" stop-color="#b8a870"/></linearGradient>
        <linearGradient id="glass-script" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-script"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-script)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-script)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#a8c8d0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#d4a5a5" opacity="0.9"/>
      <path d="M10 9 Q15 4 18 10 Q14 12 10 9Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="16" y="14" width="32" height="36" rx="4" fill="url(#jade-script)" filter="url(#sh-script)"/>
      <rect x="16" y="14" width="32" height="36" rx="4" stroke="#a89470" stroke-width="0.6" opacity="0.5" fill="none"/>
      <rect x="16" y="14" width="32" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.22"/>
      <line x1="20" y1="25" x2="44" y2="25" stroke="#8a7848" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="20" y1="30" x2="44" y2="30" stroke="#8a7848" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="20" y1="35" x2="38" y2="35" stroke="#8a7848" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <line x1="20" y1="40" x2="44" y2="40" stroke="#8a7848" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="20" y1="45" x2="36" y2="45" stroke="#8a7848" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
    </svg>

    <!-- editPen: 剧本编辑器 -->
    <svg v-else-if="name === 'editPen'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-editPen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-editPen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d0e8c0"/><stop offset="50%" stop-color="#8ed88e"/><stop offset="100%" stop-color="#5b9c60"/></linearGradient>
        <linearGradient id="glass-editPen" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-editPen"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-editPen)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-editPen)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#e8c8a0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#d8b0a0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="20" y="32" width="28" height="5" rx="2.5" fill="url(#jade-editPen)" filter="url(#sh-editPen)" transform="rotate(-40 34 34)"/>
      <rect x="20" y="32" width="28" height="2" rx="1" fill="#ffffff" fill-opacity="0.3" transform="rotate(-40 34 34)"/>
      <path d="M18 38 L26 36 L32 46L24 48Z" fill="url(#jade-editPen)" filter="url(#sh-editPen)"/>
    </svg>

    <!-- magic: AI剧本生成 -->
    <svg v-else-if="name === 'magic'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-magic" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-magic" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0b0"/><stop offset="50%" stop-color="#f0d870"/><stop offset="100%" stop-color="#c49a3c"/></linearGradient>
        <linearGradient id="glass-magic" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-magic"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-magic)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-magic)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#b0d0d8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#d4b8d8" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="32" r="10" fill="url(#jade-magic)" filter="url(#sh-magic)"/>
      <circle cx="32" cy="32" r="10" stroke="#b89030" stroke-width="0.5" fill="none" opacity="0.4"/>
      <circle cx="32" cy="32" r="6" fill="#ffffff" fill-opacity="0.2"/>
      <path d="M32 18 L33 24 L32 18Z" fill="#c49a3c" opacity="0.6"/>
      <path d="M32 40 L33 46 L32 40Z" fill="#c49a3c" opacity="0.6"/>
      <path d="M18 32 L24 31 L18 32Z" fill="#c49a3c" opacity="0.6"/>
      <path d="M40 32 L46 31 L40 32Z" fill="#c49a3c" opacity="0.6"/>
      <path d="M23 23 L26 26 L23 23Z" fill="#c49a3c" opacity="0.4"/>
      <path d="M41 41 L38 38 L41 41Z" fill="#c49a3c" opacity="0.4"/>
      <path d="M41 23 L38 26 L41 23Z" fill="#c49a3c" opacity="0.4"/>
      <path d="M23 41 L26 38 L23 41Z" fill="#c49a3c" opacity="0.4"/>
    </svg>

    <!-- user: 用户管理 -->
    <svg v-else-if="name === 'user'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-user" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-user" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8d0a0"/><stop offset="50%" stop-color="#d4a870"/><stop offset="100%" stop-color="#b08050"/></linearGradient>
        <linearGradient id="glass-user" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-user"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-user)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-user)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#c8d4a0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#e0c0a0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="22" r="8" fill="url(#jade-user)" filter="url(#sh-user)"/>
      <circle cx="32" cy="22" r="4" fill="#ffffff" fill-opacity="0.2"/>
      <path d="M16 48c0-8 7.2-14 16-14s16 6 16 14" fill="url(#jade-user)" filter="url(#sh-user)" opacity="0.9"/>
      <path d="M20 48c0-6 5.4-12 12-12" fill="#ffffff" fill-opacity="0.1"/>
    </svg>

    <!-- userAvatar: 头像中的用户图标（ID 加后缀避免与 user 冲突） -->
    <svg v-else-if="name === 'userAvatar'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-userAvatar" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-userAvatar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8d0a0"/><stop offset="50%" stop-color="#d4a870"/><stop offset="100%" stop-color="#b08050"/></linearGradient>
        <linearGradient id="glass-userAvatar" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-userAvatar"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-userAvatar)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-userAvatar)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#c8d4a0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#e0c0a0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="22" r="8" fill="url(#jade-userAvatar)" filter="url(#sh-userAvatar)"/>
      <circle cx="32" cy="22" r="4" fill="#ffffff" fill-opacity="0.2"/>
      <path d="M16 48c0-8 7.2-14 16-14s16 6 16 14" fill="url(#jade-userAvatar)" filter="url(#sh-userAvatar)" opacity="0.9"/>
      <path d="M20 48c0-6 5.4-12 12-12" fill="#ffffff" fill-opacity="0.1"/>
    </svg>

    <!-- settings: 系统设置 -->
    <svg v-else-if="name === 'settings'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-settings" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-settings" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c0c8c0"/><stop offset="50%" stop-color="#90a090"/><stop offset="100%" stop-color="#6a7a60"/></linearGradient>
        <linearGradient id="glass-settings" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-settings"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-settings)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-settings)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#b8c0c8" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#c8b8c0" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="32" r="7" fill="url(#jade-settings)" filter="url(#sh-settings)"/>
      <circle cx="32" cy="32" r="3.5" fill="#152618" opacity="0.5"/>
      <circle cx="32" cy="32" r="1.5" fill="#ffffff" fill-opacity="0.3"/>
      <rect x="30" y="12" width="4" height="7" rx="2" fill="url(#jade-settings)" opacity="0.7"/>
      <rect x="30" y="45" width="4" height="7" rx="2" fill="url(#jade-settings)" opacity="0.7"/>
      <rect x="12" y="30" width="7" height="4" rx="2" fill="url(#jade-settings)" opacity="0.7"/>
      <rect x="45" y="30" width="7" height="4" rx="2" fill="url(#jade-settings)" opacity="0.7"/>
      <rect x="17" y="16" width="6" height="5" rx="2" fill="url(#jade-settings)" opacity="0.5" transform="rotate(45 20 18)"/>
      <rect x="41" y="42" width="6" height="5" rx="2" fill="url(#jade-settings)" opacity="0.5" transform="rotate(45 44 44)"/>
      <rect x="42" y="16" width="6" height="5" rx="2" fill="url(#jade-settings)" opacity="0.5" transform="rotate(-45 45 18)"/>
      <rect x="16" y="42" width="6" height="5" rx="2" fill="url(#jade-settings)" opacity="0.5" transform="rotate(-45 19 44)"/>
    </svg>

    <!-- logout: 退出登录 -->
    <svg v-else-if="name === 'logout'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-logout" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-logout" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c0c0"/><stop offset="50%" stop-color="#d89090"/><stop offset="100%" stop-color="#a06060"/></linearGradient>
        <linearGradient id="glass-logout" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-logout"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-logout)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-logout)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#e8a8a8" opacity="0.85"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#d0a8b8" opacity="0.85"/>
      <path d="M12 33 Q16 29 18 35 Q14 36 12 33Z" fill="#7ec87b" opacity="0.45"/>
      <rect x="10" y="14" width="18" height="36" rx="3" fill="url(#jade-logout)" filter="url(#sh-logout)" opacity="0.85"/>
      <rect x="10" y="14" width="18" height="36" rx="3" stroke="#a06060" stroke-width="0.5" opacity="0.4" fill="none"/>
      <rect x="10" y="14" width="18" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.2"/>
      <path d="M34 24 L48 32L34 40" stroke="url(#jade-logout)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#sh-logout)"/>
      <path d="M48 32L28 32" stroke="url(#jade-logout)" stroke-width="4" stroke-linecap="round" filter="url(#sh-logout)"/>
    </svg>

    <!-- ================================================================ -->
    <!--  操作类                                                        -->
    <!-- ================================================================ -->

    <!-- search: 搜索 -->
    <svg v-else-if="name === 'search'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-search" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-search" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8c8b8"/><stop offset="50%" stop-color="#889888"/><stop offset="100%" stop-color="#5a6a58"/></linearGradient>
        <linearGradient id="glass-search" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-search"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-search)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-search)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#c8b8d0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#b0c8c0" opacity="0.9"/>
      <path d="M12 33 Q16 29 18 35 Q14 36 12 33Z" fill="#7ec87b" opacity="0.45"/>
      <circle cx="27" cy="27" r="13" fill="url(#jade-search)" filter="url(#sh-search)" opacity="0.9"/>
      <circle cx="27" cy="27" r="13" stroke="#6a7a68" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="27" cy="27" r="8" fill="#2a4a38" opacity="0.5"/>
      <circle cx="27" cy="27" r="5" fill="#ffffff" fill-opacity="0.12"/>
      <rect x="39" y="39" width="12" height="5" rx="2.5" fill="url(#jade-search)" filter="url(#sh-search)" transform="rotate(45 45 41)"/>
    </svg>

    <!-- plus: 新增 -->
    <svg v-else-if="name === 'plus'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-plus" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-plus" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8f0b8"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-plus" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-plus"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-plus)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-plus)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#a8d8b8" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#a8c8d8" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-plus)" filter="url(#sh-plus)"/>
      <circle cx="32" cy="32" r="14" stroke="#4a8c50" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="10" fill="#ffffff" fill-opacity="0.1"/>
      <rect x="28" y="18" width="8" height="28" rx="3.5" fill="#ffffff" fill-opacity="0.9"/>
      <rect x="18" y="28" width="28" height="8" rx="3.5" fill="#ffffff" fill-opacity="0.9"/>
    </svg>

    <!-- delete: 删除 -->
    <svg v-else-if="name === 'delete'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-delete" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-delete" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c0c0"/><stop offset="50%" stop-color="#d89090"/><stop offset="100%" stop-color="#a06060"/></linearGradient>
        <linearGradient id="glass-delete" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-delete"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-delete)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-delete)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#e8b0b0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c8b8d0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.45"/>
      <rect x="14" y="16" width="36" height="5" rx="2.5" fill="url(#jade-delete)" filter="url(#sh-delete)"/>
      <rect x="14" y="16" width="36" height="2" rx="1" fill="#ffffff" fill-opacity="0.2"/>
      <rect x="20" y="21" width="24" height="28" rx="4" fill="url(#jade-delete)" filter="url(#sh-delete)" opacity="0.9"/>
      <rect x="20" y="21" width="24" height="28" rx="4" stroke="#a06060" stroke-width="0.5" fill="none" opacity="0.3"/>
      <line x1="27" y1="27" x2="27" y2="43" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
      <line x1="37" y1="27" x2="37" y2="43" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
      <line x1="24" y1="27" x2="40" y2="27" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
    </svg>

    <!-- edit: 编辑 -->
    <svg v-else-if="name === 'edit'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-edit" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-edit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d0e8c0"/><stop offset="50%" stop-color="#8ed88e"/><stop offset="100%" stop-color="#5b9c60"/></linearGradient>
        <linearGradient id="glass-edit" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-edit"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-edit)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-edit)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#d0e0b8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c0d0e0" opacity="0.9"/>
      <path d="M12 33 Q16 29 18 35 Q14 36 12 33Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="16" y="18" width="32" height="26" rx="3" fill="url(#jade-edit)" filter="url(#sh-edit)" opacity="0.85"/>
      <rect x="16" y="18" width="32" height="4" rx="2" fill="#ffffff" fill-opacity="0.2"/>
      <rect x="20" y="26" width="24" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="20" y="32" width="18" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="20" y="38" width="12" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.1"/>
    </svg>

    <!-- arrowLeft: 返回箭头 -->
    <svg v-else-if="name === 'arrowLeft'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-arrowLeft" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-arrowLeft" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-arrowLeft" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-arrowLeft"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-arrowLeft)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-arrowLeft)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#a8d8c0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#c8d0a8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-arrowLeft)" filter="url(#sh-arrowLeft)"/>
      <circle cx="32" cy="32" r="14" stroke="#4a8c50" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="10" fill="#ffffff" fill-opacity="0.1"/>
      <path d="M38 22 L24 32L38 42" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    </svg>

    <!-- arrowDown: 下拉箭头 -->
    <svg v-else-if="name === 'arrowDown'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-arrowDown" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-arrowDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-arrowDown" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-arrowDown"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-arrowDown)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-arrowDown)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#d4b8a8" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#b8c8d8" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-arrowDown)" filter="url(#sh-arrowDown)"/>
      <circle cx="32" cy="32" r="14" stroke="#4a8c50" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="10" fill="#ffffff" fill-opacity="0.1"/>
      <path d="M22 26 L32 40L42 26" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    </svg>

    <!-- arrowRight: 右箭头 -->
    <svg v-else-if="name === 'arrowRight'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-arrowRight" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-arrowRight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-arrowRight" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-arrowRight"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-arrowRight)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-arrowRight)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#a8d8c0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#c8d0a8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-arrowRight)" filter="url(#sh-arrowRight)"/>
      <circle cx="32" cy="32" r="14" stroke="#4a8c50" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="10" fill="#ffffff" fill-opacity="0.1"/>
      <path d="M26 22 L40 32L26 42" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    </svg>

    <!-- fold: 折叠 -->
    <svg v-else-if="name === 'fold'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-fold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-fold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8c0b8"/><stop offset="50%" stop-color="#889888"/><stop offset="100%" stop-color="#5a6a58"/></linearGradient>
        <linearGradient id="glass-fold" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-fold"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-fold)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-fold)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#c0c8c8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c8c8c0" opacity="0.9"/>
      <path d="M12 33 Q16 29 18 35 Q14 36 12 33Z" fill="#7ec87b" opacity="0.45"/>
      <path d="M39 20 L24 32L39 44" stroke="url(#jade-fold)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M39 27 L30 32L39 37" stroke="url(#jade-fold)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    </svg>

    <!-- expand: 展开 -->
    <svg v-else-if="name === 'expand'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-expand" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-expand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8c0b8"/><stop offset="50%" stop-color="#889888"/><stop offset="100%" stop-color="#5a6a58"/></linearGradient>
        <linearGradient id="glass-expand" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-expand"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-expand)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-expand)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#d0c8b8" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#c0c8d0" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.5"/>
      <path d="M25 20 L40 32L25 44" stroke="url(#jade-expand)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 27 L34 32L25 37" stroke="url(#jade-expand)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    </svg>

    <!-- grid: 网格视图 -->
    <svg v-else-if="name === 'grid'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-grid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-grid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-grid" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-grid"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-grid)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-grid)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#c0d8b0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#d0c0a8" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.55"/>
      <rect x="14" y="14" width="16" height="16" rx="4" fill="url(#jade-grid)" filter="url(#sh-grid)"/>
      <rect x="14" y="14" width="16" height="4" rx="2" fill="#ffffff" fill-opacity="0.25"/>
      <rect x="14" y="34" width="16" height="16" rx="4" fill="url(#jade-grid)" filter="url(#sh-grid)" opacity="0.65"/>
      <rect x="14" y="34" width="16" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="34" y="14" width="16" height="16" rx="4" fill="url(#jade-grid)" filter="url(#sh-grid)" opacity="0.65"/>
      <rect x="34" y="14" width="16" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="34" y="34" width="16" height="16" rx="4" fill="url(#jade-grid)" filter="url(#sh-grid)" opacity="0.82"/>
      <rect x="34" y="34" width="16" height="4" rx="2" fill="#ffffff" fill-opacity="0.22"/>
    </svg>

    <!-- list: 列表视图 -->
    <svg v-else-if="name === 'list'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-list" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-list" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-list" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-list"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-list)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-list)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#d8d0b0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#b0c0d8" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="14" y="16" width="36" height="8" rx="4" fill="url(#jade-list)" filter="url(#sh-list)"/>
      <rect x="14" y="16" width="36" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.28"/>
      <rect x="14" y="28" width="36" height="8" rx="4" fill="url(#jade-list)" filter="url(#sh-list)" opacity="0.65"/>
      <rect x="14" y="28" width="36" height="2" rx="1" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="14" y="40" width="36" height="8" rx="4" fill="url(#jade-list)" filter="url(#sh-list)" opacity="0.5"/>
      <rect x="14" y="40" width="36" height="2" rx="1" fill="#ffffff" fill-opacity="0.1"/>
    </svg>

    <!-- bell: 通知 -->
    <svg v-else-if="name === 'bell'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-bell" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-bell" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0e0b0"/><stop offset="50%" stop-color="#d4b870"/><stop offset="100%" stop-color="#a88840"/></linearGradient>
        <linearGradient id="glass-bell" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-bell"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-bell)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-bell)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#e8d8b0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c0b8d0" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.5"/>
      <path d="M22 16c0-5 4.5-9 10-9s10 4 10 9c0 9-4 13-4 13h-12s-4-4-4-13Z" fill="url(#jade-bell)" filter="url(#sh-bell)"/>
      <path d="M22 16c0-5 4.5-9 10-9s10 4 10 9c0 9-4 13-4 13h-12s-4-4-4-13Z" stroke="#a88840" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="18" y="28" width="28" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.2"/>
      <circle cx="32" cy="13" r="4" fill="#d4a5a5" opacity="0.8"/>
      <path d="M24 44h16" stroke="url(#jade-bell)" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="48" r="2.5" fill="url(#jade-bell)" opacity="0.6"/>
    </svg>

    <!-- check: 勾选 -->
    <svg v-else-if="name === 'check'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-check" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-check" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8f0b8"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-check" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-check"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-check)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-check)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#a8d8b8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#d4a8c8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-check)" filter="url(#sh-check)"/>
      <circle cx="32" cy="32" r="14" stroke="#4a8c50" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="10" fill="#ffffff" fill-opacity="0.1"/>
      <path d="M24 32L30 39L42 26" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    </svg>

    <!-- checkFilled: 实心勾选 -->
    <svg v-else-if="name === 'checkFilled'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-checkFilled" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-checkFilled" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#90e090"/><stop offset="50%" stop-color="#5b8c5a"/><stop offset="100%" stop-color="#3a6a40"/></linearGradient>
        <linearGradient id="glass-checkFilled" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-checkFilled"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-checkFilled)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-checkFilled)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#a8d0b0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#c8b0d0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="32" r="15" fill="url(#jade-checkFilled)" filter="url(#sh-checkFilled)"/>
      <circle cx="32" cy="32" r="15" stroke="#3a6a40" stroke-width="0.5" fill="none" opacity="0.4"/>
      <circle cx="32" cy="28" r="8" fill="#ffffff" fill-opacity="0.12"/>
      <path d="M23 33L30 40L43 24" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
    </svg>

    <!-- select: 选择 -->
    <svg v-else-if="name === 'select'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-select" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-select" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8c8b8"/><stop offset="50%" stop-color="#889888"/><stop offset="100%" stop-color="#5a6a58"/></linearGradient>
        <linearGradient id="glass-select" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-select"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-select)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-select)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#d0c8b8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#b8c8c8" opacity="0.9"/>
      <path d="M12 33 Q16 29 18 35 Q14 36 12 33Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="18" y="22" width="28" height="5" rx="2.5" fill="url(#jade-select)" filter="url(#sh-select)"/>
      <rect x="18" y="22" width="28" height="2" rx="1" fill="#ffffff" fill-opacity="0.25"/>
      <rect x="18" y="31" width="28" height="5" rx="2.5" fill="url(#jade-select)" filter="url(#sh-select)" opacity="0.7"/>
      <rect x="18" y="31" width="28" height="1.5" rx="0.75" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="18" y="40" width="28" height="5" rx="2.5" fill="url(#jade-select)" filter="url(#sh-select)" opacity="0.55"/>
      <rect x="18" y="40" width="28" height="1.5" rx="0.75" fill="#ffffff" fill-opacity="0.1"/>
    </svg>

    <!-- ================================================================ -->
    <!--  特殊                                                        -->
    <!-- ================================================================ -->

    <!-- lock: 锁 -->
    <svg v-else-if="name === 'lock'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-lock" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-lock" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0e0b0"/><stop offset="50%" stop-color="#d4b870"/><stop offset="100%" stop-color="#a88840"/></linearGradient>
        <linearGradient id="glass-lock" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-lock"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-lock)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-lock)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#e0c898" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#b8c0d8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="16" y="26" width="32" height="24" rx="5" fill="url(#jade-lock)" filter="url(#sh-lock)"/>
      <rect x="16" y="26" width="32" height="24" rx="5" stroke="#a88840" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="16" y="26" width="32" height="6" rx="3" fill="#ffffff" fill-opacity="0.18"/>
      <circle cx="32" cy="40" r="3.5" fill="#ffffff" fill-opacity="0.6"/>
      <path d="M24 26V18a8 8 0 0116 0v8" stroke="url(#jade-lock)" stroke-width="4.5" stroke-linecap="round"/>
    </svg>

    <!-- ================================================================ -->
    <!--  剧本编辑器专用                                                -->
    <!-- ================================================================ -->

    <!-- chapterMap: 章节地图（卷轴旗帜） -->
    <svg v-else-if="name === 'chapterMap'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-chapterMap" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-chapterMap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0e0b0"/><stop offset="50%" stop-color="#d4c890"/><stop offset="100%" stop-color="#b8a870"/></linearGradient>
        <linearGradient id="stick" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#b8a060"/><stop offset="50%" stop-color="#d4c890"/><stop offset="100%" stop-color="#a08850"/></linearGradient>
        <linearGradient id="glass-chapterMap" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-chapterMap"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-chapterMap)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-chapterMap)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#e0d0a8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#d0c0d8" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.55"/>
      <rect x="16" y="20" width="3" height="28" rx="1.5" fill="url(#stick)" filter="url(#sh-chapterMap)"/>
      <path d="M19 22 L42 18V42L19 38Z" fill="url(#jade-chapterMap)" filter="url(#sh-chapterMap)"/>
      <path d="M19 22 L42 18V42L19 38Z" stroke="#a89470" stroke-width="0.5" fill="none" opacity="0.4"/>
      <line x1="22" y1="27" x2="39" y2="25" stroke="#9a8040" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
      <line x1="22" y1="32" x2="39" y2="30" stroke="#9a8040" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
      <line x1="22" y1="37" x2="35" y2="35" stroke="#9a8040" stroke-width="1" stroke-linecap="round" opacity="0.35"/>
    </svg>

    <!-- folder: 章节文件夹 -->
    <svg v-else-if="name === 'folder'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-folder" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-folder" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e0c890"/><stop offset="50%" stop-color="#c4a860"/><stop offset="100%" stop-color="#a08840"/></linearGradient>
        <linearGradient id="glass-folder" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-folder"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-folder)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-folder)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#d8c8a0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c0c8d8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <path d="M14 20h12l4-4h20v28H14V20Z" fill="url(#jade-folder)" filter="url(#sh-folder)"/>
      <path d="M14 20h12l4-4h20v28H14V20Z" stroke="#a08840" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="14" y="20" width="36" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.18"/>
    </svg>

    <!-- dialogue: 对话节点 -->
    <svg v-else-if="name === 'dialogue'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-dialogue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-dialogue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c0e8f0"/><stop offset="50%" stop-color="#78c0d8"/><stop offset="100%" stop-color="#4890a8"/></linearGradient>
        <linearGradient id="glass-dialogue" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-dialogue"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-dialogue)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-dialogue)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#b0d0e0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#d0b0c8" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="14" y="16" width="36" height="24" rx="10" fill="url(#jade-dialogue)" filter="url(#sh-dialogue)"/>
      <rect x="14" y="16" width="36" height="24" rx="10" stroke="#4888a0" stroke-width="0.5" fill="none" opacity="0.4"/>
      <path d="M18 48L26 42L32 48L40 42L48 48" fill="url(#jade-dialogue)" opacity="0.6"/>
      <rect x="14" y="16" width="36" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.2"/>
      <circle cx="23" cy="29" r="2.5" fill="#ffffff" fill-opacity="0.5"/>
      <circle cx="32" cy="29" r="2.5" fill="#ffffff" fill-opacity="0.5"/>
      <circle cx="41" cy="29" r="2.5" fill="#ffffff" fill-opacity="0.5"/>
    </svg>

    <!-- taskHub: 任务中枢 -->
    <svg v-else-if="name === 'taskHub'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-taskHub" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-taskHub" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c8b0"/><stop offset="50%" stop-color="#e09060"/><stop offset="100%" stop-color="#b06838"/></linearGradient>
        <linearGradient id="glass-taskHub" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-taskHub"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-taskHub)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-taskHub)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#e8c0a0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#a8d0c0" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <circle cx="32" cy="32" r="12" fill="url(#jade-taskHub)" filter="url(#sh-taskHub)"/>
      <circle cx="32" cy="32" r="12" stroke="#b06838" stroke-width="0.5" fill="none" opacity="0.4"/>
      <circle cx="32" cy="32" r="8" fill="#2a4a38" opacity="0.3"/>
      <circle cx="32" cy="32" r="3" fill="#ffffff" fill-opacity="0.3"/>
      <line x1="32" y1="20" x2="32" y2="24" stroke="url(#jade-taskHub)" stroke-width="3" stroke-linecap="round"/>
      <line x1="32" y1="40" x2="32" y2="44" stroke="url(#jade-taskHub)" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="32" x2="24" y2="32" stroke="url(#jade-taskHub)" stroke-width="3" stroke-linecap="round"/>
      <line x1="40" y1="32" x2="44" y2="32" stroke="url(#jade-taskHub)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="1.5" fill="#ffffff" fill-opacity="0.7"/>
    </svg>

    <!-- ending: 结局节点 -->
    <svg v-else-if="name === 'ending'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-ending" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-ending" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c0d0"/><stop offset="50%" stop-color="#d888a0"/><stop offset="100%" stop-color="#a06078"/></linearGradient>
        <linearGradient id="glass-ending" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-ending"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-ending)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-ending)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#e8c0d0" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#d0a8c0" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.5"/>
      <rect x="14" y="20" width="4" height="30" rx="2" fill="url(#jade-ending)" filter="url(#sh-ending)"/>
      <path d="M18 20L38 16V32L18 28Z" fill="url(#jade-ending)" filter="url(#sh-ending)"/>
      <path d="M18 20L38 16V32L18 28Z" stroke="#a06078" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="18" y="20" width="20" height="4" rx="2" fill="#ffffff" fill-opacity="0.22"/>
    </svg>

    <!-- map: 探索地图 -->
    <svg v-else-if="name === 'map'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-map" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-map" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d8f0d8"/><stop offset="50%" stop-color="#90d090"/><stop offset="100%" stop-color="#5a9860"/></linearGradient>
        <linearGradient id="glass-map" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-map"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-map)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-map)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#b8d8b0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#c8b0a8" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.55"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-map)" filter="url(#sh-map)"/>
      <circle cx="32" cy="32" r="14" stroke="#4a8050" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="9" fill="#2a4a38" opacity="0.25"/>
      <path d="M22 28L32 20L42 28L32 24L22 28Z" fill="url(#jade-map)" opacity="0.7"/>
      <path d="M24 30L32 24L40 30" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.3"/>
      <circle cx="32" cy="26" r="1.5" fill="#ffffff" fill-opacity="0.6"/>
      <line x1="32" y1="24" x2="32" y2="40" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/>
      <line x1="24" y1="33" x2="40" y2="33" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.2"/>
    </svg>

    <!-- branch: 分支选项 -->
    <svg v-else-if="name === 'branch'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-branch" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-branch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c0f0c0"/><stop offset="50%" stop-color="#78c878"/><stop offset="100%" stop-color="#489048"/></linearGradient>
        <linearGradient id="glass-branch" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-branch"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-branch)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-branch)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#b0d8b0" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#d0b8c8" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="32" cy="20" r="5" fill="url(#jade-branch)" filter="url(#sh-branch)"/>
      <circle cx="32" cy="20" r="2.5" fill="#ffffff" fill-opacity="0.25"/>
      <path d="M32 25L24 44" stroke="url(#jade-branch)" stroke-width="4" stroke-linecap="round" filter="url(#sh-branch)"/>
      <circle cx="24" cy="44" r="5" fill="url(#jade-branch)" filter="url(#sh-branch)" opacity="0.8"/>
      <circle cx="24" cy="44" r="2.5" fill="#ffffff" fill-opacity="0.2"/>
      <path d="M32 25L40 44" stroke="url(#jade-branch)" stroke-width="4" stroke-linecap="round" filter="url(#sh-branch)"/>
      <circle cx="40" cy="44" r="5" fill="url(#jade-branch)" filter="url(#sh-branch)" opacity="0.8"/>
      <circle cx="40" cy="44" r="2.5" fill="#ffffff" fill-opacity="0.2"/>
    </svg>

    <!-- npc: NPC角色 -->
    <svg v-else-if="name === 'npc'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-npc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-npc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0d8b0"/><stop offset="50%" stop-color="#d4a870"/><stop offset="100%" stop-color="#a87840"/></linearGradient>
        <linearGradient id="glass-npc" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-npc"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-npc)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-npc)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#e8d0a8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c0c8a8" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.5"/>
      <circle cx="20" cy="24" r="7" fill="url(#jade-npc)" filter="url(#sh-npc)"/>
      <circle cx="20" cy="24" r="3.5" fill="#ffffff" fill-opacity="0.2"/>
      <path d="M8 46c0-6 5.4-12 12-12s12 6 12 12" fill="url(#jade-npc)" filter="url(#sh-npc)" opacity="0.85"/>
      <circle cx="44" cy="24" r="7" fill="url(#jade-npc)" filter="url(#sh-npc)" opacity="0.85"/>
      <circle cx="44" cy="24" r="3.5" fill="#ffffff" fill-opacity="0.18"/>
      <path d="M32 46c0-6 5.4-12 12-12s12 6 12 12" fill="url(#jade-npc)" filter="url(#sh-npc)" opacity="0.72"/>
    </svg>

    <!-- ar: AR资源 -->
    <svg v-else-if="name === 'ar'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-ar" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8d0f0"/><stop offset="50%" stop-color="#8898d0"/><stop offset="100%" stop-color="#5868a0"/></linearGradient>
        <linearGradient id="glass-ar" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-ar"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-ar)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-ar)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#b8c0e0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#d0b8a8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <rect x="18" y="14" width="28" height="36" rx="5" fill="url(#jade-ar)" filter="url(#sh-ar)"/>
      <rect x="18" y="14" width="28" height="36" rx="5" stroke="#5868a0" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="22" y="18" width="20" height="20" rx="2" fill="#152618" opacity="0.4"/>
      <rect x="24" y="20" width="16" height="16" rx="1.5" fill="url(#jade-ar)" opacity="0.5"/>
      <rect x="26" y="22" width="12" height="12" rx="1" fill="#ffffff" fill-opacity="0.12"/>
      <circle cx="32" cy="28" r="3" fill="#ffffff" fill-opacity="0.3"/>
      <rect x="22" y="42" width="8" height="1.5" rx="0.75" fill="#ffffff" fill-opacity="0.2"/>
      <rect x="34" y="42" width="8" height="1.5" rx="0.75" fill="#ffffff" fill-opacity="0.15"/>
    </svg>

    <!-- drag: 拖拽排序 -->
    <svg v-else-if="name === 'drag'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-drag" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-drag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-drag" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-drag"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-drag)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-drag)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#a8d8b8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c8b8d8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <rect x="14" y="14" width="36" height="8" rx="4" fill="url(#jade-drag)" filter="url(#sh-drag)"/>
      <rect x="14" y="14" width="36" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.25"/>
      <rect x="14" y="28" width="36" height="8" rx="4" fill="url(#jade-drag)" filter="url(#sh-drag)" opacity="0.7"/>
      <rect x="14" y="28" width="36" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.18"/>
      <rect x="14" y="42" width="36" height="8" rx="4" fill="url(#jade-drag)" filter="url(#sh-drag)" opacity="0.55"/>
      <rect x="14" y="42" width="36" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.12"/>
      <circle cx="18" cy="18" r="1.5" fill="#ffffff" fill-opacity="0.4"/>
      <circle cx="24" cy="18" r="1.5" fill="#ffffff" fill-opacity="0.4"/>
      <circle cx="18" cy="32" r="1.5" fill="#ffffff" fill-opacity="0.4"/>
      <circle cx="24" cy="32" r="1.5" fill="#ffffff" fill-opacity="0.4"/>
      <circle cx="18" cy="46" r="1.5" fill="#ffffff" fill-opacity="0.35"/>
      <circle cx="24" cy="46" r="1.5" fill="#ffffff" fill-opacity="0.35"/>
    </svg>

    <!-- save: 保存 -->
    <svg v-else-if="name === 'save'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-save" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-save" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d0e8d0"/><stop offset="50%" stop-color="#88c090"/><stop offset="100%" stop-color="#508858"/></linearGradient>
        <linearGradient id="glass-save" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-save"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-save)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-save)"/>
      <path d="M7 17 L15 20 L7 23Z" fill="#c0e0c0" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#d0b0d0" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.55"/>
      <rect x="12" y="12" width="40" height="42" rx="5" fill="url(#jade-save)" filter="url(#sh-save)"/>
      <rect x="12" y="12" width="40" height="42" rx="5" stroke="#508858" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="12" y="12" width="40" height="6" rx="3" fill="#ffffff" fill-opacity="0.2"/>
      <rect x="28" y="14" width="8" height="3" rx="1.5" fill="#152618" opacity="0.3"/>
      <rect x="18" y="26" width="28" height="22" rx="3" fill="#152618" opacity="0.3"/>
      <rect x="20" y="28" width="24" height="4" rx="2" fill="#ffffff" fill-opacity="0.1"/>
      <rect x="20" y="36" width="18" height="4" rx="2" fill="#ffffff" fill-opacity="0.08"/>
      <rect x="20" y="44" width="14" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.06"/>
    </svg>

    <!-- scriptEditor: 剧本创建（场记板） -->
    <svg v-else-if="name === 'scriptEditor'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-scriptEditor" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-scriptEditor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e0d0a0"/><stop offset="50%" stop-color="#c4a860"/><stop offset="100%" stop-color="#a08840"/></linearGradient>
        <linearGradient id="glass-scriptEditor" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-scriptEditor"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-scriptEditor)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-scriptEditor)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#d8c898" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#d0b8c8" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.55"/>
      <rect x="14" y="22" width="36" height="6" rx="3" fill="url(#jade-scriptEditor)" filter="url(#sh-scriptEditor)"/>
      <rect x="14" y="22" width="36" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.3"/>
      <rect x="14" y="28" width="5" height="24" rx="2.5" fill="url(#jade-scriptEditor)" filter="url(#sh-scriptEditor)" opacity="0.85"/>
      <rect x="45" y="28" width="5" height="24" rx="2.5" fill="url(#jade-scriptEditor)" filter="url(#sh-scriptEditor)" opacity="0.85"/>
      <line x1="27" y1="32" x2="39" y2="32" stroke="#5a8c50" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <line x1="27" y1="38" x2="39" y2="38" stroke="#5a8c50" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <line x1="27" y1="44" x2="35" y2="44" stroke="#5a8c50" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
    </svg>

    <!-- contextMenu: 右键菜单 -->
    <svg v-else-if="name === 'contextMenu'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-contextMenu" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-contextMenu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c0c8d0"/><stop offset="50%" stop-color="#8890a0"/><stop offset="100%" stop-color="#586070"/></linearGradient>
        <linearGradient id="glass-contextMenu" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-contextMenu"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-contextMenu)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-contextMenu)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#b8c0c8" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#c8c0b8" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.5"/>
      <path d="M18 14L28 26L20 42L12 30Z" fill="url(#jade-contextMenu)" filter="url(#sh-contextMenu)"/>
      <path d="M18 14L28 26L20 42L12 30Z" stroke="#586070" stroke-width="0.5" fill="none" opacity="0.4"/>
      <path d="M18 14L28 26L20 42" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.3"/>
      <rect x="28" y="24" width="18" height="2" rx="1" fill="#ffffff" fill-opacity="0.25"/>
      <rect x="30" y="30" width="14" height="2" rx="1" fill="#ffffff" fill-opacity="0.2"/>
      <rect x="30" y="36" width="10" height="2" rx="1" fill="#ffffff" fill-opacity="0.15"/>
    </svg>

    <!-- wand: AI魔法（星光） -->
    <svg v-else-if="name === 'wand'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-wand" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-wand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff8d0"/><stop offset="50%" stop-color="#f0d060"/><stop offset="100%" stop-color="#c49a30"/></linearGradient>
        <linearGradient id="glass-wand" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-wand"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-wand)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-wand)"/>
      <path d="M7 18 L15 21 L7 24Z" fill="#f0e0b0" opacity="0.9"/>
      <path d="M57 19 L49 22 L57 25Z" fill="#d0c0e0" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <path d="M36 44L34 16" stroke="url(#jade-wand)" stroke-width="2.5" stroke-linecap="round" filter="url(#sh-wand)"/>
      <rect x="32" y="12" width="4" height="8" rx="2" fill="url(#jade-wand)" filter="url(#sh-wand)"/>
      <rect x="32" y="12" width="4" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.3"/>
      <circle cx="30" cy="18" r="10" fill="url(#jade-wand)" filter="url(#sh-wand)" opacity="0.7"/>
      <circle cx="30" cy="18" r="10" stroke="#c49a30" stroke-width="0.5" fill="none" opacity="0.3"/>
      <path d="M26 18L30 10L34 18L30 14L26 18Z" fill="#ffffff" fill-opacity="0.7"/>
      <circle cx="18" cy="30" r="2.5" fill="url(#jade-wand)" opacity="0.6"/>
      <circle cx="46" cy="28" r="2" fill="url(#jade-wand)" opacity="0.5"/>
      <circle cx="22" cy="40" r="1.5" fill="url(#jade-wand)" opacity="0.4"/>
      <circle cx="42" cy="38" r="1.5" fill="url(#jade-wand)" opacity="0.35"/>
    </svg>

    <!-- document: 默认文档节点 -->
    <svg v-else-if="name === 'document'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-document" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-document" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0f0e8"/><stop offset="50%" stop-color="#d0d0c8"/><stop offset="100%" stop-color="#a0a098"/></linearGradient>
        <linearGradient id="glass-document" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-document"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-document)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-document)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#d8d8d0" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#c8c0d0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.45"/>
      <rect x="16" y="12" width="32" height="44" rx="4" fill="url(#jade-document)" filter="url(#sh-document)"/>
      <rect x="16" y="12" width="32" height="44" rx="4" stroke="#a0a098" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="16" y="12" width="32" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.2"/>
      <line x1="20" y1="23" x2="44" y2="23" stroke="#808068" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <line x1="20" y1="29" x2="44" y2="29" stroke="#808068" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <line x1="20" y1="35" x2="38" y2="35" stroke="#808068" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
      <line x1="20" y1="41" x2="44" y2="41" stroke="#808068" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <line x1="20" y1="47" x2="32" y2="47" stroke="#808068" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
    </svg>

    <!-- trophy: 热门剧本 -->
    <svg v-else-if="name === 'trophy'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-trophy" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-trophy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdf0c8"/><stop offset="50%" stop-color="#e8c860"/><stop offset="100%" stop-color="#b89830"/></linearGradient>
        <linearGradient id="glass-trophy" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-trophy"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-trophy)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-trophy)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#f0d878" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#e8c860" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.45"/>
      <!-- 奖杯主体 -->
      <path d="M32 16 L32 16" fill="none"/>
      <path d="M22 20h20l-2 16H24l-2-16Z" fill="url(#jade-trophy)" filter="url(#sh-trophy)"/>
      <path d="M24 20h16l-1.5 12h-13l-1.5-12Z" fill="url(#jade-trophy)" opacity="0.8"/>
      <path d="M22 20h20l-2 16H24l-2-16Z" stroke="#a08028" stroke-width="0.5" fill="none" opacity="0.4"/>
      <rect x="26" y="17" width="12" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.3"/>
      <!-- 杯脚 -->
      <rect x="28" y="36" width="8" height="4" rx="2" fill="#b89830" filter="url(#sh-trophy)"/>
      <rect x="26" y="40" width="12" height="4" rx="2" fill="#b89830" filter="url(#sh-trophy)"/>
      <rect x="28" y="40" width="8" height="2" rx="1" fill="#fdf0c8" opacity="0.3"/>
      <!-- 手柄 -->
      <path d="M22 22q-5 2 -3 8" stroke="#c49a3c" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
      <path d="M42 22q5 2 3 8" stroke="#c49a3c" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
      <!-- 星标 -->
      <path d="M32 23l1.5 4.5h4.5l-3.5 2.5 1.5 4.5L32 32l-3.5 2.5 1.5-4.5L26.5 27.5H31L32 23Z" fill="#fdf0c8" opacity="0.85"/>
    </svg>

    <!-- experience: 今日体验 -->
    <svg v-else-if="name === 'experience'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-experience" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-experience" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c8a0"/><stop offset="50%" stop-color="#e8a050"/><stop offset="100%" stop-color="#b87030"/></linearGradient>
        <linearGradient id="glass-experience" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-experience"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-experience)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-experience)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#f0b8a0" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#e8d4c0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.45"/>
      <!-- 靶心主体 -->
      <circle cx="32" cy="32" r="14" fill="url(#jade-experience)" filter="url(#sh-experience)"/>
      <circle cx="32" cy="32" r="14" stroke="#b87030" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="10" fill="#2a4a38" fill-opacity="0.15"/>
      <circle cx="32" cy="32" r="7" fill="url(#jade-experience)" opacity="0.8"/>
      <circle cx="32" cy="32" r="7" stroke="#b87030" stroke-width="0.3" fill="none" opacity="0.25"/>
      <circle cx="32" cy="32" r="3.5" fill="#2a4a38" fill-opacity="0.4"/>
      <!-- 高光 -->
      <ellipse cx="29" cy="28" rx="5" ry="3" fill="#ffffff" fill-opacity="0.2"/>
      <!-- 靶心装饰线 -->
      <line x1="32" y1="15" x2="32" y2="18" stroke="#f0c8a0" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="32" y1="46" x2="32" y2="49" stroke="#f0c8a0" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="15" y1="32" x2="18" y2="32" stroke="#f0c8a0" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
      <line x1="46" y1="32" x2="49" y2="32" stroke="#f0c8a0" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
    </svg>

    <!-- compass: 分析素材 -->
    <svg v-else-if="name === 'compass'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-compass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-compass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8d0a0"/><stop offset="50%" stop-color="#c49a3c"/><stop offset="100%" stop-color="#8a6828"/></linearGradient>
        <linearGradient id="glass-compass" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-compass"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-compass)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-compass)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#e8d0a0" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#d0b8d8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-compass)" filter="url(#sh-compass)"/>
      <circle cx="32" cy="32" r="14" stroke="#8a6828" stroke-width="0.5" fill="none" opacity="0.35"/>
      <circle cx="32" cy="32" r="10" fill="#2a4a38" fill-opacity="0.1"/>
      <!-- 十字准轴 -->
      <line x1="32" y1="18" x2="32" y2="46" stroke="#8a6828" stroke-width="0.8" opacity="0.3"/>
      <line x1="18" y1="32" x2="46" y2="32" stroke="#8a6828" stroke-width="0.8" opacity="0.3"/>
      <!-- 指针 -->
      <path d="M32 20l3 12h-6l3-12Z" fill="#b07040" opacity="0.85"/>
      <path d="M32 44l3-12h-6l3 12Z" fill="#d0d0d0" opacity="0.6"/>
      <circle cx="32" cy="32" r="3" fill="#2a4a38" opacity="0.4"/>
      <circle cx="32" cy="32" r="1.5" fill="#e8d0a0"/>
      <ellipse cx="28" cy="27" rx="4" ry="2.5" fill="#ffffff" fill-opacity="0.15"/>
    </svg>

    <!-- build: 构建框架 -->
    <svg v-else-if="name === 'build'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-build" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-build" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a0c8d8"/><stop offset="50%" stop-color="#6cb4ee"/><stop offset="100%" stop-color="#3a7aa8"/></linearGradient>
        <linearGradient id="glass-build" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-build"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-build)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-build)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#a0c8d8" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#c8b8d0" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <!-- 框架结构 -->
      <rect x="18" y="14" width="28" height="28" rx="3" fill="url(#jade-build)" filter="url(#sh-build)" opacity="0.2"/>
      <rect x="18" y="14" width="28" height="28" rx="3" stroke="#6cb4ee" stroke-width="1.2" fill="none" opacity="0.6"/>
      <!-- 横梁 -->
      <line x1="18" y1="22" x2="46" y2="22" stroke="#6cb4ee" stroke-width="1" opacity="0.45"/>
      <line x1="18" y1="30" x2="46" y2="30" stroke="#6cb4ee" stroke-width="1" opacity="0.45"/>
      <!-- 竖柱 -->
      <line x1="26" y1="14" x2="26" y2="42" stroke="#6cb4ee" stroke-width="0.8" opacity="0.35"/>
      <line x1="36" y1="14" x2="36" y2="42" stroke="#6cb4ee" stroke-width="0.8" opacity="0.35"/>
      <!-- 高光 -->
      <rect x="20" y="16" width="10" height="4" rx="1" fill="#ffffff" fill-opacity="0.2"/>
      <!-- 角标 -->
      <circle cx="18" cy="14" r="2.5" fill="#6cb4ee" opacity="0.7"/>
      <circle cx="46" cy="14" r="2.5" fill="#6cb4ee" opacity="0.7"/>
      <circle cx="18" cy="42" r="2.5" fill="#6cb4ee" opacity="0.7"/>
      <circle cx="46" cy="42" r="2.5" fill="#6cb4ee" opacity="0.7"/>
    </svg>

    <!-- clock: 时长 -->
    <svg v-else-if="name === 'clock'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-clock" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-clock" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8e8e0"/><stop offset="50%" stop-color="#c8c8c0"/><stop offset="100%" stop-color="#909088"/></linearGradient>
        <linearGradient id="glass-clock" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-clock"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-clock)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-clock)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#d0d0c8" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#c8c0d0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.45"/>
      <circle cx="32" cy="32" r="14" fill="url(#jade-clock)" filter="url(#sh-clock)"/>
      <circle cx="32" cy="32" r="14" stroke="#909088" stroke-width="0.5" fill="none" opacity="0.35"/>
      <circle cx="32" cy="32" r="11" fill="#2a4a38" fill-opacity="0.08"/>
      <!-- 刻度 -->
      <line x1="32" y1="19" x2="32" y2="21" stroke="#808078" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <line x1="32" y1="43" x2="32" y2="45" stroke="#808078" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <line x1="19" y1="32" x2="21" y2="32" stroke="#808078" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <line x1="43" y1="32" x2="45" y2="32" stroke="#808078" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <!-- 时针 -->
      <line x1="32" y1="32" x2="32" y2="23" stroke="#606058" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <!-- 分针 -->
      <line x1="32" y1="32" x2="39" y2="32" stroke="#606058" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <circle cx="32" cy="32" r="2" fill="#606058" opacity="0.5"/>
      <ellipse cx="28" cy="26" rx="5" ry="3" fill="#ffffff" fill-opacity="0.15"/>
    </svg>

    <!-- book: 书籍 -->
    <svg v-else-if="name === 'book'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-book" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-book" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0e8d0"/><stop offset="70%" stop-color="#d0c098"/><stop offset="100%" stop-color="#a09070"/></linearGradient>
        <linearGradient id="glass-book" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-book"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-book)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-book)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#f0e0c8" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#d0c8b8" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <!-- 左页 -->
      <path d="M32 14v36" stroke="#908060" stroke-width="1" opacity="0.3"/>
      <path d="M16 14l16 3v34l-16-3V14Z" fill="url(#jade-book)" filter="url(#sh-book)"/>
      <path d="M16 14l16 3v34l-16-3V14Z" stroke="#a09070" stroke-width="0.5" fill="none" opacity="0.3"/>
      <!-- 右页 -->
      <path d="M48 11l-16 3v34l16-3V11Z" fill="url(#jade-book)" filter="url(#sh-book)" opacity="0.85"/>
      <path d="M48 11l-16 3v34l16-3V11Z" stroke="#a09070" stroke-width="0.5" fill="none" opacity="0.25"/>
      <!-- 书缝线 -->
      <line x1="32" y1="14" x2="32" y2="50" stroke="#6a5a3a" stroke-width="1.5" opacity="0.5"/>
      <!-- 文字线 -->
      <line x1="20" y1="24" x2="30" y2="26" stroke="#908060" stroke-width="0.8" stroke-linecap="round" opacity="0.3"/>
      <line x1="20" y1="30" x2="30" y2="32" stroke="#908060" stroke-width="0.8" stroke-linecap="round" opacity="0.25"/>
      <line x1="20" y1="36" x2="28" y2="38" stroke="#908060" stroke-width="0.8" stroke-linecap="round" opacity="0.2"/>
      <!-- 高光 -->
      <rect x="18" y="16" width="10" height="2" rx="1" fill="#ffffff" fill-opacity="0.15"/>
    </svg>

    <!-- gamepad: 互动/结局 -->
    <svg v-else-if="name === 'gamepad'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-gamepad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-gamepad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8d0b8"/><stop offset="50%" stop-color="#88b888"/><stop offset="100%" stop-color="#5a8a5a"/></linearGradient>
        <linearGradient id="glass-gamepad" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-gamepad"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-gamepad)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-gamepad)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#b8d0b8" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#c8c0d8" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.45"/>
      <!-- 手柄主体 -->
      <rect x="14" y="22" width="36" height="20" rx="10" fill="url(#jade-gamepad)" filter="url(#sh-gamepad)"/>
      <rect x="14" y="22" width="36" height="20" rx="10" stroke="#5a8a5a" stroke-width="0.5" fill="none" opacity="0.3"/>
      <!-- 握把 -->
      <rect x="16" y="40" width="10" height="8" rx="5" fill="url(#jade-gamepad)" opacity="0.8"/>
      <rect x="38" y="40" width="10" height="8" rx="5" fill="url(#jade-gamepad)" opacity="0.8"/>
      <!-- 方向键 -->
      <rect x="20" y="26" width="10" height="10" rx="2" fill="#2a4a38" fill-opacity="0.15"/>
      <line x1="25" y1="27" x2="25" y2="35" stroke="#5a8a5a" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
      <line x1="21" y1="31" x2="29" y2="31" stroke="#5a8a5a" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
      <!-- AB键 -->
      <circle cx="37" cy="29" r="3.5" fill="#d4a5a5" opacity="0.8"/>
      <circle cx="43" cy="27" r="3.5" fill="#b0b8d8" opacity="0.8"/>
      <!-- 高光 -->
      <rect x="16" y="23" width="32" height="6" rx="3" fill="#ffffff" fill-opacity="0.18"/>
      <!-- 连接线 -->
      <line x1="21" y1="22" x2="21" y2="19" stroke="#88b888" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <line x1="43" y1="22" x2="43" y2="19" stroke="#88b888" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
    </svg>

    <!-- refresh: 重新生成 -->
    <svg v-else-if="name === 'refresh'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-refresh" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-refresh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0e8b0"/><stop offset="50%" stop-color="#7ec87b"/><stop offset="100%" stop-color="#4a8c50"/></linearGradient>
        <linearGradient id="glass-refresh" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-refresh"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-refresh)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-refresh)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#b0e8b0" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#c8c0d0" opacity="0.9"/>
      <path d="M50 7 Q54 3 56 9 Q52 11 50 7Z" fill="#7ec87b" opacity="0.45"/>
      <!-- 循环箭头 -->
      <path d="M28 14a18 18 0 0 1 18 18" stroke="url(#jade-refresh)" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M36 50a18 18 0 0 1 -18 -18" stroke="url(#jade-refresh)" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.7"/>
      <!-- 箭头尖 -->
      <path d="M44 30l4 4-4 4" stroke="#7ec87b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M20 34l-4 -4 4 -4" stroke="#7ec87b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7"/>
    </svg>

    <!-- cross: 取消/关闭 -->
    <svg v-else-if="name === 'cross'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad-cross" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade-cross" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0b8b0"/><stop offset="50%" stop-color="#d4a5a5"/><stop offset="100%" stop-color="#a07070"/></linearGradient>
        <linearGradient id="glass-cross" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh-cross"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad-cross)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass-cross)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#f0b8b0" opacity="0.9"/>
      <path d="M57 17 L49 20 L57 23Z" fill="#d4a5a5" opacity="0.9"/>
      <path d="M10 10 Q16 5 19 11 Q15 13 10 10Z" fill="#7ec87b" opacity="0.55"/>
      <!-- 叉号 -->
      <line x1="20" y1="20" x2="44" y2="44" stroke="url(#jade-cross)" stroke-width="5" stroke-linecap="round"/>
      <line x1="44" y1="20" x2="20" y2="44" stroke="url(#jade-cross)" stroke-width="5" stroke-linecap="round"/>
      <!-- 高光 -->
      <line x1="22" y1="21" x2="40" y2="39" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/>
      <line x1="42" y1="21" x2="22" y2="39" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.15"/>
    </svg>

    <!-- ================================================================ -->
    <!--  兜底占位                                                     -->
    <!-- ================================================================ -->
    <svg v-else viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a38"/><stop offset="100%" stop-color="#152618"/></linearGradient>
        <linearGradient id="jade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8c0b8"/><stop offset="50%" stop-color="#889888"/><stop offset="100%" stop-color="#5a6a58"/></linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0.3" y2="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
        <filter id="sh"><feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#081208" flood-opacity="0.55"/></filter>
      </defs>
      <rect x="6" y="7" width="52" height="52" rx="16" fill="#081208" opacity="0.45"/>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bgGrad)"/>
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#3d5e4a" stroke-width="0.8" stroke-opacity="0.5"/>
      <rect x="8" y="8" width="44" height="20" rx="10" fill="url(#glass)"/>
      <path d="M7 19 L15 22 L7 25Z" fill="#c0c0c8" opacity="0.9"/>
      <path d="M57 18 L49 21 L57 24Z" fill="#c8c0c0" opacity="0.9"/>
      <path d="M10 9 Q14 4 17 10 Q13 12 10 9Z" fill="#7ec87b" opacity="0.45"/>
      <circle cx="32" cy="32" r="10" fill="url(#jade)" filter="url(#sh)"/>
      <circle cx="32" cy="32" r="10" stroke="#5a6a58" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="32" cy="32" r="5" fill="#2a4a38" opacity="0.4"/>
      <path d="M26 32H38" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    </svg>

  </span>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  size?: number
}>()
</script>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}
.app-icon svg {
  width: 1em;
  height: 1em;
}
</style>
