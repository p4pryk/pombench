import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('public');
const assets = path.join(root, 'assets');
fs.mkdirSync(assets, {recursive: true});
const run = (cmd, args) => execFileSync(cmd, args, {stdio: 'inherit'});
const sizeOf = file => execFileSync('identify', ['-format', '%w %h', file], {encoding: 'utf8'}).trim().split(' ').map(Number);

run('rsvg-convert', ['-w', '512', '-h', '512', path.join(root, 'favicon.svg'), '-o', path.join(assets, 'logo-512.png')]);
run('rsvg-convert', ['-w', '192', '-h', '192', path.join(root, 'favicon.svg'), '-o', path.join(assets, 'logo-192.png')]);
run('rsvg-convert', ['-w', '180', '-h', '180', path.join(root, 'favicon.svg'), '-o', path.join(root, 'apple-touch-icon.png')]);
run('convert', ['-background', 'none', path.join(root, 'favicon.svg'), '-define', 'icon:auto-resize=48,32,16', path.join(root, 'favicon.ico')]);
run('cwebp', ['-q', '82', '-resize', '800', '0', path.join(assets, 'pomeranian-hero.webp'), '-o', path.join(assets, 'pomeranian-hero-800.webp')]);

const catalog = JSON.parse(fs.readFileSync(path.join(root, 'results/index.json'), 'utf8'));
const published = catalog.models.filter(m => m.status === 'captured' && m.video && m.poster);
for (const model of published) {
  const poster = path.join(root, model.poster.replace(/^\//, ''));
  const [width] = sizeOf(poster);
  const dir = path.dirname(poster);
  if (width >= 960) {
    run('cwebp', ['-q', '80', '-resize', '960', '0', poster, '-o', path.join(dir, 'poster-960.webp')]);
    run('cwebp', ['-q', '80', '-resize', '480', '0', poster, '-o', path.join(dir, 'poster-480.webp')]);
  } else if (width > 480) {
    run('cwebp', ['-q', '80', poster, '-o', path.join(dir, 'poster-960.webp')]);
    run('cwebp', ['-q', '80', '-resize', '480', '0', poster, '-o', path.join(dir, 'poster-480.webp')]);
  } else {
    run('cwebp', ['-q', '80', poster, '-o', path.join(dir, 'poster-960.webp')]);
    run('cwebp', ['-q', '80', poster, '-o', path.join(dir, 'poster-480.webp')]);
  }
  console.log(model.id, width);
}

const newest = [...published].sort((a, b) => (b.releasedAt ?? '').localeCompare(a.releasedAt ?? '') || a.name.localeCompare(b.name)).slice(0, 4);
const font = fs.existsSync('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') ? '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' : 'DejaVu-Sans';
const fontRegular = fs.existsSync('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') ? '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf' : 'DejaVu-Sans';
const n = published.length;
run('convert', [
  '-size', '1200x630', 'xc:#f4f6f1',
  '(', path.join(assets, 'pomeranian-hero.webp'), '-resize', '520x630^', '-gravity', 'center', '-extent', '520x630', ')', '-gravity', 'east', '-composite',
  '-fill', '#f4f6f1', '-draw', 'rectangle 0,0 700,630',
  '(', path.join(assets, 'logo-512.png'), '-resize', '88x88', ')', '-gravity', 'northwest', '-geometry', '+56+48', '-composite',
  '-font', font, '-fill', '#26332d', '-pointsize', '48', '-gravity', 'northwest', '-annotate', '+56+180', 'AI coding benchmark',
  '-font', fontRegular, '-fill', '#52624a', '-pointsize', '28', '-annotate', '+56+250', `${n} LLMs · one animation`,
  '-strip', '-quality', '82', path.join(assets, 'og-pombench-1200x630.jpg'),
]);
const row = path.join(assets, 'og-compare-row.png');
run('convert', [
  ...newest.map(model => path.join(root, model.poster.replace(/^\//, ''))),
  '-resize', '270x152^', '-gravity', 'center', '-extent', '270x152', '+append', row,
]);
run('convert', [
  '-size', '1200x630', 'xc:#26332d', row, '-gravity', 'center', '-geometry', '+0+48', '-composite',
  '-font', font, '-fill', '#f7f8f4', '-pointsize', '48', '-gravity', 'north', '-annotate', '+0+36', 'AI model comparison',
  '-font', fontRegular, '-pointsize', '22', '-fill', '#d5dece', '-annotate', '+0+100', 'Four LLMs, one coding task',
  path.join(assets, 'og-compare-1200x630.png'),
]);
fs.unlinkSync(row);
for (const file of ['og-pombench-1200x630.jpg', 'og-compare-1200x630.png', 'logo-512.png']) {
  const target = path.join(assets, file);
  const [w, h] = sizeOf(target);
  console.log(file, w, h, fs.statSync(target).size);
}
