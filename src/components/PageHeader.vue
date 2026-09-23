<script setup>
defineProps({ title: String, subtitle: String })
</script>
<template>
<div class="page-heading">
<div>
<div class="eyebrow">GUANGDONG · ROAD NETWORK</div>
<h1>{{ title }}</h1>
<p>{{ subtitle }}</p>
</div>
<div class="heading-tags">
<span class="data-badge">
<i>
</i>演示模拟数据</span>
</div>
</div>
</template>
