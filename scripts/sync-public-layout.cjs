// Mechanical migration only: preserve page contents and add the shared layout contract.
const fs=require('node:fs'),path=require('node:path');
const {root,getPublicPages,getPageFamily}=require('./public-pages.cjs');
const write=process.argv.includes('--write');
const version=fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/jcsm-static-v(\d+)/)[1];
let changed=0;
for(const file of getPublicPages()){
  const absolute=path.join(root,file),before=fs.readFileSync(absolute,'utf8');
  const family=getPageFamily(file);
  let next=before.replace(/<body\b([^>]*)>/i,(tag,attrs)=>{
    const classes=['jcsm-public',...(family==='marketing'?[]:['jcsm-'+family]),...(['404.html','merci.html','offline.html'].includes(file)?['jcsm-utility']:[])];
    if(/\bclass=["']/.test(attrs))return '<body'+attrs.replace(/\bclass=(["'])(.*?)\1/,(all,quote,old)=>'class='+quote+[...new Set([...old.split(/\s+/),...classes])].filter(Boolean).join(' ')+quote)+'>';
    return '<body'+attrs+' class="'+classes.join(' ')+'">';
  });
  if(!next.includes('/css/public-layout.css?'))next=next.replace(/<\/head>/i,'    <link rel="stylesheet" href="/css/public-layout.css?v='+version+'">\n</head>');
  if(next!==before){changed++;if(write)fs.writeFileSync(absolute,next);}
}
console.log(JSON.stringify({publicPages:getPublicPages().length,changed,write}));
