const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
async function main() {
 const browser = await chromium.launch({channel:'chrome',headless:true})
 try {
  const page = await browser.newPage({viewport:{width:1920,height:1080}})
  const errors=[],external=[]
  page.on('pageerror',e=>errors.push(e.message))
  page.on('console',m=>{if(['error','warning'].includes(m.type())) errors.push(m.text())})
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5173')&&!r.url().startsWith('data:'))external.push(r.url())})
  const nav=page.getByRole('navigation',{name:'系统导航'})
  const open=()=>page.getByRole('heading',{name:'堵点分析',exact:true}).waitFor()
  const start=()=>page.getByRole('button',{name:/^(启动堵点分析|重新分析)$/})
  const reset=()=>page.getByRole('button',{name:'重置分析',exact:true})
  const result=page.locator('.congestion-conclusion')
  let trafficUrl
  const output=()=>page.evaluate(async(url)=>{
    return JSON.parse(JSON.stringify((await import(url)).currentCongestion.value))
  },trafficUrl)
  await page.goto('http://127.0.0.1:5173/#/congestion-analysis');await open()
  trafficUrl=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(u=>/\/src\/data\/traffic(?:\.js)?(?:\?|$)/.test(u)))
  assert.equal(await page.locator('[data-node]').count(),7)
  assert.equal(await page.locator('.source-cards article').count(),5)
  assert.equal(await page.locator('.chart canvas').count(),2)
  assert.ok((await page.locator('.congestion-toolbar').innerText()).includes('预置已确认样例'))
  for(const id of ['K2020','K2025','K2030','K2035','K2040','K2045','K2050']) {
    await page.locator(`[data-node="${id}"]`).click()
    assert.ok((await page.locator('.segment-detail h3').innerText()).includes(id))
  }
  await page.locator('[data-node="K2035"]').click()
  assert.ok((await page.locator('.segment-detail').innerText()).includes('18 km/h'))
  await page.getByRole('button',{name:'查看关联事件'}).click()
  assert.ok((await page.getByRole('dialog').innerText()).includes('EVT-2026-0001'))
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0)
  await page.screenshot({path:'.qa/congestion-idle-1920.png',fullPage:true})
  const began=Date.now();await start().click()
  assert.ok(await page.getByRole('button',{name:'正在分析',exact:true}).isDisabled())
  for(let i=0;i<5;i++) await page.locator(`[data-step="${i}"].active`).waitFor()
  await result.waitFor()
  const duration=Date.now()-began;assert.ok(duration>=4400&&duration<6500)
  assert.equal(await page.locator('.congestion-process li.done').count(),5)
  const data=await output()
  for(const [k,v] of Object.entries({eventId:'EVT-2026-0001',currentTime:'14:00',location:'K2035',speed:18,flow:4200,congestionLength:2.3,eventType:'交通事故',weather:'暴雨'}))assert.equal(data[k],v)
  assert.deepEqual(data.causeFactors.map(x=>x.value),[65,25,10])
  await page.waitForTimeout(600)
  await page.screenshot({path:'.qa/congestion-complete-1920.png',fullPage:true})
  assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=1080),'1920下页面超出一屏')
  await page.clock.install()
  await start().click();assert.equal(await result.count(),0);await page.clock.runFor(4600);assert.equal(await result.count(),1)
  for(const offset of [100,1000,2000,3000,4000]) {
    await start().click();await page.clock.runFor(offset);await reset().click();await page.clock.runFor(6000)
    assert.equal(await result.count(),0);assert.equal(await output(),null)
    assert.equal(await page.locator('.congestion-process li.done,.congestion-process li.active').count(),0)
  }
  await start().click();await page.clock.runFor(1000)
  await nav.getByRole('link',{name:/路网总览/}).click()
  // 等懒加载路由实际卸载分析页后再推进虚拟时间，避免把导航期间计为离页后。
  await page.getByRole('heading',{name:'路网运行监测总览',exact:true}).waitFor()
  await page.clock.runFor(6000)
  await nav.getByRole('link',{name:/堵点分析/}).click();await open();assert.equal(await result.count(),0)
  // 从真实轮巡UI生成事件，验证贯通而非另建事故。
  await nav.getByRole('link',{name:/智慧轮巡/}).click()
  await page.getByRole('button',{name:'开始智慧轮巡',exact:true}).click();await page.clock.runFor(14020)
  await page.getByRole('button',{name:'高码流复核',exact:true}).click();await page.clock.runFor(6020)
  await nav.getByRole('link',{name:/堵点分析/}).click();await open()
  assert.ok((await page.locator('.congestion-toolbar').innerText()).includes('本轮已确认事件'))
  await start().click();await page.clock.runFor(4600);assert.equal((await output()).source,'smart-patrol')
  await nav.getByRole('link',{name:/态势推演/}).click();assert.equal((await output()).location,'K2035')
  await nav.getByRole('link',{name:/堵点分析/}).click();await open();assert.equal(await result.count(),1)
  await nav.getByRole('link',{name:/智慧轮巡/}).click();await page.getByRole('button',{name:'重置演示'}).click()
  assert.equal(await output(),null)
  await nav.getByRole('link',{name:/堵点分析/}).click();await open();assert.equal(await result.count(),0)
  for(const viewport of [{width:1366,height:768},{width:390,height:844}]) {
    await page.setViewportSize(viewport);await page.clock.runFor(500)
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'横向溢出')
    await page.getByRole('button',{name:'查看关联事件'}).click()
    assert.ok(await page.getByRole('dialog').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}))
    await page.keyboard.press('Escape')
    await page.screenshot({path:`.qa/congestion-${viewport.width}.png`,fullPage:true})
  }
  await page.reload();await open();assert.equal(await result.count(),0)
  assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  console.log(JSON.stringify({result:'PASS',seconds:duration/1000,checks:['7节点点击','5步流程','事件详情','双图表','诱因65/25/10','统一输出','重分析','5阶段重置','离页取消','轮巡真实链路','上游重置失效','1920一屏完整','响应式弹窗','刷新'],errors,external},null,2))
 } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exit(1)})


