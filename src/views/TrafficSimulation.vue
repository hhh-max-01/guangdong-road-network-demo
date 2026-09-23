<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import PanelCard from '../components/PanelCard.vue'
import SimulationNetwork from '../components/simulation/SimulationNetwork.vue'
import SimulationTrend from '../components/simulation/SimulationTrend.vue'
import ModelDesignDialog from '../components/simulation/ModelDesignDialog.vue'
import { currentCongestion, simulationSteps, simulationAdvice } from '../data/traffic'
import { useSimulation } from '../composables/useSimulation'
import { confirmedMainEvent } from '../data/events'
import '../assets/simulation.css'
const { index, step, mode, running, frames, frame, spreadRate, reset, select, start } = useSimulation()
const showModel = ref(false)
const baseline = currentCongestion
const inputs = computed(() => baseline.value ? [['交通流量',`${baseline.value.flow} 辆/h`],['平均速度',`${baseline.value.speed} km/h`],['交通密度',baseline.value.density],['当前排队长度',`${baseline.value.queueLength} km`],['道路事件',baseline.value.eventType],['天气',baseline.value.weather],['道路通行能力','事故影响下受限'],['路网拓扑','G4 · 8个道路节点']] : [])
const phase = computed(() => running.value ? simulationSteps[step.value] : mode.value === 'complete' ? '态势推演完成' : mode.value === 'preview' ? '手动查看 · 自动播放已停止' : '待推演')
</script>
<template>
  <div class="simulation-page">
    <PageHeader title="交通态势推演" subtitle="基于多源交通运行数据，对路网拥堵发展趋势进行短时预测与动态推演" />
    <div class="sim-toolbar"><div><span class="tag">短时推演 · 30分钟</span><span>{{ baseline ? baseline.eventId+' · '+baseline.camera+' · 交通事故已确认' : '等待堵点分析结果' }}</span></div><div><button class="button" @click="showModel=true">模型设计</button><button class="button" :disabled="!baseline" @click="reset">重置</button><button class="button sim-primary" :disabled="!baseline || running" @click="start">{{ running ? '推演中' : mode === 'idle' ? '开始态势推演' : '重新推演' }}</button></div></div>
    <div v-if="!baseline" class="sim-missing panel"><span>G4 · K2035</span><h2>请先完成堵点分析</h2><p>态势推演以已形成的堵点分析结果为输入。先识别当前堵点，再预测未来10、20、30分钟的变化。</p><RouterLink class="button sim-primary" to="/congestion-analysis">前往堵点分析</RouterLink><small>可承接智慧轮巡本轮事件，也可在堵点分析中使用已标注的同一主线预置样例。</small></div>
    <template v-else>
      <p class="sim-source">数据来源：堵点分析结果 · {{ baseline.source === 'preset' ? '基于主线预置事件的分析' : '基于智慧轮巡本轮确认事件的分析' }} · 演示基准 {{ baseline.currentTime }} · 演示模拟数据</p>
      <div class="sim-main">
        <div class="sim-left">
          <PanelCard title="当前状态" subtitle="分析基准快照">
            <div class="sim-baseline"><div><strong>{{ baseline.currentTime }}</strong><span class="status danger">{{ baseline.status }}</span></div><h3>{{ baseline.road }} · {{ baseline.location }}</h3><div class="sim-baseline-kpi"><span><b>{{ baseline.congestionLength }}</b> km 拥堵长度</span><span><b>{{ baseline.speed }}</b> km/h 平均速度</span></div><p>{{ baseline.eventType }} · {{ baseline.weather }} · {{ baseline.flow }} 辆/h</p></div>
          </PanelCard>
          <PanelCard title="推演模型输入" subtitle="多源数据快照"><dl class="sim-inputs"><div v-for="[label,value] in inputs" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div></dl></PanelCard>
        </div>
        <PanelCard title="路网动态推演" subtitle="G4 K2020—K2055" class="sim-map-panel"><template #action><span class="tag">{{ frame.time }}</span></template><SimulationNetwork :frame="frame" :index="index" /><div class="sim-map-note"><span>当前选择 <b>{{ frame.time }}</b></span><span>拥堵长度 <b>{{ frame.congestionLength }} km</b></span><span>平均速度 <b>{{ frame.speed }} km/h</b></span></div></PanelCard>
        <PanelCard title="推演结果" :subtitle="mode === 'idle' ? '基准参考 · 未开始推演' : '演示预测结果'" class="sim-result">
          <div class="sim-result-content"><div class="sim-result-time"><span>当前推演时间</span><strong data-testid="sim-time">{{ frame.time }}</strong><small>{{ index ? '未来 '+frame.minutes+' 分钟' : '当前基准' }}</small></div><dl>
            <div><dt>预计拥堵长度</dt><dd><b data-testid="sim-length">{{ frame.congestionLength }}</b> km</dd></div><div><dt>预计平均速度</dt><dd><b data-testid="sim-speed">{{ frame.speed }}</b> km/h</dd></div><div><dt>预计排队长度</dt><dd>{{ frame.queueLength }} km</dd></div><div><dt>预计影响路段</dt><dd data-testid="sim-range">{{ frame.affectedRange }}</dd></div><div><dt>预计持续时间（模拟）</dt><dd>{{ frame.duration }} min</dd></div><div><dt>平均扩散速度</dt><dd>{{ spreadRate }} km/min</dd></div></dl><p>{{ frame.status }}</p><small>持续时间指所选时点起的模拟剩余时长；未开始时为基准参考。</small></div>
        </PanelCard>
      </div>
      <section class="sim-timeline-panel panel"><div class="sim-phase" role="status"><strong>{{ phase }}</strong><span>自动播放约5.4秒 · 点击时间点可停止播放并回看</span></div><div class="sim-timeline"><button v-for="(point,i) in frames" :key="point.time" :data-time="point.time" :aria-pressed="index===i" :class="{selected:index===i}" @click="select(i)"><i></i><strong>{{ point.time }}</strong><span>{{ i ? '未来 '+point.minutes+' 分钟' : '当前状态' }}</span><small>{{ point.congestionLength }} km</small></button></div><ol class="sim-process"><li v-for="(name,i) in simulationSteps" :key="name" :class="{active:running&&step===i,done:mode==='complete'||(running&&step>i)}">{{ name }}</li></ol></section>
      <div class="sim-bottom"><PanelCard title="关键指标趋势" subtitle="预设情景曲线 · 高亮当前时点"><template #action><span class="sim-chart-legend"><i></i>拥堵 / 排队长度 <i></i>平均速度</span></template><SimulationTrend :frames="frames" :index="index" /></PanelCard><PanelCard title="推演结论与辅助决策" subtitle="演示建议"><div class="sim-conclusion"><template v-if="mode==='complete'"><h3>态势推演完成</h3><div class="demo-completion"><strong>{{ confirmedMainEvent ? '本次演示业务闭环已完成' : '本次预置情景推演已完成' }}</strong><span v-if="confirmedMainEvent">视频资源管理 ✓ · AI事件发现 ✓ · 高码流复核 ✓ · 堵点识别 ✓ · 态势推演 ✓</span><RouterLink to="/">返回路网总览 →</RouterLink></div><p>预计未来30分钟内，{{ baseline.road }}{{ baseline.location }}事故影响范围将继续扩大，拥堵长度预计由{{ baseline.congestionLength }}km增加至6.8km。</p><p>预计主要影响K2027-K2043路段。建议重点关注上游K2025-K2035路段交通运行状态。</p></template><p v-else class="sim-conclusion-wait">{{ mode==='preview' ? '正在查看'+frame.time+'预设情景；完整结论将在自动推演结束后展示。' : running ? '正在生成未来态势，请观察路网颜色和指标变化。' : '尚未开始推演，以下为预置演示建议。' }}</p><ul><li v-for="advice in simulationAdvice" :key="advice">{{ advice }}</li></ul></div></PanelCard></div>
      <p class="sim-footnote">演示模拟结论 · 重点关注上游K2025-K2035路段。重置推演保留上游分析结果。</p>
    </template>
    <ModelDesignDialog v-if="showModel" @close="showModel=false" />
  </div>
</template>

