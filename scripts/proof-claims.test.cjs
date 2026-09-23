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
  // Équipe : certification constructeur et recyclage annuel non prouvés (retirés le 23/09/2026).
  /certifi[ée]s? constructeurs|certifi[ée]s par les constructeurs|recycl[ée]s (chaque|en continu)|manufacturer-certified|recertified|herstellerzertifiziert|rezertifiziert|reciclaje anual|reciclagem anual|jaarlijks bijgeschoold|doszkalani co roku|[Mm]anufacturer-trained|door de fabrikant opgeleide|certificados por el fabricante/i,
  // Intégrateurs nommés sans accord écrit.
  /Bouygues, Eiffage|Firalp|Sogetrel/,
  // Régions : chiffre identique partout, base et équipes locales non établies.
  />500\+<\/div>|base principale|supervision r[ée]gional|bas[ée]s localement|[ée]quipe (locale|r[ée]gionale|implant[ée]e)|Qualifelec (garantie|assur[ée]e)|Contactez notre [ée]quipe en/i,
];
test('aucune preuve invérifiable retirée ne réapparaît',()=>{
  for(const file of getPublicPages()){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for(const re of banned)assert(!re.test(html),`${file} : ${re}`);
  }
});
