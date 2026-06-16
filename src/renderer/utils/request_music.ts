import axios from 'axios';
import * as StandaloneApi from '@/services/StandaloneNeteaseApi';
import { isElectron } from './index';

const baseURL = `${import.meta.env.VITE_API_MUSIC}`;
const request = axios.create({
  baseURL,
  timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 移动端如果配置失效，可以拦截特定的解析请求
    if (!isElectron && config.url === '/music') {
      config.adapter = async (c) => {
        try {
          const id = c.params.id;
          const result = await StandaloneApi.songUrl(id);
          return {
            data: result,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: c
          } as any;
        } catch (error) {
          console.error('Standalone music parse error:', error);
          throw error;
        }
      };
    }
    return config;
  },
  (error) => {
    // 当请求异常时做一些处理
    return Promise.reject(error);
  }
);

export default request;
