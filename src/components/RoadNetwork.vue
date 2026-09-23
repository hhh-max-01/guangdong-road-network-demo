<script setup>
import { mapNodes as sourceNodes, mapLinks, trafficStates } from '../data/traffic'
defineProps({ corridor: Boolean })
// 横向驾驶舱拓扑保持文字正常比例，压缩节点纵向间距以提高地图可读性。
const mapNodes = sourceNodes.map(point => ({ ...point, y: point.y * .53 + 15 }))
const node = (id) => mapNodes.find((item) => item.id === id)
const corridorNodes = ['K2025', 'K2030', 'K2035', 'K2040', 'K2045']
</script>
<template>
  <div class="network" :class="{ corridor }">
    <div class="network-caption">
<span class="tiny-dot">
</span>{{ corridor ? 'G4 京港澳高速 · 重点监测路段' : '广东省重点路网 · 珠三角区域' }}</div>
    <svg v-if="!corridor" viewBox="0 0 1000 300" role="img" aria-label="广东路网示意拓扑，包含广州、深圳、佛山、东莞、惠州及高速节点，非真实GIS">
      <defs>
<pattern id="map-grid" width="35" height="35" patternUnits="userSpaceOnUse">
<path d="M 35 0 L 0 0 0 35" fill="none" stroke="#20364a" stroke-width=".6"/>
</pattern>
</defs>
      <rect width="1000" height="300" fill="url(#map-grid)" opacity=".55" />
      <g transform="translate(0 15) scale(1 .53)">
      <path d="M30 152 128 82 230 63 273 25 399 63 485 34 590 68 674 25 805 108 863 196 975 242 944 346 856 386 838 456 752 479 649 450 578 493 481 475 399 495 315 469 211 421 155 339 78 326Z" fill="#142c40" fill-opacity=".6" stroke="#29475e" stroke-dasharray="5 7" />
      <path d="M416 510 Q380 405 470 375 T676 490" fill="none" stroke="#1f4a69" stroke-width="27" opacity=".35"/>
      </g>
      <g v-for="(link, i) in mapLinks" :key="i">
        <line :x1="node(link.from).x" :y1="node(link.from).y" :x2="node(link.to).x" :y2="node(link.to).y" stroke="#213b4b" stroke-width="12" stroke-linecap="round" />
        <line :x1="node(link.from).x" :y1="node(link.from).y" :x2="node(link.to).x" :y2="node(link.to).y" :stroke="trafficStates[link.state].color" stroke-width="4" stroke-linecap="round">
<title>{{ link.road }} · {{ trafficStates[link.state].label }}</title>
</line>
        <g :transform="`translate(${(node(link.from).x + node(link.to).x) / 2},${(node(link.from).y + node(link.to).y) / 2})`">
<rect x="-24" y="-11" width="48" height="22" rx="4" fill="#163043" stroke="#385169"/>
<text text-anchor="middle" y="4" font-size="11" fill="#a2bed2">{{ link.road }}</text>
</g>
      </g>
      <g v-for="point in mapNodes" :key="point.id" :transform="`translate(${point.x},${point.y})`">
        <circle v-if="!point.minor || point.alert" :r="point.alert ? 18 : 14" :fill="point.alert ? '#f2667920' : '#4badeb18'" :stroke="point.alert ? '#f2667960' : '#4badeb40'" />
        <circle :r="point.minor ? 5 : 6" :fill="point.alert ? '#f26679' : '#badcef'" stroke="#102237" stroke-width="2" />
        <text :y="point.minor ? -19 : 30" text-anchor="middle" :fill="point.alert ? '#ff9ca9' : point.minor ? '#8ba6bc' : '#e3edf7'" :font-size="point.minor ? 12 : 18" :font-weight="point.minor ? 400 : 600">{{ point.name }}</text>
      </g>
      <text x="870" y="270" fill="#44647b" font-size="18" letter-spacing="8">珠江口</text>
      <g transform="translate(948 47)" fill="#7895ab">
<path d="m0-15-6 22 6-5 6 5Z"/>
<text y="-22" text-anchor="middle" font-size="11">N</text>
</g>
    </svg>
    <svg v-else viewBox="0 0 1000 350" role="img" aria-label="G4高速K2025至K2045路段，K2035为严重拥堵堵点">
      <path d="M70 180H930" stroke="#233c52" stroke-width="30"/>
<path d="M70 180H930" stroke="#6b8599" stroke-dasharray="10 10"/>
      <path d="M70 164H270" stroke="#36cba0" stroke-width="5"/>
<path d="M270 164H390" stroke="#e7c65b" stroke-width="5"/>
<path d="M390 164H510" stroke="#f26679" stroke-width="5"/>
<path d="M510 164H710" stroke="#ef964c" stroke-width="5"/>
<path d="M710 164H930" stroke="#36cba0" stroke-width="5"/>
      <g v-for="(item,i) in corridorNodes" :key="item" :transform="`translate(${100+i*200},180)`">
<circle r="8" :fill="i===2 ? '#f26679' : '#adcee5'"/>
<text y="42" text-anchor="middle" fill="#bacbdd" font-size="18">{{ item }}</text>
</g>
      <g transform="translate(500 92)">
<rect x="-110" y="-25" width="220" height="46" rx="6" fill="#402638" stroke="#a64c61"/>
<text text-anchor="middle" y="3" fill="#ffa4b0" font-size="16">交通事故 · 严重拥堵</text>
<path d="M0 21v37" stroke="#f26679" stroke-dasharray="4 4"/>
</g>
      <text x="100" y="280" fill="#7593ac" font-size="14">上游方向 ←</text>
<text x="780" y="280" fill="#7593ac" font-size="14">→ 下游方向</text>
    </svg>
    <div class="network-footer">
<div class="legend">
<span v-for="state in trafficStates" :key="state.label">
<i :style="{ background: state.color }">
</i>{{ state.label }}</span>
</div>
<span>● 城市节点 · <b style="color:#f26679">● 事件监测点</b> · 示意拓扑 / 非真实地理位置</span>
</div>
  </div>
</template>
