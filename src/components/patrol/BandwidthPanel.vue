<script setup>
import PanelCard from '../PanelCard.vue'
defineProps({ low: Number, high: Number, total: Number, confirmed: Boolean })
</script>
<template>
  <PanelCard title="带宽资源调配" subtitle="按需高清复核 · 模拟计算" class="bandwidth-panel">
    <div class="bandwidth-content">
      <div class="bandwidth-total"><span>当前总分析带宽</span><strong data-testid="bandwidth-total">{{ total.toFixed(1) }}<small>Mbps</small></strong><span>{{ low }} 路低码流 / {{ high }} 路高清码流</span></div>
      <div class="bandwidth-breakdown">
        <div class="bandwidth-row"><label>日常智能检测 <b>0.5 Mbps / 路</b></label><div class="bandwidth-track"><i :style="{ width: `${low * .5 / 5.5 * 100}%` }"></i></div><small>{{ low }} × 0.5 = {{ (low * .5).toFixed(1) }} Mbps</small></div>
        <div class="bandwidth-row high"><label>事件高清复核 <b>4 Mbps / 路</b></label><div class="bandwidth-track"><i :style="{ width: `${high * 4 / 5.5 * 100}%` }"></i></div><small>{{ high }} × 4 = {{ (high * 4).toFixed(1) }} Mbps{{ confirmed ? ' · 保留高清供查看' : '' }}</small></div>
      </div>
    </div>
    <p class="bandwidth-note">日常轮巡采用低码流进行智能分析，降低大规模视频并发分析带宽占用。仅在发现事件后按需切换高清。512kbps 按演示口径近似计为 0.5Mbps。</p>
  </PanelCard>
</template>
