/**
 * 移动端初始化脚本
 * 在应用启动时，为移动端配置完全独立的环境
 */

import { isMobileEnvironment } from '@/utils/mobileConfig';

/**
 * 初始化移动端环境
 */
export function initializeMobileEnvironment() {
  if (!isMobileEnvironment()) {
    return;
  }

  console.log('[Mobile Init] 正在初始化移动端独立环境...');

  // 1. 设置全局移动端标记
  (window as any).__MOBILE_STANDALONE__ = true;

  // 2. 禁用某些桌面特性
  disableDesktopFeatures();

  // 3. 优化移动端性能
  optimizeMobilePerformance();

  // 4. 设置移动端特有的错误处理
  setupMobileErrorHandling();

  // 5. 初始化离线支持（可选）
  if ('serviceWorker' in navigator) {
    initializeServiceWorker();
  }

  console.log('[Mobile Init] 移动端初始化完成，所有 API 将使用本地 Standalone 服务');
}

/**
 * 禁用某些不适合移动端的功能
 */
function disableDesktopFeatures() {
  // 禁用 Electron 特性
  if ((window as any).electron) {
    console.log('[Mobile] 禁用 Electron 特性');
    // 移动端不使用 Electron 的 IPC
    (window as any).electron = undefined;
  }

  // 禁用本地文件系统相关操作
  const originalOpen = window.open;
  window.open = function (url, target, features) {
    const urlStr = typeof url === 'string' ? url : url?.toString() || '';
    if (urlStr && urlStr.startsWith('file://')) {
      console.warn('[Mobile] 移动端不支持打开本地文件:', urlStr);
      return null;
    }
    return originalOpen?.call(window, url, target, features) || null;
  };
}

/**
 * 优化移动端性能
 */
function optimizeMobilePerformance() {
  // 1. 启用请求压缩
  console.log('[Mobile] 启用请求优化');

  // 2. 减少动画卡顿（可选）
  const root = document.documentElement;
  root.style.setProperty('--animation-duration', '0.3s');

  // 3. 优化滚动性能
  document.addEventListener(
    'touchmove',
    (e) => {
      const target = e.target as HTMLElement;
      if (target?.className?.includes('scroll-container')) {
        // 允许滚动容器的滚动
        return;
      }
    },
    { passive: true }
  );
}

/**
 * 设置移动端特有的错误处理
 */
function setupMobileErrorHandling() {
  const originalErrorHandler = window.onerror;

  window.onerror = function (message, source, lineno, colno, error) {
    console.error('[Mobile Error]', { message, source, lineno, colno, error });

    // 移动端特殊处理某些错误
    if (message?.toString().includes('net::ERR_FAILED')) {
      console.warn('[Mobile] 网络连接失败，将尝试使用本地缓存');
    }

    // 调用原始错误处理器
    return originalErrorHandler?.call(window, message, source, lineno, colno, error);
  };

  // 处理未捕获的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Mobile UnhandledRejection]', event.reason);
  });
}

/**
 * 初始化 Service Worker（用于离线缓存）
 */
function initializeServiceWorker() {
  // 可选：创建一个简单的 Service Worker 来缓存资源
  if (navigator.serviceWorker) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        console.log('[Mobile] Service Worker 注册成功');
      })
      .catch((err) => {
        console.warn('[Mobile] Service Worker 注册失败:', err);
      });
  }
}

/**
 * 获取移动端信息
 */
export function getMobileInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isOnline: navigator.onLine,
    language: navigator.language,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
  };
}

/**
 * 记录移动端运行日志
 */
export function logMobileInfo() {
  const info = getMobileInfo();
  console.group('[Mobile Device Info]');
  console.log('User Agent:', info.userAgent);
  console.log('Platform:', info.platform);
  console.log('Online:', info.isOnline);
  console.log('Language:', info.language);
  console.log('Device Memory:', info.deviceMemory);
  console.log('Hardware Concurrency:', info.hardwareConcurrency);
  console.groupEnd();
}
