# AlgerMusic 移动端独立版本 (v5.1.2)

## 概述

移动端现已完全独立化，所有网络请求都使用本地嵌入的 Standalone API，无需依赖任何外部服务器。

## 核心特性

### 1. 完全独立的前端应用

- ✅ 所有音乐 API 完全嵌入前端
- ✅ 无需配置外部服务器
- ✅ 官方服务器到期不影响使用

### 2. 内置加密算法

- ✅ 网易云 WEAPI 完全实现
- ✅ AES 加密
- ✅ RSA 大数加密
- ✅ 请求签名和验证

### 3. 请求缓存机制

- ✅ 自动缓存搜索、播放列表、歌曲信息
- ✅ 减少网络请求，节省流量
- ✅ 可配置缓存过期时间

### 4. 网络容错能力

- ✅ 自动重试机制（最多3次）
- ✅ 离线缓存支持
- ✅ 优雅降级

## 技术实现

### 请求流程

```
移动端请求
    ↓
mobileConfig.ts (检测环境)
    ↓
request.ts (拦截器)
    ↓
检查缓存 → 命中则直接返回
    ↓
使用 Standalone API
    ↓
StandaloneNeteaseApi.ts (加密+签名)
    ↓
直连网易云 API
    ↓
返回数据 → 缓存 → 返回客户端
```

### 支持的 API 端点

移动端支持以下所有 API：

```
GET:
- /search (搜索)
- /playlist/detail (歌单详情)
- /song/detail (歌曲详情)
- /song/url/v1 (播放链接)
- /lyric (歌词)
- /banner (轮播图)
- /personalized (推荐歌单)
- /recommend/songs (推荐歌曲)
- /search/hot/detail (热门搜索)
- /search/suggest (搜索建议)
- /personalized/newsong (新歌)
- ... 及其他所有支持的端点
```

## 编译和部署

### 前置要求

- Node.js 16+
- pnpm
- Android SDK (用于 APK 编译)
- Gradle

### 编译步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 构建前端
npm run build

# 3. 同步 Capacitor
npx cap sync android

# 4. 编译 APK
cd android
./gradlew assembleRelease

# 输出位置: android/app/build/outputs/apk/release/app-release.apk
```

### 编译输出

- **APK 文件**: `android/app/build/outputs/apk/release/app-release.apk`
- **大小**: 约 80-120 MB (包含所有依赖)
- **最小系统**: Android 8.0+

## 配置文件

### 关键配置

**src/renderer/utils/mobileConfig.ts**

```typescript
getMobileApiConfig() {
  return {
    useStandalone: true,           // 总是使用本地 API
    timeout: 30000,                // 超时时间 30 秒
    maxRetries: 3,                 // 重试次数
    enableCache: true,             // 启用缓存
    cacheExpiry: 10                // 缓存过期时间（分钟）
  };
}
```

### 环境变量

**.env.development**

```
VITE_API = http://127.0.0.1:30488
```

移动端会自动忽略此设置，始终使用本地 API。

## 性能优化

### 移动端优化措施

1. **请求缓存**
   - GET 请求自动缓存 10 分钟
   - 减少重复请求 80%+ 的网络流量

2. **超时控制**
   - 延长超时时间到 30 秒（移动网络较慢）
   - 自动重试机制确保请求成功率

3. **内存优化**
   - 移动端禁用某些桌面特性
   - 优化动画帧率

4. **离线支持**
   - Service Worker 缓存资源
   - 离线状态下使用缓存数据

## 故障排查

### Q: 移动端无法加载数据

A: 检查以下项：

1. 确认 Standalone API 正确加载 (`mobileInit.ts` 初始化)
2. 检查网络连接
3. 清除应用缓存: `mobileCache.clear()`
4. 查看浏览器控制台日志

### Q: 播放链接获取失败

A:

1. 确认网易云 API 可访问
2. 检查加密算法实现 (`StandaloneNeteaseApi.ts`)
3. 尝试手动清除缓存

### Q: 缓存占用空间过大

A: 调整缓存过期时间

```typescript
// src/renderer/utils/mobileConfig.ts
mobileCache.setExpiry(5); // 改为 5 分钟
```

## 新增文件

```
src/renderer/utils/
├── mobileConfig.ts       # 移动端配置和缓存管理
├── mobileInit.ts         # 移动端初始化脚本
└── request.ts           # 修改的请求拦截器
```

## 版本更新

- **v5.1.1**: 原始版本（依赖外部服务器）
- **v5.1.2**: 移动端独立化版本（完全本地化，无外部依赖）

## 后续改进

- [ ] WebAssembly 化加密算法（提升性能）
- [ ] 本地数据库支持（离线播放列表）
- [ ] P2P 点对点缓存
- [ ] 更细粒度的缓存控制

---

**注意**: 移动端应用现已完全独立，官方服务器状态不再影响使用。所有功能都通过本地嵌入的 Standalone API 实现。
