const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {root,getPublicPages,getPageFamily}=require('./public-pages.cjs');
test('les 154 pages publiques partagent le contrat de mise en page',()=>{
  const pages=getPublicPages();assert.equal(pages.length,154);
  for(const file of pages){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html,/<body\b[^>]*class=["'][^"']*\bjcsm-public\b/,file);
    assert.equal((html.match(/href="\/css\/public-layout\.css\?v=\d+"/g)||[]).length,1,file);
    const head=html.split('</head>')[0],last=head.lastIndexOf('<link rel="stylesheet"');
    assert(head.slice(last).includes('/css/public-layout.css') || head.slice(last).includes('/css/editorial-20260906.css'),file);
  }
});
test('les articles et pages legales gardent leur colonne de lecture',()=>{
  const counts={article:0,legal:0,marketing:0};
  for(const file of getPublicPages()){
    const family=getPageFamily(file);counts[family]++;
    if(family!=='marketing')assert.match(fs.readFileSync(path.join(root,file),'utf8'),new RegExp('jcsm-'+family+'\\b'),file);
  }
  assert.deepEqual(counts,{article:51,legal:6,marketing:97});
});
test('les prototypes et pages privees ne recoivent pas le nouveau gabarit',()=>{
  for(const file of ['powerdot.html','virta.html','evergreen.html','interne.html','internedemo.html','rapport-intervention.html']){
    if(fs.existsSync(path.join(root,file)))assert(!fs.readFileSync(path.join(root,file),'utf8').includes('/css/public-layout.css'),file);
  }
});
test('chaque feuille de style publique existe, quel que soit le sous-repertoire',()=>{
  for(const file of getPublicPages()){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for(const match of html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)/g)){
      const url=new URL(match[1],'https://jcsm.fr/'+file);
      if(url.origin==='https://jcsm.fr')assert(fs.existsSync(path.join(root,url.pathname)),file+': '+url.pathname);
    }
  }
});
test('la synchronisation de la mise en page est idempotente',()=>{
  const result=JSON.parse(cp.execFileSync(process.execPath,['scripts/sync-public-layout.cjs'],{cwd:root,encoding:'utf8'}));
  assert.equal(result.changed,0);assert.equal(result.publicPages,154);
});
test('le module de configuration ne se charge jamais deux fois',()=>{
  for(const file of getPublicPages()){
    const matches=fs.readFileSync(path.join(root,file),'utf8').match(/<script\b[^>]*src=["'][^"']*\/js\/config\.js(?:\?[^"']*)?["']/g)||[];
    assert(matches.length<=1,file);
  }
});
test('toutes les feuilles communes sont syntaxiquement valides',()=>{
  const postcss=require('postcss');
  for(const file of ['styles.css','css/critical.css','css/theme-2026.css','css/public-layout.css']){
    postcss.parse(fs.readFileSync(path.join(root,file),'utf8'),{from:file});
  }
});
test('les liens de service gardent leur contraste sans survol dans les huit langues',()=>{
  for(const file of ['index.html','en/index.html','de/index.html','es/index.html','it/index.html','nl/index.html','pl/index.html','pt/index.html']){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html,/\.card-feature \.svc-arrow \{ color: var\(--color-primary\); opacity: 1; \}/,file);
  }
});
test('la carte nommee de l accueil possede un role accessible meme avant son chargement',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/<div\b[^>]*id="coverage-map"[^>]*role="region"[^>]*aria-label="[^"]+"/);
});
