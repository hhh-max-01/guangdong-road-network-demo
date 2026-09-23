<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import PanelCard from '../components/PanelCard.vue'
import CorridorTopology from '../components/congestion/CorridorTopology.vue'
import CongestionCharts from '../components/congestion/CongestionCharts.vue'
import LinkedEventDialog from '../components/congestion/LinkedEventDialog.vue'
import { analysisEvent } from '../data/events'
import { roadSegments, trafficStates, trafficMetrics, weatherData, analysisSteps, currentCongestion } from '../data/traffic'
import { useCongestion } from '../composables/useCongestion'
import '../assets/congestion.css'
const { step, running, complete, start, reset, message } = useCongestion()
const selected = ref('K2035'), showEvent = ref(false)
const node = computed(() => {
  const item = roadSegments.find(item => item.location === selected.value)
  return item.location === 'K2035' ? { ...item, ...trafficMetrics.value } : item
})
const facts = computed(() => [['平均速度', `${node.value.speed} km/h`], ['交通流量', `${node.value.flow} 辆/h`], ['交通密度', node.value.density], ['排队长度', `${node.value.queueLength} km`], ['道路事件', selected.value === 'K2035' ? analysisEvent.value.eventType : '无直接事件'], ['天气', weatherData.value.weather], ['拥堵等级', ['无','轻度','中度','严重'][node.value.state]], ['运行状态', trafficStates[node.value.state].label]])
const sources = computed(() => [
  ['路网运行指标', `${trafficMetrics.value.speed} km/h · ${trafficMetrics.value.flow} 辆/h · 密度${trafficMetrics.value.density}`],
  ['交通事件', `${analysisEvent.value.eventType} · ${analysisEvent.value.status}`],
  ['天气数据', `${weatherData.value.weather} · 能见度${weatherData.value.visibility}`],
  ['道路基础信息', `${analysisEvent.value.road} · 高速公路`],
  ['视频事件', `${analysisEvent.value.camera} · AI高清复核已确认`],
])
function resetPage() { reset(); selected.value = 'K2035' }
function analyze() { selected.value = 'K2035'; start() }
</script>
<template>
  <div class="congestion-page">
    <PageHeader title="堵点分析" subtitle="融合路网运行指标、交通事件及天气信息，实现道路堵点识别与成因研判" />
    <div class="congestion-toolbar"><div><span class="tag">{{ analysisEvent.id }}</span><span>来源：智慧轮巡 · {{ analysisEvent.source === 'preset' ? '预置已确认样例' : '本轮已确认事件' }} · {{ analysisEvent.camera }}</span><button class="congestion-link" @click="showEvent = true">查看关联事件</button></div><div><button class="button" @click="resetPage">重置分析</button><button class="button primary" :disabled="running" @click="analyze">{{ running ? '正在分析' : complete ? '重新分析' : '启动堵点分析' }}</button></div></div>
    <p class="congestion-source-note">{{ analysisEvent.source === 'preset' ? '当前为同一主线预置样例；完成智慧轮巡复核后，自动使用本轮事件。' : '已承接智慧轮巡高清复核结果 · 交通事故 · 已确认 · 置信度 99%。' }} 所有指标均为演示模拟数据。</p>
    <div class="congestion-main">
      <PanelCard title="路网运行态势" subtitle="点击节点查看交通数据" class="congestion-map"><CorridorTopology :selected="selected" :located="complete || step >= 3" @select="selected = $event" /></PanelCard>
      <div class="congestion-center">
        <PanelCard title="路段运行详情"><template #action><span class="tag" :style="{ color: trafficStates[node.state].color }">{{ trafficStates[node.state].label }}</span></template><div class="segment-detail"><h3>{{ analysisEvent.road }} <b>{{ selected }}</b></h3><dl><div v-for="[key,value] in facts" :key="key"><dt>{{ key }}</dt><dd>{{ value }}</dd></div></dl></div></PanelCard>
        <PanelCard title="堵点研判结果" class="congestion-result"><template #action><span class="tag">{{ complete ? '已定位 K2035' : '等待研判' }}</span></template>
          <div v-if="complete" class="congestion-conclusion" role="status"><h3>发现严重拥堵堵点</h3><p>{{ currentCongestion.road }} · {{ currentCongestion.location }} · 拥堵等级：严重</p><div><strong>{{ currentCongestion.queueLength }}<small> km 排队</small></strong><strong>{{ currentCongestion.speed }}<small> km/h</small></strong><span>主要诱因 <b>{{ currentCongestion.mainCause }}</b></span></div><RouterLink to="/traffic-simulation">进入态势推演 →</RouterLink></div>
          <div v-else class="congestion-result-empty"><span>{{ running ? message : '等待多源数据融合分析' }}</span><p>分析对象固定为 G4 K2035；点击其他节点可对比运行指标。</p></div>
        </PanelCard>
      </div>
      <PanelCard title="多源数据输入" subtitle="关联 G4 K2035" class="congestion-sources"><div class="source-cards"><article v-for="([title,content],index) in sources" :key="title"><i>{{ String(index+1).padStart(2,'0') }}</i><div><h3>{{ title }}</h3><p>{{ content }}</p></div><span>已接入</span></article></div><p class="fusion-explainer">融合交通流、运行速度、事件及气象信息，结合时空关联关系定位堵点并研判主要诱因。</p></PanelCard>
    </div>
    <section class="congestion-process panel"><div class="analysis-message" role="status"><strong>{{ message }}</strong><span>分析流程 · 约 4.5 秒</span></div><ol><li v-for="(name,index) in analysisSteps" :key="name" :data-step="index" :class="{ done: complete || step > index, active: running && step === index, located: index === 3 && (complete || step > 3) }"><b>{{ complete || step > index ? '✓' : index+1 }}</b>{{ name }}<span v-if="index < 4">→</span></li></ol></section>
    <CongestionCharts :complete="complete" />
    <p class="congestion-footnote">演示基准：14:00 · 分析完成后可进入态势推演。</p>
    <LinkedEventDialog v-if="showEvent" :event="analysisEvent" @close="showEvent = false" />
  </div>
</template>

