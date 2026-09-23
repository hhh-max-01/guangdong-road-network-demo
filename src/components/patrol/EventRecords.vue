<script setup>
import PanelCard from '../PanelCard.vue'
import { confirmedEvents } from '../../data/events'
</script>
<template>
  <PanelCard title="事件列表" subtitle="高清复核确认后自动入列" class="patrol-record-panel">
    <template #action><RouterLink v-if="confirmedEvents.length" to="/congestion-analysis" class="patrol-next">进入堵点分析 →</RouterLink><span v-else class="tag">待确认</span></template>
    <div class="patrol-record-scroll"><table><thead><tr><th>事件编号</th><th>事件类型</th><th>道路</th><th>桩号</th><th>发现时间</th><th>事件状态</th></tr></thead><tbody>
      <tr v-for="event in confirmedEvents" :key="event.id"><td>{{ event.id }}</td><td>{{ event.eventType }}</td><td>{{ event.road }}</td><td>{{ event.location }}</td><td>{{ new Date(event.discoveredAt).toLocaleString('zh-CN', { hour12: false }) }}</td><td><span class="status danger">{{ event.status }}</span></td></tr>
      <tr v-if="!confirmedEvents.length"><td colspan="6" class="patrol-record-empty">暂无已确认事件 · 待复核事件不写入确认记录</td></tr>
    </tbody></table></div>
  </PanelCard>
</template>
