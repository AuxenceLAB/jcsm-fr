const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {root,getPublicPages,getPageFamily}=require('./public-pages.cjs');
test('les 154 pages publiques partagent le contrat de mise en page',()=>{
  const pages=getPublicPages();assert.equal(pages.length,154);
  for(const file of pages){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html,/<body\b[^>]*class=["'][^"']*\bjcsm-public\b/,file);
    // Deux feuilles bloquantes : site-a (critical + tailwind + styles [+ theme]) puis site-b (public-layout + editorial), en dernier.
    assert.equal((html.match(/href="\/css\/site-b\.css\?v=\d+"/g)||[]).length,1,file);
    assert.equal((html.match(/href="\/css\/site-a(?:-theme)?\.css\?v=\d+"/g)||[]).length,1,file);
    const head=html.split('</head>')[0],last=head.lastIndexOf('<link rel="stylesheet"');
    assert(head.slice(last).includes('/css/site-b.css'),file);
    assert(!/href="[^"]*(?:critical|public-layout|editorial-20260906|theme-2026)\.css/.test(head),file);
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
    if(fs.existsSync(path.join(root,file)))assert(!/\/css\/(?:public-layout|site-b)\.css/.test(fs.readFileSync(path.join(root,file),'utf8')),file);
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
  for(const file of ['styles.css','css/critical.css','css/theme-2026.css','css/public-layout.css','css/site-a.css','css/site-a-theme.css','css/site-b.css']){
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
test('les feuilles groupees sont a jour avec leurs sources',()=>{
  const read=f=>fs.readFileSync(path.join(root,f),'utf8');
  const {bundles,build}=require('./build-css-bundle.cjs');
  assert.deepEqual(bundles['css/site-a.css'],['css/critical.css','css/tailwind.css','styles.css']);
  assert.deepEqual(bundles['css/site-a-theme.css'],['css/critical.css','css/tailwind.css','styles.css','css/theme-2026.css']);
  assert.deepEqual(bundles['css/site-b.css'],['css/public-layout.css','css/editorial-20260906.css']);
  for(const [out,parts] of Object.entries(bundles))assert.equal(read(out),build(parts),out+' : relancer npm run build:bundle');
});
test('le fil d Ariane en tete de main garde le decalage d en-tete unique',()=>{
  const css=fs.readFileSync(path.join(root,'css/public-layout.css'),'utf8');
  const pages=getPublicPages().filter(file=>/<main\b[^>]*>\s*<nav\b/.test(fs.readFileSync(path.join(root,file),'utf8')));
  assert(pages.length>0);
  for(const selector of ['main > nav:first-child {','main > nav:first-child ol','main > nav:first-child ~ section:first-of-type'])assert(css.includes(selector),selector);
  // Plus de barre de progression de défilement : elle précédait le fil d'Ariane et cassait ce sélecteur.
  for(const file of getPublicPages())assert(!fs.readFileSync(path.join(root,file),'utf8').includes('id="scroll-progress"'),file);
});
test('chaque pied de page public relie les huit langues sans drapeau emoji',()=>{
  for(const file of getPublicPages()){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert(!/[\u{1F1E6}-\u{1F1FF}]/u.test(html),file);
    if(file==='offline.html')continue;
    const nav=html.match(/<nav class="jcsm-lang-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert(nav,file);assert.equal((nav[1].match(/<a [^>]*hreflang="/g)||[]).length,8,file);
  }
});
test('les cartes sociales sont en 1200x630, identiques pour Open Graph et Twitter',()=>{
  for(const file of getPublicPages()){
    if(file==='offline.html')continue;
    const html=fs.readFileSync(path.join(root,file),'utf8');
    const og=(html.match(/<meta property="og:image" content="https:\/\/jcsm\.fr(\/images\/og\/[a-z0-9-]+\.jpg)">/)||[])[1];
    assert(og,file);assert(fs.statSync(path.join(root,og)).size<=150*1024,og);
    assert(html.includes('<meta name="twitter:image" content="https://jcsm.fr'+og+'">'),file);
    assert(/<meta property="og:image:width" content="1200">/.test(html)&&/<meta property="og:image:height" content="630">/.test(html),file);
    assert(/<meta property="og:image:alt" content="[^"]+">/.test(html),file);
  }
});
