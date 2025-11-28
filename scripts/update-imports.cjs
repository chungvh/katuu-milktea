/*
  Update import paths inside files under src/ based on move-map.json.
  Usage: node scripts/update-imports.cjs

  - This script reads scripts/move-map.json which maps originalAbsolutePath -> newAbsolutePath
  - For each file under src/, it scans for import/require statements that reference original files
    and replaces them to point to the new relative path from the importing file.

  Important: This updates files in-place under src/. It creates backups with .bak extension.
*/

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');
const mapPath = path.join(__dirname, 'move-map.json');

if (!fs.existsSync(mapPath)) {
  console.error('move-map.json missing - run build-move-map.cjs first');
  process.exit(1);
}

const moveMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

function listSrcFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(listSrcFiles(filePath));
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = listSrcFiles(srcRoot);
console.log('Scanning', files.length, 'files under src/');

// Helper to compute new import path
function computeNewImport(importingFile, originalImportPath) {
  // Resolve originalImportPath relative to project root if it's relative from old file
  const importingDir = path.dirname(importingFile);

  // If import is absolute (starts with / or doesn't start with '.'), skip
  if (!originalImportPath.startsWith('.')) return null;

  const resolvedOldAbs = path.normalize(path.resolve(importingDir.replace(srcRoot, root), originalImportPath));
  const candidates = Object.keys(moveMap).filter(k => k.startsWith(resolvedOldAbs));
  if (candidates.length === 0) {
    // also try with .ts/.tsx/.js variations
    const exts = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
    for (const e of exts) {
      const tryPath = resolvedOldAbs + e;
      const k = Object.keys(moveMap).find(x => x === tryPath);
      if (k) { candidates.push(k); break; }
    }
  }

  if (candidates.length === 0) return null;
  const oldAbs = candidates[0];
  const newAbs = moveMap[oldAbs];
  if (!newAbs) return null;

  // compute relative path from importingFile (in src/) to newAbs
  const rel = path.relative(path.dirname(importingFile), newAbs);
  let relPath = rel.startsWith('.') ? rel : './' + rel;
  // remove extensions for TS imports
  relPath = relPath.replace(/\.(tsx|ts|jsx|js)$/, '');
  return relPath.split('\\').join('/');
}

const importRegex = /(import\s+[^'";]+['"](\.\/.+?)['"];?)/g;
const dynamicImportRegex = /(from\s+['"](\.\/.+?)['"])/g;

let totalRewrites = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // find relative import occurrences
  const matches = [];
  let m;
  const regexAll = /(?:import\s+[\s\S]*?from\s+['"](\.\/.+?)['"])|(?:require\(['"](\.\/.+?)['"]\))/g;
  while ((m = regexAll.exec(content)) !== null) {
    const imp = m[1] || m[2];
    if (!imp) continue;
    matches.push(imp);
  }

  const unique = Array.from(new Set(matches));
  let changed = false;
  for (const imp of unique) {
    const newPath = computeNewImport(file, imp);
    if (newPath && newPath !== imp) {
      const regexSafe = new RegExp(imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regexSafe, newPath);
      changed = true;
      totalRewrites++;
      console.log(`Rewrote in ${path.relative(root, file)}: ${imp} -> ${newPath}`);
    }
  }

  if (changed) {
    const bak = file + '.bak';
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, original);
    fs.writeFileSync(file, content);
  }
}

console.log('Done. total rewrites=', totalRewrites);

