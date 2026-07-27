import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1500,height:1000},colorScheme:'light'});
const p = await ctx.newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(), {waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(800);
const out = await p.evaluate(()=>{
  const phones=[...document.querySelectorAll('.phone')];
  const caps=phones.map(ph=>{let c=null,par=ph.parentElement;for(let k=0;k<4&&par&&!c;k++){const q=par.querySelector(':scope > .scrcap');if(q)c=q.textContent.trim();par=par.parentElement;}return c;});
  const isAccent = cs => { const m=cs.backgroundColor.match(/\d+/g); if(!m) return false; const [r,g,bl]=m.map(Number); return Math.abs(r-231)<30 && Math.abs(g-117)<40 && Math.abs(bl-55)<40; };
  const res=[];
  phones.forEach((ph,i)=>{
    const z = parseFloat(getComputedStyle(ph).zoom)||1;
    [...ph.querySelectorAll('button, .btn, [class*=btn], a')].forEach(el=>{
      const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      if(r.width<80||r.height<20) return;
      const txt=(el.textContent||'').trim().slice(0,28);
      if(!txt) return;
      res.push({i,cap:caps[i],txt,bg:cs.backgroundColor,fg:cs.color,h:+(r.height/z).toFixed(1),w:+(r.width/z).toFixed(1),rad:cs.borderRadius,bw:cs.borderTopWidth,accent:isAccent(cs)});
    });
  });
  return res;
});
const acc = out.filter(o=>o.accent);
console.log('=== ACCENT-FILLED CONTROLS ===');
const seen=new Set();
for(const o of acc){const k=o.txt+o.fg+o.h; if(seen.has(k))continue; seen.add(k); console.log(`[${o.i}] ${o.cap} | "${o.txt}" fg=${o.fg} h=${o.h} rad=${o.rad}`);}
console.log('\n=== ALL BIG CONTROLS heights/radii (dedup by cap+txt) ===');
const s2=new Set();
for(const o of out){const k=o.i+o.txt; if(s2.has(k))continue; s2.add(k); if(o.h>=32) console.log(`[${o.i}] ${o.cap} | "${o.txt}" h=${o.h} w=${o.w} rad=${o.rad} bw=${o.bw} bg=${o.bg}`);}
await b.close();
