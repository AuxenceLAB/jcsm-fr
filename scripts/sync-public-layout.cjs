// Mechanical migration only: preserve page contents and add the shared layout contract.
const fs=require('node:fs'),path=require('node:path');
const {root,getPublicPages,getPageFamily}=require('./public-pages.cjs');
const write=process.argv.includes('--write');
const version=fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/jcsm-static-v(\d+)/)[1];
// Footer language links, generated from each page's hreflang alternates (fallback: that language's home page).
const LANGS=['fr','en','de','es','it','nl','pl','pt'];
const LANG_LABEL={fr:'Langues',en:'Languages',de:'Sprachen',es:'Idiomas',it:'Lingue',nl:'Talen',pl:'Języki',pt:'Idiomas'};
function langNav(html){
  const own=(html.match(/<html\b[^>]*\blang="([a-z]{2})/i)||[,'fr'])[1];
  const alt={};for(const [,l,href] of html.matchAll(/<link rel="alternate" hreflang="([a-z]{2})" href="([^"]+)"/g))alt[l]=href;
  const canonical=(html.match(/<link rel="canonical" href="([^"]+)"/)||[])[1];
  if(canonical)alt[own]=canonical;
  const links=LANGS.map(l=>'<a href="'+(alt[l]||'https://jcsm.fr/'+(l==='fr'?'':l+'/')).replace('https://jcsm.fr','')+'" hreflang="'+l+'" lang="'+l+'"'+(l===own?' aria-current="page"':'')+'>'+l.toUpperCase()+'</a>');
  return '<nav class="jcsm-lang-nav" aria-label="'+(LANG_LABEL[own]||LANG_LABEL.fr)+'">'+links.join(' ')+'</nav>';
}
let changed=0;
for(const file of getPublicPages()){
  const absolute=path.join(root,file),before=fs.readFileSync(absolute,'utf8');
  const family=getPageFamily(file);
  let next=before.replace(/<body\b([^>]*)>/i,(tag,attrs)=>{
    const classes=['jcsm-public',...(family==='marketing'?[]:['jcsm-'+family]),...(['404.html','merci.html','offline.html'].includes(file)?['jcsm-utility']:[])];
    if(/\bclass=["']/.test(attrs))return '<body'+attrs.replace(/\bclass=(["'])(.*?)\1/,(all,quote,old)=>'class='+quote+[...new Set([...old.split(/\s+/),...classes])].filter(Boolean).join(' ')+quote)+'>';
    return '<body'+attrs+' class="'+classes.join(' ')+'">';
  });
  // The body font is preloaded on every public page, before the first stylesheet.
  const fontPreload='<link rel="preload" href="/fonts/source-sans-latin.woff2" as="font" type="font/woff2" crossorigin>';
  if(!next.includes('href="/fonts/source-sans-latin.woff2"'))next=next.replace(/([ \t]*)<link rel="stylesheet"/i,(all,indent)=>indent+fontPreload+'\n'+all);
  // The main navigation sits in a <header> landmark.
  if(!/<header>\s*<nav\b[^>]*glass-nav/.test(next))next=next.replace(/([ \t]*)(<nav\b[^>]*\bglass-nav\b[^>]*>[\s\S]*?<\/nav>)/,(all,indent,nav)=>indent+'<header>\n'+indent+nav+'\n'+indent+'</header>');
  if(/<nav class="jcsm-lang-nav"[^>]*>[\s\S]*?<\/nav>/.test(next))next=next.replace(/<nav class="jcsm-lang-nav"[^>]*>[\s\S]*?<\/nav>/,langNav(next));
  else next=next.replace(/(<footer\b[\s\S]*?<span>(?:&copy;|©) 2026 JCSM SAS[^<]*<\/span>)/,(all)=>all+'\n                '+langNav(next));
  if(!next.includes('/css/site-b.css?'))next=next.replace(/<\/head>/i,'    <link rel="stylesheet" href="/css/site-b.css?v='+version+'">\n</head>');
  if(next!==before){changed++;if(write)fs.writeFileSync(absolute,next);}
}
console.log(JSON.stringify({publicPages:getPublicPages().length,changed,write}));
