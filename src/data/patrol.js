import { cameraMedia } from './cameras'
// 512 kbps 按演示口径近似为 0.5 Mbps，非真实带宽测量。
export const streamProfiles = {
  low: { name: '低码流', resolution: '640×360', bitrate: '512kbps', bandwidth: 0.5 },
  high: { name: '高码流', resolution: '1920×1080', bitrate: '4Mbps', bandwidth: 4 },
}
export const patrolTiming = { analysis: 2000, interval: 2000, request: 2000, switched: 2000, review: 2000 }
export const phaseLabels = {
  idle: '等待开始', scanning: '智慧轮巡中', suspected: '发现疑似交通事故',
  requesting: '正在申请高清码流……', switched: '高清码流切换成功',
  reviewing: '正在进行事件高清复核……', confirmed: '复核完成 · 事件已确认',
}
export const cameraLabels = {
  idle: '待轮巡', analyzing: 'AI分析中', normal: '检测完成：正常', suspected: '疑似事故',
  requesting: '申请高清码流', reviewing: '高清复核', confirmed: '已确认事故',
}

// Vite 构建时枚举文件，只输出 public 资源路径，不导入或下载外部视频。
const videoFiles = Object.keys(import.meta.glob('/public/videos/*.[mM][pP]4', { query: '?url', import: 'default' })).sort()
export function localVideoFor(cameraId) {
  const file = videoFiles.find(path => path.split('/').pop().toLowerCase() === cameraMedia[cameraId]?.video.split('/').pop().toLowerCase())
  return file ? `${import.meta.env.BASE_URL}videos/${encodeURIComponent(file.split('/').pop())}` : ''
}
