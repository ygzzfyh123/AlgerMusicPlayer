import './index.css';
import '@/assets/css/mobile.css';
import 'animate.css';
import 'remixicon/fonts/remixicon.css';

import { createApp } from 'vue';

import i18n from '@/../i18n/renderer';
import router from '@/router';
import pinia from '@/store';
import { initializeMobileEnvironment, logMobileInfo } from '@/utils/mobileInit';

import App from './App.vue';
import directives from './directive';

// 初始化移动端环境
initializeMobileEnvironment();
logMobileInfo();

const app = createApp(App);

Object.keys(directives).forEach((key: string) => {
  app.directive(key, directives[key as keyof typeof directives]);
});

app.use(pinia);
app.use(router);
app.use(i18n as any);
app.mount('#app');
