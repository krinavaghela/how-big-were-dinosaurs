// usage: node tools/snap.js <art.svg> <out.png> [widthPx=1400]
// Renders one plate on parchment with a true-scale centimetre/metre grid behind it.
const { launch } = require('./pptr'), path = require('path'), fs = require('fs');
(async()=>{
  const [file,out,wArg]=process.argv.slice(2);
  const src=fs.readFileSync(file,'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../art/ink.css'),'utf8');
  const b=await launch();
  const p=await b.newPage(); await p.setViewport({width:+(wArg||1400)+80,height:900,deviceScaleFactor:1});
  p.on('pageerror',e=>console.log('[err]',e.message));
  await p.setContent(`<!doctype html><style>body{margin:0;background:#ece2cb;font:12px Georgia}${css}
  #wrap{position:relative;margin:40px}#grid{position:absolute;inset:0}</style><div id=wrap><svg id=grid></svg><div class=dino id=art>${src}</div></div><pre id=info></pre>
  <script>
  const W=${+(wArg||1400)}, svg=document.querySelector('#art svg');
  const vb=svg.getAttribute('viewBox').split(/[ ,]+/).map(Number);
  const L=+svg.getAttribute('data-length-cm'); const cmPerU=L/1000;
  const pxPerU=W/vb[2]; svg.setAttribute('width',W); svg.setAttribute('height',vb[3]*pxPerU); svg.style.overflow='visible';
  const H=vb[3]*pxPerU, g=document.getElementById('grid'); g.setAttribute('width',W); g.setAttribute('height',H);
  const pxPerCm=pxPerU/cmPerU; const steps=[0.1,0.5,1,5,10,25,50,100,200,500,1000,5000,10000,50000,100000,500000];
  const step=steps.find(s=>s*pxPerCm>=40)||500000; let s='';
  const x0=-vb[0]*pxPerU, y0=(-vb[1])*pxPerU;
  const lab=c=>Math.abs(c)>=100000?(c/100000)+'km':Math.abs(c)>=100?(c/100)+'m':c+'cm';
  for(let x=x0%(step*pxPerCm);x<=W;x+=step*pxPerCm){const c=Math.round((x-x0)/pxPerCm*10)/10;
    s+='<line x1='+x+' x2='+x+' y1=0 y2='+H+' stroke="#c9b48a" stroke-width=.6 /><text x='+(x+2)+' y=10 fill="#9a8560">'+lab(c)+'</text>';}
  for(let c=0;c*pxPerCm<=H;c+=step){const y=y0-c*pxPerCm; if(y<0)break; s+='<line x1=0 x2='+W+' y1='+y+' y2='+y+' stroke="'+(c==0?'#8a7350':'#c9b48a')+'" stroke-width='+(c==0?1.4:.6)+' /><text x=2 y='+(y-2)+' fill="#9a8560">'+lab(c)+'</text>';}
  g.innerHTML=s;
  document.getElementById('info').textContent='length '+L+'cm  viewBox '+vb.join(' ')+'  => drawn extent '+(vb[2]*cmPerU).toFixed(1)+'cm wide x '+(vb[3]*cmPerU).toFixed(1)+'cm tall   grid step '+step+'cm   '+${JSON.stringify(path.basename(file))}+' '+${src.length}+' bytes';
  </script>`);
  await p.screenshot({path:out,fullPage:true});
  console.log(await p.$eval('#info',e=>e.textContent));
  await b.close();
})();
