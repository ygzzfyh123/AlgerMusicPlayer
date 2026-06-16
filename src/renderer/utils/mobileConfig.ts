/**
 * 移动端独立配置
 * 为移动端(Android/iOS)提供完全独立的本地 API 配置
 * 所有后端服务完全嵌入前端，无需依赖外部服务器
 */

import { isMobile } from '.';

/**
 * 检测是否为移动端环境
 */
export function isMobileEnvironment(): boolean {
  return isMobile.value || /Android|iPhone|iPad|iPod|mobile/i.test(navigator.userAgent);
}

/**
 * 获取移动端 API 配置
 * 移动端始终使用本地 Standalone API，不依赖远程服务
 */
export function getMobileApiConfig() {
  return {
    // 移动端总是启用本地 API
    useStandalone: true,
    // 所有 API 都走本地
    apiMode: 'standalone' as const,
    // 超时时间（本地请求应该快速）
    timeout: 30000,
    // 重试次数
    maxRetries: 3,
    // 重试延迟
    retryDelay: 1000,
    // 启用请求缓存（移动端减少流量）
    enableCache: true,
    // 缓存过期时间（分钟）
    cacheExpiry: 10
  };
}

/**
 * 获取电脑端 API 配置
 */
export function getDesktopApiConfig() {
  return {
    // 电脑端优先使用远程 API（如果可用）
    useStandalone: false,
    // API 模式可切换
    apiMode: 'remote' as const,
    // 超时时间
    timeout: 15000,
    // 重试次数
    maxRetries: 1,
    // 重试延迟
    retryDelay: 500,
    // 启用请求缓存
    enableCache: true,
    // 缓存过期时间
    cacheExpiry: 5
  };
}

/**
 * 获取当前环境的 API 配置
 */
export function getCurrentApiConfig() {
  if (isMobileEnvironment()) {
    return getMobileApiConfig();
  }
  return getDesktopApiConfig();
}

/**
 * 移动端请求缓存管理
 */
class MobileRequestCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private expiry: number = 10 * 60 * 1000; // 10 分钟

  setExpiry(minutes: number) {
    this.expiry = minutes * 60 * 1000;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  getCacheKey(url: string, params?: any): string {
    return `${url}:${JSON.stringify(params || {})}`;
  }
}

export const mobileCache = new MobileRequestCache();

/**
 * 移动端特有的网络状态管理
 */
export class MobileNetworkManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: ((online: boolean) => void)[] = [];

  constructor() {
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  private setOnline(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.listeners.forEach((listener) => listener(online));
    }
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const mobileNetworkManager = new MobileNetworkManager();
