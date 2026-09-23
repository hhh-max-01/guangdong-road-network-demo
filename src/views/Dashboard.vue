<script setup>
import PageHeader from '../components/PageHeader.vue'
import PanelCard from '../components/PanelCard.vue'
import AppIcon from '../components/AppIcon.vue'
import RoadNetwork from '../components/RoadNetwork.vue'
import ChartPanel from '../components/ChartPanel.vue'
import { metrics, trend, eventTypes } from '../data/traffic'
import { events, coreDemoEvent } from '../data/events'
const axis = { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#8ca5bc', fontSize: 11 }, splitLine: { lineStyle: { color: '#213447', type: 'dashed' } } }
const common = { textStyle: { fontFamily: 'Microsoft YaHei, sans-serif' }, tooltip: { trigger: 'axis', backgroundColor: '#162c43', borderColor: '#37516b', textStyle: { color: '#e3edf7' } }, grid: { left: 36, right: 22, top: 30, bottom: 28 }, animationDuration: 500 }
const trendOption = { ...common, xAxis: { ...axis, type: 'category', boundaryGap: false, data: trend.hours }, yAxis: { ...axis, type: 'value', minInterval: 1, name: '起', nameTextStyle: { color: '#8ca5bc' } }, series: [{ name: '交通事件', type: 'line', smooth: .3, data: trend.values, symbolSize: 6, lineStyle: { color: '#4cbbec', width: 3 }, itemStyle: { color: '#4cbbec' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#329fd840' }, { offset: 1, color: '#329fd803' }] } } }] }
const typeOption = { ...common, xAxis: { ...axis, type: 'category', data: eventTypes.labels }, yAxis: { ...axis, type: 'value', minInterval: 1, name: '起', nameTextStyle: { color: '#8ca5bc' } }, series: [{ name: '事件数量', type: 'bar', barMaxWidth: 30, data: eventTypes.values.map((value, i) => ({ value, itemStyle: { color: ['#f26679', '#ef964c', '#e7c65b', '#4cbbec', '#7b91da', '#36cba0'][i], borderRadius: [4, 4, 0, 0] } })), label: { show: true, position: 'top', color: '#c2d5e6' } }] }
</script>
<template>
  <div class="dashboard">
    <PageHeader title="路网运行监测总览" subtitle="全域资源汇聚 · 运行态势感知 · 重点事件关注" />
    <nav class="dashboard-shortcuts" aria-label="业务快捷入口"><RouterLink to="/video-catalog">视频编目 →</RouterLink><RouterLink to="/smart-patrol">智慧轮巡 →</RouterLink><RouterLink to="/congestion-analysis">堵点分析 →</RouterLink><RouterLink to="/traffic-simulation">态势推演 →</RouterLink></nav>
    <div class="metrics">
<article v-for="metric in metrics" :key="metric.label" class="metric-card" :class="metric.color">
<div class="metric-label">{{ metric.label }}<AppIcon :name="metric.icon" />
</div>
<div class="metric-value">{{ metric.value }}<span>{{ metric.unit }}</span>
</div>
<div class="metric-detail">
<i>
</i>{{ metric.detail }}</div>
</article>
</div>
    <div class="overview-grid">
      <PanelCard title="路网运行态势" subtitle="ROAD NETWORK STATUS" class="map-panel">
<template #action>
<span class="tag">重点路网示意</span>
</template>
<RoadNetwork />
<div class="map-summary">
<span>
<i class="tiny-dot danger">
</i>重点关注</span>
<strong>G4京港澳高速 K2035</strong>
<span>交通事故 · 暴雨</span>
<RouterLink to="/congestion-analysis">查看堵点分析 <AppIcon name="arrow" />
</RouterLink>
</div>
</PanelCard>
      <PanelCard title="实时交通事件" subtitle="TRAFFIC EVENTS" class="events-panel">
<template #action>
<span class="tag">最新 3 起</span>
</template>
<div class="event-list">
<RouterLink v-for="event in events" :key="event.id" :to="event.id === coreDemoEvent.id ? '/congestion-analysis' : '/smart-patrol'" class="event-card" :class="event.tone">
<div class="event-meta">
<span class="status" :class="event.tone">{{ event.type }}</span>
<time>{{ event.time }}</time>
</div>
<h3>{{ event.road }} <span>{{ event.stake }}</span>
</h3>
<p>{{ event.description }}</p>
<div class="event-bottom">
<span>
<i>
</i>{{ event.level }} · {{ event.city }}</span>
<AppIcon name="arrow" />
</div>
</RouterLink>
</div>
<RouterLink to="/smart-patrol" class="panel-link">进入智慧轮巡 <AppIcon name="arrow" />
</RouterLink>
</PanelCard>
    </div>
    <div class="charts-grid">
<PanelCard title="今日交通事件趋势" subtitle="分时统计 · 截至模拟时间 14:00">
<template #action>
<span class="chart-key">
<i>
</i>交通事件</span>
</template>
<ChartPanel :option="trendOption" label="今日交通事件趋势，00时至14时共32起" />
</PanelCard>
<PanelCard title="交通事件类型统计" subtitle="当日累计 · 演示模拟数据">
<template #action>
<span class="tag">合计 32 起</span>
</template>
<ChartPanel :option="typeOption" label="事故8起，拥堵11起，施工5起，抛洒物3起，气象3起，其他2起" />
</PanelCard>
</div>
  </div>
</template>

