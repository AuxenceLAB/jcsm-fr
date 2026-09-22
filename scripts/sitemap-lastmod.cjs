// sitemap.xml : <lastmod> = date du dernier commit de la page, et aucune URL en noindex.
// Usage : node scripts/sitemap-lastmod.cjs [--write]   (sans --write : contrôle, code 1 si écart)
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.join(__dirname, '..');
const file = path.join(root, 'sitemap.xml');
const before = fs.readFileSync(file, 'utf8');

function pageFor(loc) {
  const p = new URL(loc).pathname.replace(/^\//, '');
  const candidates = p === '' || p.endsWith('/') ? [p + 'index.html'] : [p + '.html', p + '/index.html', p];
  return candidates.find(c => fs.existsSync(path.join(root, c)));
}
function gitDate(rel) {
  return cp.execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: root, encoding: 'utf8' }).trim();
}

let changed = 0, removed = [];
const after = before.replace(/(\n[ \t]*<!--[^\n]*-->)?\n[ \t]*<url>[\s\S]*?<\/url>/g, (block) => {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)[1];
  const page = pageFor(loc);
  if (!page) return block;
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) { removed.push(loc); return ''; }
  const date = gitDate(page);
  if (!date) return block;
  return block.replace(/<lastmod>[^<]*<\/lastmod>/, (tag) => {
    const next = '<lastmod>' + date + '</lastmod>';
    if (next !== tag) changed++;
    return next;
  });
});

const result = { urls: (after.match(/<url>/g) || []).length, changed, removed };
if (process.argv.includes('--write')) { if (after !== before) fs.writeFileSync(file, after); }
else if (after !== before) { console.log(JSON.stringify(result)); process.exit(1); }
console.log(JSON.stringify(result));
