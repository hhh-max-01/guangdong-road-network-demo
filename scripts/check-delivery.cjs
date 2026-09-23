const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const assert=require('node:assert/strict'),fs=require('node:fs')
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true})
 try{
  const page=await browser.newPage({viewport:{width:1920,height:1080}})
  const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())})
  await page.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();external.push(r.request().url());return r.abort()})
  await page.goto('http://127.0.0.1:5173/');await page.getByRole('heading',{name:'路网运行监测总览',exact:true}).waitFor();await page.clock.install()
  const nav=page.getByRole('navigation',{name:'系统导航'}),go=async(name,title=name)=>{await nav.getByRole('link',{name:new RegExp(name)}).click();await page.getByRole('heading',{name:title,exact:true}).waitFor()}
  const btn=name=>page.getByRole('button',{name,exact:true})
  const modal=()=>page.getByRole('dialog')
  fs.mkdirSync('report-assets/screenshots',{recursive:true})
  async function shot(n,dialog=false){
   if(!dialog)await btn('截图模式').click()
   await page.clock.runFor(550)
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=1920))
   assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=1080),'截图页面超出1080高度 '+n)
   await page.screenshot({path:`report-assets/screenshots/${String(n).padStart(2,'0')}.png`,fullPage:true})
   if(!dialog)await btn('退出截图模式').click()
  }
  await btn('系统说明').click();assert.ok((await modal().innerText()).includes('视频资源编目'));await page.keyboard.press('Escape')
  for(let run=0;run<2;run++){
   await btn('重置演示数据').click();await btn('取消').click()
   if(!run)await shot(1)
   await go('视频编目','视频编目管理');assert.ok((await page.locator('.catalog-stats').innerText()).includes('15'))
   if(!run)await shot(2)
   await btn('＋ 新增视频').click();await modal().getByLabel('城市 *',{exact:true}).selectOption('广州市');await modal().getByLabel('道路 *',{exact:true}).selectOption('G4京港澳高速');await modal().getByLabel('桩号 *',{exact:true}).fill('K2035');await modal().getByLabel('视频名称 *',{exact:true}).fill('交付验收新增资源');await modal().getByRole('button',{name:'生成编码',exact:true}).click()
   if(!run)await shot(3,true)
   await modal().getByRole('button',{name:'保存',exact:true}).click();assert.ok((await page.locator('.catalog-stats').innerText()).includes('16'))
   await go('智慧轮巡');assert.equal(await page.locator('.monitor-card[data-state="idle"]').count(),4)
   await btn('开始智慧轮巡').click();await page.clock.runFor(400)
   if(!run)await shot(4)
   await page.clock.runFor(14500);assert.equal(await page.locator('[data-state="normal"]').count(),3);assert.equal(await page.locator('[data-state="suspected"]').count(),1);assert.ok((await page.locator('.incident-box').innerText()).includes('96%'))
   if(!run)await shot(5)
   await btn('高码流复核').click();await page.clock.runFor(6100);assert.equal(await page.locator('[data-state="confirmed"]').count(),1);assert.ok((await page.locator('.incident-box').innerText()).includes('99%'));assert.ok((await page.locator('.bandwidth-content').innerText()).includes('5.5'))
   if(!run)await shot(6)
   await go('堵点分析');await btn('启动堵点分析').click();await page.clock.runFor(4700);assert.equal(await page.locator('.congestion-conclusion').count(),1)
   if(!run){await shot(7);await shot(8)}
   await go('智慧轮巡');assert.equal(await page.locator('[data-state="confirmed"]').count(),1)
   await go('堵点分析');assert.equal(await page.locator('.congestion-conclusion').count(),1)
   await go('态势推演','交通态势推演');await btn('开始态势推演').click();await page.clock.runFor(5500);assert.equal(await page.getByTestId('sim-time').innerText(),'14:30')
   if(!run){await page.locator('[data-time="14:10"]').click();await shot(9);await btn('重新推演').click();await page.clock.runFor(5500);await shot(10)}
   await page.reload();await page.getByRole('heading',{name:'交通态势推演',exact:true}).waitFor();assert.equal(await page.getByTestId('sim-time').innerText(),'14:30')
   await btn('重置演示数据').click();await btn('取消').click();assert.equal(await page.getByTestId('sim-time').innerText(),'14:30')
   await btn('重置演示数据').click();assert.ok((await modal().innerText()).includes('确定重置全部演示数据？'));await btn('确认重置').click();await page.getByRole('heading',{name:'路网运行监测总览',exact:true}).waitFor();assert.ok((await page.locator('.demo-guide').innerText()).includes('步骤1/6'))
   await go('态势推演','交通态势推演');assert.equal(await page.getByTestId('sim-time').count(),0)
   await go('路网总览','路网运行监测总览')
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(JSON.stringify({result:'PASS',completeRuns:2,screenshots:10,errors,external}))
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exit(1)})

