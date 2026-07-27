import { chromium } from 'playwright';
const theme=process.argv[2]||'light';
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1600,height:1200},colorScheme:theme})).newPage();
await p.goto('http://localhost:4599/index.html?cb='+Date.now(),{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.section').forEach(s=>s.classList.add('active')));
await p.waitForTimeout(900);
const out=await p.evaluate(()=>{
  const Z=0.5, R=[];
  const phones=[...document.querySelectorAll('.phone')];
  const cap=ph=>{let c=null,par=ph.parentElement;for(let k=0;k<4&&par&&!c;k++){const q=par.querySelector(':scope > .scrcap');if(q)c=q.textContent.trim();par=par.parentElement;}return c;};
  const arial=[], errs=[], gaps=[], tracks=[];
  phones.forEach((ph,i)=>{
    const c=cap(ph); if(!c) return;
    const pr=ph.getBoundingClientRect();
    [...ph.querySelectorAll('*')].forEach(e=>{
      const cs=getComputedStyle(e), r=e.getBoundingClientRect();
      if(r.width<1) return;
      const leaf=e.children.length===0&&(e.textContent||'').trim();
      if(leaf&&/Arial|serif$/i.test(cs.fontFamily.split(',')[0].replace(/["']/g,'')))
        arial.push({i,c,txt:e.textContent.trim().slice(0,24),ff:cs.fontFamily});
      if(leaf){
        const t=e.textContent.trim();
        if(/don't match|failed|already exists|isn't in the Miden|Not sent|Failed|Public on Base|Very strong|Low$|match!/i.test(t))
          errs.push({i,c,txt:t.slice(0,44),color:cs.color,fs:cs.fontSize});
      }
    });
    // progress track: direct children all short bars
    [...ph.querySelectorAll('*')].forEach(e=>{
      const ch=[...e.children]; if(ch.length<2||ch.length>9) return;
      if(!ch.every(x=>{const r=x.getBoundingClientRect();return r.height>0&&r.height/Z<8&&r.width/Z>16&&!x.children.length;})) return;
      tracks.push({i,c,n:ch.length});
    });
    // dead space: bottom-most CTA-ish button vs bottom-most content above it
    const btns=[...ph.querySelectorAll('button,.btn,[class*=cta]')].filter(e=>{const r=e.getBoundingClientRect();return r.height/Z>40&&r.width/Z>150;});
    if(btns.length){
      const cta=btns[btns.length-1], cr=cta.getBoundingClientRect();
      let maxB=-1, who='';
      [...ph.querySelectorAll('*')].forEach(e=>{
        if(cta.contains(e)||e.contains(cta)) return;
        const r=e.getBoundingClientRect();
        if(r.width<2||r.height<2) return;
        if(r.bottom<=cr.top && r.bottom>maxB && r.top>pr.top+30){maxB=r.bottom;who=(e.textContent||e.className||'').trim().slice(0,20);}
      });
      if(maxB>0) gaps.push({i,c,gap:Math.round((cr.top-maxB)/Z),after:who});
    }
  });
  return {arial,errs,gaps,tracks};
});
console.log('--- ARIAL / fallback glyphs ---');
[...new Map(out.arial.map(a=>[a.i+a.txt,a])).values()].forEach(a=>console.log(` [${a.i}] ${a.c} :: "${a.txt}"`));
console.log('\n--- STATUS / ERROR text colours ---');
out.errs.forEach(e=>console.log(` [${e.i}] ${e.c}\n      "${e.txt}"  ${e.color}  ${e.fs}`));
console.log('\n--- PROGRESS TRACK SEGMENT COUNTS ---');
[...new Map(out.tracks.map(t=>[t.i,t])).values()].forEach(t=>console.log(` [${t.i}] ${t.c} => ${t.n} segments`));
console.log('\n--- DEAD SPACE above bottom CTA (real px) ---');
out.gaps.sort((a,b)=>b.gap-a.gap).forEach(g=>console.log(` ${String(g.gap).padStart(4)}px  [${g.i}] ${g.c}   (after: "${g.after}")`));
await b.close();
