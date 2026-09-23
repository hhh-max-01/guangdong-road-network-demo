<script setup>
import { computed } from 'vue'
import PanelCard from '../PanelCard.vue'
import ChartPanel from '../ChartPanel.vue'
import { congestionTrend, causeFactors } from '../../data/traffic'
const props = defineProps({ complete: Boolean })
const axis = { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#88a0b8', fontSize: 10 }, splitLine: { lineStyle: { color: '#24384f', type: 'dashed' } }, nameTextStyle: { color: '#88a0b8', fontSize: 10 } }
const base = { tooltip: { trigger: 'axis', backgroundColor: '#14263c', borderColor: '#24384f', textStyle: { color: '#e4edf7' } }, animationDuration: 350 }
const trendOption = { ...base, grid: { left: 48, right: 55, top: 32, bottom: 26 }, xAxis: { ...axis, type: 'category', data: congestionTrend.times }, yAxis: [{ ...axis, type: 'value', name: 'km/h', min: 0, max: 100 }, { ...axis, type: 'value', name: '辆/h', min: 0, max: 5000, splitLine: { show: false } }], series: [{ name: '平均速度（km/h）', type: 'line', data: congestionTrend.speeds, itemStyle: { color: '#4cbbec' }, lineStyle: { width: 3 } }, { name: '交通流量（辆/h）', type: 'line', yAxisIndex: 1, data: congestionTrend.flows, itemStyle: { color: '#e7c65b' }, lineStyle: { width: 2 } }] }
const causeOption = computed(() => ({ ...base, grid: { left: 108, right: 44, top: 20, bottom: 25 }, xAxis: { ...axis, type: 'value', min: 0, max: 100, axisLabel: { ...axis.axisLabel, formatter: '{value}%' } }, yAxis: { ...axis, type: 'category', inverse: true, data: causeFactors.map(item => item.name), splitLine: { show: false } }, series: [{ name: '诱因占比（%）', type: 'bar', barWidth: 15, data: causeFactors.map(item => ({ value: props.complete ? item.value : 0, itemStyle: { color: item.color, borderRadius: [0, 3, 3, 0] } })), label: { show: props.complete, position: 'right', formatter: '{c}%', color: '#c7d9e9' } }] }))
</script>
<template>
  <div class="congestion-charts">
    <PanelCard title="交通运行指标趋势" subtitle="演示时段 13:35—14:00"><template #action><span class="trend-legend"><i></i>速度 <i></i>流量</span></template><ChartPanel :option="trendOption" label="模拟趋势：速度72降至18km/h，流量3200增至4200辆/h" /></PanelCard>
    <PanelCard title="拥堵诱因分析" subtitle="诱因占比为演示模拟结果"><template #action><span class="tag">{{ complete ? '研判完成' : '待分析' }}</span></template><div class="cause-chart"><ChartPanel :option="causeOption" :label="complete ? '模拟诱因：交通事故65%，交通流量过大25%，恶劣天气10%' : '诱因分析等待执行'" /><span v-if="!complete" class="cause-wait">完成分析后展示诱因占比</span></div></PanelCard>
  </div>
</template>
