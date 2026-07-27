import { chromium } from 'playwright';
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1200}})).newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(),{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(()=>{
  const ph=document.querySelectorAll('.phone')[8];
  const r=ph.getBoundingClientRect();
  const all=[...ph.querySelectorAll('*')].filter(e=>e.children.length===0 && (e.textContent||'').trim());
  const t=all.find(e=>/Welcome/.test(e.textContent))||all[0];
  return {phoneRect:[Math.round(r.width),Math.round(r.height)], zoom:getComputedStyle(ph).zoom,
    sample:t?{txt:t.textContent.trim().slice(0,20),fs:getComputedStyle(t).fontSize,h:t.getBoundingClientRect().height}:null,
    n:all.length};
}),null,1));
await b.close();
