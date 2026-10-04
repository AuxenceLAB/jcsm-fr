# jcsm.fr : terminologie, désynchronisation FR/7 langues, promesses de délai (propositions, rien publié)

Date : 2026-10-04. Copie lue (lecture seule, aucun fichier du dépôt modifié) : /home/auxence/chantiers-20261004/sites-10sur10/copies/jcsm.fr. Les balises title et meta description (et leurs copies og/twitter) sont ignorées, car deux autres agents les éditent.

## Résumé (10 lignes)

1. Terminologie HTA/BT : 277 occurrences relevées hors title/description dans les 7 langues, dont 86 FAUSSES (mauvaise tension), 108 ambiguës (sigle français non traduit), 29 incohérentes entre pages d'une même langue.
2. Le plus grave : l'erreur n'est pas qu'en allemand. HTA est rendu par « haute tension » en EN (30 occ.), DE (27), NL (17, hoogspanning/HS/LS), ES (6), IT (4), PT (2). Seul le polonais est juste (SN/nn) mais mélange nn/nN et HTA/BT.
3. Pire cas : en/operations-maintenance.html et de/betrieb-wartung.html (« HV-certified technicians », « HV-befähigten Techniker », « HV switchgear cells ») : on y promet des travaux en haute tension, alors que le métier est la moyenne tension.
4. « Habilité » (habilitation électrique) est traduit au hasard par certified / zertifiziert / gecertificeerd / certyfikowani selon les pages : c'est une certification, pas une habilitation (voir 1.8).
5. Désynchronisation : « du premier coup » (NF C 15-100) est présent dans les 7 langues (index) et « résolu dès la première visite » dans les 7 (index) ; le FR actuel dit « vérification des équipements » (index.html:682) et n'a plus la seconde phrase (index.html:788).
6. Hotline : DE (de/index.html:974-975) et NL (nl/index.html:582) annoncent « FR/EN/NL/DE » alors que le FR dit FR/EN/NL (centre-appel.html:282, exploitation.html:422) ; ES dit FR/EN/ES et PT dit PT/FR/EN : quatre listes de langues différentes.
7. Le bloc « normes belges / organisme agréé / approbation du premier coup » des pages installation traduites n'existe pas dans le FR (0 occurrence de RGIE/AREI dans installation-conformite.html).
8. Délais, FR toutes pages : « 24h ouvrées » 84 occurrences visibles, « 48h » 14, « 24/7 » 219, « 7j/7 » 11, « SLA garanti » 15. Les sources de vérité FR (FAQ « délais définis dans votre contrat », CGV art. 6 « à titre indicatif ») contredisent la vitrine (index.html:782 et 788, exploitation.html:347 « technicien sur site sous 24h ouvrées »).
9. Même le CGV art. 6 se contredit (« indicatif » puis « JCSM s'engage à respecter » avec 24/7 et 24h ouvrées, cgv.html:211-215).
10. Trois formulations prudentes sont proposées en section 3.5 ; le choix de la formulation vraie (et la décision de garder ou non 48h, 24h ouvrées, 24/7 ou 7j/7) appartient à Auxence.

Méthode : grep -n sur les fichiers de la copie, extraits courts (les lignes HTML sont très longues). Une ligne comptée une fois par ligne dans les tableaux, avec le nombre d'occurrences du terme (xN) ; les comptes finaux sont en occurrences de termes (HTA/BT compte pour 1). JSON-LD signalé par [JSON-LD].

## 1. Terminologie

### 1.0 Règle de référence (HTA, BT) et forme à retenir

HTA (France) = moyenne tension (1 kV à 50 kV en alternatif). BT = basse tension (jusqu'à 1 kV). « Haute tension » (HTB) commence au dessus de 50 kV : ce n'est pas le périmètre de JCSM (cellules HTA, postes HTA/BT). Équivalents à retenir :

| Langue | Moyenne tension (HTA) | Basse tension (BT) | Paire (transformateur/poste) | Glose conseillée à la 1re occurrence |
|-|-|-|-|-|
| en | medium voltage (MV) | low voltage (LV) | MV/LV transformer, MV/LV substation | MV/LV (medium voltage/low voltage), première occurrence : "MV/LV (medium voltage / low voltage; HTA/BT in France)" |
| de | Mittelspannung (MS) | Niederspannung (NS) | MS/NS-Transformator, MS/NS-Station | MS/NS (Mittelspannung/Niederspannung), première occurrence : "MS/NS (Mittel-/Niederspannung, in Frankreich HTA/BT)" |
| es | media tensión (MT) | baja tensión (BT) | transformador MT/BT, centro de transformación MT/BT | MT/BT (media tensión/baja tensión) |
| it | media tensione (MT) | bassa tensione (BT) | trasformatore MT/BT, cabina MT/BT | MT/BT (media tensione/bassa tensione) |
| nl | middenspanning (MS) | laagspanning (LS) | MS/LS-transformator, MS/LS-station | MS/LS (middenspanning/laagspanning) |
| pl | średnie napięcie (SN) | niskie napięcie (nn) | transformator SN/nn, stacja SN/nn | SN/nn (średnie napięcie/niskie napięcie) |
| pt | média tensão (MT) | baixa tensão (BT) | transformador MT/BT, posto de transformação MT/BT | MT/BT (média tensão/baixa tensão) |

Pour DE, l'option de la revue « HTA/BT (Mittel-/Niederspannung) » est acceptable mais garde un sigle français inconnu d'un lecteur allemand : préférer MS/NS avec glose, et garder « HTA/BT » seulement entre parenthèses pour le SEO français.

Statuts utilisés : FAUX = traduit la mauvaise tension ; AMBIGU = sigle français HTA/BT laissé tel quel, sans glose, alors que la langue a son sigle ; INCOHERENT = la même langue emploie deux formes selon les pages ; OK = correct.

### 1.1 Anglais (en/)

Lignes concernées : 35 (dont 6 en JSON-LD) ; occurrences : 41 = 30 FAUX, 9 AMBIGU, 0 INCOHERENT, 2 OK. Lignes title/meta ignorées (autres agents) : 6.

| fichier:ligne | texte actuel (extrait) | statut et problème | correction proposée |
|-|-|-|-|
| en/become-partner.html:52 [JSON-LD] | n, maintenance of charging stations and HV/LV transformers across France and Belgium.", | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | n, maintenance of charging stations and MV/LV transformers across France and Belgium.", |
| en/careers.html:57 [JSON-LD] | n, maintenance of charging stations and HV/LV transformers across France and Belgium.", | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | n, maintenance of charging stations and MV/LV transformers across France and Belgium.", |
| en/coverage.html:755 | HV/LV maintenance and troubleshooting. Certified teams. | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV/LV maintenance and troubleshooting. Certified teams. |
| en/index.html:27 [JSON-LD] | lec installation", "OCPP supervision", "HV/LV transformers", "White-label support", "EV charger | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | lec installation", "OCPP supervision", "MV/LV transformers", "White-label support", "EV charger |
| en/index.html:150 [JSON-LD] | "HV/LV transformer maintenance", | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | "MV/LV transformer maintenance", |
| en/index.html:626 | Preventive, corrective, HV/LV. Remote diagnostics first, then on-site intervent | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | Preventive, corrective, MV/LV. Remote diagnostics first, then on-site intervent |
| en/index.html:705 | HV/LV + AC/DC chargers + hotline under a single point o | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV/LV + AC/DC chargers + hotline under a single point o |
| en/index.html:741 | te. All brands, AC 3.7 kW to DC 400 kW, HV/LV substations included. | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | te. All brands, AC 3.7 kW to DC 400 kW, MV/LV substations included. |
| en/installation-compliance.html:268 | ompliance upgrades for existing fleets, HTA/BT substation installation for DC charging hubs. Fro | AMBIGU : sigle français HTA/BT non traduit, sans glose | ompliance upgrades for existing fleets, MV/LV substation installation for DC charging hubs. Fro |
| en/installation-compliance.html:331 | s, installation and OCPP commissioning. HTA/BT substation installation for high-power DC chargin | AMBIGU : sigle français HTA/BT non traduit, sans glose | s, installation and OCPP commissioning. MV/LV substation installation for high-power DC chargin |
| en/installation-compliance.html:347 | Enedis grid connection and HTA/BT substations | AMBIGU : sigle français HTA/BT non traduit, sans glose | Enedis grid connection and MV/LV substations |
| en/installation-compliance.html:418 | DC chargers 50-350 kW with HTA/BT substation | AMBIGU : sigle français HTA/BT non traduit, sans glose | DC chargers 50-350 kW with MV/LV substation |
| en/installation-compliance.html:624 | The foundational French standard for low-voltage electrical installations. It governs cable sizing | OK : low-voltage = basse tension (NF C 15-100) : correct | aucune |
| en/installation-compliance.html:736 | HTA/BT electrical infrastructure | AMBIGU : sigle français HTA/BT non traduit, sans glose | MV/LV electrical infrastructure |
| en/installation-compliance.html:737 | 0 kW and above) often require dedicated high-voltage (HTA) to low-voltage (BT) transformer substations (x4) | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | 0 kW and above) often require dedicated high-voltage (MV) to low-voltage (LV) transformer substations |
| en/installation-compliance.html:748 | HTA cell installation and commissioning | AMBIGU : sigle français HTA/BT non traduit, sans glose | MV cell installation and commissioning |
| en/installation-compliance.html:749 | Installation and testing of HTA switchgear, transformer and BT distribution panel (x2) | AMBIGU : sigle français HTA/BT non traduit, sans glose | Installation and testing of MV switchgear, transformer and LV distribution panel |
| en/installation-compliance.html:753 | Preventive maintenance contracts for HTA/BT transformers: oil analysis, thermographic inspect | AMBIGU : sigle français HTA/BT non traduit, sans glose | Preventive maintenance contracts for MV/LV transformers: oil analysis, thermographic inspect |
| en/operations-maintenance.html:21 [JSON-LD] | nance of EV charging infrastructure and HV/LV transformers. OCPP supervision, commissioning and | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | nance of EV charging infrastructure and MV/LV transformers. OCPP supervision, commissioning and |
| en/operations-maintenance.html:99 [JSON-LD] | gers, cables, main distribution boards, HV/LV transformers) and reporting arrangements. A dedic | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | gers, cables, main distribution boards, MV/LV transformers) and reporting arrangements. A dedic |
| en/operations-maintenance.html:246 | ith parts on board. AC and DC chargers, HV/LV transformers. Mainland France and Belgium. | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | ith parts on board. AC and DC chargers, MV/LV transformers. Mainland France and Belgium. |
| en/operations-maintenance.html:450 | HV/LV Transformers | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV/LV Transformers |
| en/operations-maintenance.html:452 | Maintenance of HV/LV Transformers | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | Maintenance of MV/LV Transformers |
| en/operations-maintenance.html:455 | charger faults comes from the upstream HV/LV substation, not the charger itself. Most EV charg | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | charger faults comes from the upstream MV/LV substation, not the charger itself. Most EV charg |
| en/operations-maintenance.html:458 | Our HV-certified technicians work on protection cells, c (x2) | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | Our MV-authorised technicians work on protection cells, c |
| en/operations-maintenance.html:484 | HV switchgear cells &amp; cable compartments | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV switchgear cells &amp; cable compartments |
| en/operations-maintenance.html:600 | [commentaire HTML] HV/LV Transformers | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | [commentaire HTML] MV/LV Transformers |
| en/operations-maintenance.html:608 | HV/LV Transformers | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV/LV Transformers |
| en/operations-maintenance.html:617 | HV switchgear cells | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV switchgear cells |
| en/operations-maintenance.html:654 | HV substation main distribution board | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV substation main distribution board |
| en/operations-maintenance.html:658 | &#8226;LV main circuit breaker operations | OK : low-voltage = basse tension (NF C 15-100) : correct | aucune |
| en/operations-maintenance.html:697 | HV fuses | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | MV fuses |
| en/operations-maintenance.html:731 | &#8226;HV / transformer / LV circuit breaker equipment iden (x2) | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | &#8226;MV / transformer / LV circuit breaker equipment iden |
| en/operations-maintenance.html:735 | &#8226;Tailored solutions based on HV substation age | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | &#8226;Tailored solutions based on MV substation age |
| en/operations-maintenance.html:1019 | gers, cables, main distribution boards, HV/LV transformers) and reporting arrangements. A dedic | FAUX : HV/high-voltage rend HTA (= moyenne tension) : mauvaise tension | gers, cables, main distribution boards, MV/LV transformers) and reporting arrangements. A dedic |

Incohérences internes (en) : HV/LV (operations-maintenance, index) et HTA/BT (installation-compliance) pour la même chose ; installation-compliance:737 mélange « high-voltage (HTA) to low-voltage (BT) ». Forme à retenir : MV/LV partout.

### 1.2 Allemand (de/)

Lignes concernées : 32 (dont 3 en JSON-LD) ; occurrences : 38 = 27 FAUX, 10 AMBIGU, 0 INCOHERENT, 1 OK. Lignes title/meta ignorées (autres agents) : 5.

| fichier:ligne | texte actuel (extrait) | statut et problème | correction proposée |
|-|-|-|-|
| de/betrieb-wartung.html:21 [JSON-LD] | Wartung von IRVE-Ladeinfrastruktur und HV/LV-Transformatoren. OCPP-Überwachung, Inbetriebnahme | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | Wartung von IRVE-Ladeinfrastruktur und MS/NS-Transformatoren. OCPP-Überwachung, Inbetriebnahme |
| de/betrieb-wartung.html:99 [JSON-LD] | (Ladestationen, Kabel, Hauptverteilung, HV/LV-Transformatoren) und die Reporting-Modalitäten. E | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | (Ladestationen, Kabel, Hauptverteilung, MS/NS-Transformatoren) und die Reporting-Modalitäten. E |
| de/betrieb-wartung.html:247 | zteilen an Bord. AC-, DC-Ladestationen, HV/LV-Transformatoren. Frankreich-weit und Belgien. | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | zteilen an Bord. AC-, DC-Ladestationen, MS/NS-Transformatoren. Frankreich-weit und Belgien. |
| de/betrieb-wartung.html:451 | HV/LV-Transformatoren | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | MS/NS-Transformatoren |
| de/betrieb-wartung.html:453 | Wartung der HV/LV-Transformatoren | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | Wartung der MS/NS-Transformatoren |
| de/betrieb-wartung.html:456 | estationen stammt aus der vorgelagerten HV/LV-Station, nicht von der Ladestation selbst. Die me | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | estationen stammt aus der vorgelagerten MS/NS-Station, nicht von der Ladestation selbst. Die me |
| de/betrieb-wartung.html:459 | Unsere HV-befähigten Techniker warten Schutzzellen, Kabelfe (x2) | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | Unsere MS-befähigten Techniker warten Schutzzellen, Kabelfe |
| de/betrieb-wartung.html:485 | HV-Schaltanlagenzellen &amp; Kabelfelder | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | MS-Schaltanlagenzellen &amp; Kabelfelder |
| de/betrieb-wartung.html:601 | [commentaire HTML] HV/LV-Transformatoren | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | [commentaire HTML] MS/NS-Transformatoren |
| de/betrieb-wartung.html:609 | HV/LV-Transformatoren | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | MS/NS-Transformatoren |
| de/betrieb-wartung.html:618 | HV-Schaltanlagenzellen | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | MS-Schaltanlagenzellen |
| de/betrieb-wartung.html:655 | HV-Umspannwerk-Hauptverteilung | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | MS-Umspannwerk-Hauptverteilung |
| de/betrieb-wartung.html:659 | &#8226;Schaltvorgänge am LV-Hauptleistungsschalter | FAUX : LV : sigle anglais dans un texte allemand (NS attendu) | &#8226;Schaltvorgänge am NS-Hauptleistungsschalter |
| de/betrieb-wartung.html:698 | HV-Sicherungen | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | MS-Sicherungen |
| de/betrieb-wartung.html:732 | &#8226;HV-/Transformator-/LV-Leistungsschalter-Geräteidenti (x2) | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | &#8226;MS-/Transformator-/NS-Leistungsschalter-Geräteidenti |
| de/betrieb-wartung.html:736 | te Lösungen basierend auf dem Alter des HV-Umspannwerks | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | te Lösungen basierend auf dem Alter des MS-Umspannwerks |
| de/betrieb-wartung.html:1020 | (Ladestationen, Kabel, Hauptverteilung, HV/LV-Transformatoren) und die Reporting-Modalitäten. E | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | (Ladestationen, Kabel, Hauptverteilung, MS/NS-Transformatoren) und die Reporting-Modalitäten. E |
| de/index.html:145 [JSON-LD] | "Wartung von HV/LV-Transformatoren", | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | "Wartung von MS/NS-Transformatoren", |
| de/index.html:633 | Präventiv, korrektiv, HV/LV. Ferndiagnose, dann Einsatz vor Ort mit den nötig | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | Präventiv, korrektiv, MS/NS. Ferndiagnose, dann Einsatz vor Ort mit den nötig |
| de/index.html:711 | HV/LV + AC-/DC-Ladestationen + Hotline bei einem einzig | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | MS/NS + AC-/DC-Ladestationen + Hotline bei einem einzig |
| de/index.html:747 | . Alle Marken, AC 3,7 kW bis DC 400 kW, HV/LV-Stationen inklusive. | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | . Alle Marken, AC 3,7 kW bis DC 400 kW, MS/NS-Stationen inklusive. |
| de/installation-konformitaet.html:256 | gen gemäß NF C 15-100, Installation von HTA/BT-Transformatorstationen für DC-Ladehubs. Von der t | AMBIGU : sigle français HTA/BT non traduit, sans glose | gen gemäß NF C 15-100, Installation von MS/NS-Transformatorstationen für DC-Ladehubs. Von der t |
| de/installation-konformitaet.html:319 | d OCPP-Inbetriebnahme. Installation von HTA/BT-Transformatorstationen für DC-Hochleistungs-Ladeh | AMBIGU : sigle français HTA/BT non traduit, sans glose | d OCPP-Inbetriebnahme. Installation von MS/NS-Transformatorstationen für DC-Hochleistungs-Ladeh |
| de/installation-konformitaet.html:335 | Netzanschluss und HTA/BT-Transformatorstationen | AMBIGU : sigle français HTA/BT non traduit, sans glose | Netzanschluss und MS/NS-Transformatorstationen |
| de/installation-konformitaet.html:406 | DC-Ladestationen 50-350 kW mit HTA/BT-Station | AMBIGU : sigle français HTA/BT non traduit, sans glose | DC-Ladestationen 50-350 kW mit MS/NS-Station |
| de/installation-konformitaet.html:612 | Die grundlegende französische Norm für Niederspannungsinstallationen. Sie regelt Kabelquerschnitte, Schutzgeräte, Erdu | OK : Niederspannung = basse tension : correct | aucune |
| de/installation-konformitaet.html:678 | [commentaire HTML] Consuel-Prozess & HTA/BT | AMBIGU : sigle français HTA/BT non traduit, sans glose | [commentaire HTML] Consuel-Prozess & MS/NS |
| de/installation-konformitaet.html:704 | HTA/BT-Elektroinfrastruktur | AMBIGU : sigle français HTA/BT non traduit, sans glose | MS/NS-Elektroinfrastruktur |
| de/installation-konformitaet.html:705 | g dedizierte Transformatorstationen von Hochspannung (HTA) zu Niederspannung (BT). Dies erhöht die Kom (x4) | FAUX : HV/Hochspannung rend HTA (= moyenne tension) ; LV est un sigle anglais | g dedizierte Transformatorstationen von Mittelspannung (MS) zu Niederspannung (NS). Dies erhöht die Kom |
| de/installation-konformitaet.html:716 | HTA-Zellen-Installation und Inbetriebnahme | AMBIGU : sigle français HTA/BT non traduit, sans glose | MS-Zellen-Installation und Inbetriebnahme |
| de/installation-konformitaet.html:717 | Installation und Prüfung von HTA-Schaltanlagen, Transformator und BT-Verteilerschr (x2) | AMBIGU : sigle français HTA/BT non traduit, sans glose | Installation und Prüfung von MS-Schaltanlagen, Transformator und NS-Verteilerschr |
| de/installation-konformitaet.html:721 | Präventive Wartungsverträge für HTA/BT-Transformatoren: Ölanalyse, thermografische Inspe | AMBIGU : sigle français HTA/BT non traduit, sans glose | Präventive Wartungsverträge für MS/NS-Transformatoren: Ölanalyse, thermografische Inspe |

Incohérences internes (de) : HV/LV (betrieb-wartung, index) contre HTA/BT (installation-konformitaet, ueber-uns) ; installation-konformitaet.html:705 dit « Hochspannung (HTA) zu Niederspannung (BT) ». Forme à retenir : MS/NS avec glose. Note : « HT/NT » à betrieb-wartung.html:299 désigne Hochtarif/Niedertarif (tarif), pas une tension : à ne pas toucher.

### 1.3 Espagnol (es/)

Lignes concernées : 36 (dont 6 en JSON-LD) ; occurrences : 43 = 6 FAUX, 35 AMBIGU, 0 INCOHERENT, 2 OK. Lignes title/meta ignorées (autres agents) : 9.

| fichier:ligne | texte actuel (extrait) | statut et problème | correction proposée |
|-|-|-|-|
| es/index.html:27 [JSON-LD] | ", "Supervisión OCPP", "Transformadores HTA/BT", "Soporte marca blanca", "mantenimiento IRVE", " | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | ", "Supervisión OCPP", "Transformadores MT/BT", "Soporte marca blanca", "mantenimiento IRVE", " |
| es/index.html:150 [JSON-LD] | "Mantenimiento de transformadores HTA/BT", | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | "Mantenimiento de transformadores MT/BT", |
| es/index.html:682 | Preventivo, correctivo, HTA/BT. Diagnóstico remoto seguido de intervención en si | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Preventivo, correctivo, MT/BT. Diagnóstico remoto seguido de intervención en si |
| es/index.html:761 | HTA/BT + puntos de recarga AC/DC + centro de atención co | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | MT/BT + puntos de recarga AC/DC + centro de atención co |
| es/index.html:797 | rcas, de AC 3,7 kW a DC 400 kW, centros HTA/BT incluidos. | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | rcas, de AC 3,7 kW a DC 400 kW, centros MT/BT incluidos. |
| es/instalacion-conformidad.html:70 [JSON-LD] | miento de la subestación transformadora HTA/BT, la obra civil (losas, zanjas, recorridos de cabl | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | miento de la subestación transformadora MT/BT, la obra civil (losas, zanjas, recorridos de cabl |
| es/instalacion-conformidad.html:78 [JSON-LD] | royectos DC con creación de subestación HTA/BT se extienden de 3 a 6 meses, principalmente por l | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | royectos DC con creación de subestación MT/BT se extienden de 3 a 6 meses, principalmente por l |
| es/instalacion-conformidad.html:272 | xistentes, instalación de subestaciones HTA/BT para los hubs de recarga DC. Desde el estudio téc | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | xistentes, instalación de subestaciones MT/BT para los hubs de recarga DC. Desde el estudio téc |
| es/instalacion-conformidad.html:335 | icio OCPP. Instalación de subestaciones HTA/BT para los hubs de recarga DC de alta potencia. | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | icio OCPP. Instalación de subestaciones MT/BT para los hubs de recarga DC de alta potencia. |
| es/instalacion-conformidad.html:351 | Conexión Enedis y subestaciones HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Conexión Enedis y subestaciones MT/BT |
| es/instalacion-conformidad.html:422 | Puntos DC 50-350 kW con subestación HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Puntos DC 50-350 kW con subestación MT/BT |
| es/instalacion-conformidad.html:625 | mental para instalaciones eléctricas de baja tensión. Regula el dimensionamiento de cables, dispositiv | OK : baja tensión/BT : correct | aucune |
| es/instalacion-conformidad.html:658 | [commentaire HTML] Proceso Consuel & HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | [commentaire MTML] Proceso Consuel & MT/BT |
| es/instalacion-conformidad.html:672 | Infraestructura eléctrica HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Infraestructura eléctrica MT/BT |
| es/instalacion-conformidad.html:673 | estaciones transformadoras dedicadas de alta tensión (HTA) a baja tensión (BT). Esto añade una complej (x4) | FAUX : alta tensión/HT rend HTA (= media tensión) | estaciones transformadoras dedicadas de media tensión (MT) a baja tensión (BT). Esto añade una complej |
| es/instalacion-conformidad.html:677 | nstalación y puesta en marcha de celdas HTAInstalación y prueba de aparamenta HTA, transforma (x3) | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | nstalación y puesta en marcha de celdas MTInstalación y prueba de aparamenta MT, transforma |
| es/instalacion-conformidad.html:678 | imiento preventivo para transformadores HTA/BT: análisis de aceite, inspecciones termográficas, | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | imiento preventivo para transformadores MT/BT: análisis de aceite, inspecciones termográficas, |
| es/instalacion-conformidad.html:798 | miento de la subestación transformadora HTA/BT, la obra civil (losas, zanjas, recorridos de cabl | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | miento de la subestación transformadora MT/BT, la obra civil (losas, zanjas, recorridos de cabl |
| es/instalacion-conformidad.html:807 | royectos DC con creación de subestación HTA/BT se extienden de 3 a 6 meses, principalmente por l | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | royectos DC con creación de subestación MT/BT se extienden de 3 a 6 meses, principalmente por l |
| es/operacion-mantenimiento.html:21 [JSON-LD] | vehículos eléctricos y transformadores HTA/BT. Puesta en servicio, mantenimiento preventivo y c | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | vehículos eléctricos y transformadores MT/BT. Puesta en servicio, mantenimiento preventivo y c |
| es/operacion-mantenimiento.html:54 [JSON-LD] | ién intervenimos en los transformadores HTA/BT asociados." | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | ién intervenimos en los transformadores MT/BT asociados." |
| es/operacion-mantenimiento.html:223 | bordo. Puntos AC, DC y transformadores HTA/BT. Francia entera y Bélgica. | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | bordo. Puntos AC, DC y transformadores MT/BT. Francia entera y Bélgica. |
| es/operacion-mantenimiento.html:427 | Transformadores HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Transformadores MT/BT |
| es/operacion-mantenimiento.html:429 | Mantenimiento de los Transformadores HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Mantenimiento de los Transformadores MT/BT |
| es/operacion-mantenimiento.html:432 | C proviene del centro de transformación HTA/BT aguas arriba, no del propio punto. La mayoría de | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | C proviene del centro de transformación MT/BT aguas arriba, no del propio punto. La mayoría de |
| es/operacion-mantenimiento.html:435 | Nuestros técnicos habilitados en HTA intervienen en celdas de protección, compartiment (x2) | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Nuestros técnicos habilitados en MT intervienen en celdas de protección, compartiment |
| es/operacion-mantenimiento.html:461 | Celdas HTA y compartimentos de cables | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Celdas MT y compartimentos de cables |
| es/operacion-mantenimiento.html:577 | [commentaire HTML] Transformadores HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | [commentaire MTML] Transformadores MT/BT |
| es/operacion-mantenimiento.html:585 | Transformadores HTA/BT | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Transformadores MT/BT |
| es/operacion-mantenimiento.html:594 | Celdas HTA | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Celdas MT |
| es/operacion-mantenimiento.html:631 | Armario TGBT puesto HTA | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Armario TGBT puesto MT |
| es/operacion-mantenimiento.html:635 | ;Operaciones en los disyuntores general BT | OK : baja tensión/BT : correct | aucune |
| es/operacion-mantenimiento.html:674 | Fusibles HTA | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | Fusibles MT |
| es/operacion-mantenimiento.html:708 | &#8226;Identificación del material HT / transformadores / disyuntor BT (x2) | FAUX : alta tensión/HT rend HTA (= media tensión) | &#8226;Identificación del material MT / transformadores / disyuntor BT |
| es/operacion-mantenimiento.html:712 | alizadas según la antigüedad del puesto HTA | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | alizadas según la antigüedad del puesto MT |
| es/operacion-mantenimiento.html:996 | (puntos, cables, TGBT, transformadores HTA/BT) y las modalidades de reporting. Un interlocutor | AMBIGU : sigle français HTA ; en espagnol on écrit MT (media tensión) | (puntos, cables, TGBT, transformadores MT/BT) y las modalidades de reporting. Un interlocutor |

Incohérences internes (es) : HTA/BT (sigle français) partout, mais « HT » (alta tensión) à operacion-mantenimiento.html:708 et « alta tensión (HTA) » à instalacion-conformidad.html:673. Forme à retenir : MT/BT. TGBT (tableau général basse tension) reste français dans operacion-mantenimiento.html (6 lignes) : écrire « cuadro general de baja tensión (CGBT) ».

### 1.4 Italien (it/)

Lignes concernées : 32 (dont 3 en JSON-LD) ; occurrences : 40 = 4 FAUX, 0 AMBIGU, 10 INCOHERENT, 26 OK. Lignes title/meta ignorées (autres agents) : 6.

| fichier:ligne | texte actuel (extrait) | statut et problème | correction proposée |
|-|-|-|-|
| it/gestione-manutenzione.html:21 [JSON-LD] | a per veicoli elettrici e trasformatori MT/BT. Messa in servizio, manutenzione preventiva e cor | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:66 [JSON-LD] | anche la manutenzione dei trasformatori MT/BT associati." | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:222 | bordo. Colonnine AC, DC, trasformatori MT/BT. Francia e Belgio. | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:426 | Trasformatori MT/BT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:428 | Manutenzione dei Trasformatori MT/BT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:431 | alle colonnine DC proviene dalla cabina MT/BT a monte, non dalla colonnina stessa. La maggior p | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:434 | I nostri tecnici abilitati MT intervengono su celle di protezione, compartiment (x3) | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:460 | Celle MT &amp; compartimenti cavi | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:468 | Quadri generali BT &amp; sbarre | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:576 | [commentaire HTML] Trasformatori MT/BT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:584 | Trasformatori MT/BT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:593 | Celle di sezionamento MT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:630 | Quadro generale cabina MT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:634 | &#8226;Operazioni interruttore generale BT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:673 | Fusibili MT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:707 | &#8226;Identificazione apparecchiature MT / trasformatore / interruttore BT (x2) | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:711 | onalizzate in base all'età della cabina MT | OK : MT/BT, bassa tensione : correct | aucune |
| it/gestione-manutenzione.html:959 | anche la manutenzione dei trasformatori MT/BT associati. | OK : MT/BT, bassa tensione : correct | aucune |
| it/index.html:106 [JSON-LD] | "Manutenzione trasformatori MT/BT", | OK : MT/BT, bassa tensione : correct | aucune |
| it/index.html:552 | Preventiva, correttiva, MT/BT. Diagnosi a distanza e poi intervento in loco, co | OK : MT/BT, bassa tensione : correct | aucune |
| it/index.html:631 | MT/BT + colonnine AC/DC + hotline con un unico interloc | OK : MT/BT, bassa tensione : correct | aucune |
| it/index.html:667 | arche, da AC 3,7 kW a DC 400 kW, cabine MT/BT incluse. | OK : MT/BT, bassa tensione : correct | aucune |
| it/installazione-conformita.html:272 | rchi esistenti, installazione di cabine HTA/BT per gli hub di ricarica DC. Dallo studio tecnico | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | rchi esistenti, installazione di cabine MT/BT per gli hub di ricarica DC. Dallo studio tecnico |
| it/installazione-conformita.html:335 | servizio OCPP. Installazione di cabine HTA/BT per gli hub di ricarica DC ad alta potenza. | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | servizio OCPP. Installazione di cabine MT/BT per gli hub di ricarica DC ad alta potenza. |
| it/installazione-conformita.html:351 | Allacciamento Enedis e cabine HTA/BT | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | Allacciamento Enedis e cabine MT/BT |
| it/installazione-conformita.html:422 | Caricatori DC 50-350 kW con cabina HTA/BT | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | Caricatori DC 50-350 kW con cabina MT/BT |
| it/installazione-conformita.html:666 | damentale per gli impianti elettrici in bassa tensione. Regola il dimensionamento dei cavi, i dispositiv | OK : MT/BT, bassa tensione : correct | aucune |
| it/installazione-conformita.html:699 | [commentaire HTML] Processo Consuel & HTA/BT | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | [commentaire HTML] Processo Consuel & MT/BT |
| it/installazione-conformita.html:713 | Infrastruttura elettrica HTA/BT | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | Infrastruttura elettrica MT/BT |
| it/installazione-conformita.html:714 | so cabine di trasformazione dedicate da alta tensione (HTA) a bassa tensione (BT). Questo aggiunge una (x4) | FAUX : alta tensione (HTA) : HTA = media tensione | so cabine di trasformazione dedicate da media tensione (MT) a bassa tensione (BT). Questo aggiunge una |
| it/installazione-conformita.html:718 | Installazione e messa in servizio celle HTAInstallazione e collaudo di apparecchiature di man (x3) | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | Installazione e messa in servizio celle MTInstallazione e collaudo di apparecchiature di man |
| it/installazione-conformita.html:719 | nutenzione preventiva per trasformatori HTA/BT: analisi dell'olio, ispezioni termografiche, test | INCOHERENT : HTA (sigle français) alors que les pages gestione-manutenzione/index disent MT/BT | nutenzione preventiva per trasformatori MT/BT: analisi dell'olio, ispezioni termografiche, test |

Incohérences internes (it) : gestione-manutenzione.html et index.html disent MT/BT (correct), installazione-conformita.html dit HTA/BT et « alta tensione (HTA) ». Forme à retenir : MT/BT partout. Aucune occurrence de TGBT (traduit : « Quadri generali BT »).

### 1.5 Néerlandais (nl/)

Lignes concernées : 32 (dont 3 en JSON-LD) ; occurrences : 39 = 17 FAUX, 20 AMBIGU, 0 INCOHERENT, 2 OK. Lignes title/meta ignorées (autres agents) : 9.

| fichier:ligne | texte actuel (extrait) | statut et problème | correction proposée |
|-|-|-|-|
| nl/exploitatie-onderhoud.html:21 [JSON-LD] | rectief onderhoud van IRVE-laadpalen en HTA/BT-transformatoren. OCPP-bewaking, inbedrijfstelling | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | rectief onderhoud van IRVE-laadpalen en MS/LS-transformatoren. OCPP-bewaking, inbedrijfstelling |
| nl/exploitatie-onderhoud.html:99 [JSON-LD] | rventieomvang (laadpalen, kabels, TGBT, HTA/BT-transformatoren) en de rapportagemodaliteiten. Ee | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | rventieomvang (laadpalen, kabels, TGBT, MS/LS-transformatoren) en de rapportagemodaliteiten. Ee |
| nl/exploitatie-onderhoud.html:248 | erdelen aan boord. AC- en DC-laadpalen, HTA/BT-transformatoren. Heel Frankrijk en België. | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | erdelen aan boord. AC- en DC-laadpalen, MS/LS-transformatoren. Heel Frankrijk en België. |
| nl/exploitatie-onderhoud.html:452 | HTA/BT-transformatoren | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | MS/LS-transformatoren |
| nl/exploitatie-onderhoud.html:454 | Onderhoud van HTA/BT-transformatoren | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | Onderhoud van MS/LS-transformatoren |
| nl/exploitatie-onderhoud.html:457 | DC-laadpalen komt van de bovenliggende HTA/BT-post, niet van de laadpaal zelf. De meeste IRVE-o | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | DC-laadpalen komt van de bovenliggende MS/LS-post, niet van de laadpaal zelf. De meeste IRVE-o |
| nl/exploitatie-onderhoud.html:460 | Onze HTA-gemachtigde technici werken aan beveiligingscelle (x2) | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | Onze MS-gemachtigde technici werken aan beveiligingscelle |
| nl/exploitatie-onderhoud.html:486 | HTA-cellen &amp; kabelcompartimenten | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | MS-cellen &amp; kabelcompartimenten |
| nl/exploitatie-onderhoud.html:602 | [commentaire HTML] HTA/BT-transformatoren | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | [commentaire HTML] MS/LS-transformatoren |
| nl/exploitatie-onderhoud.html:610 | HTA/BT-transformatoren | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | MS/LS-transformatoren |
| nl/exploitatie-onderhoud.html:619 | HTA-cellen | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | MS-cellen |
| nl/exploitatie-onderhoud.html:656 | TGBT-kast HTA-post | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | TGBT-kast MS-post |
| nl/exploitatie-onderhoud.html:660 | &#8226;Werkzaamheden aan de algemene LS-automaten | OK : LS/laagspanning : correct | aucune |
| nl/exploitatie-onderhoud.html:699 | HTA-zekeringen | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | MS-zekeringen |
| nl/exploitatie-onderhoud.html:733 | &#8226;Identificatie van het HS-materieel / transformatoren / LS-automaat (x2) | FAUX : HS/hoogspanning rend HTA (= middenspanning) | &#8226;Identificatie van het MS-materieel / transformatoren / LS-automaat |
| nl/exploitatie-onderhoud.html:737 | maat afhankelijk van de ouderdom van de HTA-post | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | maat afhankelijk van de ouderdom van de MS-post |
| nl/exploitatie-onderhoud.html:1021 | rventieomvang (laadpalen, kabels, TGBT, HTA/BT-transformatoren) en de rapportagemodaliteiten. Ee | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | rventieomvang (laadpalen, kabels, TGBT, MS/LS-transformatoren) en de rapportagemodaliteiten. Ee |
| nl/index.html:105 [JSON-LD] | "Onderhoud van HTA/BT-transformatoren", | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | "Onderhoud van MS/LS-transformatoren", |
| nl/index.html:552 | Preventief, correctief, HTA/BT. Diagnose op afstand gevolgd door interventie ter | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | Preventief, correctief, MS/LS. Diagnose op afstand gevolgd door interventie ter |
| nl/index.html:630 | HTA/BT + AC/DC-laadpalen + hotline onder één aanspreekpu | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | MS/LS + AC/DC-laadpalen + hotline onder één aanspreekpu |
| nl/index.html:666 | . Alle merken, AC 3,7 kW tot DC 400 kW, HTA/BT-posten inbegrepen. | AMBIGU : sigle français HTA/BT ; en néerlandais MS/LS (middenspanning/laagspanning) | . Alle merken, AC 3,7 kW tot DC 400 kW, MS/LS-posten inbegrepen. |
| nl/installatie-conformiteit.html:274 | e van bestaande parken, installatie van HS/LS-transformatorstations voor DC-laadhubs. Van techn | FAUX : HS/hoogspanning rend HTA (= middenspanning) | e van bestaande parken, installatie van MS/LS-transformatorstations voor DC-laadhubs. Van techn |
| nl/installatie-conformiteit.html:337 | OCPP-inbedrijfstelling. Installatie van HS/LS-transformatorstations voor DC-laadhubs met hoog v | FAUX : HS/hoogspanning rend HTA (= middenspanning) | OCPP-inbedrijfstelling. Installatie van MS/LS-transformatorstations voor DC-laadhubs met hoog v |
| nl/installatie-conformiteit.html:353 | Enedis-aansluiting en HS/LS-transformatorstations | FAUX : HS/hoogspanning rend HTA (= middenspanning) | Enedis-aansluiting en MS/LS-transformatorstations |
| nl/installatie-conformiteit.html:424 | DC-laders 50-350 kW met HS/LS-station | FAUX : HS/hoogspanning rend HTA (= middenspanning) | DC-laders 50-350 kW met MS/LS-station |
| nl/installatie-conformiteit.html:627 | 15-100De fundamentele Franse norm voor laagspanningsinstallaties. Regelt kabeldimensionering, beveili | OK : LS/laagspanning : correct | aucune |
| nl/installatie-conformiteit.html:660 | [commentaire HTML] Consuel-proces & HS/LS | FAUX : HS/hoogspanning rend HTA (= middenspanning) | [commentaire HTML] Consuel-proces & MS/LS |
| nl/installatie-conformiteit.html:674 | HS/LS elektrische infrastructuur | FAUX : HS/hoogspanning rend HTA (= middenspanning) | MS/LS elektrische infrastructuur |
| nl/installatie-conformiteit.html:675 | ak toegewijde transformatorstations van hoogspanning (HS) naar laagspanning (LS). Dit voegt aanzienlij (x4) | FAUX : HS/hoogspanning rend HTA (= middenspanning) | ak toegewijde transformatorstations van middenspanning (MS) naar laagspanning (LS). Dit voegt aanzienlij |
| nl/installatie-conformiteit.html:679 | HS-cel installatie en inbedrijfstellingInstallatie e (x3) | FAUX : HS/hoogspanning rend HTA (= middenspanning) | MS-cel installatie en inbedrijfstellingInstallatie e |
| nl/installatie-conformiteit.html:680 | udPreventieve onderhoudscontracten voor HS/LS-transformatoren: olieanalyse, thermografische ins | FAUX : HS/hoogspanning rend HTA (= middenspanning) | udPreventieve onderhoudscontracten voor MS/LS-transformatoren: olieanalyse, thermografische ins |
| nl/installatie-conformiteit.html:800 | werken. DC-projecten met aanleg van een HS/LS-station lopen over 3 tot 6 maanden, voornamelijk | FAUX : HS/hoogspanning rend HTA (= middenspanning) | werken. DC-projecten met aanleg van een MS/LS-station lopen over 3 tot 6 maanden, voornamelijk |

Incohérences internes (nl) : exploitatie-onderhoud.html et index.html disent HTA/BT (sigle français), installatie-conformiteit.html dit HS/LS et « hoogspanning (HS) naar laagspanning (LS) », et exploitatie-onderhoud.html:733 dit « HS-materieel » alors que le même fichier dit « HTA-cellen » (:619) et « HTA-post » (:737). Forme à retenir : MS/LS. TGBT reste français (exploitatie-onderhoud.html, 7 lignes) : écrire « laagspanningshoofdverdeler (LSHV) » ou « algemeen laagspanningsbord ».

### 1.6 Polonais (pl/)

Lignes concernées : 32 (dont 4 en JSON-LD) ; occurrences : 39 = 0 FAUX, 0 AMBIGU, 19 INCOHERENT, 20 OK. Lignes title/meta ignorées (autres agents) : 9.

| fichier:ligne | texte actuel (extrait) | statut et problème | correction proposée |
|-|-|-|-|
| pl/eksploatacja-konserwacja.html:21 [JSON-LD] | cji ładowania IRVE oraz transformatorów SN/nn. Nadzór OCPP, uruchomienie i zarządzanie parkiem | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:99 [JSON-LD] | ji (stacje, kable, TGBT, transformatory SN/nn) oraz zasady raportowania. Dedykowany opiekun koo | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:245 | okładzie. Stacje AC, DC, transformatory SN/nn. Cala Francja i Belgia. | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:449 | Transformatory SN/nn | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:451 | Konserwacja transformatorów SN/nn | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:454 | stacji DC pochodzi z nadrzędnej stacji SN/nn, a nie z samej stacji. Większość serwisantów IRVE | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:457 | Nasi technicy z uprawnieniami SN interweniują przy celkach zabezpieczeń, komorach (x2) | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:483 | Celki SN i komory kablowe | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:599 | [commentaire HTML] Transformatory SN/nn | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:607 | Transformatory SN/nn | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:616 | Celki SN | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:653 | Szafa TGBT stacji SN | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:657 | #8226;Operacje na wyłącznikach głównych nn | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:696 | Bezpieczniki SN | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:730 | &#8226;Identyfikacja sprzętu SN / transformatorów / wyłącznika nn (x2) | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:734 | ozwiązania w zależności od wieku stacji SN | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/eksploatacja-konserwacja.html:1018 | ji (stacje, kable, TGBT, transformatory SN/nn) oraz zasady raportowania. Dedykowany opiekun koo | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/index.html:27 [JSON-LD] | ifelec", "Nadzór OCPP", "Transformatory HTA/BT", "Wsparcie white-label", "konserwacja IRVE", "in | INCOHERENT : HTA/BT (sigle français) alors que les pages eksploatacja/instalacja disent SN/nn | ifelec", "Nadzór OCPP", "Transformatory SN/nn", "Wsparcie white-label", "konserwacja IRVE", "in |
| pl/index.html:150 [JSON-LD] | "Konserwacja transformatorów HTA/BT", | INCOHERENT : HTA/BT (sigle français) alors que les pages eksploatacja/instalacja disent SN/nn | "Konserwacja transformatorów SN/nn", |
| pl/index.html:677 | Prewencja, naprawy, HTA/BT. Diagnostyka zdalna, a następnie interwencja na m | INCOHERENT : HTA/BT (sigle français) alors que les pages eksploatacja/instalacja disent SN/nn | Prewencja, naprawy, SN/nn. Diagnostyka zdalna, a następnie interwencja na m |
| pl/index.html:756 | HTA/BT + stacje AC/DC + infolinia u jednego partnera. Ko | INCOHERENT : HTA/BT (sigle français) alors que les pages eksploatacja/instalacja disent SN/nn | SN/nn + stacje AC/DC + infolinia u jednego partnera. Ko |
| pl/index.html:792 | arki, od AC 3,7 kW po DC 400 kW, stacje HTA/BT w komplecie. | INCOHERENT : HTA/BT (sigle français) alors que les pages eksploatacja/instalacja disent SN/nn | arki, od AC 3,7 kW po DC 400 kW, stacje SN/nn w komplecie. |
| pl/instalacja-zgodnosc.html:284 | w, instalacja stacji transformatorowych SN/nN dla hubów ładowania DC. Od studium technicznego p | INCOHERENT : graphie nN (autres pages : nn) | w, instalacja stacji transformatorowych SN/nn dla hubów ładowania DC. Od studium technicznego p |
| pl/instalacja-zgodnosc.html:347 | P. Instalacja stacji transformatorowych SN/nN dla hubów ładowania DC dużej mocy. | INCOHERENT : graphie nN (autres pages : nn) | P. Instalacja stacji transformatorowych SN/nn dla hubów ładowania DC dużej mocy. |
| pl/instalacja-zgodnosc.html:363 | ącze do sieci i stacje transformatorowe SN/nN | INCOHERENT : graphie nN (autres pages : nn) | ącze do sieci i stacje transformatorowe SN/nn |
| pl/instalacja-zgodnosc.html:434 | DC 50-350 kW ze stacją transformatorową SN/nN | INCOHERENT : graphie nN (autres pages : nn) | DC 50-350 kW ze stacją transformatorową SN/nn |
| pl/instalacja-zgodnosc.html:637 | wa francuska norma dotycząca instalacji niskonapięciowych. Reguluje dobór kabli, urządzenia ochronne, syste | OK : SN/nn, niskie napięcie : correct | aucune |
| pl/instalacja-zgodnosc.html:670 | [commentaire HTML] Proces Consuel & HTA/BT | INCOHERENT : HTA/BT (sigle français) alors que les pages eksploatacja/instalacja disent SN/nn | [commentaire HTML] Proces Consuel & SN/nn |
| pl/instalacja-zgodnosc.html:684 | Infrastruktura elektryczna SN/nN | INCOHERENT : graphie nN (autres pages : nn) | Infrastruktura elektryczna SN/nn |
| pl/instalacja-zgodnosc.html:685 | i transformatorowych przekształcających średnie napięcie (SN) na niskie napięcie (nN). To znacząco zwiększ (x4) | INCOHERENT : graphie nN (autres pages : nn) | i transformatorowych przekształcających średnie napięcie (SN) na niskie napięcie (nn). To znacząco zwiększ |
| pl/instalacja-zgodnosc.html:689 | cja i testowanie aparatury rozdzielczej SN, transformatora i rozdzielnic nN. Pełne pomiary e (x3) | INCOHERENT : graphie nN (autres pages : nn) | (voir règle 1.0) |
| pl/instalacja-zgodnosc.html:690 | nserwację zapobiegawczą transformatorów SN/nN: analiza oleju, inspekcje termograficzne, testy z | INCOHERENT : graphie nN (autres pages : nn) | nserwację zapobiegawczą transformatorów SN/nn: analiza oleju, inspekcje termograficzne, testy z |

Incohérences internes (pl) : eksploatacja-konserwacja.html dit SN/nn, instalacja-zgodnosc.html dit SN/nN (casse différente), index.html et o-nas.html disent HTA/BT. Forme à retenir : SN/nn (ou SN/nN, mais une seule graphie ; nn est la forme courante des normes polonaises). TGBT reste français (eksploatacja-konserwacja.html, 7 lignes) : écrire « rozdzielnica główna nn (RG nn) ».

### 1.7 Portugais (pt/)

Lignes concernées : 33 (dont 7 en JSON-LD) ; occurrences : 37 = 2 FAUX, 34 AMBIGU, 0 INCOHERENT, 1 OK. Lignes title/meta ignorées (autres agents) : 9.

| fichier:ligne | texte actuel (extrait) | statut et problème | correction proposée |
|-|-|-|-|
| pt/cobertura.html:752 | Manutenção e reparação HTA/BT. Equipas habilitadas. | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Manutenção e reparação MT/BT. Equipas habilitadas. |
| pt/index.html:27 [JSON-LD] | c", "Supervisão OCPP", "Transformadores HTA/BT", "Suporte marca branca", "manutenção IRVE", "ins | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | c", "Supervisão OCPP", "Transformadores MT/BT", "Suporte marca branca", "manutenção IRVE", "ins |
| pt/index.html:150 [JSON-LD] | "Manutenção de transformadores HTA/BT", | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | "Manutenção de transformadores MT/BT", |
| pt/index.html:613 | Preventiva, corretiva, HTA/BT. Diagnóstico remoto e depois intervenção no local | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Preventiva, corretiva, MT/BT. Diagnóstico remoto e depois intervenção no local |
| pt/index.html:691 | HTA/BT + postos AC/DC + linha de apoio com um único inte | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | MT/BT + postos AC/DC + linha de apoio com um único inte |
| pt/index.html:727 | arcas, de AC 3,7 kW a DC 400 kW, postos HTA/BT incluídos. | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | arcas, de AC 3,7 kW a DC 400 kW, postos MT/BT incluídos. |
| pt/instalacao-conformidade.html:67 [JSON-LD] | a NF C 15-100 (instalações elétricas de baixa tensão), a sua parte 7-722 (especifica para postos de ca (x2) | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | (voir règle 1.0) |
| pt/instalacao-conformidade.html:83 [JSON-LD] | mensionamento do posto de transformação HTA/BT, a engenharia civil (lajes, valas, percursos de c | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | mensionamento do posto de transformação MT/BT, a engenharia civil (lajes, valas, percursos de c |
| pt/instalacao-conformidade.html:91 [JSON-LD] | il. Os projetos DC com criação de posto HTA/BT estendem-se por 3 a 6 meses, sobretudo devido aos | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | il. Os projetos DC com criação de posto MT/BT estendem-se por 3 a 6 meses, sobretudo devido aos |
| pt/instalacao-conformidade.html:285 | arques existentes, instalação de postos HTA/BT para os hubs de carregamento DC. Do estudo técnic | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | arques existentes, instalação de postos MT/BT para os hubs de carregamento DC. Do estudo técnic |
| pt/instalacao-conformidade.html:348 | a em serviço OCPP. Instalação de postos HTA/BT para os hubs de carregamento DC de alta potencia. | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | a em serviço OCPP. Instalação de postos MT/BT para os hubs de carregamento DC de alta potencia. |
| pt/instalacao-conformidade.html:364 | Ligação Enedis e postos HTA/BT | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Ligação Enedis e postos MT/BT |
| pt/instalacao-conformidade.html:435 | Postos DC 50-350 kW com posto HTA/BT | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Postos DC 50-350 kW com posto MT/BT |
| pt/instalacao-conformidade.html:712 | a NF C 15-100 (instalações elétricas de baixa tensão), a sua parte 7-722 (especifica para postos de ca (x2) | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | (voir règle 1.0) |
| pt/instalacao-conformidade.html:730 | mensionamento do posto de transformação HTA/BT, a engenharia civil (lajes, valas, percursos de c | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | mensionamento do posto de transformação MT/BT, a engenharia civil (lajes, valas, percursos de c |
| pt/instalacao-conformidade.html:739 | il. Os projetos DC com criação de posto HTA/BT estendem-se por 3 a 6 meses, sobretudo devido aos | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | il. Os projetos DC com criação de posto MT/BT estendem-se por 3 a 6 meses, sobretudo devido aos |
| pt/operacao-manutencao.html:21 [JSON-LD] | de veículos elétricos e transformadores HTA/BT. Colocação em serviço, manutenção preventiva e cu | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | de veículos elétricos e transformadores MT/BT. Colocação em serviço, manutenção preventiva e cu |
| pt/operacao-manutencao.html:54 [JSON-LD] | . Também intervimos nos transformadores HTA/BT associados." | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | . Também intervimos nos transformadores MT/BT associados." |
| pt/operacao-manutencao.html:211 | a bordo. Postos AC, DC, transformadores HTA/BT. França continental e Bélgica. | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | a bordo. Postos AC, DC, transformadores MT/BT. França continental e Bélgica. |
| pt/operacao-manutencao.html:415 | Transformadores HTA/BT | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Transformadores MT/BT |
| pt/operacao-manutencao.html:417 | Manutenção dos Transformadores HTA/BT | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Manutenção dos Transformadores MT/BT |
| pt/operacao-manutencao.html:420 | das avarias dos postos DC vem do posto HTA/BT a montante, não do próprio posto. A maioria dos p | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | das avarias dos postos DC vem do posto MT/BT a montante, não do próprio posto. A maioria dos p |
| pt/operacao-manutencao.html:423 | Os nossos técnicos habilitados em HTA intervêm em células de proteção, compartimentos d (x2) | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Os nossos técnicos habilitados em MT intervêm em células de proteção, compartimentos d |
| pt/operacao-manutencao.html:449 | Células HTA &amp; compartimentos de cabos | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Células MT &amp; compartimentos de cabos |
| pt/operacao-manutencao.html:565 | [commentaire HTML] Transformadores HTA/BT | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | [commentaire MTML] Transformadores MT/BT |
| pt/operacao-manutencao.html:573 | Transformadores HTA/BT | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Transformadores MT/BT |
| pt/operacao-manutencao.html:582 | Células HTA | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Células MT |
| pt/operacao-manutencao.html:619 | Quadro TGBT posto HTA | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Quadro TGBT posto MT |
| pt/operacao-manutencao.html:623 | &#8226;Operações nos disjuntores gerais BT | OK : baixa tensão/BT : correct | aucune |
| pt/operacao-manutencao.html:662 | Fusíveis HTA | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | Fusíveis MT |
| pt/operacao-manutencao.html:696 | &#8226;Identificação do material HT / transformadores / disjuntor BT (x2) | FAUX : HT (alta tensão) rend HTA (= média tensão) | &#8226;Identificação do material MT / transformadores / disjuntor BT |
| pt/operacao-manutencao.html:700 | zadas em função da antiguidade do posto HTA | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | zadas em função da antiguidade do posto MT |
| pt/operacao-manutencao.html:984 | o (postos, cabos, TGBT, transformadores HTA/BT) e as modalidades de reporting. Um interlocutor d | AMBIGU : sigle français HTA ; en portugais MT (média tensão) | o (postos, cabos, TGBT, transformadores MT/BT) e as modalidades de reporting. Um interlocutor d |

Incohérences internes (pt) : HTA/BT partout (sigle français) et « HT » à operacao-manutencao.html:696. Ambiguïté de vocabulaire : « posto » désigne à la fois la borne (« posto de carregamento ») et le poste électrique (« posto HTA/BT », instalacao-conformidade.html:435 : « Postos DC 50-350 kW com posto HTA/BT »). Forme à retenir : MT/BT et « posto de transformação (PT) » pour le poste. TGBT reste français (operacao-manutencao.html, 6 lignes) : écrire « quadro geral de baixa tensão (QGBT) ».

### 1.8 Autres termes métier (par langue, constats vérifiés par grep)

Ces termes ne sont pas listés ligne par ligne (volume), mais chaque constat est référencé. FR de référence : « techniciens habilités » (a-propos.html:266, exploitation.html:75, faq.html:473), « certifiés Qualifelec IRVE, habilités et autonomes » (index.html:788) ; le FR mélange lui-même « certifié » et « habilité » (securisation-installations.html:530 « techniciens certifiés »).

Règle proposée : « habilité » = habilitation électrique délivrée par l'employeur (NF C 18-510) ; « certifié Qualifelec » = qualification de l'entreprise ; ne jamais traduire « habilité » par « certified ».

| Langue | Terme FR | Formes trouvées (fichier:ligne) | Problème | Forme à retenir |
|-|-|-|-|-|
| en | habilité | certified technicians (about.html:333, installation-security.html:531, operations-maintenance.html:115), HV-certified (operations-maintenance.html:458), authorised (index.html:747), qualified (about.html:268, 455, 468, 469 ; operations-maintenance.html:75, 992) | 3 mots pour 1 notion ; « HV » faux | electrically authorised technicians (NF C 18-510) ; MV-authorised |
| de | habilité | zertifizierte Techniker (ueber-uns.html:65, 248, 333 ; betrieb-wartung.html:115 ; anlagensicherung.html:532), befähigte (ueber-uns.html:459, 468 ; betrieb-wartung.html:848), HV-befähigten (betrieb-wartung.html:459), geschult (callcenter.html:393, 448) | zertifiziert = certification, pas habilitation | elektrotechnisch befähigte Techniker (Habilitation nach NF C 18-510) |
| es | habilité | habilitados (nosotros.html:270, 457, 470 ; operacion-mantenimiento.html:435, 824, 969 ; index.html:803), certificados (nosotros.html:250, 335 ; seguridad-instalaciones.html:531), cualificados (nosotros.html:209, 250) | mélange habilitados/certificados | técnicos habilitados (habilitación eléctrica) |
| it | habilité | abilitati (chi-siamo.html:268, 455, 468 ; gestione-manutenzione.html:434, 823), certificati (chi-siamo.html:248, 333 ; sicurezza-installazioni.html:531), qualificati (chi-siamo.html:207, 248) | idem | tecnici abilitati (abilitazione elettrica) |
| nl | habilité | bevoegd (over-ons.html:269, 456, 469 ; exploitatie-onderhoud.html:75, 849), gecertificeerde technici (beveiliging-installaties.html:531 ; exploitatie-onderhoud.html:115 ; over-ons.html:334), HTA-gemachtigde (exploitatie-onderhoud.html:460), irve-gecertificeerde technici (index.html:672) | 3 mots (bevoegd, gemachtigd, gecertificeerd) ; dérive relevée par la revue | bevoegde technici (elektrische bevoegdheid, NF C 18-510) |
| pl | habilité | uprawnieni (o-nas.html:268, 459, 468, 469 ; eksploatacja-konserwacja.html:75, 457, 846), certyfikowani (o-nas.html:65, 333 ; eksploatacja-konserwacja.html:115 ; zabezpieczenie-instalacji.html:480, 530 ; index.html:646, 798), przeszkoleni (centrum-telefoniczne.html:259, 434) | mélange uprawnieni/certyfikowani | technicy z uprawnieniami elektrycznymi (NF C 18-510) |
| pt | habilité | habilitados (sobre-nos.html:269, 456, 469 ; operacao-manutencao.html:423, 812, 957 ; index.html:733 ; cobertura.html:752), certificados (sobre-nos.html:249, 334 ; seguranca-instalacoes.html:531 ; operacao-manutencao.html:231) | mélange | técnicos habilitados (habilitação elétrica) |
| toutes | Qualifelec | gardé tel quel partout (en/de/es/it/nl/pl/pt) | OK. Mais « Qualifelec-zertifizierte Installation », « Qualifelec-gecertificeerde », « certyfikat Qualifelec » : voir 3.2 sur le mot « certifié » | garder Qualifelec ; verbe selon la décision d'Auxence |
| toutes | Consuel | nom propre, gardé partout (en 13, de 13, es 20, it 14, nl 14, pl 14, pt 15 occurrences du mot) | OK. FR dit « attestation Consuel » (installation-conformite.html:72-75, 413) ; les traductions disent « certificate/Zertifikat/Zertifizierungsverfahren » (de/installation-konformitaet.html:532, 681 ; es/instalacion-conformidad.html:661-662 ; nl/installatie-conformiteit.html:663 « Consuel-certificeringsproces ») | « attestation de conformité Consuel » : en attestation, de Konformitätsbescheinigung, es certificado, it attestazione, nl conformiteitsattest, pl zaświadczenie, pt atestado |
| en | bureau de contrôle | inspection body (index.html:877-878 ; installation-compliance.html:651), approved inspection (installation-compliance.html:90, 883) | OK | inspection body |
| de | bureau de contrôle | Prüfstelle (index.html:883-884, 1023 ; installation-konformitaet.html:78, 639) | OK (Prüfstelle) ; « Zertifizierung durch Prüfstelle » (639) est un titre trompeur | Prüfstelle |
| es | bureau de contrôle | entidad de control (index.html:933-934 ; FR index.html:924-925), organismo de inspección / organismo acreditado (instalacion-conformidad.html:640) | 2 formes selon la page | organismo de control |
| it | bureau de contrôle | organismo di ispezione (index.html:803-804 ; installazione-conformita.html:78, 681, 807) | OK | organismo di controllo (ou ispezione) |
| nl | bureau de contrôle | keuringsinstantie (index.html:802-803), controleorganisme (installatie-conformiteit.html:78, 809), keuringsorganisme (installatie-conformiteit.html:642) | 3 mots pour 1 notion | erkend controleorganisme (un seul) |
| pl | bureau de contrôle | uprawniony organ (instalacja-zgodnosc.html:89, 819), akredytowany organ kontrolny (652) | 2 formes | akredytowana jednostka kontrolna |
| pt | bureau de contrôle | organismo de controlo (index.html:863-864), organismo acreditado (instalacao-conformidade.html:99, 748) | OK | organismo de controlo |
| toutes | borne | en charger/charging station ; de Ladestation (111) mais aussi Ladesäule (3), Wallbox, Ladepunkt ; es punto de recarga ; it colonnina (65) / stazione di ricarica (24) ; nl laadpaal (91) mais laadstation (3), lader (5) ; pl stacja ładowania (33+) / ładowarka (6) ; pt posto de carregamento | mélange de 2 à 3 mots par langue | de : Ladestation ; nl : laadpaal ; it : colonnina ; pl : stacja ładowania ; pt : posto de carregamento ; es : punto de recarga ; en : charging station |
| it, es, pt | borne laissé en français | it/installazione-conformita.html:859, 869, 879 (titres d'articles de blog en français) ; es/operacion-mantenimiento.html:552 et pt/operacao-manutencao.html:540 « bornes » (bornes de câblage : sens correct mais ambigu, préférer terminales/bornas ou terminais) | cartes blog FR dans pages traduites | traduire le libellé de carte ou marquer (FR) |
| toutes | wallbox | gardé (Wallbox) : en 17, de 15, es 14, it 13, nl 16, pl 15, pt 17 | OK, terme international | garder |
| toutes | IRVE | gardé tel quel : en 113, de 84, es 216, it 70, nl 198, pl 209, pt 225 occurrences | sigle français inconnu hors de France | gloser à la 1re occurrence de chaque page : en EV charging infrastructure (IRVE), de Ladeinfrastruktur (IRVE), etc. |
| toutes | AC/DC | « AC/DC » (en 15, de 6, es 9, it 8, nl 8, pl 9, pt 6) et « AC-/DC- », « AC and DC » selon les pages | graphies mixtes mais sens correct | AC/DC dans les titres, « AC- und DC-Ladestationen » dans la prose |

## 2. Désynchronisation avec le français actuel

FR actuel de référence (index.html) :

- FR 682 : « Étude, installation et vérification des équipements. Sur un parc existant, audit des écarts et préparation des corrections nécessaires. »
- FR 788 : « Réponse sous 24h ouvrées. Techniciens certifiés Qualifelec IRVE, habilités et autonomes. Préparation des pièces, diagnostic sur site et essais de remise en service. »
- FR 936 (FAQ) : « Les délais sont définis dans votre contrat de maintenance. Avant tout déplacement, on fait un diagnostic à distance. L'objectif : résoudre la panne au premier passage et, si une pièce manque, y retourner sans facturation de déplacement supplémentaire. » (objectif, pas promesse : les traductions de ce passage sont synchrones)
- FR 697 : « Hotline IRVE 100% basée en France, 7j/7. » ; FR centre-appel.html:282 : « Multilangue (FR, EN, NL) » ; FR exploitation.html:422 : « Hotline 24/7 (FR/EN/NL) ».

### 2.1 « Du premier coup » (NF C 15-100) : plus fort que le FR

| Langue | fichier:ligne | texte traduit actuel | FR actuel (fichier:ligne) | traduction proposée du FR actuel |
|-|-|-|-|-|
| en | en/index.html:641 | Your chargers pass the NF C 15-100 inspection first time. | index.html:682 | Design, installation and checks of the equipment. On an existing fleet, we audit the gaps and prepare the necessary corrections. |
| de | de/index.html:648 | Ihre Ladestationen bestehen die NF C 15-100 Prüfung beim ersten Mal. | index.html:682 | Planung, Installation und Prüfung der Anlagen. Bei einem bestehenden Bestand: Audit der Abweichungen und Vorbereitung der nötigen Korrekturen. |
| es | es/index.html:697 | Sus puntos de recarga pasan el control NF C 15-100 a la primera. | index.html:682 | Estudio, instalación y verificación de los equipos. En un parque existente, auditoría de las desviaciones y preparación de las correcciones necesarias. |
| it | it/index.html:567 | Le vostre colonnine superano il controllo NF C 15-100 al primo colpo. | index.html:682 | Studio, installazione e verifica delle apparecchiature. Su un parco esistente, audit delle difformità e preparazione delle correzioni necessarie. |
| nl | nl/index.html:567 | Uw laadpalen slagen in één keer voor de NF C 15-100-keuring. | index.html:682 | Studie, installatie en controle van de apparatuur. Bij een bestaand park: audit van de afwijkingen en voorbereiding van de nodige correcties. |
| pl | pl/index.html:692 | Twoje stacje ładowania przechodzą kontrole NF C 15-100 za pierwszym razem. | index.html:682 | Projekt, instalacja i weryfikacja urządzeń. W istniejącym parku: audyt odchyleń i przygotowanie niezbędnych korekt. |
| pt | pt/index.html:628 | Os seus postos de carregamento passam o controlo NF C 15-100 à primeira. | index.html:682 | Estudo, instalação e verificação dos equipamentos. Num parque existente, auditoria dos desvios e preparação das correções necessárias. |

Variante dans les pages installation : « first-pass approval » et équivalents pour l'inspection belge (voir 2.4).

### 2.2 « Résolu dès la première visite » : plus fort que le FR

| Langue | fichier:ligne | texte traduit actuel | FR actuel (fichier:ligne) | traduction proposée du FR actuel (sans la 2e phrase) |
|-|-|-|-|-|
| en | en/index.html:747 | Multi-brand parts on board, issues resolved on the first visit. | index.html:788 | Qualifelec IRVE certified, authorised and self-sufficient technicians. Parts preparation, on-site diagnosis and return-to-service tests. |
| de | de/index.html:753 | Multi-Marken-Ersatzteile an Bord, Behebung beim ersten Einsatz. | index.html:788 | Qualifelec-IRVE-zertifizierte, befähigte und eigenständige Techniker. Teilevorbereitung, Diagnose vor Ort und Wiederinbetriebnahmetests. |
| es | es/index.html:803 | Piezas multimarca a bordo, intervención resuelta en la primera visita. | index.html:788 | Técnicos certificados Qualifelec IRVE, habilitados y autónomos. Preparación de piezas, diagnóstico in situ y pruebas de puesta en servicio. |
| it | it/index.html:673 | Ricambi multi-marca a bordo, intervento risolto al primo passaggio. | index.html:788 | Tecnici certificati Qualifelec IRVE, abilitati e autonomi. Preparazione dei ricambi, diagnosi in loco e prove di rimessa in servizio. |
| nl | nl/index.html:672 | Multi-merk onderdelen aan boord, storing verholpen bij het eerste bezoek. | index.html:788 | Technici met Qualifelec IRVE-certificering, bevoegd en zelfstandig. Voorbereiding van onderdelen, diagnose ter plaatse en tests voor de hernieuwde indienststelling. |
| pl | pl/index.html:798 | Części wielu marek na pokładzie, usterka rozwiazywana za pierwszym razem. | index.html:788 | Technicy z certyfikatem Qualifelec IRVE, z uprawnieniami i samodzielni. Przygotowanie części, diagnostyka na miejscu i testy ponownego uruchomienia. |
| pt | pt/index.html:733 | Peças multimarcas a bordo, intervenção resolvida na primeira passagem. | index.html:788 | Técnicos certificados Qualifelec IRVE, habilitados e autónomos. Preparação das peças, diagnóstico no local e ensaios de recolocação em serviço. |

Note : ces traductions gardent « certifié Qualifelec IRVE » parce que le FR actuel le dit ; si Auxence retire ou adoucit ce mot (section 3.2), le décliner de la même façon.

Pages FAQ « au premier passage » (FR index.html:936 et faq.html:77, 306) : le FR dit « l'objectif : résoudre la panne au premier passage » ; les traductions en/index.html:889, de/index.html:895, es/index.html:945, it/index.html:815, nl/index.html:814, pl/index.html:940, pt/index.html:875 disent la même chose (« objectif »). Elles sont donc synchrones avec le FR, mais portent le même mot « premier passage » que la revue juge trop fort : à adoucir en même temps que le FR si Auxence le décide.

Question « résolu dès le premier appel ? » : FR centre-appel.html:80 et 618, réponse « Souvent, oui ... ». Traduit partout (en/call-center.html:80 et 620 ; de/callcenter.html:79, 620 ; es/centro-llamadas.html:80, 620 ; it/centro-chiamate.html:79, 621 ; nl/callcenter.html:79, 618 ; pt/central-atendimento.html:79, 620). Synchrone : rien à faire.

### 2.3 Hotline « multilingue FR/EN/NL/DE » et variantes

| Langue | fichier:ligne | texte traduit actuel | FR actuel | proposition |
|-|-|-|-|-|
| de | de/index.html:974-975 | « Mehrsprachiger Support (FR/EN/NL/DE) ... Französisch, Englisch, Niederländisch und Deutsch ... Muttersprachler » (bloc FAQ) | aucun bloc équivalent dans index.html ; FR centre-appel.html:282 « Multilangue (FR, EN, NL) », centre-appel.html:90 (FAQ : français, néerlandais, anglais) | supprimer le bloc ou le traduire du FR : « Support en français, néerlandais et anglais » ; retirer « Deutsch » et « Muttersprachler » |
| nl | nl/index.html:582 | Meertalige IRVE-hotline (FR/EN/NL/DE), 7 dagen per week. | index.html:697 « Hotline IRVE 100% basée en France, 7j/7. » | Hotline IRVE 100% in Frankrijk, 7 dagen per week. (langues : FR/EN/NL si on veut les citer) |
| es | es/centro-llamadas.html:284 et 490-491 | Multilingüe (FR, EN, ES) ; « francés, inglés y español » | centre-appel.html:282 FR, EN, NL ; es/centro-llamadas.html:91 (FAQ) dit francés, neerlandés e inglés : contradiction interne | Multilingüe (FR, EN, NL) ; francés, inglés y neerlandés |
| es | es/index.html:712 | Centro de atención IRVE multilingüe, 7 días a la semana. | index.html:697 (« 100% basée en France ») | Línea de atención IRVE 100% basada en Francia, 7 días a la semana. |
| pt | pt/operacao-manutencao.html:389 | Linha de apoio 24/7 (PT/FR/EN) | exploitation.html:422 « Hotline 24/7 (FR/EN/NL) » | Linha de apoio 24/7 (FR/EN/NL) |
| de | de/index.html:663 | Ladeinfrastruktur-Hotline, 7 Tage die Woche. | index.html:697 | Ladeinfrastruktur-Hotline, zu 100 % in Frankreich, 7 Tage die Woche. (la mention « 100 % basée en France » a disparu) |
| it, pt | it/index.html:582 ; pt/index.html:643 | « disponibile 7 giorni su 7 » ; « disponível, 7 dias por semana » | idem | idem, ajouter « 100% basata/baseada in Francia/França » si le FR la garde |
| en, pl | en/index.html:656 ; pl/index.html:707 | based 100% in France, 7 days a week ; obsługiwana w całości we Francji | index.html:697 | synchrone |

Rappel : le FR lui-même alterne 7j/7 (index.html:697, tarification.html:308) et 24/7 (index.html:1060, exploitation.html:422, centre-appel.html:204 à 722, cgv.html:214) : cette contradiction interne se retrouve dans les 7 langues.

### 2.4 Contenus traduits sans source FR

- Bloc « Belgian electrical standards (RGIE/AREI) » des pages installation traduites : en/installation-compliance.html:638-653 (« first-pass approval » à :652), de/installation-konformitaet.html:640 (« Erstabnahme »), es/instalacion-conformidad.html:640 (« aprobación a la primera »), it/installazione-conformita.html:681 (« al primo tentativo »), nl/installatie-conformiteit.html:642 (« goedkeuring bij het eerste bezoek »), pl/instalacja-zgodnosc.html:652 (« przy pierwszej wizycie »). Le FR installation-conformite.html n'a aucune occurrence de RGIE/AREI ni de « organisme agréé » pour la Belgique (seul « organisme agréé (Consuel) » à :99 et :746). pt/instalacao-conformidade.html : pas de formulation « à primeira » repérée par grep dans cette page.
- Pages installation traduites : 1093 lignes (en) contre 952 (FR) ; le texte traduit n'est plus un décalque du FR actuel. Régénérer depuis le FR actuel plutôt que corriger ligne à ligne.
- Blocs de blog FR affichés dans les pages traduites (titres en français) : it/installazione-conformita.html:859, 869, 879 .

## 3. Promesses de délai et de disponibilité

### 3.1 Méthode et définitions des motifs

Comptes par grep (regex insensibles à la casse, par langue) sur les fichiers .html de la copie. Colonnes : V = texte visible, LD = JSON-LD, M = balises meta (title/description/og, ignorées pour correction mais comptées ici). Lignes contenant un tracé SVG exclues. « 24h ouvrées » = 24 h suivi d'un qualificatif de jours ouvrés dans la langue (ouvrées, business, Werktage, hábiles, lavorativ, werkdagen, roboczych, úteis). « 24h » générique est compté à part (délai de devis, de rappel, etc.).

### 3.2 Comptes par motif et par langue (V / LD / M)

| Motif | FR racine | FR zones/ | FR solutions/ | FR blog/ | en | de | es | it | nl | pl | pt |
|-|-|-|-|-|-|-|-|-|-|-|-|
| « 48h » / sous 48 | 6 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 8 / 0 / 0 | 3 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 |
| « 24h ouvrées » et équivalents | 34 / 3 / 4 | 26 / 9 / 1 | 4 / 0 / 0 | 20 / 0 / 0 | 27 / 2 / 1 | 5 / 0 / 0 | 16 / 0 / 0 | 17 / 1 / 1 | 13 / 0 / 1 | 16 / 0 / 0 | 19 / 2 / 2 |
| « 24 h » générique (devis, rappel, rapport) | 47 / 6 / 13 | 54 / 9 / 1 | 14 / 3 / 2 | 42 / 0 / 1 | 32 / 3 / 4 | 11 / 0 / 3 | 22 / 1 / 3 | 23 / 2 / 4 | 20 / 0 / 4 | 22 / 0 / 4 | 25 / 3 / 8 |
| « 7j/7 » et équivalents | 8 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 3 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 |
| « 24/7 », « 24h/24 » | 67 / 13 / 13 | 41 / 18 / 3 | 21 / 2 / 9 | 90 / 4 / 6 | 52 / 12 / 11 | 41 / 11 / 14 | 40 / 11 / 12 | 40 / 12 / 10 | 40 / 11 / 15 | 39 / 10 / 15 | 43 / 13 / 13 |
| « Qualifelec » + certifié/certified/zertifiziert/gecertificeerd | 16 / 7 / 6 | 1 / 0 / 1 | 9 / 0 / 1 | 36 / 9 / 9 | 10 / 4 / 6 | 9 / 2 / 5 | 10 / 5 / 6 | 9 / 2 / 5 | 9 / 2 / 6 | 9 / 4 / 4 | 12 / 3 / 6 |
| « SLA garanti » | 6 / 2 / 0 | 0 / 0 / 0 | 2 / 1 / 6 | 7 / 1 / 0 | 3 / 1 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 2 / 0 / 0 | 3 / 1 / 0 |
| « intervention rapide » | 4 / 1 / 0 | 2 / 0 / 15 | 0 / 0 / 0 | 6 / 0 / 0 | 3 / 1 / 3 | 1 / 0 / 0 | 3 / 1 / 1 | 1 / 0 / 1 | 4 / 1 / 1 | 4 / 1 / 1 | 3 / 1 / 1 |

Lecture : la racine FR contient aussi des pages internes (_design-2026.html, _design-preview.html, evergreen.html, offline.html, powerdot.html, virta.html, 404.html) ; leurs occurrences sont dans les comptes. « 24/7 » inclut le lien de pied de page « Support 24/7 » présent sur la plupart des pages (non promesse en soi mais répétition de la promesse).

### 3.3 Détail FR : fichiers principaux (fichier:ligne, V = visible, LD = JSON-LD, M = meta)

| fichier:ligne | portée | motif | extrait |
|-|-|-|-|
| index.html:782 | VIS | 48h | Diagnostic sous 48hAudit |
| index.html:788 | VIS | 24h_ouvrees | Réponse sous 24h ouvréesTechnic |
| index.html:1041 | VIS | 24h_ouvrees | ubmit-text">Demander un diagnostic · réponse sous 24h ouvrées |
| index.html:1070 | VIS | 24h_ouvrees | font-semibold text-gray-900 text-sm">Réponse sous 24h ouvrées |
| index.html:697 | VIS | 7j7 | ous le voulez. Hotline IRVE 100% basée en France, 7j/7. |
| index.html:85 | LD | 24_7 | {"@type": "Service", "name": "Support Client IRVE 24/7", "url": "https://jcsm.fr/centre-appel"}} |
| index.html:153 | LD | 24_7 | "Support client IRVE 24/7" |
| index.html:206 | LD | 24_7 | oitation & Maintenance", "Sécurisation", "Support 24/7", "Solutions", "À propos", "Blog", "Contact"], |
| index.html:689 | VIS | 24_7 | ="En savoir plus sur notre support technique IRVE 24/7" class="card-feature card-lift block"> |
| index.html:1060 | VIS | 24_7 | -100 text-xs mt-0.5">Support technique disponible 24/7 |
| index.html:14 | META | qualifelec_certifie | IRVE en France et Belgique. Multi-marques AC/DC, certifié Qualifelec, équipe terrain depuis 2019."> |
| index.html:25 | LD | qualifelec_certifie | IRVE terrain en France et Belgique. Installation certifiée Qualifelec, maintenance multi-marques AC/DC, support aux CPO, |
| index.html:76 | LD | qualifelec_certifie | "award": "Certification Qualifelec IRVE", |
| index.html:264 | META | qualifelec_certifie | IRVE en France et Belgique. Multi-marques AC/DC, certifié Qualifelec. Devis gratuit."> |
| index.html:277 | META | qualifelec_certifie | IRVE en France et Belgique. Multi-marques AC/DC, certifié Qualifelec. Devis gratuit."> |
| index.html:788 | VIS | qualifelec_certifie | ss="text-sm mt-2" style="opacity:.65">Techniciens certifiés Qualifelec IRVE, habilités et autonomes. Préparation des piè |
| index.html:860 | VIS | qualifelec_certifie | Certification Qualifelec IRVE |
| exploitation.html:14 | META | 24h_ouvrees | jusqu'à 400 kW. France et Belgique, réponse sous 24h ouvrées."> |
| exploitation.html:347 | VIS | 24h_ouvrees | règle sans déplacement), technicien sur site sous 24h ouvrées. Pièces critiques en stock régional. Borne de courtoisie s |
| exploitation.html:351 | VIS | 24h_ouvrees | Diagnostic à distance OCPP et réponse sous 24h ouvrées |
| exploitation.html:825 | VIS | 24h_ouvrees | tracking-wide" style="color:#9ca3af">Réponse sous 24h ouvrées |
| exploitation.html:918 | VIS | 24h_ouvrees | es en France entière et en Belgique. Réponse sous 24h ouvrées. |
| exploitation.html:1032 | VIS | 24h_ouvrees | nes, les marques, les localisations. Réponse sous 24h ouvrées avec une proposition chiffrée. |
| exploitation.html:364 | VIS | 24_7 |  |
| exploitation.html:422 | VIS | 24_7 | léphonique en partenariat avec Chargelia. Hotline 24/7 (FR/EN/NL), numéro dédié à votre marque. Escalade technicie |
| exploitation.html:426 | VIS | 24_7 | Hotline 24/7 multilingue avec numéro dédié par CPO |
| exploitation.html:778 | VIS | 24_7 | vec remontée GIREVE, paiement intégré, monitoring 24/7. |
| exploitation.html:947 | VIS | qualifelec_certifie | Installation certifiée Qualifelec |
| faq.html:77 | LD | 24h_ouvrees | : "Notre SLA contractuel prévoit une réponse sous 24h ouvrées. Le délai d'intervention sur site est ensuite défini dans  |
| faq.html:133 | LD | 24h_ouvrees | 5 57 06 : vous recevez un devis personnalisé sous 24h ouvrées, adapté à votre configuration. Ce qui est signé est ce qui |
| faq.html:305 | VIS | 24h_ouvrees | Notre SLA contractuel prévoit une réponse sous 24h ouvrées. Le délai d'intervention sur site est ensuite défini dans v |
| faq.html:413 | VIS | 24h_ouvrees | 06 : vous recevez un devis personnalisé sous 24h ouvrées, adapté à votre configuration. |
| faq.html:525 | VIS | 24h_ouvrees | z votre situation, un technicien vous répond sous 24h ouvrées. Un vrai technicien, pas un script. |
| faq.html:165 | LD | qualifelec_certifie | "text": "Oui. JCSM est certifié Qualifelec IRVE et nos techniciens IRVE sont habilités et suivis par u |
| faq.html:473 | VIS | qualifelec_certifie | Oui. JCSM est certifié Qualifelec IRVE et nos techniciens IRVE sont habilités et suivis par u |
| faq.html:141 | LD | SLA_garanti | es : intervention ponctuelle, contrat annuel avec SLA garanti ou contrat cadre." |
| faq.html:426 | VIS | SLA_garanti | es : intervention ponctuelle, contrat annuel avec SLA garanti ou contrat cadre. Un contrat annuel est particulièrement p |
| centre-appel.html:518 | VIS | 48h | Déployé en 48h. Fiable pour des années. |
| centre-appel.html:334 | VIS | 24h_ouvrees | Réponse sous 24h ouvrées |
| centre-appel.html:12 | META | 24_7 | Hotline IRVE 24/7 / Centre d'Appel Bornes de Recharge - JCSM |
| centre-appel.html:14 | META | 24_7 | content="Hotline IRVE 24/7 basée en France, marque blanche, FR/EN/NL. Inclusive (RQTH/ |
| centre-appel.html:20 | LD | 24_7 | "name": "Centre d'Appel & Hotline IRVE 24/7", |
| centre-appel.html:21 | LD | 24_7 | "description": "Support client IRVE 24/7 basé en France, en marque blanche : hotline, chat en direct |
| centre-appel.html:39 | LD | 24_7 | "name": "Centre d'Appel & Hotline IRVE 24/7", |
| centre-appel.html:53 | LD | 24_7 | tem", "position": 2, "name": "Centre d'Appel IRVE 24/7", "item": "https://jcsm.fr/centre-appel"} |
| centre-appel.html:67 | LD | 24_7 | tre support est multicanal : hotline téléphonique 24/7, chat en direct sur votre application ou site web, email av |
| centre-appel.html:111 | META | 24_7 |  |
| centre-appel.html:113 | META | 24_7 | content="Hotline IRVE 24/7 basée en France, en marque blanche, support FR/EN/NL. Entre |
| centre-appel.html:123 | META | 24_7 |  |
| centre-appel.html:125 | META | 24_7 | content="Support client IRVE 24/7 en marque blanche : hotline, chat et email, en France et en |
| centre-appel.html:204 | VIS | 24_7 | Support 24/7 |
| centre-appel.html:213 | VIS | 24_7 | lass="sec-label section-appear">Support & Hotline 24/7 |
| centre-appel.html:215 | VIS | 24_7 | Support IRVE 24/7 : chaque appel décroché. Chaque panne résolue. |
| centre-appel.html:255 | VIS | 24_7 | lticanal, professionnelle et réactive, disponible 24/7 pour assurer |
| centre-appel.html:268 | VIS | 24_7 | Hotline 24/7 |
| centre-appel.html:274 | VIS | 24_7 | Disponibilité 24/7/365 |
| centre-appel.html:391 | VIS | 24_7 | écifiquement aux problématiques IRVE. Disponibles 24/7, ils assurent un support technique de qualité dans votre la |
| centre-appel.html:604 | VIS | 24_7 | tre support est multicanal : hotline téléphonique 24/7, chat en direct sur votre application ou site web, email av |
| centre-appel.html:646 | VIS | 24_7 | ez notre solution de support technique multicanal 24/7 en France et Belgique et offrez un service fiable à |
| centre-appel.html:570 | VIS | qualifelec_certifie | Installation certifiée Qualifelec |
| centre-appel.html:330 | VIS | SLA_garanti | suivi et traçabilité complète. SLA garanti sur les temps de réponse. |
| contact.html:294 | VIS | 24h_ouvrees | ubmit-text">Demander un diagnostic · réponse sous 24h ouvrées |
| contact.html:308 | VIS | 24h_ouvrees | Réponse sous 24h ouvrées |
| contact.html:330 | VIS | 24h_ouvrees | Réponse sous 24h ouvrées |
| contact.html:12 | META | 24_7 | ts, exploitants : devis gratuit sous 24h, support 24/7. Appelez le 01 83 75 57 06."> |
| contact.html:28 | META | 24_7 | ts, exploitants : devis gratuit sous 24h, support 24/7. Appelez le 01 83 75 57 06."> |
| contact.html:37 | META | 24_7 | de recharge IRVE. Devis gratuit sous 24h, support 24/7 en France et Belgique."> |
| cgv.html:215 | VIS | 24h_ouvrees | Interventions d'urgence : réponse sous 24h ouvrées |
| cgv.html:144 | VIS | 24_7 | IRVE, incluant le support client 24/7 et les interventions sur site. |
| cgv.html:214 | VIS | 24_7 | Support client : disponibilité 24/7 |
| couverture.html:60 | LD | 24h_ouvrees | t": "Notre SLA standard garantit une réponse sous 24h ouvrées. Pour les contrats premium, nous proposons des engagements |
| couverture.html:782 | VIS | 24h_ouvrees | xed">Notre SLA standard garantit une réponse sous 24h ouvrées. Pour les contrats premium, nous proposons des engagements |
| couverture.html:886 | VIS | 24h_ouvrees | -w-xl mx-auto" style="color:#D5DEEA">Réponse sous 24h ouvrées. Si votre zone n'est pas encore couverte, nous étudions un |
| couverture.html:60 | LD | 24_7 | roposons des engagements renforcés avec astreinte 24/7." |
| couverture.html:782 | VIS | 24_7 | roposons des engagements renforcés avec astreinte 24/7. |
| couverture.html:60 | LD | SLA_garanti | "text": "Notre SLA standard garantit une réponse sous 24h ouvrées. Pour les contrats premium, no |
| couverture.html:782 | VIS | SLA_garanti | Notre SLA standard garantit une réponse sous 24h ouvrées. Pour les contrats premium, no |
| tarification.html:381 | VIS | 24h_ouvrees | iser. Nous établissons un devis personnalisé sous 24h ouvrées, adapté à votre configuration exacte. |
| tarification.html:308 | VIS | 7j7 | Disponibilité 24h/24, 7j/7 |
| tarification.html:14 | META | 24_7 | orfait ou à l'intervention, installation, support 24/7 en marque blanche. Devis gratuit."> |
| tarification.html:24 | META | 24_7 | orfait ou à l'intervention, installation, support 24/7 en marque blanche. Devis gratuit."> |
| tarification.html:35 | META | 24_7 | orfait ou à l'intervention, installation, support 24/7 en marque blanche. Devis gratuit."> |
| tarification.html:300 | VIS | 24_7 | Hotline 24/7 externalisée. Facturation au volume d'appels ou au forfait |
| tarification.html:308 | VIS | 24_7 | Disponibilité 24h/24, 7j/7 |
| tarification.html:188 | VIS | SLA_garanti | Contrat annuel avec SLA garanti. Idéal pour les parcs de plus de 20 bornes. |
| tarification.html:254 | VIS | SLA_garanti | Contrat annuel avec SLA garanti. Idéal pour les parcs de plus de 20 bornes. |
| tarification.html:289 | VIS | intervention_rapide | Intervention rapide |
| a-propos.html:317 | VIS | 24h_ouvrees | g-relaxed text-sm">SLA contractuel : réponse sous 24h ouvrées. Chaque engagement est contractualisé et mesurable. |
| a-propos.html:594 | VIS | 24h_ouvrees | panne : décrivez-nous la situation. Réponse sous 24h ouvrées, France entière et Belgique. |
| a-propos.html:262 | VIS | SLA_garanti | tes les marques, d'intervenir rapidement avec des SLA garantis, et de servir de point de contact unique pour les CPO et  |
| installation-conformite.html:462 | VIS | 24h_ouvrees | ="color:var(-color-primary-darker)">Réponse sous 24h ouvrées · Certifié Qualifelec IRVE · Accompagnement ADVENIR |
| installation-conformite.html:573 | VIS | 24h_ouvrees | e="color: var(-color-text-secondary)">Devis sous 24h ouvrées - Installation sous 2 semaines |
| installation-conformite.html:689 | VIS | 24_7 | Support 24/7 |
| installation-conformite.html:14 | META | qualifelec_certifie | content="Installation certifiée Qualifelec de bornes IRVE AC 3,7-22 kW et DC jusqu'à 400 kW. Conformit |
| installation-conformite.html:21 | LD | qualifelec_certifie | AC/DC. Wallbox 7-22 kW, bornes DC jusqu'à 350 kW. Certification Qualifelec IRVE.", |
| installation-conformite.html:83 | LD | qualifelec_certifie | "text": "Oui. JCSM est certifié Qualifelec IRVE P3, ce qui nous habilite à installer des bornes DC de |
| installation-conformite.html:137 | META | qualifelec_certifie | content="Installation certifiée Qualifelec de bornes IRVE AC 3,7-22 kW et DC jusqu'à 400 kW. Conformit |
| installation-conformite.html:149 | META | qualifelec_certifie | content="Installation certifiée Qualifelec de bornes IRVE AC 3,7-22 kW et DC jusqu'à 400 kW. Conformit |
| installation-conformite.html:462 | VIS | qualifelec_certifie | color-primary-darker)">Réponse sous 24h ouvrées · Certifié Qualifelec IRVE · Accompagnement ADVENIR |
| installation-conformite.html:532 | VIS | qualifelec_certifie | t-sm text-gray-600">La loi impose un installateur certifié IRVE (Qualifelec) pour toute borne dépassant 3,7 kW. Conditio |
| installation-conformite.html:728 | VIS | qualifelec_certifie | ass="text-gray-600 leading-relaxed">Oui. JCSM est certifié Qualifelec IRVE P3, ce qui nous habilite à installer des born |
| installation-conformite.html:794 | VIS | qualifelec_certifie | <a href="/blog/certification-qualifelec-irve" class="card-feature card-lift p-6 group block section |
| installation-conformite.html:798 | VIS | qualifelec_certifie | group-hover:text-blue-600 transition-colors mb-2">Certification Qualifelec IRVE : pourquoi c'est indispensable |
| installation-conformite.html:799 | VIS | qualifelec_certifie | s="text-sm text-gray-600 mb-3">Tout savoir sur la certification Qualifelec IRVE, ses niveaux et son importance pour les  |
| securisation-installations.html:21 | LD | 24_7 | lance IA, alarmes connectées, intervention rapide 24/7. Audit gratuit.", |
| securisation-installations.html:75 | LD | 24_7 | cturne sont reliées à notre centre de supervision 24/7. En cas de détection d'intrusion (analyse IA), une alerte e |
| securisation-installations.html:125 | META | 24_7 | surveillance IA, alarmes connectées, intervention 24/7. Audit gratuit."> |
| securisation-installations.html:370 | VIS | 24_7 | Enregistrement cloud sécurisé 24/7 |
| securisation-installations.html:480 | VIS | 24_7 | alt="Intervention rapide 24/7 IRVE - Technicien certifié JCSM en intervention d'urgence" |
| securisation-installations.html:491 | VIS | 24_7 | ass="text-2xl font-bold mb-3">Intervention rapide 24/7 |
| securisation-installations.html:496 | VIS | 24_7 | Centre de télésurveillance 24/7 |
| securisation-installations.html:534 | VIS | 24_7 | ext-sm mt-2" style="opacity:.65">Télésurveillance 24/7, alertes temps réel, intervention rapide. Rapports détaillé |
| securisation-installations.html:617 | VIS | 24_7 | cturne sont reliées à notre centre de supervision 24/7. En cas de détection d'intrusion (analyse IA), une alerte e |
| securisation-installations.html:574 | VIS | qualifelec_certifie | "color: var(-color-text-secondary)">Installation certifiée Qualifelec |
| securisation-installations.html:21 | LD | intervention_rapide | câbles. Vidéosurveillance IA, alarmes connectées, intervention rapide 24/7. Audit gratuit.", |
| securisation-installations.html:480 | VIS | intervention_rapide | alt="Intervention rapide 24/7 IRVE - Technicien certifié JCSM en intervention d'urge |
| securisation-installations.html:491 | VIS | intervention_rapide | Intervention rapide 24/7 |
| securisation-installations.html:534 | VIS | intervention_rapide | y:.65">Télésurveillance 24/7, alertes temps réel, intervention rapide. Rapports détaillés post-incident et amélioration  |
| devenir-partenaire.html:624 | VIS | 48h | " style="background: #EAF1FF; color: #153C80;">24-48h |
| devenir-partenaire.html:286 | VIS | 24h_ouvrees | olume régulier, support technique et réponse sous 24h ouvrées. |
| devenir-partenaire.html:329 | VIS | 24h_ouvrees | nique, puis accès aux interventions. Réponse sous 24h ouvrées. |
| devenir-partenaire.html:410 | VIS | 24h_ouvrees | Sous 24h ouvrées |
| devenir-partenaire.html:865 | VIS | 24h_ouvrees | d'intervention et vos habilitations. Réponse sous 24h ouvrées. |

Liens de pied de page « Support 24/7 » (non détaillés) : présents sur index, exploitation, faq, centre-appel, contact, cgv, mentions-legales, couverture, tarification, a-propos, installation-conformite, securisation-installations, pilotage-projets, devenir-partenaire, carrieres.

Mentions légales : mentions-legales.html ne contient aucune promesse de délai ni de disponibilité (seul le lien de pied de page « Support 24/7 », :350) ; elle ne cite pas Qualifelec.

### 3.4 Sources de vérité FR (contenu exact)

- FAQ, faq.html:77 (JSON-LD) et :305 (visible) : « Notre SLA contractuel prévoit une réponse sous 24h ouvrées. Le délai d'intervention sur site est ensuite défini dans votre contrat, en fonction de la criticité de la panne et de la localisation. Avant tout déplacement, nous réalisons un diagnostic à distance pour préparer les pièces et maximiser la résolution au premier passage. »
- FAQ de l'accueil, index.html:936 : « En combien de temps vous intervenez ? Les délais sont définis dans votre contrat de maintenance. Avant tout déplacement, on fait un diagnostic à distance. L'objectif : résoudre la panne au premier passage et, si une pièce manque, y retourner sans facturation de déplacement supplémentaire. » (c'est la formule citée par la revue : « Les délais sont définis dans votre contrat »)
- FAQ exploitation, exploitation.html:67 (JSON-LD) et :977-979 : « Les délais de prise en charge sont fixés dans votre contrat (SLA urbains et ruraux distincts). Grâce à la supervision OCPP, une partie des incidents est résolue à distance sans déplacement. Pour les interventions sur site, nos techniciens régionaux disposent de véhicules atelier équipés et de pièces en stock. »
- CGV art. 6, cgv.html:209 (titre) à 216 : « Article 6 - Délais d'intervention. Les délais d'intervention sont donnés à titre indicatif. JCSM s'engage à respecter les délais convenus, notamment : Support client : disponibilité 24/7 ; Interventions d'urgence : réponse sous 24h ouvrées ; Interventions programmées : selon planning convenu. » La phrase est elle-même contradictoire (indicatif / s'engage).
- Contradictions à l'intérieur du FR : exploitation.html:347 « technicien sur site sous 24h ouvrées » (alors que FAQ : réponse sous 24h, délai sur site au contrat) ; couverture.html:60 et :782 « Notre SLA standard garantit une réponse sous 24h ouvrées » ; centre-appel.html:330 « SLA garanti sur les temps de réponse » ; tarification.html:188 et :254 « Contrat annuel avec SLA garanti » ; a-propos.html:262 « SLA garantis » ; solutions/cpo-operateurs.html:176 « SLA garanti, réponse sous 24h ouvrées » ; index.html:782 « Diagnostic sous 48h » ; centre-appel.html:518 « Déployé en 48h » ; securisation-installations.html:491 et :534 « Intervention rapide 24/7 ».
- Qualifelec « certifié » sans numéro ni date : index.html:788 et :860, faq.html:473, installation-conformite.html:462 et :728 (« certifié Qualifelec IRVE P3 »), securisation-installations.html:574 ; JSON-LD index.html:25 et :76.

### 3.5 Trois formulations prudentes (en français, à décliner ensuite)

Aucune nouvelle promesse n'est proposée : chaque formulation ne dit que ce que les sources de vérité FR (FAQ, CGV art. 6) disent déjà ou le retire. **Le choix de la formulation vraie, et donc de ce qui est effectivement tenu par JCSM (48h, 24h ouvrées, 24/7 ou 7j/7, certifié), appartient à Auxence.**

**Formulation A : contractuelle, sans chiffre.**
- Délai : « Délai défini au contrat ; diagnostic à distance avant tout déplacement. »
- Disponibilité : « Support joignable selon les horaires prévus à votre contrat. »
- À remplacer : index.html:782 « Diagnostic sous 48h » et :788 « Réponse sous 24h ouvrées » ; index.html:1041, :1070 ; exploitation.html:347 « technicien sur site sous 24h ouvrées » et :351 ; centre-appel.html:334 et :518 « Déployé en 48h » ; contact.html:294, :308, :330 ; couverture.html:60, :782 ; a-propos.html:317, :594 ; installation-conformite.html:462, :573 ; devenir-partenaire.html:286, :329, :410, :865 ; leurs équivalents dans les 7 langues (en/index.html:741, de/index.html:747, es/index.html:797, it/index.html:667, nl/index.html:666, pl/index.html:792, pt/index.html:727, etc.). Aligne tout sur faq.html:305 et cgv.html:211.

**Formulation B : objectif indicatif chiffré (alignée sur CGV art. 6 « à titre indicatif »).**
- Délai : « Première réponse visée sous 24 h ouvrées, à titre indicatif ; le délai d'intervention sur site est fixé dans votre contrat. »
- Disponibilité : « Hotline disponible 7j/7 (horaires précisés au contrat). »
- À remplacer : les mêmes lignes que A mais en gardant le chiffre 24 h ouvrées, en retirant 48h (index.html:782, centre-appel.html:518), et en transformant « garantit » en « vise » (couverture.html:60 et :782), « SLA garanti » en « SLA défini au contrat » (centre-appel.html:330, tarification.html:188 et :254, a-propos.html:262, solutions/cpo-operateurs.html:176, solutions/index.html:168). Choisir UNE seule formule de disponibilité (7j/7 ou 24/7) et la répéter partout : index.html:697 et tarification.html:308 contre index.html:1060, cgv.html:214 et pied de page.

**Formulation C : par le processus plutôt que par le délai.**
- Délai : « Un technicien qualifie votre demande, réalise un diagnostic à distance, puis planifie l'intervention selon la criticité de la panne et la localisation. » (reprend faq.html:85 et :318)
- Disponibilité : « Prise en charge selon l'offre souscrite (heures ouvrées ou astreinte en option). »
- À remplacer : titres de cartes chiffrés (index.html:782 et :788, en/de/es/it/nl/pl/pt index), « Intervention rapide 24/7 » (securisation-installations.html:491, :534, alt :480 ; en/installation-security.html:481, :492, :535 ; de/anlagensicherung.html:536 ; es/seguridad-instalaciones.html:481, :492, :535 ; it/sicurezza-installazioni.html:535 ; nl/beveiliging-installaties.html:481, :492, :535 ; pl/zabezpieczenie-instalacji.html:480, :491, :534 ; pt/seguranca-instalacoes.html:481, :492, :535), « Support 24/7 » en menu et pied de page (libellé à neutraliser en « Support »).

**À décider en même temps, quelle que soit la formulation :** (1) « Qualifelec certifié » : n'afficher « certifié » que si l'attestation est valable et visible (numéro, date, lien) ; sinon « qualifié Qualifelec IRVE » ; (2) « habilité » ne s'écrit que pour l'habilitation électrique ; (3) la FAQ, les CGV art. 6 et les JSON-LD FAQ (faq.html:77, exploitation.html:67, couverture.html:60, centre-appel.html:80 et suivants) doivent dire la même chose que la vitrine ; (4) les blogs (48 heures : blog/choisir-prestataire-maintenance-irve.html:336, blog/cout-maintenance-borne-recharge-2026.html:370, blog/hotline-irve-marque-blanche.html:246, blog/installer-borne-copropriete.html:324 ; 7j/7 : blog/cout-maintenance-borne-recharge-2026.html:364, blog/maintenance-bornes-recharge-guide.html:435, blog/prix-recharge-publique-comparatif-2025.html:460) contiennent des promesses de délai JCSM mêlées à des chiffres de marché : trier ce qui est un chiffre de marché de ce qui est un engagement JCSM.

### 3.6 Comptes de promesses JCSM visibles dans les langues (rappel)

| Langue | 48h | 24h ouvrées | 7j/7 | 24/7 | Qualifelec + certifié | SLA garanti | intervention rapide |
|-|-|-|-|-|-|-|
| en | 3 | 27 | 1 | 52 | 10 | 3 | 3 |
| de | 2 | 5 | 1 | 41 | 9 | 2 | 1 |
| es | 2 | 16 | 1 | 40 | 10 | 2 | 3 |
| it | 2 | 17 | 1 | 40 | 9 | 2 | 1 |
| nl | 2 | 13 | 1 | 40 | 9 | 2 | 4 |
| pl | 2 | 16 | 1 | 39 | 9 | 2 | 4 |
| pt | 2 | 19 | 1 | 43 | 12 | 3 | 3 |
| FR (4 zones) | 14 | 84 | 11 | 219 | 62 | 15 | 12 |

## 4. Comptes finaux de la section 1 (occurrences, hors title/meta description)

| Langue | Lignes | Occurrences | FAUX | AMBIGU | INCOHERENT | OK | dont lignes JSON-LD |
|-|-|-|-|-|-|-|
| en | 35 | 41 | 30 | 9 | 0 | 2 | 6 |
| de | 32 | 38 | 27 | 10 | 0 | 1 | 3 |
| es | 36 | 43 | 6 | 35 | 0 | 2 | 6 |
| it | 32 | 40 | 4 | 0 | 10 | 26 | 3 |
| nl | 32 | 39 | 17 | 20 | 0 | 2 | 3 |
| pl | 32 | 39 | 0 | 0 | 19 | 20 | 4 |
| pt | 33 | 37 | 2 | 34 | 0 | 1 | 7 |
| Total | 232 | 277 | 86 | 108 | 29 | 54 | 32 |

Limites : (1) les regex de comptage peuvent manquer une tournure inhabituelle ; les comptes sont fiables à quelques unités près, les fichier:ligne cités dans les sections 2 et 3 ont été vérifiés un par un ; (2) la section 1.8 liste les formes dominantes avec références, pas chaque occurrence ; (3) rien n'a été modifié ni publié.
