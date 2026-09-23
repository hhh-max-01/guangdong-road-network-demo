<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import DemoGuide from '../components/DemoGuide.vue'
import { demoGuide } from '../data/demoGuide'
import '../assets/integration.css'
import SystemToolsDialog from '../components/SystemToolsDialog.vue'
import { resetCameras } from '../data/cameras'
import { resetCatalogRules } from '../data/catalogRules'
import { resetPatrol } from '../composables/usePatrol'
import { clearCongestion, clearSimulationCompletion } from '../data/traffic'
const screenshotMode = ref(false)
const toolDialog = ref('')
async function resetAll() {
  // 先卸载当前业务页以取消任务，再清理共享结果，防止旧计时器回写。
  await router.push('/')
  await nextTick()
  resetCatalogRules(); resetCameras(); resetPatrol(); clearCongestion(); clearSimulationCompletion()
  demoGuide.index = 0; demoGuide.active = true
  screenshotMode.value = false; toolDialog.value = ''
}
const route = useRoute()
const router = useRouter()
async function enterDemo() { await router.push('/'); demoGuide.index = 0; demoGuide.active = true }
const currentTime = ref('')
let timer
const updateTime = () => { currentTime.value = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()) }
onMounted(() => { updateTime(); timer = setInterval(updateTime, 1000) })
onBeforeUnmount(() => clearInterval(timer))
const menus = [
  { path: '/', title: '路网总览', icon: 'grid', index: '01' },
  { path: '/video-catalog', title: '视频编目', icon: 'camera', index: '02', group: '视频资源' },
  { path: '/smart-patrol', title: '智慧轮巡', icon: 'scan', index: '03' },
  { path: '/congestion-analysis', title: '堵点分析', icon: 'activity', index: '04' },
  { path: '/traffic-simulation', title: '态势推演', icon: 'layers', index: '05' },
]
</script>
<template>
  <div class="app-shell unified-ui" :class="{ 'demo-active': demoGuide.active && !screenshotMode, 'screenshot-mode': screenshotMode }">
    <header class="topbar">
<div class="brand">
<div class="brand-symbol">
<AppIcon name="road" />
</div>
<div>
<strong>省级路网运行监测预警演示系统</strong>
<span>PROVINCIAL ROAD NETWORK MONITORING</span>
</div>
</div>
<div class="topbar-right">
<b class="demo-badge">DEMO</b>
<span class="local-status">
<i>
</i>演示模拟数据</span>
<time>{{ currentTime }}</time>
<button class="button tool-button" @click="toolDialog='about'">系统说明</button>
<button class="button tool-button" @click="toolDialog='reset'">重置演示数据</button>
<button class="button capture-button" :aria-pressed="screenshotMode" @click="screenshotMode=!screenshotMode">{{ screenshotMode ? '退出截图模式' : '截图模式' }}</button>
<button v-if="!demoGuide.active" class="button enter-demo" @click="enterDemo">进入演示模式</button>
<button v-else class="button enter-demo" @click="demoGuide.active=false">退出演示模式</button>
</div>
</header>
    <DemoGuide v-if="demoGuide.active" v-show="!screenshotMode" />
    <SystemToolsDialog v-if="toolDialog" :kind="toolDialog" @close="toolDialog=''" @confirm="resetAll" />
    <aside class="sidebar">
<div class="nav-caption">运行监测工作台</div>
<nav aria-label="系统导航">
<template v-for="item in menus" :key="item.path">
<div v-if="item.group" class="nav-group">
<AppIcon name="camera" />{{ item.group }}<span>⌄</span>
</div>
<RouterLink :to="item.path" class="nav-item" :class="{ sub: item.group }" :aria-current="route.path === item.path ? 'page' : undefined">
<AppIcon :name="item.icon" />
<span>{{ item.title }}</span>
<small>{{ item.index }}</small>
</RouterLink>
</template>
</nav>
<div class="sidebar-bottom">
<div class="sidebar-rule">
</div>
<span class="tag">本地演示系统</span>
<p>省级路网运行监测</p>
<small>课程实践 · 投标模拟</small>
<div class="sidebar-note">
<i class="tiny-dot">
</i>演示模拟数据</div>
</div>
</aside>
    <main class="workspace">
<div class="breadcrumb">运行监测工作台 <span>/</span> <strong>{{ route.meta.title }}</strong>
<span class="workspace-label">广东省 · 演示系统</span>
</div>
<RouterView />
<footer class="workspace-footer">
<span>省级路网运行监测预警演示系统</span>
<span>所有业务数据均为演示模拟数据，仅用于课程实践与投标模拟</span>
<span>V0.1.0</span>
</footer>
</main>
  </div>
</template>
