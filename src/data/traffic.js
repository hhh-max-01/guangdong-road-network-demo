import { computed, shallowRef, watch } from 'vue'
import { analysisEvent } from './events'
import { readSession, writeSession } from './demoSession'

export const metrics = [
  { label: '视频接入总数', value: '12,586', unit: '路', detail: '全域视频资源统一汇聚', icon: 'camera', color: 'blue' },
  { label: '在线视频', value: '12,410', unit: '路', detail: '离线视频 176 路', icon: 'signal', color: 'green' },
  { label: '视频在线率', value: '98.6', unit: '%', detail: '视频资源运行状态', icon: 'activity', color: 'cyan' },
  { label: '今日交通事件', value: '32', unit: '起', detail: '事故 · 拥堵 · 施工等', icon: 'alert', color: 'amber' },
  { label: '当前拥堵路段', value: '8', unit: '处', detail: '重点关注 G4 K2035', icon: 'road', color: 'red' },
]
export const trafficStates = [
  { label: '畅通', color: '#36cba0' }, { label: '缓行', color: '#e7c65b' },
  { label: '拥堵', color: '#ef964c' }, { label: '严重拥堵', color: '#f26679' },
]
// 离线路网示意布局，不表示真实地理边界和道路位置。
export const mapNodes = [
  { id: 'qingyuan', name: '清远方向', x: 255, y: 48, minor: true },
  { id: 'airport', name: '机场北', x: 345, y: 125, minor: true },
  { id: 'guangzhou', name: '广州', x: 365, y: 233 },
  { id: 'foshan', name: '佛山', x: 176, y: 279 },
  { id: 'zhaoqing', name: '肇庆方向', x: 62, y: 175, minor: true },
  { id: 'accident', name: 'K2035', x: 470, y: 210, minor: true, alert: true },
  { id: 'dongguan', name: '东莞', x: 579, y: 319 },
  { id: 'huizhou', name: '惠州', x: 764, y: 190 },
  { id: 'longmen', name: '龙门互通', x: 645, y: 82, minor: true },
  { id: 'shenzhen', name: '深圳', x: 772, y: 412 },
  { id: 'zhongshan', name: '中山方向', x: 301, y: 438, minor: true },
  { id: 'humen', name: '虎门互通', x: 526, y: 435, minor: true },
  { id: 'shantou', name: '汕尾方向', x: 923, y: 273, minor: true },
]
export const mapLinks = [
  { from: 'qingyuan', to: 'airport', state: 0, road: 'G4' },
  { from: 'airport', to: 'guangzhou', state: 1, road: 'S41' },
  { from: 'zhaoqing', to: 'foshan', state: 0, road: 'G80' },
  { from: 'foshan', to: 'guangzhou', state: 0, road: 'S15' },
  { from: 'guangzhou', to: 'accident', state: 3, road: 'G4' },
  { from: 'accident', to: 'dongguan', state: 2, road: 'G4' },
  { from: 'guangzhou', to: 'longmen', state: 0, road: 'G35' },
  { from: 'longmen', to: 'huizhou', state: 0, road: 'G25' },
  { from: 'dongguan', to: 'huizhou', state: 1, road: 'G35' },
  { from: 'huizhou', to: 'shenzhen', state: 0, road: 'G25' },
  { from: 'dongguan', to: 'shenzhen', state: 2, road: 'G15' },
  { from: 'foshan', to: 'zhongshan', state: 0, road: 'G94' },
  { from: 'zhongshan', to: 'humen', state: 0, road: 'G9411' },
  { from: 'humen', to: 'dongguan', state: 1, road: 'G4' },
  { from: 'humen', to: 'shenzhen', state: 0, road: 'S3' },
  { from: 'huizhou', to: 'shantou', state: 0, road: 'G15' },
]
export const trend = { hours: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00'], values: [1, 1, 0, 3, 7, 5, 8, 7] }
export const eventTypes = { labels: ['事故', '拥堵', '施工', '抛洒物', '气象', '其他'], values: [8, 11, 5, 3, 3, 2] }

export const roadSegments = [
  { location: 'K2020', state: 0, speed: 86, flow: 2600, density: '低', queueLength: 0 },
  { location: 'K2025', state: 0, speed: 72, flow: 3200, density: '中', queueLength: 0 },
  { location: 'K2030', state: 1, speed: 42, flow: 3900, density: '较高', queueLength: 0.8 },
  { location: 'K2035', state: 3 },
  { location: 'K2040', state: 2, speed: 28, flow: 3600, density: '高', queueLength: 1.1 },
  { location: 'K2045', state: 1, speed: 46, flow: 3300, density: '中', queueLength: 0.4 },
  { location: 'K2050', state: 0, speed: 78, flow: 2800, density: '低', queueLength: 0 },
]
export const trafficMetrics = computed(() => {
  const { speed, flow, density, queueLength } = analysisEvent.value
  return { speed, flow, density, queueLength }
})
export const weatherData = computed(() => ({ weather: analysisEvent.value.weather, visibility: '较低', rainfallLevel: '强' }))
export const congestionTrend = { times: ['13:35', '13:40', '13:45', '13:50', '13:55', '14:00'], speeds: [72, 68, 55, 38, 24, 18], flows: [3200, 3500, 3900, 4100, 4250, 4200] }
export const causeFactors = [{ name: '交通事故', value: 65, color: '#f26679' }, { name: '交通流量过大', value: 25, color: '#ef964c' }, { name: '恶劣天气', value: 10, color: '#4cbbec' }]
export const analysisSteps = ['数据接入', '数据融合', '异常识别', '堵点定位', '原因研判']
export const analysisMessages = ['正在接入多源数据……', '正在进行时空数据对齐……', '正在识别交通异常……', '正在定位道路堵点……', '正在分析拥堵诱因……']
const eventKey = event => [event.id, event.source, event.discoveredAt].join('|')
const savedOutput = readSession('congestion', value => value.eventKey === eventKey(analysisEvent.value) && value.result?.eventId === analysisEvent.value.id && value.result?.speed === analysisEvent.value.speed && value.result?.flow === analysisEvent.value.flow && value.result?.congestionLength === analysisEvent.value.queueLength && value.result?.location === analysisEvent.value.location && typeof value.result?.analyzedAt === 'string')
const output = shallowRef(savedOutput ? { event: analysisEvent.value, result: savedOutput.result } : null)
// 上游重置或替换事件后，旧结果自动失效。
export const currentCongestion = computed(() => output.value?.event === analysisEvent.value ? output.value.result : null)
export function clearCongestion() { output.value = null; writeSession('congestion', null) }
// 全局业务数据的监听持续到应用关闭；防止返回预置样例时恢复旧分析。
watch(analysisEvent, clearCongestion, { flush: 'sync' })
export function saveCongestion(event) {
  output.value = { event, result: Object.freeze({ eventId: event.id, source: event.source, currentTime: '14:00', road: event.road,
    location: event.location, camera: event.camera, queueLength: event.queueLength, congestionLength: event.queueLength,
    speed: event.speed, flow: event.flow, density: event.density, eventType: event.eventType, weather: event.weather,
    level: '严重', status: '严重拥堵', mainCause: '交通事故', causeFactors: causeFactors.map(item => ({ ...item })), analyzedAt: new Date().toISOString(), simulation: true }) }
  writeSession('congestion', { eventKey: eventKey(event), result: output.value.result })
}

export const simulationCompletion = shallowRef(readSession('simulation-complete', value => Boolean(currentCongestion.value) && value.analysisTime === currentCongestion.value.analyzedAt))
export function clearSimulationCompletion() { simulationCompletion.value = null; writeSession('simulation-complete', null) }
export function finishSimulation() {
  simulationCompletion.value = { analysisTime: currentCongestion.value.analyzedAt }
  writeSession('simulation-complete', simulationCompletion.value)
}
watch(currentCongestion, clearSimulationCompletion, { flush: 'sync' })

// 固定演示情景；首帧取堵点分析结果，未来帧按脚本播放，不运行真实预测算法。
export const simulationTimeline = [
  { time: '14:00', minutes: 0, congestionLength: 2.3, queueLength: 2.3, speed: 18, flow: 4200, affectedRange: 'K2033-K2037', duration: 30, status: '严重拥堵', roadStates: [...roadSegments.map(node => node.state), 0] },
  { time: '14:10', minutes: 10, congestionLength: 3.6, queueLength: 3.6, speed: 15, flow: 4200, affectedRange: 'K2031-K2039', duration: 35, status: '严重拥堵扩大', roadStates: [0,0,2,3,3,1,0,0] },
  { time: '14:20', minutes: 20, congestionLength: 5.1, queueLength: 5.1, speed: 12, flow: 4200, affectedRange: 'K2029-K2041', duration: 40, status: '拥堵继续向上游扩散', roadStates: [0,1,3,3,3,2,0,0] },
  { time: '14:30', minutes: 30, congestionLength: 6.8, queueLength: 6.8, speed: 10, flow: 4200, affectedRange: 'K2027-K2043', duration: 45, status: '拥堵范围进一步扩大', roadStates: [0,2,3,3,3,3,0,0] },
]
export const simulationNodes = [...roadSegments.map(node => node.location), 'K2055']
export const simulationSteps = ['模型初始化', '加载动态路网', '融合实时交通状态', '计算拥堵传播趋势', '生成未来态势', '推演完成']
export const simulationModel = [
  { name: '数据输入层', text: '动态路网拓扑、交通流量、速度、密度、交通事件、天气及道路通行能力。' },
  { name: '数据融合层', text: '时间对齐、空间匹配、异常修复与指标标准化，形成同一时间和路段的输入快照。' },
  { name: '状态识别层', text: '识别道路运行状态、拥堵堵点与瓶颈节点，承接堵点分析结果。' },
  { name: '态势推演层', text: '按短时滚动预测思路组织拥堵传播计算与影响范围估计，形成未来10、20、30分钟情景。' },
  { name: '服务输出层', text: '输出路网状态示意、速度预测、拥堵及排队长度预测、影响范围与异常预警。' },
]
export const simulationAdvice = ['加强事故点上游交通诱导', '提前发布拥堵预警', '加强K2025-K2035路段视频轮巡', '关注暴雨天气下二次事故风险']
