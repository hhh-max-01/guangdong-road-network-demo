<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
defineProps({ event: Object })
const emit = defineEmits(['close'])
const dialog = ref(null)
let previousFocus
onMounted(() => { previousFocus = document.activeElement; dialog.value.showModal() })
onBeforeUnmount(() => { dialog.value?.close(); previousFocus?.focus() })
const time = value => new Date(value).toLocaleString('zh-CN', { hour12: false })
</script>
<template>
  <Teleport to="body"><dialog ref="dialog" class="congestion-dialog" aria-labelledby="linked-event-title" @cancel.prevent="emit('close')">
    <header><div><h2 id="linked-event-title">关联交通事件</h2><p>演示模拟数据 · {{ event.source === 'preset' ? '智慧轮巡主线预置样例' : '智慧轮巡本轮确认记录' }}</p></div><button class="button" aria-label="关闭关联事件" @click="emit('close')">关闭</button></header>
    <dl><div v-for="[key,value] in [['事件编号',event.id],['事件类型',event.eventType],['道路位置',event.road+' '+event.location],['发现时间',time(event.discoveredAt)],['发现摄像机',event.camera],['AI置信度',event.confidence+'%'],['高清复核结果','已确认 · 1920×1080 / 4Mbps'],['事件状态',event.status]]" :key="key"><dt>{{ key }}</dt><dd>{{ value }}</dd></div></dl>
  </dialog></Teleport>
</template>
