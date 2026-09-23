<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { cities, categories, externalDirectories, devices, catalogRules, getRule, generateCode, normalizeStake, roadsFor } from '../../data/catalogRules'
const props = defineProps({ camera: Object, resources: Array })
const emit = defineEmits(['save', 'close'])
const editing = Boolean(props.camera)
const form = reactive(props.camera ? { ...props.camera } : {
  domain: 'highway', city: '', road: '', stake: '', deviceType: '枪型摄像机', category: '高速公路',
  platformDirectory: '', externalDirectory: '', name: '', code: '',
})
const feedback = ref('')
const error = ref('')
const availableRoads = computed(() => roadsFor(form.city, form.domain))
const rule = computed(() => getRule(form.domain))
watch(() => [form.domain, form.city], () => {
  if (!availableRoads.value.includes(form.road)) form.road = ''
})
// 修改定位信息后立即作废旧编码，防止预览与表单不一致。
watch(() => [form.domain, form.city, form.road, form.stake, form.deviceType], () => {
  if (!editing) { form.code = ''; feedback.value = ''; error.value = '' }
})
function generate() {
  error.value = ''
  try {
    form.code = generateCode(form, props.resources)
    feedback.value = '已根据当前编目规则生成唯一视频编码'
  } catch (reason) { error.value = reason.message }
}
function save() {
  error.value = ''
  if (!form.name.trim() || !form.category || !form.domain || !form.city || !form.road || !form.stake || !form.deviceType) {
    error.value = '请完整填写所有标有 * 的必填字段。'
    return
  }
  if (!form.code) { error.value = '请先点击“生成编码”，确认编码后再保存。'; return }
  if (!editing) {
    let expected
    try { expected = generateCode(form, props.resources) } catch (reason) { error.value = reason.message; return }
    if (expected !== form.code) { form.code = expected; error.value = '原编码已失效，已更新为当前唯一编码，请确认后再次保存。'; return }
  }
  emit('save', {
    ...form, name: form.name.trim(), stake: normalizeStake(form.stake),
    id: editing ? form.id : crypto.randomUUID(), status: editing ? form.status : '在线',
    ruleSnapshot: editing ? { ...form.ruleSnapshot } : { ...rule.value },
  })
}
</script>

<template>
  <form class="catalog-form" @submit.prevent="save">
    <p class="form-note">{{ editing ? '基础定位与资源编码保持不变，可调整名称、设备类型、业务分类和两个独立共享目录。' : '选择领域与道路后生成编码，再完成资源编目。带 * 为必填项；共享目录可独立选择或留空。' }}</p>
    <div class="catalog-form-grid">
      <label>领域 *<select v-model="form.domain" aria-label="领域 *" :disabled="editing" required><option v-for="item in catalogRules" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
      <label>城市 *<select v-model="form.city" aria-label="城市 *" :disabled="editing" required><option value="">请选择城市</option><option v-for="city in cities" :key="city.code">{{ city.name }}</option></select></label>
      <label>道路 *<select v-model="form.road" aria-label="道路 *" :disabled="editing || !form.city" required><option value="">请选择道路</option><option v-for="road in availableRoads" :key="road">{{ road }}</option></select></label>
      <label>桩号 *<input v-model="form.stake" aria-label="桩号 *" :disabled="editing" required pattern="[Kk][0-9]{1,5}(\+[0-9]{3})?" maxlength="10" placeholder="如 K2035 或 K2035+100" /></label>
      <label>设备类型 *<select v-model="form.deviceType" aria-label="设备类型 *" required><option v-for="device in devices" :key="device">{{ device }}</option></select></label>
      <label>业务分类 *<select v-model="form.category" aria-label="业务分类 *" required><option v-for="category in categories" :key="category">{{ category }}</option></select></label>
      <label>一体化平台目录<select v-model="form.platformDirectory" aria-label="一体化平台目录"><option value="">不归入平台目录</option><option v-for="category in categories" :key="category">{{ category }}</option></select></label>
      <label>外部共享目录<select v-model="form.externalDirectory" aria-label="外部共享目录"><option value="">不对外共享</option><option v-for="directory in externalDirectories" :key="directory">{{ directory }}</option></select></label>
      <label class="form-span">视频名称 *<input v-model="form.name" aria-label="视频名称 *" required maxlength="80" placeholder="如 G4京港澳高速K2035监控点" /></label>
      <div class="form-span code-preview"><label for="generated-code">视频编码 *<input id="generated-code" :value="form.code" readonly placeholder="填写定位信息后点击生成编码" /></label><button v-if="!editing" class="button primary" type="button" @click="generate">生成编码</button></div>
    </div>
    <p class="form-note">{{ editing ? '两种摄像机均采用 CAM 设备代码，切换设备类型不改变资源编码。' : `当前规则：${rule.name} · 领域标识 ${rule.token || '不附加'} · 最少 ${rule.digits} 位序号；新增默认“在线”（模拟状态）。` }}</p>
    <p v-if="feedback" class="form-success" role="status">{{ feedback }}</p><p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <footer class="catalog-dialog-footer"><button class="button" type="button" @click="emit('close')">取消</button><button class="button primary" type="submit">保存</button></footer>
  </form>
</template>
