import { reactive } from 'vue'

export const cities = [
  { name: '广州市', code: 'GZ', roads: ['G4京港澳高速', 'S41机场高速', 'G105京澳线'] },
  { name: '深圳市', code: 'SZ', roads: ['G15沈海高速', 'G107京深线'] },
  { name: '佛山市', code: 'FS', roads: ['G1508广州绕城高速', 'G321广成线'] },
  { name: '东莞市', code: 'DG', roads: ['G4京港澳高速', 'G94珠三角环线高速', 'G107京深线'] },
  { name: '惠州市', code: 'HZ', roads: ['G25长深高速', 'G35济广高速', 'G324福昆线'] },
]
export const categories = ['高速公路', '普通公路', '收费站', '服务区', '桥梁', '隧道']
export const externalDirectories = ['应急指挥', '交警共享', '路网运行', '行业监管']
export const devices = ['枪型摄像机', '球型摄像机']
export const statuses = ['在线', '离线', '故障']
// 每个领域独立配置。更改只在本次运行生效，不重写历史编码。
export const catalogRules = reactive([
  { id: 'highway', name: '高速公路', token: '', digits: 3 },
  { id: 'ordinary', name: '普通公路', token: 'RD', digits: 3 },
  { id: 'facility', name: '交通设施', token: 'FAC', digits: 4 },
])
const defaultRules = catalogRules.map(rule => ({ ...rule }))
export function resetCatalogRules() { catalogRules.splice(0, catalogRules.length, ...defaultRules.map(rule => ({ ...rule }))) }
export const getRule = id => catalogRules.find(rule => rule.id === id)
export const roadCode = road => road.match(/^[A-Z]\d+/)?.[0] || ''
export const normalizeStake = stake => stake.trim().toUpperCase()
export function roadsFor(city, domain) {
  const roads = cities.find(item => item.name === city)?.roads || []
  if (domain === 'highway') return roads.filter(road => road.includes('高速'))
  if (domain === 'ordinary') return roads.filter(road => !road.includes('高速'))
  return roads
}
export function ruleDescription(rule) {
  return `省份代码 + 城市代码${rule.token ? ' + 领域标识' : ''} + 道路代码 + 桩号 + 设备类型 + ${rule.digits}位序号`
}
export function codeBase(form, rule = getRule(form.domain)) {
  const city = cities.find(item => item.name === form.city)
  if (!rule || !city || !roadCode(form.road) || !/^K\d{1,5}(\+\d{3})?$/.test(normalizeStake(form.stake)) || !devices.includes(form.deviceType)) {
    throw new Error('请先选择领域、城市、道路和设备类型，并填写有效桩号（如 K2035 或 K2035+100）。')
  }
  if (!roadsFor(form.city, form.domain).includes(form.road)) throw new Error('道路不属于所选城市或领域，请重新选择。')
  return ['GD', city.code, rule.token, roadCode(form.road), normalizeStake(form.stake), 'CAM'].filter(Boolean).join('-')
}
export function generateCode(form, resources, rule = getRule(form.domain)) {
  const base = codeBase(form, rule)
  // 同基础编码取最大尾号 + 1，保证删减、筛选与分页不会影响唯一性。
  const numbers = resources.filter(item => item.code.startsWith(`${base}-`))
    .map(item => Number(item.code.slice(base.length + 1))).filter(Number.isInteger)
  return `${base}-${String(Math.max(0, ...numbers) + 1).padStart(rule.digits, '0')}`
}
export function matchesDirectory(camera, node) {
  if (!node || node.kind === 'all') return true
  if (node.kind === 'city') return camera.city === node.value
  if (node.kind === 'road') return camera.city === node.city && camera.road === node.value
  if (node.kind === 'platform-root') return Boolean(camera.platformDirectory)
  if (node.kind === 'external-root') return Boolean(camera.externalDirectory)
  return camera[node.kind] === node.value
}
export const directoryTree = [
  { id: 'business', label: '业务资源目录', kind: 'all', children: [
    { id: 'province', label: '广东省', kind: 'all', children: cities.map(city => ({
      id: city.code, label: city.name, kind: 'city', value: city.name,
      children: city.roads.map(road => ({ id: `${city.code}-${roadCode(road)}`, label: road, kind: 'road', city: city.name, value: road })),
    })) },
  ] },
  { id: 'platform', label: '一体化平台目录', kind: 'platform-root', children: categories.map(value => ({ id: `platform-${value}`, label: value, kind: 'platformDirectory', value })) },
  { id: 'external', label: '外部共享目录', kind: 'external-root', children: externalDirectories.map(value => ({ id: `external-${value}`, label: value, kind: 'externalDirectory', value })) },
]
