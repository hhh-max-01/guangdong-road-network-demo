<script setup>
import { computed } from 'vue'
import PanelCard from '../PanelCard.vue'
import AppIcon from '../AppIcon.vue'
const props = defineProps({ event: Object, phase: String, phaseLabel: String, canReview: Boolean, high: Boolean })
defineEmits(['review'])
const time = computed(() => props.event ? new Date(props.event.discoveredAt).toLocaleTimeString('zh-CN', { hour12: false }) : '—')
</script>
<template>
  <PanelCard title="当前事件" class="patrol-event-panel">
    <template #action><span class="tag">{{ event?.status || '未发现' }}</span></template>
    <div v-if="event" class="patrol-event" :class="{ confirmed: phase === 'confirmed' }">
      <div class="patrol-event-title"><AppIcon name="alert" /><strong>{{ event.eventType }}</strong><span>{{ event.eventLevel }}</span><b>{{ event.confidence }}<small>%</small></b></div>
      <p class="patrol-event-road">{{ event.road }} {{ event.location }}</p>
      <dl><div><dt>摄像机</dt><dd>{{ event.camera }}</dd></div><div><dt>发现时间</dt><dd>{{ time }}</dd></div><div><dt>当前分析方式</dt><dd>{{ high ? '高码流事件复核' : '低码流智能检测' }}</dd></div><div><dt>事件状态</dt><dd class="event-status-text">{{ event.status }}</dd></div></dl>
      <div class="review-stage" role="status">{{ phaseLabel }}</div>
    </div>
    <div v-else class="patrol-event-empty"><AppIcon name="scan" /><strong>等待轮巡发现事件</strong><span>本次预设：CAM004 · G4 K2035</span></div>
    <div class="review-action"><button class="button patrol-primary" :disabled="!canReview" @click="$emit('review')">高码流复核</button><small>{{ phase === 'confirmed' ? '事件记录已生成，可进入堵点分析' : canReview ? '点击切换高清码流，进一步确认事故' : '发现疑似事件后可进行高清复核' }}</small></div>
  </PanelCard>
</template>
