const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const assert=require('node:assert/strict')
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true})
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[]
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text())})
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)})
  await page.goto('http://127.0.0.1:4173/');await page.clock.install()
  for(const [path,title] of [['/','路网运行监测总览'],['/video-catalog','视频编目管理'],['/smart-patrol','智慧轮巡'],['/congestion-analysis','堵点分析'],['/traffic-simulation','交通态势推演']]){
   await page.goto('http://127.0.0.1:4173/#'+path);await page.getByRole('heading',{name:title,exact:true}).waitFor()
   await page.reload();await page.getByRole('heading',{name:title,exact:true}).waitFor()
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  }
  await page.getByRole('button',{name:'进入演示模式',exact:true}).click()
  const guide=page.getByRole('region',{name:'全流程演示引导'}),next=()=>guide.getByRole('button',{name:'下一步',exact:true})
  await next().click();await page.getByRole('heading',{name:'视频编目管理',exact:true}).waitFor()
  await next().click();await page.getByRole('button',{name:'开始智慧轮巡',exact:true}).click();await page.clock.runFor(14020)
  await next().click();await page.getByRole('button',{name:'高码流复核',exact:true}).click();await page.clock.runFor(6020)
  await next().click();await page.getByRole('button',{name:'启动堵点分析',exact:true}).click();await page.clock.runFor(4600)
  await next().click();await page.getByRole('button',{name:'开始态势推演',exact:true}).click();await page.clock.runFor(5500)
  assert.equal(await page.getByTestId('sim-length').innerText(),'6.8')
  await page.reload();await page.getByRole('heading',{name:'交通态势推演',exact:true}).waitFor();assert.equal(await page.getByTestId('sim-length').innerText(),'6.8')
  await guide.getByRole('button',{name:'重新演示',exact:true}).click();await page.getByRole('heading',{name:'路网运行监测总览',exact:true}).waitFor()
  // 损坏的会话检查点不可造成白屏。
  await page.evaluate(()=>{for(const key of ['guide','confirmed-event','congestion','simulation-complete'])sessionStorage.setItem('road-demo-v1:'+key,'{broken')})
  await page.reload();await page.getByRole('heading',{name:'路网运行监测总览',exact:true}).waitFor()
  assert.equal(await guide.count(),0)
  assert.deepEqual(errors,[])
  console.log(JSON.stringify({result:'PASS',checks:['生产构建五路由及刷新','1366无横向溢出','生产版六步闭环','F5恢复完成记录','重新演示','损坏检查点安全回退'],errors},null,2))
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exit(1)})
