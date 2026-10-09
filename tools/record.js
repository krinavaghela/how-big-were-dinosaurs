// node tools/record.js [out.mp4] [fps=30] [dark]
// Renders the film deterministically (window.renderAt) and streams JPEG frames straight into ffmpeg (no frame files on disk).
const { launch } = require('./pptr'), path = require('path'), { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
(async () => {
  const out = path.resolve(process.argv[2] || path.join(__dirname, '../How Big Were Dinosaurs.mp4'));
  const fps = +(process.argv[3] || 30), dark = process.argv.includes('dark');
  const b = await launch(); const p = await b.newPage();
  await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
  p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html#record')); await p.evaluate(() => document.fonts.ready);
  const len = await p.evaluate(() => window.FILM_LENGTH), n = Math.ceil(len * fps);
  const ff = spawn(ffmpeg, ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    await p.evaluate(t => window.renderAt(t), f / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.log('wrote', out);
})();
