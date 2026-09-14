// Copies the static site into dist/ for hosting. Run: node build.js
const fs = require('fs');
const path = require('path');
const root = __dirname;
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const entry of ['index.html', 'css', 'js', 'assets']) {
  fs.cpSync(path.join(root, entry), path.join(out, entry), { recursive: true });
}
console.log('built dist/');
