# jcsm.fr : délai unique « 48 h » et disponibilité 24/7 dans les 6 autres langues (PROPOSITION, rien publié)

Décision d'Auxence (04/10/2026) : FR et EN sont appliqués dans la branche. Ici : de, es, it, nl, pl, pt (six langues, pas cinq : le site en compte huit avec FR et EN). Aucun fichier de ces langues n'a été modifié ; le test `scripts/delais-promesses.test.cjs` les exclut tant que ce fichier n'est pas appliqué.

Règle appliquée en FR et EN, à reproduire :
- Engagement de service (SLA, technicien sur site, borne de courtoisie, tuiles de chiffres, CGV) : délai 48 h accompagné de la nuance contractuelle (FR « selon contrat », EN « as per contract »).
- Réponse à une demande, devis, rappel (cas sans contrat encore signé) : « 48 h » seul, une nuance contractuelle n'aurait pas de sens.
- Disponibilité : « 24/7 » partout (CGV art. 6, support client 24/7). « 7 jours sur 7 » disparaît.
- Non touchés : rapports transmis sous 24 h après intervention, déploiement hotline « en 48 h » (déjà 48 h).
- Mentions de qualification « ouvrées/ouvrables » supprimées : le délai de 48 h n'est plus exprimé en jours ouvrés (décision d'Auxence : « sous 48 h »).

Relecture par un locuteur natif indispensable avant publication (traductions non relues). La colonne « type » est établie par mots-clés : à vérifier ligne à ligne.


## de (allemand)

- Engagement de service (S) : `Antwort innerhalb von 48 Stunden, laut Vertrag` ; tuile de chiffre : `48 h` + libellé `Antwort laut Vertrag`.
- Réponse, devis, rappel (P) : `Antwort innerhalb von 48 Stunden`.
- Disponibilité (D) : `Ladeinfrastruktur-Hotline, rund um die Uhr (24/7)` (remplace « 7 jours sur 7 »).

| fichier:ligne | type | contexte actuel |
|-|-|-|
| de/betrieb-wartung.html:362 | S | ¦Ersatz durch Leihladestation innerhalb von 24 Stunden¦ |
| de/index.html:663 | D | In Ihrem Namen, wenn Sie wollen. Ladeinfrastruktur-Hotline, 7 Tage die Woche.¦ |
| de/index.html:753 | P | ¦Reaktion innerhalb von 24h an Werktagen¦<p class="text-sm mt-2" style=" |
| de/index.html:1156 | S | Ihre Situation. Ein Techniker, der das Feld kennt, ruft Sie innerhalb von 24h zurück. Kein Vertriebsmitarbeiter. |
| de/index.html:1232 | P | ¦Antwort innerhalb von 24h an Werktagen¦ |
| de/installation-konformitaet.html:435 | P | -xs mt-4" style="color:var(--color-primary-darker)">Antwort innerhalb von 24 Stunden (werktags) · Qualifelec IRVE zertifiziert · ADVENI |
| de/installation-konformitaet.html:546 | P | xs mt-4" style="color: var(--color-text-secondary)">Angebot innerhalb von 24 Stunden (werktags) - Installation innerhalb von 2 Wochen</ |
| de/kontakt.html:12 | P | Ladeprojekte in Frankreich und Belgien. Kostenloses Angebot innerhalb von 24h, 24/7-Support per Telefon oder Formular |
| de/kontakt.html:28 | P | meta property="og:description" content="Kostenloses Angebot innerhalb von 24h. Installation, Wartung und Support für |
| de/kontakt.html:37 | P | eta name="twitter:description" content="Kostenloses Angebot innerhalb von 24h. Installation, Wartung und Support für |
| de/kontakt.html:178 | P | r: Ein persönlicher technischer Ansprechpartner meldet sich innerhalb von 24 Stunden mit einem auf Ihren Bestand zugeschnitt |
| de/ueber-uns.html:594 | P | oder eine defekte Ladestation: Schildern Sie uns die Lage. Reaktion innerhalb von 24h an Werktagen, in ganz Frankreich und Belgien. |

Total de : 12 occurrences (2 S, 9 P, 1 D). Les tuiles de chiffres « 24 h » et « <24 h » (about/exploitation) sont à passer à « 48 h » comme en FR et EN.

## es (espagnol)

- Engagement de service (S) : `respuesta en 48 h, según contrato` ; tuile de chiffre : `48 h` + libellé `Respuesta según contrato`.
- Réponse, devis, rappel (P) : `respuesta en 48 h`.
- Disponibilité (D) : `centro de atención IRVE multilingüe, 24/7` (remplace « 7 jours sur 7 »).

| fichier:ligne | type | contexte actuel |
|-|-|-|
| es/centro-llamadas.html:336 | P | ¦Respuesta en menos de 24 horas hábiles¦ |
| es/contacto.html:12 | P | s proyectos IRVE en Francia y Bélgica. Presupuesto gratuito en 24h, soporte 24/7. Llame o rellene nuestro |
| es/contacto.html:28 | P | eta property="og:description" content="Presupuesto gratuito en 24h. Instalación, mantenimiento y soporte d |
| es/contacto.html:37 | P | ta name="twitter:description" content="Presupuesto gratuito en 24h. Instalación, mantenimiento y soporte d |
| es/contacto.html:46 | P | s proyectos de puntos de recarga IRVE. Presupuesto gratuito en 24h.", |
| es/contacto.html:178 | P | radores, retailers: un experto técnico dedicado le responde en 24h con una propuesta adaptada a su parque. |
| es/contacto.html:202 | P | ¦Respuesta técnica en 24h¦ |
| es/contacto.html:295 | P | an class="submit-text">Solicitar un diagnóstico · respuesta en 24 h laborables¦ |
| es/contacto.html:309 | P | Respuesta en 24h laborables |
| es/contacto.html:331 | P | ¦Respuesta en 24h laborables¦ |
| es/index.html:712 | D | su nombre si lo desea. Centro de atención IRVE multilingüe, 7 días a la semana.¦ |
| es/index.html:803 | P | ¦Respuesta en 24h laborables¦<p class="text-sm mt-2" style=" |
| es/index.html:1004 | P | iba su situación. Un técnico que conoce el terreno le llama en 24h. No un comercial. |
| es/index.html:1051 | P | an class="submit-text">Solicitar un diagnóstico · respuesta en 24 h laborables¦ |
| es/index.html:1080 | P | ¦Respuesta en 24h laborables¦ |
| es/instalacion-conformidad.html:451 | P | s mt-4" style="color:var(--color-primary-darker)">Respuesta en 24 h laborables · Certificado Qualifelec IRVE · Acompañ |
| es/instalacion-conformidad.html:562 | P | t-4" style="color: var(--color-text-secondary)">Presupuesto en 24 h laborables - Instalación en 2 semanas¦ |
| es/nosotros.html:321 | S | -600 leading-relaxed text-sm">SLA contractual: respuesta en menos de 24 h hábiles. Cada compromiso se formaliza por contr |
| es/nosotros.html:596 | P | r o un cargador averiado: cuéntenos la situación. Respuesta en 24h laborables, en toda Francia y Bélgica. |
| es/operacion-mantenimiento.html:326 | S | averías se resuelve sin desplazamiento), técnico presencial en 24h hábiles. Piezas críticas en stock regional. Pun |
| es/operacion-mantenimiento.html:330 | S | ¦Diagnóstico remoto OCPP y respuesta en 24h hábiles¦ |
| es/operacion-mantenimiento.html:338 | S | ¦Sustitución por un punto provisional en 24h¦ |
| es/operacion-mantenimiento.html:804 | P | ld uppercase tracking-wide" style="color:#9ca3af">Respuesta en 24h hábiles¦ |
| es/operacion-mantenimiento.html:897 | P | ás de 25 ciudades en Francia entera y en Bélgica. Respuesta en 24h hábiles. |
| es/operacion-mantenimiento.html:1011 | P | l número de puntos, las marcas y las ubicaciones. Respuesta en 24h hábiles con una propuesta valorada. |

Total es : 25 occurrences (4 S, 20 P, 1 D). Les tuiles de chiffres « 24 h » et « <24 h » (about/exploitation) sont à passer à « 48 h » comme en FR et EN.

## it (italien)

- Engagement de service (S) : `risposta entro 48 ore, secondo contratto` ; tuile de chiffre : `48 h` + libellé `Risposta secondo contratto`.
- Réponse, devis, rappel (P) : `risposta entro 48 ore`.
- Disponibilité (D) : `hotline ricarica EV disponibile 24/7` (remplace « 7 jours sur 7 »).

| fichier:ligne | type | contexte actuel |
|-|-|-|
| it/centro-chiamate.html:337 | P | ¦Risposta entro 24 ore lavorative¦ |
| it/chi-siamo.html:319 | S | ray-600 leading-relaxed text-sm">SLA contrattuale: risposta entro 24h lavorative. Ogni impegno &egrave; contrattualizzat |
| it/chi-siamo.html:594 | P | una colonnina guasta: descriveteci la situazione. Risposta entro 24h lavorative, in tutta la Francia e in Belgio. |
| it/contatti.html:12 | P | tti di ricarica EV in Francia e Belgio. Preventivo gratuito entro 24h, supporto 24/7. Chiamaci o compila il n |
| it/contatti.html:28 | P | meta property="og:description" content="Preventivo gratuito entro 24h. Installazione, manutenzione e supporto |
| it/contatti.html:37 | P | eta name="twitter:description" content="Preventivo gratuito entro 24h. Installazione, manutenzione e supporto |
| it/contatti.html:46 | P | oi progetti di stazioni di ricarica EV. Preventivo gratuito entro 24h.", |
| it/contatti.html:178 | P | gestori, retailer: un esperto tecnico dedicato ti risponde entro 24 ore con una proposta su misura per il tuo p |
| it/contatti.html:202 | P | ¦Risposta tecnica entro 24h¦ |
| it/contatti.html:295 | P | ¦Richiedi una diagnosi · risposta entro 24 ore lavorative¦ |
| it/contatti.html:309 | P | Risposta entro 24 ore lavorative |
| it/contatti.html:331 | P | ¦Risposta entro 24 ore lavorative¦ |
| it/gestione-manutenzione.html:14 | P | P. Francia e Belgio, tutti i marchi fino a 400 kW. Risposta in 24 ore lavorative."> |
| it/gestione-manutenzione.html:74 | S | "text": "Il nostro impegno contrattuale è di rispondere entro 24 ore lavorative per gli interventi critici. La supervis |
| it/gestione-manutenzione.html:325 | S | te dei guasti si risolve senza intervento), tecnico in loco entro 24 ore lavorative. Ricambi critici in stock regionale. Co |
| it/gestione-manutenzione.html:329 | S | ¦Diagnosi remota OCPP e risposta entro 24 ore lavorative¦ |
| it/gestione-manutenzione.html:337 | S | ¦Sostituzione con colonnina di cortesia entro 24 ore¦ |
| it/gestione-manutenzione.html:803 | P | old uppercase tracking-wide" style="color:#9ca3af">Risposta entro 24 ore lavorative¦ |
| it/gestione-manutenzione.html:896 | P | in oltre 25 città in tutta la Francia e in Belgio. Risposta entro 24 ore lavorative. |
| it/gestione-manutenzione.html:968 | S | ing-relaxed">Il nostro impegno contrattuale è di rispondere entro 24 ore lavorative per gli interventi critici. La supervis |
| it/gestione-manutenzione.html:1010 | P | i il numero di colonnine, i marchi, le ubicazioni. Risposta entro 24 ore lavorative con una proposta dettagliata. |
| it/index.html:582 | D | tro nome, se lo desiderate. Hotline ricarica EV disponibile 7 giorni su 7.¦ |
| it/index.html:673 | P | ¦Risposta entro 24h lavorative¦<p class="text-sm mt-2" style=" |
| it/index.html:874 | P | tra situazione. Un tecnico che conosce il campo vi richiama entro 24h. Non un commerciale. |
| it/index.html:921 | P | ¦Richiedi una diagnosi · risposta entro 24 ore lavorative¦ |
| it/index.html:950 | P | ¦Risposta entro 24h lavorative¦ |
| it/installazione-conformita.html:451 | P | xs mt-4" style="color:var(--color-primary-darker)">Risposta entro 24h lavorative · Certificazione Qualifelec IRVE · Supp |
| it/installazione-conformita.html:562 | P | mt-4" style="color: var(--color-text-secondary)">Preventivo entro 24h lavorative - Installazione entro 2 settimane¦ |

Total it : 28 occurrences (6 S, 21 P, 1 D). Les tuiles de chiffres « 24 h » et « <24 h » (about/exploitation) sont à passer à « 48 h » comme en FR et EN.

## nl (néerlandais)

- Engagement de service (S) : `antwoord binnen 48 uur, volgens contract` ; tuile de chiffre : `48 h` + libellé `Antwoord volgens contract`.
- Réponse, devis, rappel (P) : `antwoord binnen 48 uur`.
- Disponibilité (D) : `meertalige IRVE-hotline, 24/7` (remplace « 7 jours sur 7 »).

| fichier:ligne | type | contexte actuel |
|-|-|-|
| nl/contact.html:12 | P | or uw IRVE-projecten in Frankrijk en België. Gratis offerte binnen 24 uur, 24/7 ondersteuning. Bel of vul ons for |
| nl/contact.html:28 | P | <meta property="og:description" content="Gratis offerte binnen 24 uur. Installatie, onderhoud en ondersteunin |
| nl/contact.html:37 | P | <meta name="twitter:description" content="Gratis offerte binnen 24 uur. Installatie, onderhoud en ondersteunin |
| nl/contact.html:200 | P | ¦Technisch antwoord binnen 24 uur¦ |
| nl/exploitatie-onderhoud.html:363 | S | ¦Vervanging door een leenlaadpaal binnen 24 uur¦ |
| nl/index.html:582 | D | aam als u dat wenst. Meertalige IRVE-hotline (FR/EN/NL/DE), 7 dagen per week.¦ |
| nl/index.html:873 | P | rijf uw situatie. Een technicus met praktijkervaring belt u binnen 24 uur terug. Geen verkoper. |

Total nl : 7 occurrences (1 S, 5 P, 1 D). Les tuiles de chiffres « 24 h » et « <24 h » (about/exploitation) sont à passer à « 48 h » comme en FR et EN.

## pl (polonais)

- Engagement de service (S) : `odpowiedź w ciągu 48 godzin, zgodnie z umową` ; tuile de chiffre : `48 h` + libellé `Odpowiedź zgodnie z umową`.
- Réponse, devis, rappel (P) : `odpowiedź w ciągu 48 godzin`.
- Disponibilité (D) : `infolinia IRVE 24/7` (remplace « 7 jours sur 7 »).

| fichier:ligne | type | contexte actuel |
|-|-|-|
| pl/centrum-telefoniczne.html:323 | P | ¦Odpowiedz w ciągu 24 godzin roboczych¦ |
| pl/eksploatacja-konserwacja.html:14 | P | a Francja i Belgia, wszystkie marki do DC 400 kW. Odpowiedź w 24 godziny robocze."> |
| pl/eksploatacja-konserwacja.html:348 | S | OCPP (część awarii usuwamy bez wyjazdu), technik na miejscu w ciągu 24 godzin roboczych. Części krytyczne na stanie regionalnym |
| pl/eksploatacja-konserwacja.html:352 | S | ¦Diagnostyka zdalna OCPP i odpowiedz w ciągu 24 godzin roboczych¦ |
| pl/eksploatacja-konserwacja.html:360 | S | ¦Wymiana na stacje zastepcza w ciągu 24h¦ |
| pl/eksploatacja-konserwacja.html:826 | P | ld uppercase tracking-wide" style="color:#9ca3af">Odpowiedz w ciągu 24 godzin roboczych¦ |
| pl/eksploatacja-konserwacja.html:919 | P | i w ponad 25 miastach w całej Francji i w Belgii. Odpowiedz w ciągu 24 godzin roboczych. |
| pl/eksploatacja-konserwacja.html:1033 | P | Prześlij nam liczbę stacji, marki i lokalizacje. Odpowiedz w ciągu 24 godzin roboczych z wycena. |
| pl/index.html:707 | D | li chcesz. Infolinia IRVE obsługiwana w całości we Francji, 7 dni w tygodniu.¦ |
| pl/index.html:798 | P | ¦Odpowiedz w ciągu 24h roboczych¦<p class="text-sm mt-2" style=" |
| pl/index.html:999 | P | Opisz swoja sytuacje. Technik, który zna teren, oddzwoni w ciągu 24h. Nie handlowiec. |
| pl/index.html:1046 | P | ¦Zamów diagnostykę · odpowiedź w ciągu 24 godzin roboczych¦ |
| pl/index.html:1075 | P | ¦Odpowiedz w ciągu 24h roboczych¦ |
| pl/instalacja-zgodnosc.html:463 | P | s mt-4" style="color:var(--color-primary-darker)">Odpowiedź w ciągu 24 godzin roboczych · Certyfikat Qualifelec IRVE · Wsparcie |
| pl/instalacja-zgodnosc.html:574 | P | -xs mt-4" style="color: var(--color-text-secondary)">Wycena w ciągu 24 godzin roboczych · Instalacja w ciągu 2 tygodni¦ |
| pl/kontakt.html:12 | P | prawie projektów IRVE we Francji i Belgii. Bezpłatna wycena w 24h, wsparcie 24/7. Zadzwoń lub wypełnij fo |
| pl/kontakt.html:28 | P | <meta property="og:description" content="Bezplatna wycena w 24h. Instalacja, konserwacja i wsparcie sta |
| pl/kontakt.html:37 | P | <meta name="twitter:description" content="Bezplatna wycena w 24h. Instalacja, konserwacja i wsparcie sta |
| pl/kontakt.html:160 | P | orzy, sieci handlowe: dedykowany ekspert techniczny odpowie w ciągu 24h z propozycja dopasowana do Twojej infra |
| pl/kontakt.html:184 | P | ¦Odpowiedz techniczna w ciągu 24h¦ |
| pl/kontakt.html:277 | P | ¦Zamów diagnostykę · odpowiedź w ciągu 24 godzin roboczych¦ |
| pl/kontakt.html:291 | P | Odpowiedz w ciągu 24h roboczych |
| pl/kontakt.html:313 | P | ¦Odpowiedz w ciągu 24h roboczych¦ |
| pl/o-nas.html:319 | S | "text-gray-600 leading-relaxed text-sm">SLA umowne: reakcja w ciągu 24h roboczych. Każde zobowiązanie jest skontraktowane |
| pl/o-nas.html:594 | P | b niedziałająca ładowarka: opiszcie nam sytuację. Odpowiedź w ciągu 24h roboczych, w całej Francji i Belgii. |

Total pl : 25 occurrences (4 S, 20 P, 1 D). Les tuiles de chiffres « 24 h » et « <24 h » (about/exploitation) sont à passer à « 48 h » comme en FR et EN.

## pt (portugais)

- Engagement de service (S) : `resposta em 48 h, conforme contrato` ; tuile de chiffre : `48 h` + libellé `Resposta conforme contrato`.
- Réponse, devis, rappel (P) : `resposta em 48 h`.
- Disponibilité (D) : `linha IRVE disponível 24/7` (remplace « 7 jours sur 7 »).

| fichier:ligne | type | contexte actuel |
|-|-|-|
| pt/central-atendimento.html:336 | P | ¦Resposta em 24h úteis¦ |
| pt/cobertura.html:60 | S | "text": "O nosso SLA padrão garante uma resposta em 24h úteis. Para os contratos premium, propomos co |
| pt/cobertura.html:76 | P | ssidade e a sua localização: um técnico no terreno liga-lhe em 24h com uma proposta adaptada." |
| pt/cobertura.html:780 | S | 00 leading-relaxed">O nosso SLA padrão garante uma resposta em 24h úteis. Para os contratos premium, propomos co |
| pt/cobertura.html:798 | P | ssidade e a sua localização: um técnico no terreno liga-lhe em 24h.¦ |
| pt/cobertura.html:864 | P | ng-relaxed max-w-xl mx-auto" style="color:#D5DEEA">Resposta em 24h úteis. Se a sua zona ainda não estiver cobert |
| pt/contato.html:12 | P | seus projetos IRVE em França e Bélgica. Orçamento gratuito em 24h, suporte 24/7. Ligue ou preencha o noss |
| pt/contato.html:28 | P | <meta property="og:description" content="Orçamento gratuito em 24h. Instalação, manutenção e suporte de po |
| pt/contato.html:37 | P | meta name="twitter:description" content="Orçamento gratuito em 24h. Instalação, manutenção e suporte de po |
| pt/contato.html:159 | P | retalhistas: um especialista técnico dedicado responde-lhe no prazo de 24 horas úteis com uma proposta adaptada ao |
| pt/contato.html:183 | P | ¦Resposta técnica em 24h¦ |
| pt/contato.html:276 | P | ¦Pedir um diagnóstico · resposta em 24h úteis¦ |
| pt/contato.html:290 | P | Resposta em 24h úteis |
| pt/contato.html:312 | P | ¦Resposta em 24h úteis¦ |
| pt/index.html:643 | D | atendemos. Em seu nome, se preferir. Linha IRVE disponível, 7 dias por semana.¦ |
| pt/index.html:733 | P | ¦Resposta em 24h úteis¦<p class="text-sm mt-2" style=" |
| pt/index.html:934 | P | uação. Um técnico que conhece o terreno volta a contactá-lo em 24h. Não um comercial. |
| pt/index.html:981 | P | ¦Pedir um diagnóstico · resposta em 24h úteis¦ |
| pt/index.html:1010 | P | ¦Resposta em 24h úteis¦ |
| pt/instalacao-conformidade.html:14 | P | Conformidade NF C 15-100, postos HTA/BT. Orçamento gratuito em 24h."> |
| pt/instalacao-conformidade.html:137 | P | Conformidade NF C 15-100, postos HTA/BT. Orçamento gratuito em 24h."> |
| pt/instalacao-conformidade.html:149 | P | Conformidade NF C 15-100, postos HTA/BT. Orçamento gratuito em 24h."> |
| pt/instalacao-conformidade.html:464 | P | xs mt-4" style="color:var(--color-primary-darker)">Resposta em 24h uteis · Certificado Qualifelec IRVE · Acompan |
| pt/instalacao-conformidade.html:575 | P | mt-4" style="color: var(--color-text-secondary)">Orçamento em 24h uteis - Instalação em 2 semanas¦ |
| pt/operacao-manutencao.html:14 | P | utenção preventiva e curativa em França e Bélgica. Resposta em 24h úteis."> |
| pt/operacao-manutencao.html:62 | S | tância parte das avarias. O nosso compromisso e de resposta em 24h úteis para intervencoes criticas." |
| pt/operacao-manutencao.html:100 | P | utenção preventiva e curativa em França e Bélgica. Resposta em 24h úteis."> |
| pt/operacao-manutencao.html:314 | S | te das avarias resolve-se sem deslocação), técnico no local em 24h úteis. Peças críticas em stock regional. Post |
| pt/operacao-manutencao.html:318 | S | ¦Diagnóstico remoto OCPP e resposta em 24h úteis¦ |
| pt/operacao-manutencao.html:326 | S | ¦Substituição por posto de cortesia em 24h¦ |
| pt/operacao-manutencao.html:792 | P | old uppercase tracking-wide" style="color:#9ca3af">Resposta em 24h úteis¦ |
| pt/operacao-manutencao.html:885 | P | de 25 cidades na França continental e na Bélgica. Resposta em 24h úteis. |
| pt/operacao-manutencao.html:999 | P | s o número de postos, as marcas e as localizações. Resposta em 24h úteis com uma proposta orçamentada. |
| pt/sobre-nos.html:320 | S | -gray-600 leading-relaxed text-sm">SLA contratual: resposta em 24h úteis. Cada compromisso é contratualizado e m |
| pt/sobre-nos.html:595 | P | u um carregador avariado: descreva-nos a situação. Resposta em 24h úteis, em toda a França e na Bélgica. |

Total pt : 35 occurrences (7 S, 27 P, 1 D). Les tuiles de chiffres « 24 h » et « <24 h » (about/exploitation) sont à passer à « 48 h » comme en FR et EN.
