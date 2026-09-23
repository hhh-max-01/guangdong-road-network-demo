import { computed, onBeforeUnmount, reactive, readonly } from 'vue'
import { patrolCameras } from '../data/cameras'
import { clearPatrolEvents, confirmedMainEvent, eventScenario, recordConfirmedEvent } from '../data/events'
import { phaseLabels, patrolTiming, streamProfiles } from '../data/patrol'

const initial = () => ({
  phase: 'idle', progress: 0, activeCamera: '', highCamera: '',
  cameras: Object.fromEntries(['CAM001', 'CAM002', 'CAM003', 'CAM004'].map(id => [id, 'idle'])),
  event: null, logs: [],
})
// 保留已确认结果供跨页演示；组件卸载时取消尚未完成的异步步骤。
const state = reactive(initial())
if (confirmedMainEvent.value) {
  Object.assign(state, { phase: 'confirmed', progress: 4, activeCamera: 'CAM004', highCamera: 'CAM004', event: confirmedMainEvent.value, cameras: { CAM001: 'normal', CAM002: 'normal', CAM003: 'normal', CAM004: 'confirmed' } })
}
export const patrolState = readonly(state)
let generation = 0
let logSequence = 0
const timers = new Map()
function cancelTimers() {
  generation++
  for (const [timer, resolve] of timers) { clearTimeout(timer); resolve(false) }
  timers.clear()
}
function delay(ms, run) {
  return new Promise(resolve => {
    const timer = setTimeout(() => { timers.delete(timer); resolve(run === generation) }, ms)
    timers.set(timer, resolve)
  })
}
function log(message, tone = 'info') {
  state.logs.push({ id: ++logSequence, at: new Date().toISOString(), message, tone })
}
export function resetPatrol() {
  cancelTimers()
  Object.assign(state, initial())
  clearPatrolEvents()
  logSequence = 0
}
async function start() {
  if (state.phase !== 'idle') return
  const run = ++generation
  state.phase = 'scanning'
  const cameras = [...patrolCameras.value]
  for (let index = 0; index < cameras.length; index++) {
    if (run !== generation) return
    const camera = cameras[index]
    state.activeCamera = camera.id
    state.progress = index + 1
    state.cameras[camera.id] = 'analyzing'
    log(`${camera.id} 开始智能分析 · 低码流 640×360 / 512kbps`)
    if (!await delay(patrolTiming.analysis, run)) return
    if (camera.id === eventScenario.camera) {
      state.cameras[camera.id] = 'suspected'
      state.event = { ...eventScenario, discoveredAt: new Date().toISOString(), confidence: 96, status: '待复核' }
      state.phase = 'suspected'
      log(`${camera.id} 检测到疑似交通事故 · AI置信度 96%`, 'danger')
    } else {
      state.cameras[camera.id] = 'normal'
      log(`${camera.id} 未发现异常事件`, 'success')
      if (!await delay(patrolTiming.interval, run)) return
    }
  }
}
async function review() {
  if (state.phase !== 'suspected') return
  const run = ++generation
  state.phase = 'requesting'
  state.cameras.CAM004 = 'requesting'
  log('CAM004 申请高清码流')
  if (!await delay(patrolTiming.request, run)) return
  state.phase = 'switched'
  state.highCamera = 'CAM004'
  state.cameras.CAM004 = 'reviewing'
  log('CAM004 高清码流切换成功 · 1920×1080 / 4Mbps', 'success')
  if (!await delay(patrolTiming.switched, run)) return
  state.phase = 'reviewing'
  log('CAM004 正在进行事件高清复核')
  if (!await delay(patrolTiming.review, run)) return
  state.event = recordConfirmedEvent(state.event)
  state.phase = 'confirmed'
  state.cameras.CAM004 = 'confirmed'
  log('事件复核完成：交通事故 · 已确认 · 置信度 99%', 'danger')
  log(`${state.event.id} 已形成交通事件记录，可供堵点分析使用`, 'success')
}

export function usePatrol() {
  const highCount = computed(() => state.highCamera ? 1 : 0)
  const lowCount = computed(() => patrolCameras.value.length - highCount.value)
  const totalBandwidth = computed(() => lowCount.value * streamProfiles.low.bandwidth + highCount.value * streamProfiles.high.bandwidth)
  onBeforeUnmount(() => {
    const active = ['scanning', 'requesting', 'switched', 'reviewing'].includes(state.phase)
    if (!active) return
    cancelTimers()
    if (state.event) {
      state.phase = 'suspected'; state.highCamera = ''; state.cameras.CAM004 = 'suspected'
      log('已离开轮巡页面，高清复核已中止并回退低码流；返回后可重新复核', 'info')
    } else {
      Object.assign(state, initial())
    }
  })
  return {
    state: readonly(state), start, review, reset: resetPatrol,
    canStart: computed(() => state.phase === 'idle'), canReview: computed(() => state.phase === 'suspected'),
    phaseLabel: computed(() => phaseLabels[state.phase]), lowCount, highCount, totalBandwidth,
  }
}
