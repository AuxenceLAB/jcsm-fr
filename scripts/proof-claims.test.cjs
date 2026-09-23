// Garde-fou : les preuves invérifiables retirées en septembre 2026 ne reviennent pas.
// Un chiffre de performance ne se remet qu'avec une source datée fournie par Auxence.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {root,getPublicPages}=require('./public-pages.cjs');
const banned=[
  /\d\s?%\s*(de\s)?(r[ée]solution|r[ée]solus|resolved|pannes en moins|fewer faults|weniger St[öo]rungen)/i,
  /\b2[ .,]?000 (pannes|faults|behobene|aver[íi]as|guasti|storingen|awarii|avarias)/i,
  /\b1:27\b|counter-animate">x3</,
  /Airbus|Safran|Thales/,
  /garantit contractuellement|assurent un taux de disponibilit[ée] contractuel/i,
  /(certifi[ée]e?s? par chaque|certified by each|door elke fabrikant|przez kazdego producenta|por cada fabricante)/i,
  /\b6\+ (ans|years|Jahre|a[ñn]os|anni|jaar|lat)\b|>6<span/,
  /sp[ée]cialis[ée]s, form[ée]s en interne|Specialised IRVE technicians, trained in-house|Pas d'interm[ée]diaires|No middlemen/i,
  /\+200 ?%|3 000 bornes maintenues/,
];
test('aucune preuve invérifiable retirée ne réapparaît',()=>{
  for(const file of getPublicPages()){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for(const re of banned)assert(!re.test(html),`${file} : ${re}`);
  }
});
