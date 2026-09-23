// Garde-fou : les formes sans accent corrigées le 23/09/2026 (es, pt, pl) ne reviennent pas
// dans le texte lu (texte, title, meta, JSON-LD). Les URL et les attributs techniques sont ignorés.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {root,getPublicPages}=require('./public-pages.cjs');
const banned={
  es:/(?<![\p{L}-])(Instalacion|Belgica|Gestion|Diagnostico|diagnostico|Auditoria|auditoria|tecnicos?|navegacion|Proteccion|Operacion)(?![\p{L}-])/u,
  pt:/(?<![\p{L}-])(servicos?|eletricos?|eletricas?|Instalacoes|instalacoes|ligacao|navegacao|Orcamento|orcamento)(?![\p{L}-])/u,
  pl:/(?<![\p{L}-])(ciagu|Ciagly|nadzor|Nadzor|uslugi|Uslugi|Zarzadzanie|zarzadzanie|sie|Wyslij|Zadzwon)(?![\p{L}-])/u,
};
function readable(html){
  return html
    .replace(/<script\b(?![^>]*ld\+json)[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/g,' ')
    .replace(/<[^>]*>/g,tag=>(tag.match(/\s(?:content|alt|title|aria-label|placeholder)="[^"]*"/g)||[]).join(' '))
    .replace(/https?:\/\/\S+|"\/[^"]*"/g,' ');
}
test('aucune forme sans accent relevée ne réapparaît (es, pt, pl)',()=>{
  for(const file of getPublicPages()){
    const re=banned[file.slice(0,2)];
    if(!re||file[2]!=='/')continue;
    const m=readable(fs.readFileSync(path.join(root,file),'utf8')).match(re);
    assert(!m,`${file} : ${m&&m[0]}`);
  }
});
