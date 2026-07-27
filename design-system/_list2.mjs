import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1500,height:1000}});
const p = await ctx.newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(), {waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(700);
const data = await p.evaluate(()=>{
  const phones=[...document.querySelectorAll('.phone')];
  return phones.map((ph,i)=>{
    let c=null,par=ph.parentElement;
    for(let k=0;k<4&&par&&!c;k++){const q=par.querySelector(':scope > .scrcap');if(q)c=q.textContent.trim();par=par.parentElement;}
    const sec=ph.closest('.section');
    return `${i}\t${sec?sec.id:'-'}\t${c||''}`;
  });
});
console.log(data.join('\n'));
console.log('TOTAL', data.length);
await b.close();
