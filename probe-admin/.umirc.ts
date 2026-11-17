import { defineConfig } from '@umijs/max';

export default defineConfig({
  npmClient: 'npm',
  routes: [
    { path: '/login', component: '@/pages/login' },
    { path: '/', redirect: '/login' },
  ],
});

