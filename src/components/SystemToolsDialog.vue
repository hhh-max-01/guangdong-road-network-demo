<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
defineProps({ kind: String })
defineEmits(['close', 'confirm'])
const dialog = ref(null)
let previous
onMounted(() => { previous = document.activeElement; dialog.value.showModal() })
onBeforeUnmount(() => { dialog.value?.close(); previous?.focus() })
const steps = ['视频资源编目', '智慧轮巡', '事故发现', '高清复核', '堵点分析', '态势推演']
</script>
<template>
  <dialog ref="dialog" class="system-tools-dialog" aria-labelledby="system-tool-title" @cancel.prevent="$emit('close')">
    <header><h2 id="system-tool-title">{{ kind === 'reset' ? '确定重置全部演示数据？' : '系统说明' }}</h2><button class="button" aria-label="关闭" @click="$emit('close')">×</button></header>
    <template v-if="kind === 'reset'">
      <p>恢复基础视频编目和编码规则，清除轮巡事件、堵点分析及推演结果，返回演示步骤 1/6。</p>
      <p>当前演示新增和修改的数据将被清除。</p>
      <footer><button class="button" @click="$emit('close')">取消</button><button class="button" @click="$emit('confirm')">确认重置</button></footer>
    </template>
    <template v-else>
      <h3>省级路网运行监测预警演示系统</h3>
      <p>围绕交通视频汇聚、智能分析、堵点识别和态势推演构建演示原型。</p>
      <h3>核心能力与业务流程</h3>
      <ol class="system-flow"><li v-for="(step,index) in steps" :key="step"><b>{{ index+1 }}</b>{{ step }}<span v-if="index<5">→</span></li></ol>
      <p>本系统为课程实践和投标 DEMO 模拟系统，业务数据均为演示模拟数据。识别、带宽调配与预测均为前端模拟，不接入真实业务系统。</p>
      <footer><span class="tag">演示模拟数据</span><button class="button" @click="$emit('close')">关闭说明</button></footer>
    </template>
  </dialog>
</template>
