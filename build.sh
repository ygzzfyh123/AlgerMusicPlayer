#!/usr/bin/env bash

# AlgerMusic 多平台编译脚本
# 用法: chmod +x build.sh && ./build.sh [platform]
# platform: win | mac | linux | apk | all

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_OUTPUT="$PROJECT_DIR/build-output"

# 创建输出目录
mkdir -p "$BUILD_OUTPUT"

echo "================================================"
echo "AlgerMusic v5.1.2 多平台编译脚本"
echo "================================================"
echo ""

# 获取编译平台
PLATFORM="${1:-all}"

# 编译前端
echo "[1/5] 正在编译前端资源..."
npm run build
echo "✓ 前端编译完成"
echo ""

# Windows 编译
build_windows() {
  echo "[2/5] 正在编译 Windows 版本..."
  npm run build:win
  if [ -d "$PROJECT_DIR/dist" ]; then
    cp -r "$PROJECT_DIR/dist"/* "$BUILD_OUTPUT/" 2>/dev/null || true
    echo "✓ Windows 版本输出到: $BUILD_OUTPUT/AlgerMusicPlayer-*.exe"
  fi
  echo ""
}

# macOS 编译 (仅 x64)
build_mac() {
  echo "[3/5] 正在编译 macOS 版本 (x64)..."
  npm run build:mac:x64
  if [ -d "$PROJECT_DIR/dist" ]; then
    cp -r "$PROJECT_DIR/dist"/* "$BUILD_OUTPUT/" 2>/dev/null || true
    echo "✓ macOS x64 版本输出到: $BUILD_OUTPUT/AlgerMusicPlayer-*.dmg"
  fi
  echo ""
}

# Linux 编译
build_linux() {
  echo "[4/5] 正在编译 Linux 版本..."
  npm run build:linux
  if [ -d "$PROJECT_DIR/dist" ]; then
    cp -r "$PROJECT_DIR/dist"/* "$BUILD_OUTPUT/" 2>/dev/null || true
    echo "✓ Linux 版本输出到: $BUILD_OUTPUT/algermusic-*.AppImage"
  fi
  echo ""
}

# Android APK 编译
build_apk() {
  echo "[5/5] 正在编译 Android APK..."
  npx cap sync android
  cd "$PROJECT_DIR/android"
  ./gradlew clean assembleRelease
  if [ -f "$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk" ]; then
    cp "$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk" "$BUILD_OUTPUT/AlgerMusicPlayer-v5.1.2.apk"
    echo "✓ APK 版本输出到: $BUILD_OUTPUT/AlgerMusicPlayer-v5.1.2.apk"
  fi
  cd "$PROJECT_DIR"
  echo ""
}

# 执行编译
case "$PLATFORM" in
  win)
    build_windows
    ;;
  mac)
    build_mac
    ;;
  linux)
    build_linux
    ;;
  apk)
    build_apk
    ;;
  all)
    build_windows
    build_mac
    build_linux
    build_apk
    ;;
  *)
    echo "未知的平台: $PLATFORM"
    echo "支持的平台: win | mac | linux | apk | all"
    exit 1
    ;;
esac

echo "================================================"
echo "编译完成！"
echo "输出目录: $BUILD_OUTPUT"
echo "================================================"
echo ""
echo "文件列表:"
ls -lh "$BUILD_OUTPUT" | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
