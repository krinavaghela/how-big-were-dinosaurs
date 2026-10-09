// node tools/shot.js <outPrefix> <w>x<h> [dark] film:t1,t2 explore:i1,i2
const { launch } = require('./pptr'), path = require('path');
(async () => {
  const [prefix, size, ...rest] = process.argv.slice(2); const [w, h] = size.split('x').map(Number);
  const b = await launch();
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  if (rest.includes('dark')) await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  p.on('console', m => console.log('[page]', m.text())); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html#record')); await p.evaluate(() => document.fonts.ready);
  for (const spec of rest.filter(r => r.includes(':'))) {
    const [kind, list] = spec.split(':');
    for (const v of list.split(',')) {
      if (kind === 'film') await p.evaluate(t => window.renderAt(+t), v);
      else { await p.evaluate(i => window.exploreAt(+i), v); }
      await p.screenshot({ path: `${prefix}_${kind}${v}.png` });
    }
  }
  console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth), 'film length', await p.evaluate(() => window.FILM_LENGTH));
  await b.close();
})();
