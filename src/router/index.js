import { createRouter, createWebHashHistory } from 'vue-router'

// 本地静态部署无需服务端配置，直接访问和刷新业务路由均可用。
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '路网总览' } },
    { path: '/video-catalog', component: () => import('../views/VideoCatalog.vue'), meta: { title: '视频编目' } },
    { path: '/smart-patrol', component: () => import('../views/SmartPatrol.vue'), meta: { title: '智慧轮巡' } },
    { path: '/congestion-analysis', component: () => import('../views/CongestionAnalysis.vue'), meta: { title: '堵点分析' } },
    { path: '/traffic-simulation', component: () => import('../views/TrafficSimulation.vue'), meta: { title: '态势推演' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
