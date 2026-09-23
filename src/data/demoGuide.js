import { reactive, watch } from 'vue'
import { readSession, writeSession } from './demoSession'
export const demoSteps = [
  { path: '/', name: '路网运行总览', hint: '查看当前省级路网视频资源、交通事件及运行态势。', duration: '建议讲解 1～2 分钟' },
  { path: '/video-catalog', name: '视频资源编目', hint: '选择G4京港澳高速，查看资源；打开新增视频，演示自动编码与独立共享目录。', duration: '建议讲解 2～3 分钟' },
  { path: '/smart-patrol', name: '智慧轮巡与事件发现', hint: '点击“开始智慧轮巡”，观察CAM004发现G4 K2035疑似交通事故。', duration: '建议讲解 2 分钟' },
  { path: '/smart-patrol', name: '高码流事件复核', hint: '点击“高码流复核”，观察512kbps切换至4Mbps，确认交通事故。', duration: '建议讲解 1～2 分钟' },
  { path: '/congestion-analysis', name: '多源数据融合与堵点研判', hint: '点击“启动堵点分析”，展示多源数据、严重拥堵堵点及65%事故诱因。', duration: '建议讲解 2～3 分钟' },
  { path: '/traffic-simulation', name: '交通态势推演', hint: '点击“开始态势推演”，观察2.3→6.8km；回看时间点并打开模型设计。', duration: '建议讲解 2～3 分钟' },
]
const saved = readSession('guide', value => typeof value.active === 'boolean' && Number.isInteger(value.index) && value.index >= 0 && value.index < 6)
export const demoGuide = reactive(saved || { active: false, index: 0 })
watch(demoGuide, value => writeSession('guide', value), { deep: true, flush: 'sync' })
