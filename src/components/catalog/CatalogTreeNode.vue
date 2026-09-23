<script setup>
import { ref, computed } from 'vue'
import { matchesDirectory } from '../../data/catalogRules'
const props = defineProps({ node: Object, selected: String, resources: Array, depth: { type: Number, default: 0 } })
defineEmits(['select'])
const expanded = ref(props.depth < 2)
const count = computed(() => props.resources.filter(camera => matchesDirectory(camera, props.node)).length)
</script>

<template>
  <li>
    <div class="catalog-tree-row" :class="{ active: selected === node.id }" :style="{ paddingLeft: `${10 + depth * 12}px` }">
      <button v-if="node.children?.length" class="tree-toggle" :aria-label="`${expanded ? '收起' : '展开'}${node.label}`" :aria-expanded="expanded" @click="expanded = !expanded">{{ expanded ? '⌄' : '›' }}</button>
      <span v-else class="tree-leaf">·</span>
      <button class="tree-label" :title="node.label" :aria-pressed="selected === node.id" @click="$emit('select', node)">{{ node.label }}<small>{{ count }}</small></button>
    </div>
    <ul v-if="node.children?.length && expanded">
      <CatalogTreeNode v-for="child in node.children" :key="child.id" :node="child" :depth="depth + 1" :selected="selected" :resources="resources" @select="$emit('select', $event)" />
    </ul>
  </li>
</template>
