<script setup>
import { ref, computed, watch } from 'vue'
import { catalogRules, getRule, ruleDescription, generateCode } from '../../data/catalogRules'
const selected = ref('highway')
const token = ref('')
const digits = ref(3)
const feedback = ref('')
const error = ref('')
const load = () => { const rule = getRule(selected.value); token.value = rule.token; digits.value = rule.digits; feedback.value = ''; error.value = '' }
watch(selected, load, { immediate: true })
const previewRule = computed(() => ({ ...getRule(selected.value), token: token.value.trim().toUpperCase(), digits: Number(digits.value) }))
const example = computed(() => generateCode({ domain: selected.value, city: '广州市', road: selected.value === 'ordinary' ? 'G105京澳线' : 'G4京港澳高速', stake: 'K2035', deviceType: '枪型摄像机' }, [], previewRule.value))
function save() {
  error.value = ''; feedback.value = ''
  const normalized = token.value.trim().toUpperCase()
  if (!/^[A-Z0-9]{0,6}$/.test(normalized)) { error.value = '领域标识只能填写 0～6 位英文字母或数字。'; return }
  if (catalogRules.some(rule => rule.id !== selected.value && rule.token === normalized)) { error.value = '该领域标识已被其他领域使用，请设置不同标识。'; return }
  Object.assign(getRule(selected.value), { token: normalized, digits: Number(digits.value) })
  token.value = normalized
  feedback.value = '规则已应用，仅影响此后生成的新编码；已有资源编码保持不变。'
}
</script>
<template>
  <div class="catalog-rules">
    <p class="form-note">每个领域具有独立的编码配置，可现场调整领域标识与序号位数。规则只在当前运行状态保留。</p>
    <div class="catalog-rule-cards"><button v-for="rule in catalogRules" :key="rule.id" class="button" :class="{ primary: selected === rule.id }" @click="selected = rule.id">{{ rule.name }}<small>{{ rule.token || '基础规则' }} · {{ rule.digits }} 位序号</small></button></div>
    <form @submit.prevent="save"><div class="catalog-form-grid">
      <label>领域标识<input v-model="token" aria-label="领域标识" maxlength="6" placeholder="可留空，如 RD、FAC" /></label>
      <label>序号位数<select v-model="digits" aria-label="序号位数"><option :value="3">3 位（001）</option><option :value="4">4 位（0001）</option></select></label>
    </div><div class="rule-example"><h3>{{ ruleDescription(previewRule) }}</h3><code>{{ example }}</code><p>城市代码：广州 GZ / 深圳 SZ / 佛山 FS / 东莞 DG / 惠州 HZ</p><p>省份 GD，设备 CAM。同基础编码取已存在最大尾号 + 1；超出位数时自然扩展。</p></div>
    <p class="form-note">当前编码规则仅用于演示系统业务流程，不代表实际生产环境编码规范。</p>
    <p v-if="feedback" class="form-success" role="status">{{ feedback }}</p><p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <footer class="catalog-dialog-footer"><button class="button primary" type="submit">应用规则</button></footer></form>
  </div>
</template>
