import { chromium } from 'playwright';
for (const theme of ['light','dark']) {
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1500,height:1000},colorScheme:theme});
const p = await ctx.newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(), {waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(600);
const out = await p.evaluate(()=>{
  const r={};
  const root=getComputedStyle(document.documentElement);
  ['--accent','--on-accent','--accent-strong','--accent-press','--ink','--paper','--surface','--ok','--warn','--danger','--info'].forEach(v=>{const x=root.getPropertyValue(v).trim(); if(x) r[v]=x;});
  return r;
});
console.log(theme, JSON.stringify(out,null,0));
await b.close();
}
