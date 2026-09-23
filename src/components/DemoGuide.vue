<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { demoGuide, demoSteps } from '../data/demoGuide'
import { patrolState, resetPatrol } from '../composables/usePatrol'
import { confirmedMainEvent } from '../data/events'
import { currentCongestion, clearCongestion, simulationCompletion } from '../data/traffic'
const router = useRouter(), route = useRoute(), moving = ref(false)
const step = computed(() => demoSteps[demoGuide.index])
const blockReason = computed(() => {
  if (demoGuide.index === 2 && !['suspected','confirmed'].includes(patrolState.phase)) return '请先完成智慧轮巡，发现疑似事故。'
  if (demoGuide.index === 3 && !confirmedMainEvent.value) return '请先完成高码流复核，确认交通事故。'
  if (demoGuide.index === 4 && (!confirmedMainEvent.value || !currentCongestion.value || currentCongestion.value.source !== 'smart-patrol')) return '请承接本轮已确认事件，完成堵点分析。'
  return ''
})
const hint = computed(() => {
  if (demoGuide.index === 2 && patrolState.phase === 'confirmed') return '本轮事故已确认，可进入下一步回顾高清复核，或重新演示完整过程。'
  if (demoGuide.index === 3 && patrolState.phase === 'idle') return '轮巡尚未完成或被刷新中断，请点“上一步”重新发现疑似事件。'
  if (demoGuide.index === 4 && currentCongestion.value) return '堵点分析已完成，可讲解诱因占比，再点击“下一步”。'
  if (demoGuide.index === 5 && simulationCompletion.value) return '推演已完成，可回看任意时间点或打开模型设计；点击“完成演示”退出引导。'
  return step.value.hint
})
async function go(index) {
  if (moving.value || index < 0 || index > 5) return
  moving.value = true
  try { await router.push(demoSteps[index].path); demoGuide.index = index } finally { moving.value = false }
}
async function restart() {
  resetPatrol(); clearCongestion(); await go(0)
}
// 手动菜单及业务入口同步引导，不自动推进；轮巡页的第3/4步保留当前选择。
watch(() => route.path, path => {
  if (!demoGuide.active || moving.value) return
  if (path === '/smart-patrol' && [2,3].includes(demoGuide.index)) return
  const index = demoSteps.findIndex(item => item.path === path)
  if (index >= 0) demoGuide.index = index
})
</script>
<template>
  <section class="demo-guide" aria-label="全流程演示引导">
    <div class="demo-guide-progress"><b>{{ demoGuide.index+1 }}</b><span>/ 6</span></div>
    <div class="demo-guide-text"><strong>步骤{{ demoGuide.index+1 }}/6 {{ step.name }}</strong><p>{{ hint }}</p><small>{{ step.duration }}</small></div>
    <div class="demo-guide-actions"><span class="guide-block" role="status">{{ blockReason }}</span><button class="button" :disabled="demoGuide.index===0 || moving" @click="go(demoGuide.index-1)">上一步</button><button v-if="demoGuide.index<5" class="button primary" :disabled="Boolean(blockReason) || moving" @click="go(demoGuide.index+1)">下一步</button><button v-else class="button primary" :disabled="!simulationCompletion" @click="demoGuide.active=false">完成演示</button><button class="guide-text-button" :disabled="moving" @click="restart">重新演示</button><button class="guide-text-button" @click="demoGuide.active=false">退出演示</button></div>
  </section>
</template>
