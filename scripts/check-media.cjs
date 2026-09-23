// 临时生成纯色MP4验证素材接入，完成后只清理本脚本创建的文件。
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict')
async function main(){
 const file=path.resolve('public/videos/cam001.mp4');assert.ok(!fs.existsSync(file),'已有用户素材，请勿覆盖')
 const browser=await chromium.launch({channel:'chrome',headless:true});let created=false
 try{
  const page=await browser.newPage()
  const bytes=await page.evaluate(async()=>{
   const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180
   document.body.appendChild(canvas);const ctx=canvas.getContext('2d');ctx.fillStyle='#224455';ctx.fillRect(0,0,320,180)
   const stream=canvas.captureStream(10),chunks=[]
   const mime='video/mp4;codecs=avc1.42001E';if(!MediaRecorder.isTypeSupported(mime))throw Error('MP4 recording unavailable')
   const recorder=new MediaRecorder(stream,{mimeType:mime})
   const done=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=resolve})
   recorder.start();const paint=setInterval(()=>{ctx.fillStyle=`rgb(${Date.now()%255},60,90)`;ctx.fillRect(0,0,320,180);stream.getVideoTracks()[0].requestFrame()},50)
   await new Promise(r=>setTimeout(r,1500));recorder.stop();await done;clearInterval(paint);stream.getTracks().forEach(t=>t.stop())
   return Array.from(new Uint8Array(await new Blob(chunks,{type:'video/mp4'}).arrayBuffer()))
  })
  assert.ok(bytes.length>100,'Recording produced no frames');fs.writeFileSync(file,Buffer.from(bytes),{flag:'wx'});created=true
  await page.goto('http://127.0.0.1:5173/#/smart-patrol');await page.getByRole('heading',{name:'智慧轮巡',exact:true}).waitFor()
  await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2)
  assert.equal(await page.locator('video').count(),1);assert.equal(await page.locator('.road-scene').count(),3)
  assert.ok(await page.locator('video').evaluate(v=>v.videoWidth===320&&!v.paused))
  await page.route('**/videos/cam001.mp4',r=>r.fulfill({status:200,contentType:'video/mp4',body:'invalid media fixture'}))
  await page.reload();await page.waitForFunction(()=>document.querySelectorAll('.road-scene').length===4)
  assert.ok((await page.locator('[data-camera="CAM001"]').innerText()).includes('素材不可用'))
  console.log(JSON.stringify({result:'PASS',oneMP4:1,unmatchedFallback:3,brokenMediaFallback:true}))
 }finally{await browser.close();if(created)fs.unlinkSync(file)}
}
main().catch(e=>{console.error(e);process.exit(1)})
