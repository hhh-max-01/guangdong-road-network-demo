<script setup>
import RoadStatusLegend from '../RoadStatusLegend.vue'
import { simulationNodes, trafficStates } from '../../data/traffic'
defineProps({ frame: Object, index: Number })
const x = i => 60 + i * 97
</script>
<template>
  <div class="simulation-network">
    <div class="sim-map-caption"><strong>G4 京港澳高速</strong><span>{{ frame.time }} · {{ index ? '预测情景' : '当前态势' }}</span></div>
    <svg viewBox="0 0 800 155" role="img" :aria-label="`${frame.time}路网：${frame.status}，影响范围${frame.affectedRange}`">
      <defs><pattern id="simulation-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#21394b" stroke-width=".5" /></pattern></defs>
      <rect width="800" height="155" fill="url(#simulation-grid)" />
      <text x="55" y="15" class="sim-direction">← 重点关注上游 K2025—K2035</text><text x="540" y="15" class="sim-direction">行驶方向 → 下游</text>
      <rect :x="x(3)-35-index*52" y="65" :width="70+index*104" height="50" rx="10" class="sim-spread-band" />
      <path d="M60 90H739" stroke="#31475b" stroke-width="22" />
      <line v-for="(_,i) in simulationNodes.slice(0,-1)" :key="i" :x1="x(i)" :x2="x(i+1)" y1="90" y2="90" :stroke="trafficStates[frame.roadStates[i+1]].color" stroke-width="9" class="sim-road-link" />
      <g v-for="(name,i) in simulationNodes" :key="name" :data-sim-node="name" :data-state="frame.roadStates[i]">
        <circle :cx="x(i)" cy="90" :r="name === 'K2035' ? 15 : 9" fill="#102138" :stroke="trafficStates[frame.roadStates[i]].color" stroke-width="3" class="sim-road-node" />
        <text :x="x(i)" y="57" text-anchor="middle" class="sim-node-label">{{ name }}</text>
        <text :x="x(i)" y="127" text-anchor="middle" :fill="trafficStates[frame.roadStates[i]].color" class="sim-node-state">{{ trafficStates[frame.roadStates[i]].label }}</text>
        <text v-if="name === 'K2035'" :x="x(i)" y="96" text-anchor="middle" fill="#f26679" font-size="17">!</text>
      </g>
      <text :x="x(3)" y="38" text-anchor="middle" fill="#ed9aaa" font-size="13">交通事故 · CAM004</text>
      <text x="400" y="150" text-anchor="middle" class="sim-direction">红色示意区域随时间扩展 · 非真实GIS / 非等比例距离</text>
    </svg>
    <RoadStatusLegend />
    <div class="sim-impact"><strong>{{ frame.status }}</strong><span>预计影响走廊 <b>{{ frame.affectedRange }}</b></span></div>
    <p>影响范围表示预警走廊，不等同于连续拥堵长度；节点颜色为演示情景。</p>
  </div>
</template>

