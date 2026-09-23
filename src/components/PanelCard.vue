<script setup>
defineProps({ title: String, subtitle: String })
</script>
<template>
<section class="panel">
<header class="panel-heading">
<div>
<h2>{{ title }}</h2>
<span v-if="subtitle" class="panel-subtitle">{{ subtitle }}</span>
</div>
<slot name="action" />
</header>
<div class="panel-body">
<slot />
</div>
</section>
</template>
