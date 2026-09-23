<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { cameraLabels, localVideoFor, streamProfiles } from '../../data/patrol'
const props = defineProps({ camera: Object, status: String, high: Boolean })
const video = ref(null)
const failed = ref(false)
const paused = ref(false)
const source = localVideoFor(props.camera.id)
const profile = computed(() => streamProfiles[props.high ? 'high' : 'low'])
const incident = computed(() => ['suspected', 'requesting', 'reviewing', 'confirmed'].includes(props.status))
const vehicles = Array.from({ length: 10 }, (_, index) => ({ lane: index % 4, delay: `${-index * 1.3}s`, duration: `${5 + index % 3}s`, color: ['#c2d5df', '#78a2b9', '#bcaf95', '#8ca1ad'][index % 4] }))
async function play() {
  try { await video.value?.play(); paused.value = false } catch { paused.value = true }
}
watch(video, element => { if (element) play() })
onBeforeUnmount(() => video.value?.pause())
</script>

<template>
  <article class="monitor-card video-placeholder" :class="[status, { hd: high }]" :data-camera="camera.id" :data-state="status">
    <header class="monitor-header"><strong>{{ camera.id }}</strong><span class="monitor-online"><i></i>在线</span><span class="monitor-state">{{ cameraLabels[status] }}</span></header>
    <div class="monitor-screen">
      <template v-if="source && !failed">
        <video ref="video" :src="source" autoplay loop muted playsinline preload="metadata" @error="failed = true" aria-label="本地交通视频素材" />
        <button v-if="paused" class="play-local" @click="play">播放本地视频</button>
      </template>
      <div v-else class="road-scene" :class="{ incident }" role="img" aria-label="离线模拟监控画面，车辆沿道路移动">
        <div class="road-verge left"></div><div class="road-verge right"></div>
        <div class="sim-road"><div class="lane-line one"></div><div class="lane-line two"></div><div class="lane-line three"></div>
          <i v-for="(car,index) in vehicles" :key="index" class="sim-car" :class="{ stalled: incident && index > 5 }" :style="{ left: `${12 + car.lane * 24}%`, animationDelay: car.delay, animationDuration: car.duration, background: car.color }"></i>
        </div>
        <span class="scene-road-label">{{ camera.road.match(/^[A-Z]\d+/)?.[0] }}<small>{{ camera.stake }}</small></span>
      </div>
      <div class="monitor-osd"><span>{{ high ? '高清复核 · HD' : '低码流智能分析 · SD' }}</span><small>{{ source && !failed ? '本地素材 · 模拟识别' : failed ? '素材不可用 · 动画回退' : '离线模拟画面' }}</small></div>
      <div v-if="status === 'analyzing'" class="scan-line"></div>
      <div v-if="incident" class="incident-box"><span>交通事故 · 置信度 {{ status === 'confirmed' ? '99% · 已确认' : '96% · 待复核' }}</span></div>
      <div v-if="high" class="hd-mark">1080P <span>高清复核</span></div>
      <div class="monitor-watermark">DEMO · 演示模拟数据</div>
    </div>
    <footer class="monitor-footer"><strong>{{ camera.road }} <span>{{ camera.stake }}</span></strong><div><span>{{ profile.name }}</span><span>{{ profile.resolution }}</span><span>{{ profile.bitrate }}</span></div></footer>
  </article>
</template>
