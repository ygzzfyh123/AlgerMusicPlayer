# GitHub Actions 自动编译指南

## 🚀 快速开始

所有代码已推送到 GitHub，GitHub Actions 工作流已启动。

### 版本信息
- **版本**: v5.1.2 - Mobile Standalone Edition
- **仓库**: https://github.com/ygzzfyh123/AlgerMusicPlayer
- **标签**: v5.1.2

## 📋 工作流状态

### 1. 自动编译工作流 (build.yml)
状态: **正在运行** ✅

该工作流将在以下平台编译：
- ✅ Windows (windows-latest)
- ✅ macOS (macos-latest)  
- ✅ Linux (ubuntu-latest)
- ✅ Android APK (ubuntu-latest)

### 2. 发布工作流 (release.yml)
状态: **等待** ⏳

编译完成后将自动发布到 GitHub Releases。

## 📥 下载编译产物

所有编译产物将在以下位置提供：

### GitHub Releases
https://github.com/ygzzfyh123/AlgerMusicPlayer/releases/tag/v5.1.2

预期文件列表：
```
AlgerMusicPlayer-5.1.2.exe          (Windows 安装程序)
AlgerMusicPlayer-5.1.2.dmg          (macOS 安装程序)
algermusic-5.1.2.AppImage           (Linux 通用应用)
AlgerMusicPlayer-v5.1.2.apk         (Android 移动端)
latest-mac.yml                      (macOS 更新配置)
latest-mac-x64.yml                  (macOS x64 更新配置)
latest-mac-arm64.yml                (macOS ARM64 更新配置)
```

## 📊 编译详情

### Windows 编译
- **运行时间**: ~10-15 分钟
- **输出**: `AlgerMusicPlayer-5.1.2.exe`
- **大小**: ~150 MB
- **最低要求**: Windows 7+

### macOS 编译
- **运行时间**: ~15-20 分钟
- **输出**: `AlgerMusicPlayer-5.1.2.dmg`
- **大小**: ~180 MB
- **最低要求**: macOS 10.13+

### Linux 编译
- **运行时间**: ~10-15 分钟
- **输出**: `algermusic-5.1.2.AppImage`
- **大小**: ~140 MB
- **最低要求**: glibc 2.29+

### Android APK 编译
- **运行时间**: ~20-25 分钟
- **输出**: `AlgerMusicPlayer-v5.1.2.apk`
- **大小**: ~80-120 MB
- **最低要求**: Android 8.0+

## 🔍 查看工作流进度

### 方法 1: GitHub 网页界面
1. 访问: https://github.com/ygzzfyh123/AlgerMusicPlayer/actions
2. 查看 "Build and Release" 工作流的进度

### 方法 2: 检查特定步骤
每个平台编译的步骤：
1. Check out Git repository (克隆代码)
2. Install dependencies (安装依赖)
3. Build artifacts (编译)
4. Upload artifacts (上传产物)

## 🛠️ 本地编译（备选方案）

如果需要本地编译，可以使用提供的脚本：

### Linux/macOS
```bash
chmod +x build.sh
./build.sh all  # 编译所有平台
# 或指定平台: ./build.sh win | ./build.sh mac | ./build.sh linux | ./build.sh apk
```

### Windows
```cmd
build.bat all
REM 或指定平台: build.bat win | build.bat apk
```

## 📝 新增文件

### 源代码文件
```
src/renderer/utils/
├── mobileConfig.ts      # 移动端配置和缓存管理
├── mobileInit.ts        # 移动端初始化脚本
└── request.ts          # 修改的请求拦截器
```

### 工作流文件
```
.github/workflows/
├── build.yml            # 多平台编译工作流
└── release.yml          # 自动发布工作流
```

### 编译脚本
```
├── build.sh             # Linux/macOS 编译脚本
├── build.bat            # Windows 编译脚本
```

### 文档
```
├── MOBILE_STANDALONE_README.md    # 移动端独立版本说明
└── GITHUB_CI_GUIDE.md            # 本文件
```

## 🔐 安全考虑

### Token 安全
- 已使用 GitHub PAT 进行认证
- Token 只在工作流中使用
- 不要在公开的地方分享 Token

### 代码签名
- Windows: CSC_IDENTITY_AUTO_DISCOVERY 已禁用
- macOS: 需要在 macOS 机器上手动签名（可选）
- Linux: 无签名要求
- Android: APK 已签名

## 📈 监控和日志

### 查看详细日志
1. 进入 GitHub Actions 页面
2. 选择对应的工作流运行
3. 点击对应的 job 名称
4. 查看每一步的输出日志

### 常见问题排查

#### 编译失败
- 检查依赖安装是否成功
- 查看具体的错误消息
- 重新触发工作流

#### 超时
- 如果编译超时，GitHub Actions 有 6 小时限制
- 大多数编译应在 30 分钟内完成

#### 文件未生成
- 检查工作流日志
- 确认编译命令执行成功
- 查看 Upload artifacts 步骤

## 🎯 后续步骤

1. ✅ 代码已推送到 GitHub main 分支
2. ✅ 版本标签 v5.1.2 已创建
3. ⏳ GitHub Actions 正在编译
4. ⏳ 编译完成后自动发布到 Releases

## 🔗 相关链接

- **仓库**: https://github.com/ygzzfyh123/AlgerMusicPlayer
- **发布页面**: https://github.com/ygzzfyh123/AlgerMusicPlayer/releases/tag/v5.1.2
- **Actions 页面**: https://github.com/ygzzfyh123/AlgerMusicPlayer/actions
- **移动端文档**: MOBILE_STANDALONE_README.md

## 📞 支持

如有问题，请：
1. 查看 GitHub Actions 的详细日志
2. 检查 issue 是否已报告
3. 创建新的 issue 描述问题

---

**编译时间**: 2026-06-16  
**编译平台**: GitHub Actions  
**编译用户**: AlgerMusic Build Bot
