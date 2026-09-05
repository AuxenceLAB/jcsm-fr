const fs = require('node:fs');
const cp = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function getPublicPages() {
  return cp.execFileSync('git', ['ls-files', '*.html'], {cwd:root, encoding:'utf8'}).trim().split('\n')
    .filter(file => !/^(demo\/|_|powerdot\.html$|virta\.html$|evergreen\.html$|interne|ca\d?\.html$|rapport-intervention)/.test(file))
    .filter(file => /class=["'][^"']*\bglass-nav\b/.test(fs.readFileSync(path.join(root,file),'utf8')));
}
function getPageFamily(file) {
  if (file.startsWith('blog/')) return 'article';
  if (/(^|\/)(confidentialite|mentions-legales|cgv|privacy|legal-notice|terms)\.html$/.test(file)) return 'legal';
  return 'marketing';
}
module.exports = {root,getPublicPages,getPageFamily};
