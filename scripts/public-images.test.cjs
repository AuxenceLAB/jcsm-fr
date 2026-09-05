const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {root,getPublicPages}=require('./public-pages.cjs');
const {families,photoIdentity}=require('./public-photographs.cjs');
const attr=(tag,name)=>tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`))?.[1];
const sources=tag=>[attr(tag,'src'),...(attr(tag,'srcset')||'').split(',').map(s=>s.trim().split(/\s+/)[0])].filter(Boolean);

test('les variantes de photos sont connues et les deux caméras restent distinctes',()=>{
  const paths=Object.values(families).flat();
  assert.equal(paths.length,new Set(paths).size);
  for(const file of paths)assert(fs.existsSync(path.join(root,'images',file)),file);
  assert.equal(photoIdentity('images/remiseconfo.jpg'),photoIdentity('images/remiseconformite.webp'));
  assert.notEqual(photoIdentity('images/camera.png'),photoIdentity('images/camera.jpg'));
});

for(const file of getPublicPages())test(`${file}: images présentes, alternatives cohérentes, pas de photo répétée`,()=>{
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const [tag] of html.matchAll(/<(?:img|source)\b[^>]*>/g)) {
    if(tag.startsWith('<img'))assert(/\balt=["']/.test(tag),`alt absent: ${tag}`);
    for(const source of sources(tag)) {
      const url=new URL(source,new URL(file,'https://jcsm.fr/'));
      if(url.origin==='https://jcsm.fr')assert(fs.existsSync(path.join(root,decodeURIComponent(url.pathname))),`image absente: ${source}`);
    }
  }
  for(const [picture] of html.matchAll(/<picture\b[^>]*>[\s\S]*?<\/picture>/g)) {
    const img=picture.match(/<img\b[^>]*>/)?.[0];
    assert(img,'picture sans img');
    const identity=photoIdentity(attr(img,'src'),file);
    if(!identity)continue;
    for(const [tag] of picture.matchAll(/<(?:img|source)\b[^>]*>/g))for(const source of sources(tag))
      assert.equal(photoIdentity(source,file),identity,`variante d'une autre photo: ${source}`);
  }
  const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
  const ids=[...main.matchAll(/<img\b[^>]*>/g)].map(([tag])=>photoIdentity(attr(tag,'src'),file)).filter(Boolean);
  assert.equal(ids.length,new Set(ids).size,`photo répétée: ${ids}`);
});
