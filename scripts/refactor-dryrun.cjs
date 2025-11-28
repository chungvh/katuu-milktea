/*
  CommonJS version of the refactor dry-run script.
  Usage:
    node scripts/refactor-dryrun.cjs       # dry-run
    node scripts/refactor-dryrun.cjs --apply  # actually copy files
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

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

(function main(){
  const apply = process.argv.includes('--apply');
  console.log('Refactor dry-run. apply=', apply);

  for (const map of mapping) {
    const fromAbs = path.join(root, map.from);
    const toAbs = path.join(srcRoot, map.to);

    if (!fs.existsSync(fromAbs)) {
      // handle single files
      const fromFile = path.join(root, map.from);
      if (fs.existsSync(fromFile)) {
        console.log(`File: ${map.from} -> ${path.relative(root, toAbs)}`);
        if (apply) {
          ensureDir(path.dirname(toAbs));
          copyFile(fromFile, toAbs);
        }
      } else {
        console.log(`Skip missing: ${fromAbs}`);
      }
      continue;
    }

    const stat = fs.statSync(fromAbs);
    if (stat.isDirectory()) {
      const files = listFiles(fromAbs);
      for (const f of files) {
        const rel = path.relative(fromAbs, f);
        const dest = path.join(toAbs, rel);
        console.log(`${path.relative(root, f)} -> ${path.relative(root, dest)}`);
        if (apply) copyFile(f, dest);
      }
    } else {
      // single file
      const dest = toAbs;
      console.log(`${path.relative(root, fromAbs)} -> ${path.relative(root, dest)}`);
      if (apply) copyFile(fromAbs, dest);
    }
  }

  console.log('\nDry-run completed.');
  if (!apply) console.log('Run with --apply to actually copy files.');
})();
