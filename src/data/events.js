import { computed, reactive, watch } from 'vue'
import { readSession, writeSession } from './demoSession'

// 统一主线输入。首页保留静态样例，轮巡确认记录在下方独立管理。
export const coreDemoEvent = Object.freeze({
  id: 'EVT-2026-0001', status: '已确认', congestionLevel: '严重',
  road: 'G4京港澳高速', location: 'K2035', camera: 'CAM004', eventType: '交通事故',
  weather: '暴雨', speed: 18, flow: 4200, queueLength: 2.3, density: '高', eventLevel: '较大',
})
export const eventScenario = coreDemoEvent
export const coreEvent = {
  stake: coreDemoEvent.location, type: coreDemoEvent.eventType, level: coreDemoEvent.congestionLevel, tone: 'danger',
  ...eventScenario,
  time: '14:00:00', city: '广州', queue: eventScenario.queueLength,
  description: '主线车辆通行受阻，建议关注上游排队变化。',
}
export const events = [
  coreEvent,
  { id: 'EVT-002', road: 'G15沈海高速', stake: 'K2784', type: '交通拥堵', level: '较重', tone: 'congested', time: '13:52:18', city: '深圳', description: '车流量增加，路段持续缓行。' },
  { id: 'EVT-003', road: 'S41机场高速', stake: 'K23', type: '道路施工', level: '一般', tone: 'warning', time: '13:46:32', city: '广州', description: '局部车道施工，请关注通行状态。' },
]
export const detectionTypes = ['拥堵', '烟火', '事故', '抛洒物', '施工', '滑坡', '路面塌陷', '气象事件']

const savedEvent = readSession('confirmed-event', value => value.id === coreDemoEvent.id && value.camera === coreDemoEvent.camera && value.status === '已确认' && value.source === 'smart-patrol' && Number.isFinite(Date.parse(value.discoveredAt)))
export const confirmedEvents = reactive(savedEvent ? [{ ...savedEvent, ...coreDemoEvent, confidence: 99 }] : [])
export const confirmedMainEvent = computed(() => confirmedEvents.find(event => event.source === 'smart-patrol') || null)
watch(confirmedMainEvent, value => writeSession('confirmed-event', value), { deep: true, flush: 'sync' })
// 独立演示复用同一主线，不写入轮巡的确认列表。
export const presetConfirmedEvent = Object.freeze({ ...coreDemoEvent, confidence: 99, discoveredAt: '2026-09-22T13:55:00+08:00', confirmedAt: '2026-09-22T13:56:00+08:00', source: 'preset' })
export const analysisEvent = computed(() => confirmedMainEvent.value || presetConfirmedEvent)
export function recordConfirmedEvent(draft) {
  if (confirmedMainEvent.value) return confirmedMainEvent.value
  const event = {
    ...eventScenario, ...draft,
    id: coreDemoEvent.id,
    status: '已确认', confidence: 99, confirmedAt: new Date().toISOString(), source: 'smart-patrol',
    // 与现有态势页面字段兼容，后续页面可直接使用 confirmedMainEvent。
    stake: eventScenario.location, type: eventScenario.eventType, queue: eventScenario.queueLength,
  }
  confirmedEvents.push(event)
  return event
}
export function clearPatrolEvents() {
  for (let index = confirmedEvents.length - 1; index >= 0; index--) {
    if (confirmedEvents[index].source === 'smart-patrol') confirmedEvents.splice(index, 1)
  }
}
