import { chromium } from 'playwright';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1500,height:1100}});
await p.goto('http://localhost:4599/#allscreens',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(700);
const css = await p.evaluate(()=>{const out=[];
  for(const s of document.styleSheets){try{for(const r of s.cssRules){
    if(r.selectorText&&/\.glogo|\.gcard|\.band/.test(r.selectorText)) out.push(r.cssText);}}catch(e){}}
  return out;});
console.log(css.join('\n\n'));
