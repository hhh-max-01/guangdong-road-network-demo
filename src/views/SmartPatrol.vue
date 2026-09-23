<script setup>
import PageHeader from '../components/PageHeader.vue'
import PanelCard from '../components/PanelCard.vue'
import VideoMonitorCard from '../components/patrol/VideoMonitorCard.vue'
import EventAlertPanel from '../components/patrol/EventAlertPanel.vue'
import BandwidthPanel from '../components/patrol/BandwidthPanel.vue'
import PatrolLog from '../components/patrol/PatrolLog.vue'
import EventRecords from '../components/patrol/EventRecords.vue'
import { patrolCameras } from '../data/cameras'
import { detectionTypes } from '../data/events'
import { usePatrol } from '../composables/usePatrol'
import '../assets/patrol.css'

const { state, start, review, reset, canStart, canReview, phaseLabel, lowCount, highCount, totalBandwidth } = usePatrol()
const steps = ['逐路轮巡', '疑似事件', '高清复核', '事件确认']
const stepIndex = () => state.phase === 'confirmed' ? 3 : ['requesting', 'switched', 'reviewing'].includes(state.phase) ? 2 : state.phase === 'suspected' ? 1 : 0
</script>

<template>
  <div class="patrol-page">
    <PageHeader title="智慧轮巡" subtitle="基于视频智能分析实现交通事件自动发现与高清复核" />
    <div class="patrol-toolbar">
      <div class="patrol-steps"><span v-for="(step,index) in steps" :key="step" :class="{ active: index === stepIndex(), done: index < stepIndex() }"><b>{{ index + 1 }}</b>{{ step }}</span></div>
      <div class="patrol-actions"><button class="button" @click="reset">重置演示</button><button class="button patrol-primary" :disabled="!canStart" @click="start">开始智慧轮巡</button></div>
    </div>
    <div class="patrol-banner" :class="{ alert: state.event, confirmed: state.phase === 'confirmed' }" role="status">
      <span class="tiny-dot"></span><strong>{{ phaseLabel }}</strong>
      <span>{{ state.event ? 'G4京港澳高速 K2035 · CAM004 · 交通事故' : '4 路在线 · 全部检测类型已启用 · 低码流分析' }}</span>
      <small>{{ state.phase === 'confirmed' ? '确认结果已写入事件列表' : '自动执行约 20 秒；待复核阶段由演示人员手动继续' }}</small>
    </div>
    <div class="patrol-main">
      <PanelCard title="交通视频监测" subtitle="四路同步展示 · 逐路智能分析" class="patrol-monitors">
        <template #action><span class="tag">低码流 {{ lowCount }} 路 / 高清 {{ highCount }} 路</span></template>
        <div class="patrol-video-grid"><VideoMonitorCard v-for="camera in patrolCameras" :key="camera.id" :camera="camera" :status="state.cameras[camera.id]" :high="state.highCamera === camera.id" /></div>
      </PanelCard>
      <div class="patrol-sidebar">
        <PanelCard title="智能检测模型" class="patrol-models">
          <template #action><span class="tag">8 类已启用</span></template>
          <div class="patrol-model-tags"><span v-for="type in detectionTypes" :key="type"><i>✓</i>{{ type }}</span></div>
          <p>交通事件综合识别</p>
        </PanelCard>
        <PanelCard title="轮巡状态" class="patrol-progress-panel">
          <div class="patrol-progress"><div><span>当前巡检 <strong>{{ state.activeCamera || '待启动' }}</strong></span><span>分析进度 <strong>{{ state.progress }} / 4</strong></span></div><progress :value="state.progress" max="4" aria-label="分析进度"></progress><p>当前码流：{{ state.highCamera ? '高码流 · 1920×1080 / 4Mbps' : '低码流 · 640×360 / 512kbps' }}</p></div>
        </PanelCard>
        <EventAlertPanel :event="state.event" :phase="state.phase" :phase-label="phaseLabel" :can-review="canReview" :high="Boolean(state.highCamera)" @review="review" />
      </div>
    </div>
    <div class="patrol-bottom"><PatrolLog :logs="state.logs" /><BandwidthPanel :low="lowCount" :high="highCount" :total="totalBandwidth" :confirmed="state.phase === 'confirmed'" /></div>
    <EventRecords />
    <p class="patrol-footnote">日常低码流检测，疑似事件按需高码流复核。重置演示将清除本轮事件及后续分析结果。</p>
  </div>
</template>

