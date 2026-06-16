import axios, { InternalAxiosRequestConfig } from 'axios';

import * as StandaloneApi from '@/services/StandaloneNeteaseApi';
import { useUserStore } from '@/store/modules/user';

import { getSetData, isElectron } from '.';
import { getCurrentApiConfig, isMobileEnvironment, mobileCache } from './mobileConfig';

let setData: any = null;

// 扩展请求配置接口
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
  noRetry?: boolean;
}

// 初始化 baseURL（动态，在请求时重新计算）
const getBaseURL = () => {
  setData = getSetData();

  // 移动端始终使用本地地址
  if (isMobileEnvironment()) {
    return 'http://127.0.0.1:30488';
  }

  if (window.electron) {
    return `http://127.0.0.1:${setData?.musicApiPort || 30488}`;
  }
  return setData?.customApiUrl || import.meta.env.VITE_API || 'http://127.0.0.1:30488';
};

const request = axios.create({
  baseURL: 'http://127.0.0.1:30488', // 默认本地降级地址
  timeout: 30000, // 移动端延长超时时间
  withCredentials: true
});

/**
 * 映射请求到 Standalone API
 */
async function handleStandaloneRequest(config: CustomAxiosRequestConfig) {
  const url = config.url || '';
  const params = config.params || {};
  const data = config.data || {};

  try {
    let result: any;
    if (url === '/cloudsearch' || url === '/search') {
      result = await StandaloneApi.search(
        params.keywords,
        params.type,
        params.limit,
        params.offset
      );
    } else if (url === '/playlist/detail') {
      result = await StandaloneApi.playlistDetail(params.id);
    } else if (url === '/song/detail') {
      result = await StandaloneApi.songDetail(params.ids.split(','));
    } else if (url === '/song/url/v1') {
      result = await StandaloneApi.songUrl(params.id, params.level);
    } else if (url === '/lyric/new' || url === '/lyric') {
      result = await StandaloneApi.lyric(params.id);
    } else if (url === '/banner') {
      result = await StandaloneApi.banners(params.type);
    } else if (url === '/personalized') {
      result = await StandaloneApi.personalizedPlaylist(params.limit);
    } else if (url === '/recommend/songs') {
      result = await StandaloneApi.dayRecommend();
    } else if (url === '/search/hot/detail') {
      result = await StandaloneApi.hotSearch();
    } else if (url === '/search/suggest') {
      result = await StandaloneApi.searchSuggest(params.keywords);
    } else if (url === '/personalized/newsong') {
      result = await StandaloneApi.personalizedNewSong(params.limit);
    } else {
      // 其他请求尝试通用 weapi 转换
      const weapiUrl = url.startsWith('/') ? url : `/${url}`;
      result = await StandaloneApi.standaloneRequest(weapiUrl, { ...params, ...data });
    }

    return {
      data: result,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
  } catch (error) {
    console.error('Standalone request error:', error);
    throw error;
  }
}

// 最大重试次数
const MAX_RETRIES = isMobileEnvironment() ? 3 : 1;
// 重试延迟（毫秒）
const RETRY_DELAY = isMobileEnvironment() ? 1000 : 500;

// 请求拦截器
request.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    setData = getSetData();

    // 更新 baseURL（动态计算）
    config.baseURL = getBaseURL();

    // 移动端配置
    const isMobileEnv = isMobileEnvironment();
    const apiConfig = getCurrentApiConfig();

    if (isMobileEnv) {
      // ========== 移动端：完全独立模式 ==========
      // 所有API都使用本地 Standalone
      const allMobileApis = [
        '/cloudsearch',
        '/search',
        '/playlist/detail',
        '/song/detail',
        '/song/url/v1',
        '/lyric/new',
        '/lyric',
        '/search/suggest',
        '/banner',
        '/personalized',
        '/recommend/songs',
        '/search/hot/detail',
        '/personalized/newsong',
        '/album',
        '/artist',
        '/user',
        '/login',
        '/logout',
        '/collection',
        '/favorite'
      ];

      if (allMobileApis.some((u) => config.url?.includes(u))) {
        // 检查缓存
        const cacheKey = mobileCache.getCacheKey(config.url || '', config.params);
        const cached = mobileCache.get(cacheKey);

        if (cached && config.method?.toUpperCase() === 'GET') {
          // 直接返回缓存数据
          config.adapter = async () => ({
            data: cached,
            status: 200,
            statusText: 'OK (from cache)',
            headers: {},
            config
          });
          return config;
        }

        // 使用 Standalone API
        config.adapter = async (c) => {
          try {
            const res = await handleStandaloneRequest(c);
            // 缓存结果
            if (c.method?.toUpperCase() === 'GET') {
              mobileCache.set(cacheKey, res.data);
            }
            return res as any;
          } catch (err) {
            console.error('[Mobile] Standalone API 请求失败:', err);
            throw err;
          }
        };
      }

      // 扩展超时时间
      config.timeout = apiConfig.timeout;
    } else {
      // ========== 桌面端：兼容模式 ==========
      // 保持原有逻辑，支持远程服务降级
      const standaloneUrls = [
        '/cloudsearch',
        '/search',
        '/playlist/detail',
        '/song/detail',
        '/song/url/v1',
        '/lyric/new',
        '/lyric',
        '/search/suggest'
      ];

      if (standaloneUrls.some((u) => config.url?.includes(u))) {
        const isRemoteAvailable = setData?.customApiUrl || import.meta.env.VITE_API;
        if (!isRemoteAvailable) {
          config.adapter = async (c) => {
            try {
              const res = await handleStandaloneRequest(c);
              return res as any;
            } catch (err) {
              console.error('[Desktop Fallback] 本地 API 请求失败:', err);
              throw err;
            }
          };
        }
      }
    }

    // 只在retryCount未定义时初始化为0
    if (config.retryCount === undefined) {
      config.retryCount = 0;
    }

    // 在请求发送之前做一些处理
    // 在get请求params中添加timestamp
    config.params = {
      ...config.params,
      timestamp: Date.now(),
      device: isElectron ? 'pc' : isMobileEnv ? 'mobile' : 'web'
    };
    const token = localStorage.getItem('token');
    if (token && config.method !== 'post') {
      config.params.cookie = config.params.cookie !== undefined ? config.params.cookie : token;
    } else if (token && config.method === 'post') {
      config.data = {
        ...config.data,
        cookie: token
      };
    }
    if (isElectron) {
      const proxyConfig = setData?.proxyConfig;
      if (proxyConfig?.enable && ['http', 'https'].includes(proxyConfig?.protocol)) {
        config.params.proxy = `${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}`;
      }
      if (setData.enableRealIP && setData.realIP) {
        config.params.realIP = setData.realIP;
      }
    }

    return config;
  },
  (error) => {
    // 当请求异常时做一些处理
    return Promise.reject(error);
  }
);

const NO_RETRY_URLS = ['暂时没有'];

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('error', error);
    const config = error.config as CustomAxiosRequestConfig;

    // 如果没有配置，直接返回错误
    if (!config) {
      return Promise.reject(error);
    }

    // 处理 301 状态码
    if (error.response?.status === 301 && config.params.noLogin !== true) {
      // 使用 store mutation 清除用户信息
      const userStore = useUserStore();
      userStore.handleLogout();
      console.log(`301 状态码，清除登录信息后重试第 ${config.retryCount} 次`);
      config.retryCount = 3;
    }

    // 检查是否还可以重试
    if (
      config.retryCount !== undefined &&
      config.retryCount < MAX_RETRIES &&
      !NO_RETRY_URLS.includes(config.url as string) &&
      !config.noRetry
    ) {
      config.retryCount++;
      console.error(`请求重试第 ${config.retryCount} 次`);

      // 延迟重试
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

      // 重新发起请求
      return request(config);
    }

    console.error(`重试${MAX_RETRIES}次后仍然失败`);
    return Promise.reject(error);
  }
);

export default request;
