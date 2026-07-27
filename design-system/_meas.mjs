import { chromium } from 'playwright';
const theme=process.argv[2]||'light';
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1600,height:1200},colorScheme:theme})).newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(),{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(900);
const out=await p.evaluate(()=>{
  const Z=0.5;
  const phones=[...document.querySelectorAll('.phone')];
  const cap=ph=>{let c=null,par=ph.parentElement;for(let k=0;k<4&&par&&!c;k++){const q=par.querySelector(':scope > .scrcap');if(q)c=q.textContent.trim();par=par.parentElement;}return c;};
  const glob={sizes:{},radii:{},fams:{}};
  const res=[];
  phones.forEach((ph,i)=>{
    const c=cap(ph); if(!c) return;
    // detect scrim: element with rgba black bg covering most of frame
    const scrim=[...ph.querySelectorAll('*')].find(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();const pr=ph.getBoundingClientRect();return /rgba\(0, 0, 0/.test(s.backgroundColor)&&r.height>pr.height*0.5;});
    const scrimTop=scrim?scrim.getBoundingClientRect().top:null;
    const behind=e=>{ if(!scrim) return false; return scrim.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_PRECEDING && !scrim.contains(e); };
    const sizes={},radii={},fams={};
    [...ph.querySelectorAll('*')].forEach(e=>{
      const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      if(r.width<1||r.height<1) return;
      if(cs.opacity!=='1'&&parseFloat(cs.opacity)<0.5) return;
      if(behind(e)) return;
      if(e.children.length===0 && (e.textContent||'').trim()){
        const fs=Math.round(parseFloat(cs.fontSize)*10)/10;
        sizes[fs]=(sizes[fs]||0)+1; glob.sizes[fs]=(glob.sizes[fs]||0)+1;
        const f=cs.fontFamily.split(',')[0].replace(/["']/g,'');
        fams[f]=(fams[f]||0)+1; glob.fams[f]=(glob.fams[f]||0)+1;
      }
      if(r.width/Z>=16&&r.height/Z>=16&&!e.classList.contains('phone')){
        const br=cs.borderTopLeftRadius;
        if(br!=='0px'&&!br.includes('%')){
          const v=Math.round(parseFloat(br));
          const min=Math.min(r.width,r.height)/Z;
          if(v<min/2-1){ radii[v]=(radii[v]||0)+1; glob.radii[v]=(glob.radii[v]||0)+1; }
        }
      }
    });
    res.push({i,cap:c,sizes:Object.keys(sizes).map(Number).sort((a,b)=>b-a),radii:Object.keys(radii).map(Number).sort((a,b)=>a-b),fams:Object.keys(fams)});
  });
  return {res,glob};
});
console.log('=== GLOBAL font sizes (count) ===');
console.log(Object.entries(out.glob.sizes).sort((a,b)=>b[0]-a[0]).map(([k,v])=>`${k}px×${v}`).join('  '));
console.log('=== GLOBAL radii (count) ===');
console.log(Object.entries(out.glob.radii).sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k}px×${v}`).join('  '));
console.log('=== GLOBAL families ===');
console.log(Object.entries(out.glob.fams).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}×${v}`).join('  '));
console.log('\n=== PER SCREEN ===');
for(const r of out.res) console.log(`[${r.i}] ${r.cap}\n    type(${r.sizes.length}): ${r.sizes.join(', ')}   radii: ${r.radii.join(', ')}   fams: ${r.fams.join('/')}`);
await b.close();
