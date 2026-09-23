import { computed, reactive } from 'vue'
import { generateCode, getRule } from './catalogRules'

// 平台目录、外部共享目录独立保存，所有状态均为演示数据。
const seeds = [
  ['CAM001', 'S41机场高速K18监控点', 'highway', '广州市', 'S41机场高速', 'K18', '枪型摄像机', '高速公路', '在线', '高速公路', '路网运行'],
  ['CAM002', 'G15沈海高速K2784监控点', 'highway', '深圳市', 'G15沈海高速', 'K2784', '球型摄像机', '高速公路', '在线', '高速公路', '交警共享'],
  ['CAM003', '佛山绕城互通监控点', 'highway', '佛山市', 'G1508广州绕城高速', 'K62', '枪型摄像机', '高速公路', '在线', '高速公路', ''],
  ['CAM004', 'G4京港澳高速K2035监控点', 'highway', '广州市', 'G4京港澳高速', 'K2035', '枪型摄像机', '高速公路', '在线', '高速公路', '应急指挥'],
  ['CAM005', '京港澳高速K2030监控点', 'highway', '广州市', 'G4京港澳高速', 'K2030', '球型摄像机', '高速公路', '离线', '', ''],
  ['CAM006', '机场高速收费站监控点', 'facility', '广州市', 'S41机场高速', 'K18', '枪型摄像机', '收费站', '在线', '收费站', '行业监管'],
  ['CAM007', '深圳京深线监控点', 'ordinary', '深圳市', 'G107京深线', 'K2450', '枪型摄像机', '普通公路', '故障', '普通公路', ''],
  ['CAM008', '沈海高速隧道入口', 'facility', '深圳市', 'G15沈海高速', 'K2790', '球型摄像机', '隧道', '在线', '隧道', '应急指挥'],
  ['CAM009', '佛山绕城桥梁监控点', 'facility', '佛山市', 'G1508广州绕城高速', 'K66', '球型摄像机', '桥梁', '在线', '桥梁', '行业监管'],
  ['CAM010', '佛山广成线监控点', 'ordinary', '佛山市', 'G321广成线', 'K32', '枪型摄像机', '普通公路', '离线', '', ''],
  ['CAM011', '东莞京港澳高速服务区', 'facility', '东莞市', 'G4京港澳高速', 'K2120', '球型摄像机', '服务区', '在线', '服务区', '路网运行'],
  ['CAM012', '东莞珠三角环线监控点', 'highway', '东莞市', 'G94珠三角环线高速', 'K48', '枪型摄像机', '高速公路', '在线', '', '交警共享'],
  ['CAM013', '惠州长深高速监控点', 'highway', '惠州市', 'G25长深高速', 'K3505', '枪型摄像机', '高速公路', '在线', '高速公路', '路网运行'],
  ['CAM014', '惠州济广高速收费站', 'facility', '惠州市', 'G35济广高速', 'K1860', '球型摄像机', '收费站', '故障', '收费站', '行业监管'],
  ['CAM015', '惠州福昆线监控点', 'ordinary', '惠州市', 'G324福昆线', 'K815', '枪型摄像机', '普通公路', '在线', '普通公路', ''],
]
const initial = []
for (const values of seeds) {
  const [id, name, domain, city, road, stake, deviceType, category, status, platformDirectory, externalDirectory] = values
  const camera = { id, name, domain, city, road, stake, deviceType, category, status, platformDirectory, externalDirectory }
  camera.code = generateCode(camera, initial)
  camera.ruleSnapshot = { ...getRule(domain) }
  initial.push(camera)
}
// 模块级状态支持路由切换后继续演示；刷新恢复初始15条数据。
export const cameras = reactive(structuredClone(initial))
export const patrolCameras = computed(() => cameras.filter(camera => ['CAM001', 'CAM002', 'CAM003', 'CAM004'].includes(camera.id)))

export function resetCameras() { cameras.splice(0, cameras.length, ...structuredClone(initial)) }
// 每路独立素材配置；缺失时只回退该路模拟画面。
export const cameraMedia = Object.fromEntries(['CAM001', 'CAM002', 'CAM003', 'CAM004'].map(id => [id, { video: `/videos/${id.toLowerCase()}.mp4` }]))
