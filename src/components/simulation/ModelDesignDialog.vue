<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { simulationModel } from '../../data/traffic'
const emit = defineEmits(['close'])
const dialog=ref(null)
let previousFocus
onMounted(()=>{previousFocus=document.activeElement;dialog.value.showModal()})
onBeforeUnmount(()=>{dialog.value?.close();previousFocus?.focus()})
</script>
<template>
  <Teleport to="body"><dialog ref="dialog" class="simulation-dialog" aria-labelledby="sim-model-title" @cancel.prevent="emit('close')">
    <header><div><h2 id="sim-model-title">推演模型设计</h2><p>概念架构与演示实现 · 演示模拟数据</p></div><button class="button" aria-label="关闭模型设计" @click="emit('close')">关闭</button></header>
    <p class="model-disclaimer">当前模型为演示模型，用于展示业务流程和技术思路，不代表真实生产预测模型。</p>
    <ol class="model-layers"><li v-for="(layer,i) in simulationModel" :key="layer.name"><b>{{ i+1 }}</b><div><h3>{{ layer.name }}</h3><p>{{ layer.text }}</p></div><span v-if="i<4">↓</span></li></ol>
    <section class="model-implementation"><h3>本 DEMO 实际执行逻辑</h3><p>读取堵点分析结果作为14:00快照 → 载入四个预设时间点 → 每1.8秒切换一次道路状态与指标 → 同步更新图表和结果。手动选点会停止自动播放。</p><p>未来数据采用固定情景查表，不执行真实的异常修复、交通流方程、机器学习或滚动预测。通行能力为“事故影响下受限”的定性模拟输入。</p><p>扩散速度 =（所选时点拥堵长度 − 初始拥堵长度）÷ 经过分钟数；14:30为（6.8 − 2.3）÷ 30 = 0.15 km/min。持续时间为预设值，流量保持4200辆/h；影响走廊与连续排队长度使用不同口径。</p></section>
  </dialog></Teleport>
</template>
