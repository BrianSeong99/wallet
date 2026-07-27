import { chromium } from 'playwright';
const OUT='/private/tmp/claude-501/-Users-bs-Develop-Miden/6fdda36b-0379-4785-84b9-c1d6d62c877b/scratchpad/shots/';
const theme=process.argv[2], name=process.argv[3], idx=process.argv[4].split(',').map(Number);
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1900,height:1100},deviceScaleFactor:2,colorScheme:theme})).newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(),{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(900);
const box=await p.evaluate(idx=>{
  const phones=[...document.querySelectorAll('.phone')];
  const cap=ph=>{let c=null,par=ph.parentElement;for(let k=0;k<4&&par&&!c;k++){const q=par.querySelector(':scope > .scrcap');if(q)c=q.textContent.trim();par=par.parentElement;}return c;};
  const host=document.querySelector('#allscreens');
  const wrap=document.createElement('div'); wrap.id='__sheet';
  wrap.style.cssText='position:absolute;left:0;top:0;z-index:99999;background:var(--paper,#fff);padding:14px;display:flex;gap:14px;align-items:flex-start;width:max-content;';
  for(const i of idx){
    const cell=document.createElement('div'); cell.style.cssText='display:flex;flex-direction:column;gap:5px;align-items:center;';
    const lab=document.createElement('div'); lab.textContent=`[${i}] ${cap(phones[i])||''}`;
    lab.style.cssText='font:600 13px/1.2 -apple-system,sans-serif;color:#c0392b;background:#ffe9e3;padding:3px 7px;border-radius:4px;';
    const cl=phones[i].cloneNode(true); cl.style.zoom='1';
    cell.appendChild(lab); cell.appendChild(cl); wrap.appendChild(cell);
  }
  host.appendChild(wrap);
  [...document.querySelectorAll('body > *')].forEach(el=>{if(!el.contains(host))el.style.visibility='hidden';});
  [...host.children].forEach(el=>{if(el!==wrap)el.style.display='none';});
  host.style.cssText='position:absolute;left:0;top:0;padding:0;margin:0;';
  window.scrollTo(0,0);
  const r=wrap.getBoundingClientRect(); return {w:r.width,h:r.height};
},idx);
await p.setViewportSize({width:Math.min(3000,Math.ceil(box.w)+30),height:Math.min(2400,Math.ceil(box.h)+30)});
await p.waitForTimeout(350);
await (await p.$('#__sheet')).screenshot({path:OUT+name+'-'+theme+'.png'});
console.log('ok',name,theme,box.w,box.h);
await b.close();
