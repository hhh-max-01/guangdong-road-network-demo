<script setup>
import { ref, watch, nextTick } from 'vue'
import PanelCard from '../PanelCard.vue'
const props = defineProps({ logs: Array })
const container = ref(null)
const follow = ref(true)
watch(() => props.logs.length, async () => {
  await nextTick()
  if (follow.value && container.value) container.value.scrollTop = container.value.scrollHeight
})
function trackScroll() {
  const element = container.value
  follow.value = element.scrollHeight - element.scrollTop - element.clientHeight < 40
}
</script>
<template>
  <PanelCard title="智慧轮巡日志" class="patrol-log-panel"><template #action><span class="tag">{{ logs.length }} 条</span></template>
    <div ref="container" class="patrol-log" role="log" aria-label="智慧轮巡日志" @scroll="trackScroll">
      <p v-if="!logs.length" class="patrol-log-empty">等待开始智慧轮巡，操作日志将在此实时生成。</p>
      <div v-for="entry in logs" :key="entry.id" :class="entry.tone"><time>{{ new Date(entry.at).toLocaleTimeString('zh-CN', { hour12: false }) }}</time><i></i><span>{{ entry.message }}</span></div>
    </div>
  </PanelCard>
</template>
