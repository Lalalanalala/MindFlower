# MindFlower

一句话输入，AI自动拆解任务，番茄钟，提醒闹钟 - 全自动任务管理 PWA

## 🎯 核心功能

- **AI 智能任务拆解**：输入自然语言，AI自动分析并拆解为可执行步骤
- **番茄钟计时器**：专注工作，提高效率
- **智能闹钟**：支持任务关联的提醒功能
- **任务管理**：四象限优先级分类，标签系统
- **PWA 支持**：可添加到手机主屏幕，离线可用

## 🛠 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand（状态管理）
- vite-plugin-pwa（PWA支持）
- localStorage（数据存储）
- DeepSeek API（AI分析）

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 环境变量配置

创建 `.env` 文件：

```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 开发运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📱 PWA 使用

1. 构建项目：`npm run build`
2. 部署到支持 HTTPS 的服务器（如 Zeabur）
3. 在手机浏览器中打开应用
4. 点击"添加到主屏幕"即可像原生 App 一样使用

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── Banner.tsx      # Banner 图片上传
│   ├── TaskInput.tsx   # 任务输入框（AI分析）
│   ├── TaskCard.tsx    # 任务卡片
│   ├── TaskList.tsx    # 任务列表
│   ├── PomodoroTimer.tsx  # 番茄钟
│   ├── AlarmList.tsx   # 闹钟列表
│   ├── Calendar.tsx    # 日历视图
│   ├── Home.tsx        # 首页
│   └── BottomNav.tsx   # 底部导航
├── stores/             # Zustand 状态管理
│   ├── taskStore.ts
│   ├── alarmStore.ts
│   └── bannerStore.ts
├── services/           # 服务层
│   ├── aiService.ts    # AI 分析服务
│   └── notificationService.ts  # 通知服务
├── types/              # TypeScript 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   └── storage.ts      # localStorage 封装
├── App.tsx             # 主应用组件
├── main.tsx            # 入口文件
└── index.css           # 全局样式
```

## 🔧 功能说明

### AI 任务分析

用户输入自然语言任务描述，AI 会自动：
- 提取任务标题和描述
- 拆解为 3-6 个可执行步骤
- 估算每步时间（转换为番茄钟数量）
- 判断四象限优先级
- 建议截止日期
- 提取相关标签

### 番茄钟

- 标准 25 分钟专注时间
- 5 分钟休息时间
- 自动通知提醒
- 关联任务步骤，自动更新进度

### 闹钟

- 设置提醒时间
- 支持重复（每天、工作日、每周）
- 可关联任务
- 桌面通知提醒

## 🎨 图标和资源

应用需要以下资源文件（详见 `public/ASSETS.md`）：
- `public/icon-192.png` - PWA 图标（192x192）
- `public/icon-512.png` - PWA 图标（512x512）
- `public/favicon.ico` - 浏览器图标
- `public/sounds/ding.mp3` - 番茄钟提示音
- `public/sounds/alarm.mp3` - 闹钟提示音

如果没有这些文件，应用仍可运行，但部分功能可能受限。你可以参考 `scripts/generate-icons.md` 生成图标。

## 🌐 部署

推荐使用 [Zeabur](https://zeabur.com) 部署：

1. 连接 GitHub 仓库
2. 设置环境变量 `VITE_DEEPSEEK_API_KEY`
3. 自动部署完成

## 📝 License

MIT
