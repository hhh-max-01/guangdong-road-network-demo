// 开发验收脚本：使用外部测试运行时，不向业务项目添加浏览器测试依赖。
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('node:fs')

async function main() {
  fs.mkdirSync('.qa', { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  const errors = []
  const externalRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()) })
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5173') && !request.url().startsWith('data:')) externalRequests.push(request.url()) })
  const check = (value, message) => { if (!value) throw new Error(message) }
  await page.goto('http://127.0.0.1:5173/')
  await page.getByRole('heading', { name: '路网运行监测总览', exact: true }).waitFor()
  await page.locator('.chart canvas').first().waitFor()
  await page.screenshot({ path: '.qa/dashboard-1920.png', fullPage: true })
  check(await page.locator('.chart canvas').count() === 2, '首页应有两个 ECharts canvas')
  const size = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewport: innerHeight }))
  check(size.width <= 1920 && size.height <= 1080, `1920首页超出视窗: ${JSON.stringify(size)}`)
  const cases = [
    ['视频编目', '视频编目管理'], ['智慧轮巡', '智慧轮巡'], ['堵点分析', '堵点分析'], ['态势推演', '交通态势推演'], ['路网总览', '路网运行监测总览'],
  ]
  for (let cycle = 0; cycle < 2; cycle++) {
    for (const [menu, heading] of cases) {
      await page.getByRole('navigation', { name: '系统导航' }).getByRole('link', { name: new RegExp(menu) }).click()
      await page.getByRole('heading', { name: heading, exact: true }).waitFor()
      await page.reload()
      await page.getByRole('heading', { name: heading, exact: true }).waitFor()
      check(await page.locator('.data-badge').isVisible(), `${menu} 缺少模拟数据标识`)
      if (cycle === 0) await page.screenshot({ path: `.qa/page-${menu}.png`, fullPage: true })
    }
  }
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.waitForTimeout(250)
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    check(width <= viewport.width, `${viewport.width} 视窗存在横向溢出: ${width}`)
    check(await page.locator('.chart canvas').count() === 2, 'resize 后图表数异常')
    await page.screenshot({ path: `.qa/dashboard-${viewport.width}.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.getByRole('navigation', { name: '系统导航' }).getByRole('link', { name: /视频编目/ }).click()
  await page.getByLabel('关键词', { exact: true }).fill('不存在的摄像头')
  await page.getByRole('button', { name: '查询', exact: true }).click()
  check(await page.getByText('未找到匹配资源，请调整目录或查询条件。').isVisible(), '搜索空状态异常')
  await page.getByRole('button', { name: '重置', exact: true }).click()
  check(await page.locator('tbody tr').count() === 6, '重置未恢复资源列表')
  await page.getByRole('navigation', { name: '视频资源目录树' }).getByRole('button', { name: /^深圳市/ }).click()
  check(await page.locator('tbody tr').count() === 3, '目录筛选异常')
  await page.goto('http://127.0.0.1:5173/#/unknown-route')
  await page.getByRole('heading', { name: '路网运行监测总览', exact: true }).waitFor()
  await page.getByRole('link', { name: /查看堵点分析/ }).click()
  await page.getByRole('heading', { name: '堵点分析', exact: true }).waitFor()
  check(errors.length === 0, `浏览器错误或警告: ${errors.join('\n')}`)
  check(externalRequests.length === 0, `不应请求外部资源: ${externalRequests.join('\n')}`)
  await browser.close()
  console.log(JSON.stringify({ result: 'PASS', routes: 5, navigationAndReloadCycles: 2, viewports: ['1920×1080', '1366×768', '1024×768', '390×844'], consoleErrorsAndWarnings: errors, externalRequests, checks: ['图表挂载和销毁', '路由刷新', '未知路由回退', '目录筛选', '搜索空状态', '搜索重置', '首页业务入口'] }, null, 2))
}
main().catch(error => { console.error(error); process.exit(1) })

