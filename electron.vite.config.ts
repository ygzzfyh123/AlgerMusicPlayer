import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
// import viteCompression from 'vite-plugin-compression'; // 禁用压缩以修复 Android 资源冲突
import VueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '@renderer': resolve('src/renderer'),
        '@i18n': resolve('src/i18n')
      }
    },
    plugins: [
      vue(),
      // viteCompression(), // 禁用压缩以修复 Android 资源冲突 喵~
      VueDevTools(),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar']
          }
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      })
    ],
    publicDir: resolve('resources'),
    server: {
      host: '0.0.0.0',
      port: 2389
    }
  }
});
