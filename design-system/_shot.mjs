import { chromium } from 'playwright';
const OUT='/private/tmp/claude-501/-Users-bs-Develop-Miden/6fdda36b-0379-4785-84b9-c1d6d62c877b/scratchpad/shots/';
const args=process.argv.slice(2);
const theme=args[0]; const name=args[1]; const idx=args[2].split(',').map(Number); const perRow=Number(args[3]||6);

const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1600,height:1200},deviceScaleFactor:2,colorScheme:theme});
const p = await ctx.newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(), {waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(1000);

const box = await p.evaluate(({idx,perRow})=>{
  const phones=[...document.querySelectorAll('.phone')];
  const caps=phones.map(ph=>{let c=null,par=ph.parentElement;for(let k=0;k<4&&par&&!c;k++){const q=par.querySelector(':scope > .scrcap');if(q)c=q.textContent.trim();par=par.parentElement;}return c;});
  const host=document.querySelector('#allscreens');
  const wrap=document.createElement('div');
  wrap.id='__sheet';
  wrap.style.cssText=`position:absolute;left:0;top:0;z-index:99999;background:var(--paper,#fff);padding:16px;display:grid;grid-template-columns:repeat(${perRow},max-content);gap:18px 14px;width:max-content;`;
  for(const i of idx){
    const cell=document.createElement('div');
    cell.style.cssText='display:flex;flex-direction:column;gap:6px;align-items:center;';
    const lab=document.createElement('div');
    lab.textContent=`[${i}] ${caps[i]||''}`;
    lab.style.cssText='font:600 11px/1.2 -apple-system,sans-serif;color:#c0392b;background:#ffe9e3;padding:3px 6px;border-radius:4px;max-width:210px;text-align:center;';
    const cl=phones[i].cloneNode(true);
    cell.appendChild(lab); cell.appendChild(cl); wrap.appendChild(cell);
  }
  host.appendChild(wrap);
  // hide siblings
  document.body.style.overflow='visible';
  [...document.querySelectorAll('body > *')].forEach(el=>{ if(!el.contains(host)) el.style.visibility='hidden'; });
  [...host.children].forEach(el=>{ if(el!==wrap) el.style.display='none'; });
  host.style.cssText='position:absolute;left:0;top:0;padding:0;margin:0;';
  window.scrollTo(0,0);
  const r=wrap.getBoundingClientRect();
  return {x:r.x,y:r.y,w:r.width,h:r.height};
},{idx,perRow});

await p.setViewportSize({width:Math.min(2400,Math.ceil(box.w)+40),height:Math.min(4000,Math.ceil(box.h)+40)});
await p.waitForTimeout(400);
const el = await p.$('#__sheet');
await el.screenshot({path:OUT+name+'-'+theme+'.png'});
console.log('wrote',OUT+name+'-'+theme+'.png',JSON.stringify(box));
await b.close();
