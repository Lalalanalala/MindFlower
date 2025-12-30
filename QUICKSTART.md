# 快速开始指南

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://www.deepseek.com/)
2. 注册账号并登录
3. 进入 API 管理页面
4. 创建新的 API Key
5. 将 API Key 复制到 `.env` 文件中

## 3. 添加资源文件（可选）

### 图标文件

在 `public/` 目录下添加：
- `icon-192.png` (192x192 像素)
- `icon-512.png` (512x512 像素)
- `favicon.ico`

详细说明请参考 `scripts/generate-icons.md`

### 音效文件

在 `public/sounds/` 目录下添加：
- `ding.mp3` - 番茄钟完成提示音
- `alarm.mp3` - 闹钟提醒音

> **注意**：如果没有这些文件，应用仍可运行，但部分功能可能受限。

## 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 运行。

## 5. 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist/` 目录。

## 6. 预览生产版本

```bash
npm run preview
```

## 功能测试

1. **AI 任务分析**：在首页输入任务描述，点击"智能规划"
2. **任务管理**：查看任务列表，展开任务查看步骤
3. **番茄钟**：切换到番茄钟页面，选择任务步骤开始计时
4. **闹钟**：添加闹钟，设置时间和重复规则
5. **日历视图**：查看按日期组织的任务

## 常见问题

### API 调用失败

- 检查 `.env` 文件中的 API Key 是否正确
- 确认网络连接正常
- 检查 DeepSeek API 服务状态

### 通知不工作

- 在浏览器中允许通知权限
- 确保浏览器支持 Web Notifications API
- 检查浏览器通知设置

### PWA 安装问题

- 确保使用 HTTPS（生产环境）或 localhost（开发环境）
- 检查 manifest.json 配置
- 确认图标文件存在

## 下一步

- 阅读 `README.md` 了解完整功能
- 查看 `src/` 目录了解代码结构
- 根据需求自定义样式和功能
