<script setup>
import RoadStatusLegend from '../RoadStatusLegend.vue'
import { roadSegments, trafficStates } from '../../data/traffic'
defineProps({ selected: String, located: Boolean })
defineEmits(['select'])
</script>
<template>
  <div class="congestion-topology">
    <div class="corridor-caption"><strong>G4 <span>京港澳高速</span></strong><span>运行方向 ↓ · 示意拓扑</span></div>
    <div class="corridor-nodes">
      <button v-for="(node,index) in roadSegments" :key="node.location" :data-node="node.location" :aria-pressed="selected === node.location" :class="{ selected: selected === node.location, accident: node.location === 'K2035', located: located && node.location === 'K2035' }" :style="{ '--node-color': trafficStates[node.state].color }" @click="$emit('select', node.location)">
        <span class="corridor-track"><i>{{ node.location === 'K2035' ? '!' : '' }}</i></span><strong>{{ node.location }}</strong><span>{{ trafficStates[node.state].label }}</span><small>{{ index === 1 ? '上游 · 关注排队' : index === 2 ? '上游车辆开始排队' : index === 3 ? '交通事故 · 当前堵点' : index === 4 ? '下游通行逐渐恢复' : index === 5 ? '下游 · 缓行疏解' : '正常通行' }}</small>
      </button>
    </div>
    <RoadStatusLegend />
    <p>上游排队 ← 事故点 → 下游疏解 · 非真实地理位置</p>
  </div>
</template>
