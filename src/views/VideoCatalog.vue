<script setup>
import { ref, reactive, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import PanelCard from '../components/PanelCard.vue'
import CatalogTreeNode from '../components/catalog/CatalogTreeNode.vue'
import CatalogDialog from '../components/catalog/CatalogDialog.vue'
import CatalogForm from '../components/catalog/CatalogForm.vue'
import CatalogDetails from '../components/catalog/CatalogDetails.vue'
import CatalogRules from '../components/catalog/CatalogRules.vue'
import { cameras } from '../data/cameras'
import { cities, categories, statuses, directoryTree, matchesDirectory } from '../data/catalogRules'
import '../assets/catalog.css'

const emptyQuery = () => ({ keyword: '', city: '', road: '', status: '', category: '' })
const query = reactive(emptyQuery())
const applied = ref(emptyQuery())
const selected = ref(directoryTree[0].children[0])
const page = ref(1)
const pageSize = ref(6)
const dialog = ref('')
const activeCamera = ref(null)
const message = ref('')
const roads = computed(() => [...new Set(cities.filter(city => !query.city || city.name === query.city).flatMap(city => city.roads))])
const filtered = computed(() => cameras.filter(camera => {
  const q = applied.value
  return matchesDirectory(camera, selected.value) &&
    (!q.city || camera.city === q.city) && (!q.road || camera.road === q.road) &&
    (!q.status || camera.status === q.status) && (!q.category || camera.category === q.category) &&
    [camera.name, camera.code, camera.road, camera.stake].join(' ').toLowerCase().includes(q.keyword.trim().toLowerCase())
}))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const rows = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const stats = computed(() => [
  { label: '视频资源总数', value: cameras.length, note: '本地编目样例', tone: '' },
  { label: '在线视频', value: cameras.filter(c => c.status === '在线').length, note: '模拟运行状态', tone: 'normal' },
  { label: '离线视频', value: cameras.filter(c => c.status === '离线').length, note: '另有故障 ' + cameras.filter(c => c.status === '故障').length + ' 路', tone: 'offline' },
  { label: '已共享资源', value: cameras.filter(c => c.platformDirectory || c.externalDirectory).length, note: '任一目录已归入，去重统计', tone: 'shared' },
])
const tone = status => ({ 在线: 'normal', 离线: 'offline', 故障: 'danger' }[status])
function search() { applied.value = { ...query }; page.value = 1; message.value = '' }
function reset() { Object.assign(query, emptyQuery()); applied.value = emptyQuery(); selected.value = directoryTree[0].children[0]; page.value = 1; message.value = '' }
function selectDirectory(node) { selected.value = node; page.value = 1; message.value = '' }
function open(mode, camera = null) { activeCamera.value = camera; dialog.value = mode; message.value = '' }
function save(camera) {
  const index = cameras.findIndex(item => item.id === camera.id)
  if (index >= 0) cameras.splice(index, 1, camera)
  else cameras.unshift(camera)
  dialog.value = ''
  // 返回全部资源首屏，避免新增项被保存前的查询条件隐藏。
  reset()
  message.value = (index >= 0 ? '视频信息已更新：' : '视频新增成功：') + camera.name + '。已返回全部资源，可立即查询。'
}
</script>

<template>
  <div class="catalog-page">
    <PageHeader title="视频编目管理" subtitle="统一管理省级交通视频资源编码、目录及共享关系" />
    <div class="catalog-toolbar">
      <span>资源目录管理 <b>/</b> 编目工作台</span>
      <div><button class="button" @click="open('rules')">编码规则</button><button class="button primary" @click="open('new')">＋ 新增视频</button></div>
    </div>
    <div class="catalog-stats">
      <article v-for="stat in stats" :key="stat.label" :class="stat.tone">
        <span>{{ stat.label }}</span><strong>{{ stat.value }}<small>路</small></strong><p>{{ stat.note }}</p>
      </article>
    </div>
    <p v-if="message" class="catalog-feedback" role="status">{{ message }}<button aria-label="关闭提示" @click="message = ''">×</button></p>
    <div class="catalog-workbench">
      <PanelCard title="视频资源目录" class="catalog-tree-panel">
        <nav aria-label="视频资源目录树"><ul class="catalog-tree">
          <CatalogTreeNode v-for="node in directoryTree" :key="node.id" :node="node" :selected="selected.id" :resources="cameras" @select="selectDirectory" />
        </ul></nav>
        <p class="catalog-tree-tip">两个共享目录独立归类<br />同一资源可同时归入</p>
      </PanelCard>
      <PanelCard title="视频资源列表" class="catalog-list-panel">
        <template #action><span class="tag">演示模拟数据 · {{ filtered.length }} 路</span></template>
        <form class="catalog-query" @submit.prevent="search">
          <label class="keyword-field">关键词<input v-model="query.keyword" aria-label="关键词" placeholder="名称、编码、道路或桩号" /></label>
          <label>所属区域<select v-model="query.city" aria-label="所属区域" @change="query.road = ''"><option value="">全部区域</option><option v-for="city in cities" :key="city.code">{{ city.name }}</option></select></label>
          <label>所属道路<select v-model="query.road" aria-label="所属道路"><option value="">全部道路</option><option v-for="road in roads" :key="road">{{ road }}</option></select></label>
          <label>在线状态<select v-model="query.status" aria-label="在线状态"><option value="">全部状态</option><option v-for="status in statuses" :key="status">{{ status }}</option></select></label>
          <label>业务分类<select v-model="query.category" aria-label="业务分类"><option value="">全部分类</option><option v-for="category in categories" :key="category">{{ category }}</option></select></label>
          <div class="query-actions"><button class="button primary" type="submit">查询</button><button class="button" type="button" @click="reset">重置</button></div>
        </form>
        <div class="catalog-selection"><span>当前目录：<strong>{{ selected.kind.startsWith('platform') ? '一体化平台 / ' : selected.kind.startsWith('external') ? '外部共享 / ' : '' }}{{ selected.label }}</strong></span><span>目录与查询条件共同筛选</span></div>
        <div class="catalog-table-scroll">
          <table class="catalog-table">
            <thead><tr><th>视频名称 / 视频编码</th><th>所属区域</th><th>所属道路 / 桩号</th><th>设备类型</th><th>业务分类</th><th>在线状态</th><th>一体化平台</th><th>外部共享</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="camera in rows" :key="camera.id">
                <td><strong>{{ camera.name }}</strong><small>{{ camera.code }}</small></td>
                <td>{{ camera.city }}</td><td>{{ camera.road }}<small>{{ camera.stake }}</small></td>
                <td>{{ camera.deviceType }}</td><td>{{ camera.category }}</td>
                <td><span class="status" :class="tone(camera.status)"><i></i>{{ camera.status }}</span></td>
                <td>{{ camera.platformDirectory || '未归入' }}</td><td>{{ camera.externalDirectory || '未共享' }}</td>
                <td><div class="row-actions"><button @click="open('details', camera)">查看</button><button @click="open('edit', camera)">编辑</button></div></td>
              </tr>
              <tr v-if="!rows.length"><td colspan="9" class="empty-cell">未找到匹配资源，请调整目录或查询条件。</td></tr>
            </tbody>
          </table>
        </div>
        <div class="catalog-pagination">
          <span>共 {{ filtered.length }} 条<span class="total-note"> / 全部 {{ cameras.length }} 条</span></span>
          <div><label>每页<select v-model.number="pageSize" @change="page = 1"><option :value="6">6 条</option><option :value="12">12 条</option><option :value="24">24 条</option></select></label>
            <button class="button" :disabled="page <= 1" @click="page--">上一页</button><span>{{ page }} / {{ pages }}</span><button class="button" :disabled="page >= pages" @click="page++">下一页</button>
          </div>
        </div>
      </PanelCard>
    </div>
    <p class="catalog-session-note">视频编目样例资源独立统计，与首页全省概览口径不同。</p>
    <CatalogDialog v-if="dialog" :title="({ new: '新增视频资源', edit: '编辑视频资源', details: '视频资源详情', rules: '编码规则配置' })[dialog]" :wide="dialog === 'new' || dialog === 'edit'" @close="dialog = ''">
      <CatalogForm v-if="dialog === 'new' || dialog === 'edit'" :camera="activeCamera" :resources="cameras" @save="save" @close="dialog = ''" />
      <CatalogDetails v-else-if="dialog === 'details'" :camera="activeCamera" />
      <CatalogRules v-else />
    </CatalogDialog>
  </div>
</template>

