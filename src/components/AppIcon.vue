<script setup>
defineProps({ name: { type: String, default: 'road' } })
const paths = {
  road: 'M7 3 3 21M17 3l4 18M12 3v4m0 3v4m0 3v4',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  camera: 'M3 6h12v12H3zM15 10l6-4v12l-6-4',
  signal: 'M4 17v4m5-9v9m5-14v14m5-19v19',
  activity: 'M2 12h5l3-8 4 16 3-8h5',
  alert: 'm12 3 10 18H2L12 3ZM12 9v5m0 3v1',
  scan: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 12h10m-5-5v10',
  layers: 'm12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
}
</script>
<template>
<svg class="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path :d="paths[name] || paths.road" />
</svg>
</template>
