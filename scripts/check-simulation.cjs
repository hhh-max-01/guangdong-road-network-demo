const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const assert=require('node:assert/strict')
const fs=require('node:fs')
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true})
 try{
  fs.mkdirSync('.qa',{recursive:true})
  const page=await browser.newPage({viewport:{width:1920,height:1080}})
  const errors=[],external=[]
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text())})
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5173')&&!r.url().startsWith('data:'))external.push(r.url())})
  const nav=page.getByRole('navigation',{name:'系统导航'})
  const open=()=>page.getByRole('heading',{name:'交通态势推演',exact:true}).waitFor()
  const start=()=>page.getByRole('button',{name:/^(开始态势推演|重新推演)$/})
  const reset=()=>page.getByRole('button',{name:'重置',exact:true})
  const expected=[['14:00','2.3','18','K2033-K2037',[0,0,1,3,2,1,0,0]],['14:10','3.6','15','K2031-K2039',[0,0,2,3,3,1,0,0]],['14:20','5.1','12','K2029-K2041',[0,1,3,3,3,2,0,0]],['14:30','6.8','10','K2027-K2043',[0,2,3,3,3,3,0,0]]]
  const verify=async(i)=>{
   const [time,length,speed,range,states]=expected[i]
   assert.equal(await page.getByTestId('sim-time').innerText(),time)
   assert.equal(await page.getByTestId('sim-length').innerText(),length)
   assert.equal(await page.getByTestId('sim-speed').innerText(),speed)
   assert.equal(await page.getByTestId('sim-range').innerText(),range)
   assert.deepEqual(await page.locator('[data-sim-node]').evaluateAll(els=>els.map(el=>Number(el.dataset.state))),states)
   assert.equal(await page.locator(`[data-time="${time}"]`).getAttribute('aria-pressed'),'true')
   assert.ok((await page.locator('.sim-bottom .chart').getAttribute('aria-label')).includes(time))
  }
  await page.goto('http://127.0.0.1:5173/#/traffic-simulation');await open()
  assert.ok(await page.getByRole('heading',{name:'请先完成堵点分析'}).isVisible());assert.ok(await start().isDisabled())
  await page.getByRole('button',{name:'模型设计',exact:true}).click()
  assert.equal(await page.locator('.model-layers li').count(),5)
  assert.ok((await page.getByRole('dialog').innerText()).includes('不代表真实生产预测模型'))
  await page.keyboard.press('Escape')
  await page.getByRole('link',{name:'前往堵点分析',exact:true}).click()
  await page.getByRole('button',{name:'启动堵点分析',exact:true}).click();await page.locator('.congestion-conclusion').waitFor()
  await nav.getByRole('link',{name:/态势推演/}).click();await open()
  await verify(0);assert.equal(await page.locator('.sim-inputs>div').count(),8)
  assert.ok((await page.locator('.sim-source').innerText()).includes('数据来源：堵点分析结果'))
  await page.screenshot({path:'.qa/simulation-idle-1920.png',fullPage:true})
  const began=Date.now();await start().click()
  assert.ok(await page.getByRole('button',{name:'推演中',exact:true}).isDisabled())
  for(let i=1;i<4;i++){
    await page.locator(`[data-time="${expected[i][0]}"][aria-pressed="true"]`).waitFor();await verify(i)
  }
  await page.locator('.sim-conclusion h3').waitFor()
  const duration=Date.now()-began;assert.ok(duration>=5300&&duration<=8000)
  assert.ok((await page.locator('.sim-result-content').innerText()).includes('0.15 km/min'))
  assert.ok((await page.locator('.sim-result-content').innerText()).includes('45 min'))
  assert.equal(await page.locator('.sim-process .done').count(),6)
  await page.waitForTimeout(500)
  await page.screenshot({path:'.qa/simulation-complete-1920.png',fullPage:true})
  assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=1080),'1920页面超过一屏')
  for(let i=0;i<4;i++){await page.locator(`[data-time="${expected[i][0]}"]`).click();await verify(i)}
  await page.clock.install()
  await start().click();await verify(0);await page.clock.runFor(5500);await verify(3)
  await start().click();await page.clock.runFor(2000);await page.locator('[data-time="14:20"]').click();await page.clock.runFor(10000);await verify(2)
  assert.equal(await page.locator('.sim-conclusion h3').count(),0)
  for(const ms of [100,1000,2000,3000,4000,5000]){
   await start().click();await page.clock.runFor(ms);await reset().click();await page.clock.runFor(10000);await verify(0)
   assert.equal(await page.locator('.sim-process .done,.sim-process .active').count(),0)
  }
  await start().click();await page.clock.runFor(2000);await nav.getByRole('link',{name:/路网总览/}).click();await page.getByRole('heading',{name:'路网运行监测总览',exact:true}).waitFor();await page.clock.runFor(10000)
  await nav.getByRole('link',{name:/态势推演/}).click();await open();await verify(0)
  // 从轮巡实际按钮贯通到分析、推演，确认同一事件来源。
  await nav.getByRole('link',{name:/智慧轮巡/}).click();await page.getByRole('button',{name:'开始智慧轮巡',exact:true}).click();await page.clock.runFor(14020)
  await page.getByRole('button',{name:'高码流复核',exact:true}).click();await page.clock.runFor(6020)
  await nav.getByRole('link',{name:/堵点分析/}).click();await page.getByRole('button',{name:'启动堵点分析',exact:true}).click();await page.clock.runFor(4600)
  await nav.getByRole('link',{name:/态势推演/}).click();await open()
  assert.ok((await page.locator('.sim-source').innerText()).includes('智慧轮巡本轮确认事件'))
  await start().click();await page.clock.runFor(5500);await verify(3)
  // 桌面与窄屏下弹窗不越界，关闭后焦点归还。
  for(const viewport of [{width:1920,height:1080},{width:1366,height:768},{width:390,height:844}]){
   await page.setViewportSize(viewport);await page.clock.runFor(500)
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'横向溢出')
   await page.getByRole('button',{name:'模型设计',exact:true}).click()
   assert.ok(await page.getByRole('dialog').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}))
   await page.screenshot({path:`.qa/simulation-model-${viewport.width}.png`,fullPage:true})
   await page.keyboard.press('Escape')
   assert.equal(await page.evaluate(()=>document.activeElement.textContent),'模型设计')
   await page.screenshot({path:`.qa/simulation-${viewport.width}.png`,fullPage:true})
  }
  await page.setViewportSize({width:1920,height:1080})
  await nav.getByRole('link',{name:/堵点分析/}).click();await page.getByRole('button',{name:'重置分析'}).click()
  await nav.getByRole('link',{name:/态势推演/}).click();await open();assert.ok(await start().isDisabled())
  await page.reload();await open();assert.ok(await start().isDisabled())
  assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  console.log(JSON.stringify({result:'PASS',seconds:duration/1000,checks:['缺少输入保护','四时点数值及节点颜色','自动播放','图表高亮','手动中断回看','重新推演','6阶段重置','离页取消','轮巡分析推演贯通','模型设计及焦点','1920一屏','响应式','上游重置失效','刷新'],errors,external},null,2))
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exit(1)})

