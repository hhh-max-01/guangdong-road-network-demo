<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
defineProps({ title: String, wide: Boolean })
const emit = defineEmits(['close'])
const dialog = ref(null)
let previousFocus
onMounted(() => { previousFocus = document.activeElement; dialog.value.showModal() })
onBeforeUnmount(() => { dialog.value?.close(); previousFocus?.focus() })
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="catalog-dialog" :class="{ wide }" aria-labelledby="catalog-dialog-title" @cancel.prevent="emit('close')">
      <header class="catalog-dialog-header"><div><h2 id="catalog-dialog-title">{{ title }}</h2><span>演示模拟数据 · 本地运行状态</span></div><button type="button" class="dialog-close" aria-label="关闭弹窗" @click="emit('close')">×</button></header>
      <div class="catalog-dialog-body"><slot /></div>
    </dialog>
  </Teleport>
</template>
