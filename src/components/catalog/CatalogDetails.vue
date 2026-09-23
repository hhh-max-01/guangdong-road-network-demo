<script setup>
import { getRule, ruleDescription } from '../../data/catalogRules'
const props = defineProps({ camera: Object })
const rule = props.camera.ruleSnapshot || getRule(props.camera.domain)
const groups = [
  { title: '基础信息', fields: [['视频名称', props.camera.name], ['所属区域', props.camera.city], ['所属道路', props.camera.road], ['桩号', props.camera.stake], ['设备类型', props.camera.deviceType]] },
  { title: '编目信息', fields: [['视频编码', props.camera.code], ['所属领域', rule.name], ['业务分类', props.camera.category]] },
  { title: '共享信息', fields: [['一体化平台目录', props.camera.platformDirectory || '未归入'], ['外部共享目录', props.camera.externalDirectory || '未共享']] },
  { title: '运行状态', fields: [['在线状态', props.camera.status], ['数据来源', '本地演示模拟数据，未连接真实设备']] },
]
</script>
<template>
  <div class="catalog-details">
    <section v-for="group in groups" :key="group.title"><h3>{{ group.title }}</h3><dl><div v-for="[key,value] in group.fields" :key="key"><dt>{{ key }}</dt><dd>{{ value }}</dd></div></dl></section>
    <section><h3>编码规则（创建时快照）</h3><p>{{ ruleDescription(rule) }}</p><p>领域标识：{{ rule.token || '不附加' }}；设备代码：CAM。规则修改不会追溯变更本资源编码。</p><p class="form-note">当前编码规则仅用于演示系统业务流程，不代表实际生产环境编码规范。</p></section>
  </div>
</template>
