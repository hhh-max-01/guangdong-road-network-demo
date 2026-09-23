<script setup>
import { trafficStates } from '../data/traffic'
</script>
<template>
  <div class="road-status-legend"><span v-for="state in trafficStates" :key="state.label"><i :style="{ background:state.color }"></i>{{ state.label }}</span><span><b>!</b>交通事故</span></div>
</template>
