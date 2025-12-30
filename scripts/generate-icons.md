# 图标生成说明

## 方法1：使用在线工具（推荐）

1. 访问 [RealFaviconGenerator](https://realfavicongenerator.net/) 或 [Favicon.io](https://favicon.io/)
2. 上传你的图标设计（建议使用 512x512 像素的正方形图片）
3. 生成所有需要的图标尺寸
4. 下载并放置到 `public/` 目录：
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
   - `favicon.ico` (多尺寸ICO文件)

## 方法2：使用简单SVG（快速测试）

创建一个简单的SVG图标 `public/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#38BDF8"/>
  <text x="50" y="70" font-size="60" text-anchor="middle">🌺</text>
</svg>
```

然后使用在线工具将SVG转换为PNG格式的图标。

## 方法3：使用命令行工具

如果你安装了 ImageMagick:

```bash
# 创建基础图标（假设你有一个 512x512 的 source.png）
convert source.png -resize 192x192 public/icon-192.png
convert source.png -resize 512x512 public/icon-512.png
convert source.png -define icon:auto-resize=64,48,32,16 public/favicon.ico
```

## 临时解决方案

如果没有图标文件，应用仍然可以运行，但PWA安装时可能缺少图标显示。
