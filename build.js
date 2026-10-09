// node build.js  ->  writes index.html from src/app.html + data.json + art/*.svg
const fs = require('fs'), path = require('path');
const dir = __dirname;

const DEV_ROSTER = [['beehummingbird',5.5],['anchiornis',34],['archaeopteryx',50],['microraptor',77],['eoraptor',100],
  ['compsognathus',125],['velociraptor',180],['protoceratops',180],['coelophysis',300],['deinonychus',340],
  ['pachycephalosaurus',450],['ankylosaurus',700],['dilophosaurus',700],['triceratops',850],['allosaurus',850],
  ['stegosaurus',900],['parasaurolophus',950],['trex',1230],['spinosaurus',1400],['shantungosaurus',1500],
  ['brachiosaurus',2000],['diplodocus',2500],['patagotitan',3100],['argentinosaurus',3500]];

let data;
if (fs.existsSync(path.join(dir, 'data.json'))) data = JSON.parse(fs.readFileSync(path.join(dir, 'data.json'), 'utf8'));
else data = DEV_ROSTER.map(([id, L]) => ({ id, name: id, sci: id, length_cm: L, length: L / 100 + ' m', height: '?', mass: '?', ma: [100, 90], period: 'Cretaceous', place: '?', diet: '?', fact: 'Placeholder.', sources: [] }))
  .concat([{ id: 'asteroid', name: 'Chicxulub impactor' }]);

const REFS = { human: 175, bus: 1200, everest: 884900, asteroid: 1000000 };
const ids = ['human', 'bus', ...data.filter(d => d.id !== 'asteroid').map(d => d.id), 'everest', 'asteroid'];

function placeholder(id, L) {
  const h = id === 'asteroid' ? 900 : (id === 'human' || id === 'everest') ? 1000 : 300;
  const w = id === 'everest' ? 2200 : id === 'human' ? 280 : 1000;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${-h} ${w} ${h}" data-length-cm="${L}"><path class="f o" d="M10,-10 Q${w / 2},${-h * 1.6} ${w - 10},-10 Z"/></svg>`;
}

const meta = {}; let art = ''; const missing = [];
for (const id of ids) {
  const d = data.find(x => x.id === id);
  const L = REFS[id] || d.length_cm;
  const f = path.join(dir, 'art', id + '.svg');
  let s = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : (missing.push(id), placeholder(id, L));
  s = s.replace(/<\?xml[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<style[\s\S]*?<\/style>/g, '').trim();
  const m = s.match(/<svg\b([^>]*)>/);
  const vb = m[1].match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number);
  const len = +(m[1].match(/data-length-cm="([^"]+)"/) || [0, L])[1];
  if (Math.abs(len - L) / L > 0.01) console.warn(`! ${id}: art says ${len} cm, data says ${L} cm`);
  s = s.replace(m[0], `<svg id="art-${id}" class="art" viewBox="${vb.join(' ')}" preserveAspectRatio="none" overflow="visible">`)
       .replace(/\s*\n\s*/g, '\n');
  meta[id] = { vb, len: L };
  art += s + '\n';
}

const tpl = fs.readFileSync(path.join(dir, 'src', 'app.html'), 'utf8');
const out = tpl.replace('/*__DATA__*/', () => `const DATA=${JSON.stringify(data)};\nconst ART=${JSON.stringify(meta)};`)
               .replace('<!--__ART__-->', () => art);
fs.writeFileSync(path.join(dir, 'index.html'), out);
console.log(`index.html ${(out.length / 1024).toFixed(0)} KB` + (missing.length ? `  (placeholders: ${missing.join(', ')})` : ''));
