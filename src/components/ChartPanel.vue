<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { init, use } from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer])
const props = defineProps({ option: { type: Object, required: true }, label: String })
const container = ref(null)
let chart, observer, resizeFrame
const resize = () => {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => chart?.resize())
}
onMounted(() => {
  chart = init(container.value)
  chart.setOption(props.option)
  // 同时覆盖窗口变化和网格布局变化；卸载时释放监听与实例。
  observer = new ResizeObserver(resize)
  observer.observe(container.value)
})
watch(() => props.option, (option) => chart?.setOption(option, true), { deep: true })
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(resizeFrame)
  chart?.dispose()
  chart = null
})
</script>
<template>
<div ref="container" class="chart" role="img" :aria-label="label">
</div>
</template>
