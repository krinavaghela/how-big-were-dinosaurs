// node tools/sheet.js out.png [dark]  - contact sheet of every plate (each fitted to its cell, not to scale)
const { launch } = require('./pptr'), path = require('path'), fs = require('fs');
(async () => {
  const [out] = process.argv.slice(2), dark = process.argv.includes('dark');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const b = await launch(); const p = await b.newPage(); await p.setViewport({ width: 2000, height: 1400 });
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
  await p.goto('file://' + path.resolve(__dirname, '../index.html#record'));
  await p.evaluate(() => {
    const arts = [...document.querySelectorAll('#cam > svg.art')];
    const grid = document.createElement('div'); grid.className = 'dino';
    grid.style.cssText = 'position:fixed;inset:0;z-index:99;background:var(--paper);display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:10px';
    for (const a of arts) {
      const c = document.createElement('div'); c.style.cssText = 'border:1px solid var(--rule);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:6px;font:12px monospace;color:var(--ink);height:262px;box-sizing:border-box';
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', a.getAttribute('viewBox'));
      s.innerHTML = a.innerHTML; s.style.cssText = 'width:100%;height:230px;overflow:visible'; s.setAttribute('preserveAspectRatio', 'xMidYMax meet');
      c.append(s, a.id.replace('art-', '')); grid.append(c);
    }
    document.body.append(grid);
  });
  await p.screenshot({ path: out }); await b.close();
})();
