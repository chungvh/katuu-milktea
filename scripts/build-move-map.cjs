/*
  Build a JSON map of originalFilePath -> newFilePath for files copied by refactor-dryrun.cjs
  Usage: node scripts/build-move-map.cjs
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');

const mapping = [
  { from: 'components', to: 'views/components' },
  { from: 'components', to: 'views/pages' },
  { from: 'contexts', to: 'controllers' },
  { from: 'services', to: 'models' },
  { from: 'lib', to: 'config' },
  { from: 'utils', to: 'utils' },
  { from: 'assets', to: 'views/assets' },
  { from: 'types.ts', to: 'models/types.ts' },
  { from: 'App.tsx', to: 'App.tsx' },
  { from: 'index.tsx', to: 'index.tsx' }
];

function listFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const map = {}; // originalAbs -> newAbs

for (const m of mapping) {
  const fromAbs = path.join(root, m.from);
  const toAbs = path.join(srcRoot, m.to);

  if (fs.existsSync(fromAbs) && fs.statSync(fromAbs).isDirectory()) {
    const files = listFiles(fromAbs);
    for (const f of files) {
      const rel = path.relative(fromAbs, f);
      const dest = path.join(toAbs, rel);
      map[path.normalize(f)] = path.normalize(dest);
    }
  } else {
    const fromFile = path.join(root, m.from);
    if (fs.existsSync(fromFile) && fs.statSync(fromFile).isFile()) {
      map[path.normalize(fromFile)] = path.normalize(path.join(srcRoot, m.to));
    }
  }
}

const outPath = path.join(__dirname, 'move-map.json');
fs.writeFileSync(outPath, JSON.stringify(map, null, 2));
console.log('Wrote', outPath, 'entries=', Object.keys(map).length);

