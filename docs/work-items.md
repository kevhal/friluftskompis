# Friluftskompis — Work Items

## Phases

| # | Phase | Description |
|---|-------|-------------|
| 1 | Discover | Søk og inspirasjon |
| 2 | Decide | Vær og forhold |
| 3 | Gather | Invitasjon og deltakelse |
| 4 | Prepare | Pakkeliste |
| 5 | Go | Navigasjon og kart |
| 6 | Return | Økonomi |
| 7 | System og administrasjon | Konfigurasjon |

## Feature Areas

| Area | Phase | Description |
|------|-------|-------------|
| 1.0 | Discover | Søk og inspirasjon |
| 1.1 | Discover | Kart og hytter |
| 1.2 | Discover | Turforslag og filtrering |
| 1.3 | Discover | Personalisering og lister |
| 1.4 | Discover | Ferieplanlegging |
| 2.0 | Decide | Vær og forhold |
| 2.1 | Decide | Rute og transport |
| 2.2 | Decide | Tilgjengelighet og booking |
| 2.3 | Decide | Datoforslag og sammenligning |
| 2.4 | Decide | Omplanlegging |
| 3.0 | Gather | Invitasjon og deltakelse |
| 3.1 | Gather | Avstemning og beslutning |
| 3.2 | Gather | Profil og preferanser |
| 3.3 | Gather | Kjørekoordinering |
| 4.0 | Prepare | Pakkeliste |
| 4.1 | Prepare | Matplan og handling |
| 4.2 | Prepare | Vekt og forbruksvarer |
| 4.3 | Prepare | Påminnelser |
| 5.0 | Go | Navigasjon og kart |
| 5.1 | Go | Sikkerhet |
| 5.2 | Go | Sosial og sjekk-inn |
| 6.0 | Return | Økonomi |
| 6.1 | Return | Bilder og historikk |
| 6.2 | Return | Anmeldelser og statistikk |
| 7.0 | System | Konfigurasjon |
| 7.1 | System | AI-transparens |

## User Roles

| Role | Description |
|------|-------------|
| Turplanlegger | Personen som starter en tur og tar hovedansvaret for planleggingen |
| Turdeltaker | En person som er invitert til en tur, men ikke nødvendigvis initiativtaker |
| Soloturer | En person som planlegger og går alene |
| Gruppeleder | Den i gruppen som koordinerer logistikk, pakkeliste og kostnader |
| Administrator | Systemrolle for oppsett, datatilgang og konfigurasjon |

## Data Sources

| Kilde | Brukes til |
|-------|-----------|
| Kartverket | Topografisk kart, stedsnavn, fjelltopper, høydedata |
| DNT | Hytter (navn, type, kapasitet), booking, ruter |
| iNatur | Kommersielle hytter |
| AirBnB | Kommersielle hytter |
| Yr | Værvarsel, langtidsvarsel, NowCast |
| Varsom.no | Skredvarsel, snøforhold, faregrad |
| Entur | Kollektivruter, avgangstider, billetter |
| Vegvesenet / Google Maps | Kjøretid, veibeskrivelse |
| Vipps | Betalingsforespørsel, oppgjør |
| LLM / AI-agent | Pakkeliste, turforslag, omplanlegging, sammenligning, kompromissforslag, matplan, rutevurdering |

---

## MVP (9 items)

### D1 — Fritekstsøk [Høy] [MVP]
**Som en turplanlegger**, ønsker jeg å kunne søke på område, hyttenavn eller fjelltopp, slik at jeg raskt finner relevante turalternativer uten å måtte lete på tvers av flere tjenester.

**Datakilder:** Kartverket (stedsnavn, fjelltopper), DNT (hyttenavn), iNatur/AirBnB (kommersielle hytter)
**Scenarioer:** Scenario 1 (Kari søker Rondane), Scenario 4 (Morten finner dagstur)

**Akseptansekriterier:**
- Gitt at brukeren skriver minst tre tegn i søkefeltet, når resultater lastes, så vises forslag med autofullfør innen 300 ms.
- Gitt at brukeren søker på «Jotunheimen», når resultatlisten vises, så inneholder den både områder, hytter og fjelltopper.
- Gitt at brukeren velger et søkeresultat, når kartet oppdateres, så sentreres det på valgt lokasjon med relevante kartlag synlige.

### D2 — Topografisk kart med DNT-hytter [Høy] [MVP]
**Som en turplanlegger**, ønsker jeg å se et topografisk norgeskart med DNT-hytter som kartlag, slik at jeg får oversikt over hyttenettet i området jeg vurderer.

**Datakilder:** Kartverket (topografisk kart), DNT (hytter med navn, type, kapasitet)
**Scenarioer:** Scenario 1 (Kari ser hytter i Rondane), Scenario 2 (Eirik planlegger Jotunheim-rute)

**Akseptansekriterier:**
- Gitt at kartet er lastet, når brukeren zoomer til et fjellområde, så vises DNT-hytter med distinkt ikon.
- Gitt at brukeren klikker på en hyttemarkør, når detaljpanelet åpnes, så vises navn, type, kapasitet og eventuell tilgjengelighet.

### B1 — Værvarsel [Høy] [MVP]
**Som en turplanlegger**, ønsker jeg å se værvarsel for valgt lokasjon og valgt periode, slik at jeg kan ta en informert beslutning om når vi bør dra.

**Datakilder:** Yr (temperatur, nedbør, vind, værsymbol, langtidsvarsel med pålitelighetsindikator)
**Scenarioer:** Scenario 1 (Kari sjekker vær for Rondane), Scenario 2 (Eirik trenger vær per etappe over 5 dager), Scenario 4 (Morten sjekker vær lørdag morgen)

**Akseptansekriterier:**
- Gitt at en tur har valgt dato og sted, når værdata lastes, så vises temperatur, nedbør, vind og værsymbol per dag for valgt periode.
- Gitt at værvarselet strekker seg lenger enn 9 dager, når langtidsvarselet vises, så markeres det med lavere pålitelighet.
- Gitt at værdata ikke er tilgjengelig, når feilen oppstår, så vises en tydelig melding i stedet for tomme felter.

### B3 — Ruteplanlegging mellom hytter [Høy] [MVP]
**Som en turplanlegger**, ønsker jeg å se ruteplanlegging mellom hytter med avstand, tid og høydemeter per etappe, slik at jeg kan vurdere om ruten er realistisk for gruppen vår.

**Datakilder:** Kartverket (høydedata, rutegeometri), DNT (rutedata mellom hytter)
**Scenarioer:** Scenario 2 (Eirik: Gjendesheim–Memurubu–Glitterheim med km, hm og tid per etappe)

**Akseptansekriterier:**
- Gitt at flere hytter er valgt i rekkefølge, når ruten beregnes, så vises total distanse, høydemeter og estimert tid per etappe.
- Gitt at en etappe har mer enn 1000 høydemeter, når ruten vises, så markeres etappen som krevende.
- Gitt at brukeren endrer rekkefølgen på hyttene, når ruten oppdateres, så reflekteres endringen umiddelbart i kartet og statistikken.

### B6 — Dag-for-dag-visning [Høy] [MVP]
**Som en turdeltaker**, ønsker jeg å se dag-for-dag-visning for flerdagsturer, slik at jeg forstår hele turen som en sekvens av etapper, ikke som en uoversiktlig liste.

**Datakilder:** Yr (vær per dag), Kartverket/DNT (etappedata), DNT (hytteinformasjon)
**Scenarioer:** Scenario 2 (Eirik ser dag-for-dag-tidslinje: dag 1 Gjendesheim til Memurubu 14 km/450 hm/6t, dag 2 osv.), Scenario 3 (Henrik ser ferietidslinje for to uker)

**Akseptansekriterier:**
- Gitt at en flerdagstur er opprettet, når tidslinjen vises, så har hver dag egen etappe med hytte, distanse, vær og høydeprofil.
- Gitt at været endrer seg for én dag, når tidslinjen oppdateres, så markeres den aktuelle dagen med oppdatert vær.

### G1 — Opprett tur og inviter deltakere [Høy] [MVP]
**Som en turplanlegger**, ønsker jeg å opprette en tur og invitere deltakere via en delbar lenke, slik at folk kan se og akseptere turen uten å laste ned en app først.

**Datakilder:** Intern (turdata, deltakerliste, delbar URL)
**Scenarioer:** Scenario 1 (Kari trykker «Inviter Ola og Marie», de åpner lenke uten å installere noe), Scenario 3 (Henrik deler ferieplan med tante Hilde via lenke)
**Designprinsipp:** Inviterte skal kunne se og akseptere uten å laste ned app — webbasert delingsflate.

**Akseptansekriterier:**
- Gitt at en tur er opprettet, når brukeren trykker «Inviter», så genereres en unik URL som kan deles.
- Gitt at en invitert person åpner lenken, når tursiden lastes, så vises turdetaljer, kart, vær og deltakerliste uten innlogging.
- Gitt at en deltaker aksepterer invitasjonen, når aksepten registreres, så oppdateres deltakerlisten for alle.

### P1 — AI-generert pakkeliste [Høy] [MVP]
**Som en gruppeleder**, ønsker jeg å få en AI-generert pakkeliste basert på vær, varighet og antall personer, slik at vi ikke glemmer viktige ting og slipper å bygge listen fra bunnen av.

**Datakilder:** LLM/AI-agent (genererer pakkeliste), Yr (værdata som input)
**Scenarioer:** Scenario 1 (pakkeliste oppdateres: regnplagg inn, varmere soveposer), Scenario 2 (pakkeliste for 5-dagers tur, 4 personer, inkl. turkjøkken og gass), Scenario 3 (familietilpasset: ekstra varmt tøy, solkrem, plaster, snacks), Scenario 4 (enkel pakkeliste for dagstur)
**AI-bruk:** AI genererer basert på vær, varighet, gruppe og erfaring. AI-foreslåtte elementer skal visuelt skilles fra brukerens egne.

**Akseptansekriterier:**
- Gitt at tur er opprettet med dato, sted og deltakere, når pakkelisten genereres, så er den tilpasset forventet vær, varighet og gruppestørrelse.
- Gitt at brukeren fjerner eller legger til elementer, når listen lagres, så beholdes brukerens tilpasninger.
- Gitt at pakkelisten er AI-generert, når den vises, så er AI-foreslåtte elementer visuelt skilt fra brukerens egne tillegg.

### T1 — Offline-kart og ruteinformasjon [Høy] [MVP]
**Som en turdeltaker**, ønsker jeg å ha tilgang til offline-kart og ruteinformasjon for mine etapper, slik at jeg kan navigere trygt selv uten mobildekning.

**Datakilder:** Kartverket (kartfliser for offline), DNT (rutedata, hytteinformasjon)
**Scenarioer:** Scenario 2 (offline-kart for alle etapper, GPX-spor til klokka), Scenario 4 (GPX-fil til klokka)

**Akseptansekriterier:**
- Gitt at turen er lastet ned for offline bruk, når enheten mister nettilgang, så er kart, rute og hytteinformasjon fortsatt tilgjengelig.
- Gitt at brukeren er på en etappe, når GPS-posisjon oppdateres, så vises posisjon på det nedlastede kartet.

### R1 — Utgiftsregistrering og splitt [Medium] [MVP]
**Som en gruppeleder**, ønsker jeg å registrere utgifter underveis og få en rettferdig splitt-beregning, slik at vi gjør opp økonomien uten regneark.

**Datakilder:** Intern (utgiftsdata, deltakeroversikt)
**Scenarioer:** Scenario 1 (kostnadssplit ferdig, Kari bruker Vipps-lenka), Scenario 2 (utgiftssplit etter hjemkomst)

**Akseptansekriterier:**
- Gitt at utgifter er registrert, når splitten beregnes, så minimeres antall transaksjoner og hver person ser hva de skylder eller har til gode.
- Gitt at en deltaker bare var med deler av turen, når splitten beregnes, så fordeles kun kostnadene for de dagene deltakeren faktisk var med.

---

## Backlog

### Discover

#### D2b — Kommersielle hytter på kart [Medium]
**Som en turplanlegger**, ønsker jeg å se kommersielle hytter fra iNatur og AirBnB som eget kartlag ved siden av DNT-hytter, slik at jeg ser hele overnattingsbildet, ikke bare DNT-nettverket.

**Datakilder:** iNatur (kommersielle hytter), AirBnB (kommersielle hytter), Kartverket (kartlag)

**Akseptansekriterier:**
- Gitt at kartet viser DNT-hytter, når brukeren aktiverer «kommersielle hytter»-laget, så vises også hytter fra iNatur og AirBnB med et annet ikon.
- Gitt at både DNT og kommersielle hytter vises, når brukeren filtrerer på «kun DNT», så skjules kommersielle hytter fra kartet.

#### D3 — Turforslag via wizard [Høy]
**Som en turplanlegger**, ønsker jeg å få turforslag basert på område, varighet, nivå og antall personer via en wizard, slik at jeg slipper å lete manuelt og får skreddersydde forslag.

**Datakilder:** LLM/AI-agent (genererer turforslag), Kartverket/DNT (rute- og hyttedata), Yr (værprognose)
**Scenarioer:** Scenario 1 (Kari velger Rondane, mars, medium nivå — appen foreslår to helger og fire hytter)

**Akseptansekriterier:**
- Gitt at brukeren har fylt ut wizard-stegene, når forslag genereres, så vises minst to turforslag med estimert varighet, høydemeter og vanskelighetsgrad.
- Gitt at forslagene vises, når brukeren velger ett, så populeres turdetaljer med hytter, rute og værprognose.
- Gitt at ingen forslag matcher kriteriene, når søket fullføres, så vises en forklaring på hvorfor og forslag til å justere filtrene.

#### D4 — Klassiske hytteruter [Medium]
**Som en turplanlegger**, ønsker jeg å kunne velge mellom klassiske hytteruter som forhåndsdefinerte forslag, slik at jeg raskt kan komme i gang med kjente ruter som Jotunheim-runden eller Rondane-kryssing.

**Datakilder:** DNT (forhåndsdefinerte ruter: Jotunheim-runden, Rondane-kryssing, Hardangervidda-traversen m.fl.), Kartverket (kartdata)
**Scenarioer:** Scenario 2 (Eirik velger den klassiske Besseggen-varianten blant tre foreslåtte hytteruter)

**Akseptansekriterier:**
- Gitt at brukeren velger «Klassiske ruter», når listen vises, så inneholder den minst fem kjente norske hytteruter med beskrivelse.
- Gitt at brukeren velger en klassisk rute, når ruten lastes, så vises alle etapper med hytter, avstander og høydeprofil på kartet.

#### D5 — Dagsturer i nærheten [Medium]
**Som en soloturer**, ønsker jeg å få forslag til dagsturer i nærheten basert på posisjon og vær, slik at jeg kan gå fra lyst til plan på noen få minutter.

**Datakilder:** Kartverket (posisjon, nærliggende ruter), Yr (vær akkurat nå), DNT (turdata)
**Scenarioer:** Scenario 4 (Morten: lørdag morgen, sol, appen foreslår tre dagsturer innen én times kjøring)

**Akseptansekriterier:**
- Gitt at brukeren deler posisjon og det er godt vær, når forslagssiden åpnes, så vises minst tre dagsturer innen 1 times kjøring.
- Gitt at et forslag velges, når turdetaljene vises, så inkluderes parkering, GPX-fil, estimert tid og enkel pakkeliste.

#### D6 — Kategorifiltrering [Medium]
**Som en turplanlegger**, ønsker jeg å filtrere turer etter kategori som dagtur, helgetur, familievennlig, ski eller paddling, slik at jeg raskt smalner inn utvalget til det som passer vår gruppe og sesong.

**Datakilder:** Intern (kategorimetadata på turer/ruter)

**Akseptansekriterier:**
- Gitt at brukeren åpner filterpanelet, når en kategori velges, så oppdateres kart og resultatliste til kun å vise turer i valgt kategori.
- Gitt at brukeren kombinerer flere filtre (f.eks. «familievennlig» + «helgetur»), når resultatene vises, så matcher alle treff begge kriteriene.
- Gitt at et filter gir null resultater, når den tomme listen vises, så foreslås det å fjerne det mest restriktive filteret.

#### D7 — Lister og samlinger [Medium]
**Som en turdeltaker**, ønsker jeg å lagre turer i lister og se lister andre har delt, slik at jeg kan samle inspirasjon over tid og starte planlegging fra en lagret tur når det passer.

**Datakilder:** Intern (brukerlister, delelenker)

**Akseptansekriterier:**
- Gitt at brukeren ser på et turforslag, når hen trykker «Lagre», så legges turen til i en valgfri liste (f.eks. «Sommerplaner»).
- Gitt at en liste finnes, når brukeren trykker «Del», så genereres en lenke som gir andre lesetilgang til listen.
- Gitt at brukeren åpner en lagret tur, når hen trykker «Planlegg denne», så opprettes en ny tur med rute og hytter forhåndsutfylt fra det lagrede forslaget.

#### D8 — Personaliserte turforslag [Medium]
**Som en turplanlegger**, ønsker jeg å få turforslag vektet mot egen turhistorikk og profilpreferanser, slik at forslagene treffer bedre enn generiske anbefalinger etter hvert som appen lærer hva jeg liker.

**Datakilder:** LLM/AI-agent (vekting av forslag), Intern (turhistorikk, profilpreferanser)
**AI-bruk:** Forslag vektes mot historikk og preferanser. Skal være tydelig merket som AI-basert rangering, ikke objektiv kvalitetsvurdering.

**Akseptansekriterier:**
- Gitt at brukeren har gjennomført minst tre turer, når forslagssiden åpnes, så vektes forslagene mot nivå, geografi og turtype fra historikken.
- Gitt at brukeren har registrert preferanser i profilen (f.eks. «foretrekker korte dager»), når turforslag genereres, så hensyntas preferansene i rangeringen.
- Gitt at brukeren ikke har turhistorikk ennå, når forslagssiden åpnes, så faller anbefalingene tilbake til område, sesong, gruppestørrelse og eksplisitte preferanser — og det er tydelig at forslagene blir mer presise med bruk.
- Gitt at forslagene er personaliserte, når de vises, så er det synlig at rangeringen er AI-basert og ikke en objektiv kvalitetsvurdering.

#### D9 — Alderstilpassede forslag [Medium]
**Som en turplanlegger**, ønsker jeg å få alderstilpassede forslag når gruppen inkluderer barn, slik at familien får aktiviteter og ruter som passer yngste deltaker, uten at jeg må filtrere selv.

**Datakilder:** LLM/AI-agent (alderstilpassing), Intern (deltakeralder)
**Scenarioer:** Scenario 3 (Henrik og Silje med barn 8 og 11: appen foreslår aktiviteter tilpasset barnas aldre)

**Akseptansekriterier:**
- Gitt at en tur opprettes med deltakere under 12 år, når turforslag genereres, så vises kun ruter og aktiviteter tilpasset yngste deltakers alder.
- Gitt at familien har barn i ulik alder, når forslagene vises, så markeres hvilke aktiviteter som passer for hvilke aldersgrupper.
- Gitt at en rute er merket som ikke barnevennlig, når den vises i resultatlisten, så skjules den eller markeres med en tydelig advarsel.

#### D10 — Ferieplanlegging [Medium]
**Som en turplanlegger**, ønsker jeg å opprette en ferieplan med flere dager og varierte aktiviteter som dagstur, padling og utflukter, slik at familien får en samlet tidslinje for hele ferien, ikke bare enkeltturer.

**Datakilder:** Yr (vær per dag), Intern (aktivitetstyper), Diverse leverandører (forhåndsbestilling)
**Scenarioer:** Scenario 3 (Henrik planlegger to uker i Hemsedal: fjelltur, padling, kajakkutleie, hviledag — alt i én tidslinje)

**Akseptansekriterier:**
- Gitt at brukeren oppretter en ferie over flere dager, når tidslinjen vises, så kan hen legge til ulike aktivitetstyper per dag (fjelltur, padling, fisking, hviledag).
- Gitt at en aktivitet krever forhåndsbestilling (f.eks. kajakkutleie), når den legges inn i planen, så vises en påminnelse om å booke med lenke til leverandør.
- Gitt at været er dårlig på en planlagt turdag, når varselet oppdateres, så foreslås det å bytte til en innendørsaktivitet eller flytte turen til en reservedag.

#### D11 — Rute på kart med høydeprofil [Høy]
**Som en turplanlegger**, ønsker jeg å se valgt rute tegnet på kartet med høydeprofil, avstand og estimert tid, slik at jeg kan vurdere ruten visuelt før jeg bestemmer meg, i stedet for å lese en tabell med tall.

**Datakilder:** Kartverket (kartlag, høydedata), DNT (rutegeometri)

**Akseptansekriterier:**
- Gitt at en rute er valgt, når kartet oppdateres, så tegnes ruten som en synlig linje med fargekoding for vanskelighetsgrad per segment.
- Gitt at ruten vises på kartet, når brukeren trykker på høydeprofil-ikonet, så vises en graf med høyde over avstand, der hytter og veipunkter er markert.
- Gitt at ruten har flere etapper, når brukeren trykker på en etappe i profilen, så zoomes kartet til den aktuelle etappen med avstand og estimert tid.

### Decide

#### B2 — Tilgjengelighetssjekk for enkelhytter [Høy]
**Som en turplanlegger**, ønsker jeg å sjekke tilgjengelighet for enkelhytter på valgte datoer, slik at jeg vet om hytta er ledig før jeg går videre med planen.

**Datakilder:** DNT (booking/tilgjengelighet), iNatur (tilgjengelighet), AirBnB (tilgjengelighet), mock-data som fallback
**Scenarioer:** Scenario 1 (Kari sjekker hytter — bare to av tre er ledige neste helg)

**Akseptansekriterier:**
- Gitt at en hytte er valgt og datoer er satt, når tilgjengeligheten sjekkes, så vises status: ledig, fullt eller ukjent.
- Gitt at en hytte er fullbooket, når konflikten oppdages, så foreslås alternative hytter eller datoer.

#### B2b — Kjede-tilgjengelighet [Høy]
**Som en turplanlegger**, ønsker jeg å sjekke kjede-tilgjengelighet for alle hytter i en flerdagsrute samtidig, slik at jeg vet om hele turen lar seg gjennomføre før jeg inviterer folk.

**Datakilder:** DNT (booking for flere hytter), iNatur/AirBnB (tilgjengelighet)
**Scenarioer:** Scenario 2 (Eirik: fem hytter må bookes på sammenhengende dager — Glitterheim er full, appen foreslår å flytte hele turen eller bytte til Olavsbu)

**Akseptansekriterier:**
- Gitt at en flerdagsrute har flere hytter, når kjede-tilgjengelighet sjekkes, så vises samlet status for hele ruten: alle ledige, eller hvilke etapper som har konflikter.
- Gitt at én eller flere hytter i kjeden er fulle, når konflikten vises, så foreslås alternative hytter eller datoer som løser hele kjeden.

#### B4 — Kjøretid og kollektivrute [Medium]
**Som en turplanlegger**, ønsker jeg å se kjøretid og kollektivrute til turutgangspunktet, slik at jeg kan planlegge transporten som en del av turen.

**Datakilder:** Entur (kollektivruter, avgangstider, buss/tog/båt), Google Maps / Vegvesenet (kjøretid)

**Akseptansekriterier:**
- Gitt at et startpunkt er valgt, når reiseruten beregnes, så vises både kjøretid og kollektivalternativ med avgangstider.
- Gitt at brukeren ikke har bil, når kollektivrute vises, så inkluderes buss, tog og eventuelt båt fra Entur.

#### B5 — Kostnadsestimat [Lav]
**Som en turplanlegger**, ønsker jeg å få et kostnadsestimat per person og per dag, slik at gruppen vet omtrent hva turen vil koste før vi bestemmer oss.

**Datakilder:** DNT/iNatur (hyttepriser), Entur (transportkostnad), Intern (matestimate)

**Akseptansekriterier:**
- Gitt at hytter og transport er valgt, når estimatet genereres, så vises en oversikt med hyttekostnad, transport og mat per person.
- Gitt at gruppen endrer antall dager, når estimatet oppdateres, så reflekteres endringen automatisk.

#### B7 — Snøforhold og skredvarsel [Medium]
**Som en turplanlegger**, ønsker jeg å se snøforhold, skredvarsel og merking for ruter og områder, slik at jeg kan ta et informert valg om ruten er trygg nok for oss på det tidspunktet vi planlegger.

**Datakilder:** Varsom.no (faregrad, skredvarsel, snøforhold), DNT (sti-merking: T-, rød, blå, svart; sesongstatus)

**Akseptansekriterier:**
- Gitt at en rute går gjennom snødekt terreng, når turdetaljene vises, så hentes faregrad fra Varsom og vises per etappe.
- Gitt at skredvarselet er på nivå 3 (betydelig) eller høyere, når brukeren ser ruten, så vises en tydelig advarsel med anbefaling om å velge alternativ rute, og lenke til Varsoms detaljerte vurdering.
- Gitt at sti-merking eller tilstand er kjent, når ruteinformasjonen vises, så vises merking (T-, rød, blå, svart) og sesongstatus, slik at brukeren kan vurdere om ruten krever spesialutstyr.

#### B8 — AI-vurdering av rute [Medium]
**Som en turplanlegger**, ønsker jeg å få en AI-vurdering av om ruten er realistisk for gruppen vår, slik at vi unngår å velge en tur som er for ambisiøs for svakeste deltaker.

**Datakilder:** LLM/AI-agent (vurdering), Kartverket/DNT (rutedata), Intern (deltakerprofiler med erfaring)
**AI-bruk:** Rute-kommentar: «er dette for ambisiøst for gruppa vår?». Skal tydelig merkes som anslag, ikke garanti.
**Scenarioer:** Scenario 1 (Marie foretrekker korte dager — appen bør vurdere om ruten passer henne)

**Akseptansekriterier:**
- Gitt at rute og gruppesammensetning er kjent, når brukeren ber om vurdering, så vises en oppsummering som tar hensyn til høydemeter, distanse og deltakernes erfaring.
- Gitt at AI vurderer ruten som krevende for gruppen, når vurderingen vises, så foreslås konkrete justeringer (kortere etapper, lettere alternativ rute).
- Gitt at vurderingen er AI-generert, når den vises, så er det tydelig markert at dette er et anslag, ikke en garanti.

#### B9 — Sanntidsvær (NowCast) [Lav]
**Som en turplanlegger**, ønsker jeg å se sanntidsvær (NowCast) for et område i tillegg til prognosen, slik at jeg kan sjekke om forholdene akkurat nå stemmer med planen, spesielt på turdagen.

**Datakilder:** Yr NowCast (nedbør, temperatur, vind i sanntid)

**Akseptansekriterier:**
- Gitt at brukeren er på tursiden på selve avreisedagen, når NowCast-data hentes, så vises nåværende nedbør, temperatur og vindforhold for turens startpunkt.
- Gitt at NowCast viser avvik fra prognosen, når avviket er vesentlig, så varsles brukeren med en endringsanbefaling.

#### B10 — Omplanleggingsforslag [Høy]
**Som en turplanlegger**, ønsker jeg å få et konkret omplanleggingsforslag fra appen når værvarselet endrer seg vesentlig, slik at jeg ser hva appen foreslår og hvilke konsekvenser det har, før jeg tar et valg.

**Datakilder:** Yr (værendring), LLM/AI-agent (genererer omplanleggingsforslag)
**Scenarioer:** Scenario 1 (fredag før turen: regn lørdag, sol søndag — appen foreslår å flytte dagsturen til søndag)
**AI-bruk:** Justeringsforslag: «flytt turen til søndag, Marie får kortere dag, alle får bedre vær». Tydelig merket som AI-forslag med synlige værdata.

**Akseptansekriterier:**
- Gitt at værvarselet for en planlagt turdag endrer seg til dårlig vær, når endringen oppdages, så mottar turplanleggeren et varsel med et konkret forslag: flytt dagsetappen, velg lavere alternativ rute, eller bytt rekkefølge på etapper.
- Gitt at et omplanleggingsforslag vises, når turplanleggeren ser det, så vises konsekvensene for pakkeliste, hytte-tilgjengelighet og estimert tid.
- Gitt at gruppen har en flerdagstur, når været er dårlig på én dag men bra på en annen, så foreslår appen å bytte dagenes innhold fremfor å avlyse.
- Gitt at omplanleggingsforslaget er AI-generert, når det vises, så er det tydelig merket som et forslag, og værdataene forslaget bygger på er synlige.

#### B10b — Akseptere omplanlegging [Høy]
**Som en turplanlegger**, ønsker jeg å akseptere et omplanleggingsforslag og få tidslinjen, pakkelisten og deltakervarsler oppdatert automatisk, slik at gruppen går fra beslutning til oppdatert plan på ett trykk.

**Datakilder:** Intern (oppdatering av tidslinje, pakkeliste, varsler)
**Scenarioer:** Scenario 1 (gruppen trykker ja — pakkeliste oppdateres: regnplagg inn, varmere soveposer. Ola får beskjed om gassbrenner.)

**Akseptansekriterier:**
- Gitt at turplanleggeren aksepterer forslaget, når endringen bekreftes, så oppdateres tidslinjen og ruten automatisk.
- Gitt at endringen påvirker pakkelisten, når tidslinjen oppdateres, så oppdateres pakkelisten automatisk med bevarte brukerendringer der de ikke konflikterer.
- Gitt at endringen er bekreftet, når oppdateringen er fullført, så varsles alle deltakere om hva som er endret.

#### B11 — Direkte booking [Medium]
**Som en turplanlegger**, ønsker jeg å booke eller reservere direkte fra appen der API-tilgang finnes, slik at jeg gjennomfører reservasjonen uten å forlate appen.

**Datakilder:** DNT (booking-API), iNatur (booking-API), AirBnB (booking-API)
**Designprinsipp:** «Aldri lenker ut til eksterne tjenester når vi kan integrere dem.»
**Scenarioer:** Scenario 2 (Eirik trykker «book denne hytta» — går mot DNTs bookingsystem direkte)

**Akseptansekriterier:**
- Gitt at en hytte har direkte booking via API, når brukeren trykker «Book», så gjennomføres reservasjonen uten å forlate appen.
- Gitt at direkte booking feiler (API nede, timeout, avvisning), når feilen oppstår, så vises en fallback-lenke til leverandørens bookingside med turkontekst bevart.

#### B11b — Handoff til leverandørens bookingside [Medium]
**Som en turplanlegger**, ønsker jeg å bli sendt til leverandørens bookingside med dato og antall forhåndsutfylt når direkte booking ikke finnes, slik at jeg slipper å taste inn turinformasjonen på nytt hos leverandøren.

**Datakilder:** Diverse leverandører (bookingsider)

**Akseptansekriterier:**
- Gitt at direkte booking ikke er tilgjengelig, når brukeren trykker «Book», så åpnes leverandørens bookingside med dato og antall forhåndsutfylt der det er mulig.
- Gitt at en aktivitet (f.eks. kajakkutleie) krever separat booking, når den er lagt inn i planen, så vises en direkte lenke til leverandør med relevant informasjon.
- Gitt at brukeren sendes til en ekstern bookingside, når hen kommer tilbake til appen, så er turkonteksten bevart og brukeren lander på samme sted i planen.

#### B12 — Kjøp av kollektivreise [Medium]
**Som en turplanlegger**, ønsker jeg å gå videre til kjøp av anbefalt kollektivreise fra turplanen, slik at jeg slipper å søke opp samme reise på nytt i Entur eller en annen app.

**Datakilder:** Entur (billettkjøp, reisekjeder)

**Akseptansekriterier:**
- Gitt at B4 har vist en anbefalt kollektivrute, når brukeren trykker «Kjøp billett», så åpnes Entur eller annen billett-app med rute, dato og antall reisende forhåndsutfylt.
- Gitt at kollektivruten har flere etapper (buss + tog), når kjøpssiden åpnes, så inkluderes hele reisekjeden, ikke bare første etappe.
- Gitt at kjøpshandoff feiler eller forhåndsutfylling ikke støttes, når brukeren trykker «Kjøp billett», så vises ruteinformasjonen på skjermen slik at brukeren manuelt kan taste den inn i billett-appen.

#### B13 — Optimale datoforslag [Høy]
**Som en turplanlegger**, ønsker jeg å få forslag til optimale datoer basert på værprognose og hytte-tilgjengelighet, slik at jeg slipper å manuelt kryssjekke vær og ledige hytter for å finne den beste helgen.

**Datakilder:** Yr (værprognose), DNT/iNatur/AirBnB (tilgjengelighet), LLM/AI-agent (rangering og anbefaling)
**Scenarioer:** Scenario 1 (appen foreslår to helger basert på vær og hytte-tilgjengelighet)
**AI-bruk:** Dato-rangering er AI-basert. Trade-offs skal være synlige (f.eks. «litt dårligere vær, men alle hytter ledige»).

**Akseptansekriterier:**
- Gitt at brukeren har valgt område og hytter men ikke dato, når datoforslag genereres, så rangeres de neste aktuelle helgene etter kombinasjon av vær og tilgjengelighet.
- Gitt at de tre beste helgene vises, når brukeren ser forslagene, så vises værsammendrag og hyttestatus per forslag slik at hen kan sammenligne.
- Gitt at brukeren velger en anbefalt helg, når valget bekreftes, så settes dato for turen og tilgjengelighet oppdateres automatisk.
- Gitt at værdata og tilgjengelighetsdata peker i forskjellige retninger, når forslagene vises, så er trade-offen synlig (f.eks. «litt dårligere vær, men alle hytter ledige») slik at brukeren kan ta et informert valg.
- Gitt at dato-rangeringen er AI-basert, når forslagene vises, så er det tydelig merket som anbefalinger med underliggende data synlig.

#### B14 — AI-sammenligning av hytter [Medium]
**Som en turplanlegger**, ønsker jeg å få en AI-generert sammenligning av hytter i et område, slik at jeg forstår hva som skiller hyttene uten å måtte lese fem separate beskrivelser.

**Datakilder:** DNT/iNatur/AirBnB (hyttedata: pris, kapasitet, beliggenhet), LLM/AI-agent (sammenligning og oppsummering)
**AI-bruk:** Hytte-sammenligninger oppsummeres: «hva skiller denne fra de andre». Tydelig merket som AI-generert.

**Akseptansekriterier:**
- Gitt at brukeren har to eller flere hytter i samme område, når hen åpner sammenligning, så vises en oppsummering med pris, kapasitet, beliggenhet og hva som gjør hver hytte distinkt.
- Gitt at sammenligningen vises, når brukeren ser den, så er AI-generert tekst tydelig merket og basert på faktisk data fra hyttekildene.
- Gitt at én hytte passer gruppens behov best, når AI foreslår den, så forklares begrunnelsen (f.eks. «nærmest forrige etappe, billigst, ledig på valgt dato»).
- Gitt at en hytte har mangelfulle data (mangler pris eller kapasitet), når sammenligningen vises, så markeres manglende felter tydelig i stedet for å utelate hytta.

### Gather

#### G2 — Avstemning [Medium]
**Som en turdeltaker**, ønsker jeg å stemme på alternativer når gruppen ikke er enig om dato eller hytte, slik at vi lander en beslutning uten endeløs diskusjon i gruppechat.

**Datakilder:** Intern (avstemningsdata)
**Scenarioer:** Scenario 1 (gruppa må bli enig om helg — Kari, Ola og Marie stemmer)

**Akseptansekriterier:**
- Gitt at turplanleggeren har lagt inn to eller flere alternativer, når avstemningen åpnes, så kan hver deltaker avgi sin stemme.
- Gitt at alle har stemt, når resultatet vises, så fremheves vinneren og turplanleggeren kan bekrefte valget.

#### G3 — Deltidsdeltakelse [Medium]
**Som en turdeltaker**, ønsker jeg å melde meg på deler av turen, slik at jeg kan bli med på de dagene som passer meg uten å blokkere resten av gruppen.

**Datakilder:** Intern (deltakelse per dag)
**Scenarioer:** Scenario 2 (vennen som vil bli med tre av fem dager), Scenario 1 (Marie kan ikke fredag)

**Akseptansekriterier:**
- Gitt at en flerdagstur er opprettet, når deltakeren velger deltidsdeltakelse, så kan hen velge hvilke dager hen er med.
- Gitt at en deltaker kun er med tre av fem dager, når pakkelisten genereres, så tilpasses den til deltakers faktiske dager.

#### G4 — Deltakerstatus [Høy]
**Som en turplanlegger**, ønsker jeg å se hvem som har svart, hvem som venter og hvem som har avslått, slik at jeg vet hvor vi står uten å måtte sende purringer manuelt.

**Datakilder:** Intern (invitasjonsstatus)
**Scenarioer:** Scenario 1 (Marie svarer ikke før sent — Kari trenger oversikt)

**Akseptansekriterier:**
- Gitt at invitasjoner er sendt, når statussiden åpnes, så vises hver deltaker med status: akseptert, venter eller avslått.
- Gitt at en deltaker ikke har svart innen 48 timer, når påminnelsesfristen utløper, så kan turplanlegger sende en påminnelse med ett trykk.

#### G5 — Kommentartråd [Medium]
**Som en turdeltaker**, ønsker jeg å ha en kommentartråd per tur der gruppen kan diskutere detaljer, slik at vi slipper å spre diskusjonen over SMS, Messenger og e-post.

**Datakilder:** Intern (kommentarer, sanntidsoppdatering)
**Designprinsipp:** Erstatter «Messenger-tråden ingen klarer å holde orden på» — all diskusjon i kontekst av turen.

**Akseptansekriterier:**
- Gitt at en tur er opprettet, når en deltaker legger igjen en kommentar, så er den synlig for alle andre deltakere i sanntid.
- Gitt at en kommentar nevner et valg (f.eks. dato eller hytte), når turredigering skjer, så vises kommentaren som kontekst ved endringen.
- Gitt at en deltaker ikke har appen, når kommentartråden åpnes via turlenken, så kan hen lese og svare uten innlogging.

#### G6 — Deltakerprofil [Medium]
**Som en turdeltaker**, ønsker jeg å registrere preferanser og erfaringsnivå i en deltakerprofil, slik at turplanleggeren får bedre grunnlag for å velge passende rute og tempo.

**Datakilder:** Intern (profildata, erfaringsnivå, preferanser)
**Scenarioer:** Scenario 1 (Kari er i god form, Marie foretrekker korte dager — ulikt erfaringsnivå)

**Akseptansekriterier:**
- Gitt at en deltaker åpner profilen sin, når hen velger erfaringsnivå og preferanser, så lagres dette og gjenbrukes på tvers av turer.
- Gitt at alle i gruppen har fylt ut profil, når turplanleggeren ser gruppesammendrag, så vises svakeste og sterkeste nivå sammen med preferanse-overlapp.

#### G7 — AI-kompromissforslag [Medium]
**Som en turplanlegger**, ønsker jeg å få et AI-generert kompromissforslag når gruppen ikke blir enig, slik at vi løser opp fastlåste diskusjoner uten at noen må gi seg helt.

**Datakilder:** LLM/AI-agent (kompromissforslag basert på deltakernes preferanser og stemmer)
**AI-bruk:** Tydelig merket som forslag, ikke gruppas beslutning.

**Akseptansekriterier:**
- Gitt at en avstemning har stått uavgjort i mer enn 24 timer, når AI analyserer alternativene, så foreslås et kompromiss som balanserer flest deltakeres preferanser.
- Gitt at kompromissforslaget vises, når gruppen ser det, så forklares begrunnelsen og gruppen kan akseptere eller forkaste det.
- Gitt at kompromisset er AI-generert, når det vises, så er det tydelig merket som forslag og ikke som gruppas beslutning.

#### G8 — Alternativ rute for deltidsdeltaker [Medium]
**Som en turdeltaker**, ønsker jeg å få en alternativ rute og møtepunkt når jeg bare er med deler av en flerdagstur, slik at jeg vet nøyaktig hvor og når jeg møter gruppen og forlater den, uten at noen må planlegge det manuelt.

**Datakilder:** Kartverket/DNT (alternative ruter), Entur/Google Maps (transport til møtepunkt)
**Scenarioer:** Scenario 2 (vennen som bare er med dag 3–5: appen gir alternativ rute fra Glitterheim, ut via Spiterstulen)

**Akseptansekriterier:**
- Gitt at en deltaker har meldt seg på dag 3–5 av en femdagers tur, når appen beregner del-ruten, så vises et anbefalt møtepunkt med transport dit og en tilpasset etappeplan.
- Gitt at møtepunktet krever transport, når del-ruten vises, så inkluderes kjøretid eller kollektivrute til møtepunktet.
- Gitt at deltakeren forlater turen før resten av gruppen, når avslutningspunktet beregnes, så vises nærmeste punkt med vei- eller kollektivtilgang.

#### G9 — Ad-hoc invitasjon [Lav]
**Som en turplanlegger**, ønsker jeg å kunne invitere noen til å «komme innom» på en spesifikk dag eller etappe midt i turen, slik at venner og familie kan slutte seg til oss underveis uten å forplikte seg til hele turen.

**Datakilder:** Intern (deltakeradministrasjon, matplan-oppdatering)
**Scenarioer:** Scenario 3 (tante Hilde vil komme innom en helg — Henrik sender lenke for spesifikk dag)

**Akseptansekriterier:**
- Gitt at en tur er pågående eller planlagt, når turplanleggeren inviterer en person til en spesifikk dag, så får hen en lenke med kun de relevante detaljene for den dagen.
- Gitt at en ad-hoc-deltaker aksepterer, når hen legges til på den aktuelle dagen, så oppdateres matplan og eventuell utstyrsfordeling for den dagen.

#### G10 — Kjørekoordinering [Medium]
**Som en turplanlegger**, ønsker jeg å koordinere kjøring til startpunktet — hvem kjører, hvem er passasjer og hvem må hentes, slik at alle vet hvordan de kommer seg til turutgangspunktet uten å koordinere det i gruppechat.

**Datakilder:** Intern (sjåfør/passasjer-registrering), Google Maps (kjøreruter)
**Scenarioer:** Scenario 1 (Marie får vite at Kari kjører)

**Akseptansekriterier:**
- Gitt at turen har et definert startpunkt, når kjørekoordinering åpnes, så kan deltakere markere seg som sjåfør (med antall plasser) eller passasjer.
- Gitt at sjåfører og passasjerer er registrert, når fordelingen vises, så ser alle hvem de kjører med og eventuell hentadresse.
- Gitt at en deltaker ikke har skyss, når ufordelte passasjerer finnes, så varsles sjåfører med ledig plass.
- Gitt at en sjåfør faller fra eller kapasitet endres, når endringen registreres, så varsles berørte passasjerer og kjørefordelingen oppdateres automatisk.

### Prepare

#### P1b — Automatisk oppdatering av pakkeliste [Medium]
**Som en gruppeleder**, ønsker jeg å få pakkelisten automatisk oppdatert når vær, plan eller gruppesammensetning endrer seg, slik at listen holder seg relevant uten at jeg må oppdatere den manuelt.

**Datakilder:** Yr (værendring som trigger), LLM/AI-agent (oppdaterer listen), Intern (planendring, gruppeendring)
**Scenarioer:** Scenario 1 (vær endres: regnplagg inn, varmere soveposer inn)

**Akseptansekriterier:**
- Gitt at værvarselet endrer seg, når listen oppdateres, så legges relevante endringer til (f.eks. regnplagg) med tydelig markering.
- Gitt at turen omplanlegges via B10, når pakkelisten oppdateres automatisk, så bevares manuelle brukerendringer der de ikke konflikterer med den nye planen, og konflikter markeres tydelig.
- Gitt at gruppen inkluderer barn, når pakkelisten genereres, så inkluderes barnespesifikke elementer (ekstra varme lag, solkrem, tilpasset matpakke) basert på barnas alder.

#### P2 — Utstyrsfordeling med avkvittering [Høy]
**Som en gruppeleder**, ønsker jeg å fordele utstyr i gruppen med avkvittering, slik at vi vet hvem som tar med gassbrenner, telt og førstehjelp uten å koordinere det i chat.

**Datakilder:** Intern (utstyrsfordeling, avkvitteringsstatus)
**Scenarioer:** Scenario 1 (Ola kvitterer ut gassbrenner), Scenario 2 (turkjøkken-utstyr fordeles på fire personer)

**Akseptansekriterier:**
- Gitt at pakkelisten inneholder fellesutstyr, når fordelingen åpnes, så kan gruppelederen tildele gjenstander til spesifikke deltakere.
- Gitt at en gjenstand er tildelt, når deltakeren åpner sin pakkeliste, så ser hen gjenstanden med en «kvitter ut»-knapp.
- Gitt at alle har kvittert ut, når gruppelederen ser oversikten, så vises en komplett status over hva som er pakket og hva som mangler.

#### P3 — Personlig pakkeliste [Medium]
**Som en turdeltaker**, ønsker jeg å se min personlige pakkeliste med både egne og tildelte ting, slik at jeg har én oversikt over alt jeg skal ha med meg.

**Datakilder:** Intern (personlig + tildelt utstyr i én visning)

**Akseptansekriterier:**
- Gitt at pakkeliste og fordeling er gjort, når deltakeren åpner sin liste, så vises personlige ting og fellesansvar i én samlet visning.
- Gitt at det er en flerdagstur, når listen vises, så er mat og gass beregnet for riktig antall dager.

#### P4 — Påminnelser [Lav]
**Som en turplanlegger**, ønsker jeg å sette påminnelser X dager før avreise, slik at deltakerne får beskjed i tide om å pakke, kjøpe mat eller sjekke været.

**Datakilder:** Intern (push-varsler, tidsstyrt)

**Akseptansekriterier:**
- Gitt at en påminnelse er satt, når datoen inntreffer, så mottar alle deltakere et varsel.
- Gitt at påminnelsen er om pakking, når varselet vises, så lenker det direkte til deltakerens pakkeliste.

#### P5 — AI-generert matplan [Medium]
**Som en gruppeleder**, ønsker jeg å få en AI-generert matplan per etappe med mengder tilpasset antall deltakere, slik at vi vet hva vi trenger av mat for hele turen uten å planlegge manuelt.

**Datakilder:** LLM/AI-agent (genererer matplan med mengder), Intern (antall deltakere per dag)
**Scenarioer:** Scenario 2 (matplanlegging per etappe for hele uka)

**Akseptansekriterier:**
- Gitt at antall dager, deltakere og måltider er satt, når matplanen genereres, så vises forslag per etappe med mengder tilpasset antall personer.
- Gitt at en deltaker kun er med deler av turen, når matplanen beregnes, så justeres mengdene per etappe etter faktisk antall deltakere den dagen.

#### P5b — Samlet handleliste [Medium]
**Som en gruppeleder**, ønsker jeg å få en samlet handleliste fra matplanen med fordeling av handleansvar, slik at vi kjøper riktig mengde mat på forhånd og vet hvem som handler hva.

**Datakilder:** Intern (aggregering fra matplan, ansvarsfordeling)

**Akseptansekriterier:**
- Gitt at matplanen er godkjent, når handlelisten genereres, så summeres alle ingredienser på tvers av etapper i én kjøpeliste.
- Gitt at handlelisten er klar, når gruppelederen fordeler ansvar, så kan hver deltaker se hvilke varer de har ansvar for å kjøpe og kvittere ut at det er handlet.

#### P6 — Estimert bærevekt [Lav]
**Som en gruppeleder**, ønsker jeg å se estimert bærevekt per person basert på pakkeliste, mat og fellesutstyr, slik at vi kan fordele rettferdig og unngå at noen får for tung sekk.

**Datakilder:** Intern (vektdata for utstyr, mat, gass)
**Scenarioer:** Scenario 2 (vekt betyr noe på femdagers tur — sekkevekt beregnes)

**Akseptansekriterier:**
- Gitt at pakkeliste og matplan er ferdig, når vektoversikten vises, så ser hver deltaker sin estimerte totalvekt (personlig + tildelt fellesutstyr + mat).
- Gitt at én deltaker har vesentlig mer vekt enn andre, når ubalansen oppdages, så foreslås en omfordeling.

#### P7 — Forhåndskjøpsliste for forbruksvarer [Lav]
**Som en gruppeleder**, ønsker jeg å få en samlet forhåndskjøpsliste for forbruksvarer utover mat, som gass, batterier og førstehjelp, slik at vi handler alt vi trenger på én gang i stedet for å oppdage at noe mangler på turdagen.

**Datakilder:** Intern (beregning basert på dager og personer)
**Scenarioer:** Scenario 2 (gassbehov regnes ut for hele uka)

**Akseptansekriterier:**
- Gitt at pakkeliste og matplan er ferdig, når forhåndskjøpslisten genereres, så samles alle varer som må kjøpes inn (gass beregnet per dag, batterier, solkrem, etc.) i én liste.
- Gitt at gassmengde avhenger av antall dager og personer, når beregningen vises, så angis anbefalt mengde i gram eller antall bokser.
- Gitt at listen er klar, når gruppelederen fordeler ansvar, så kan hver deltaker kvittere ut hva de har kjøpt.

### Go

#### T2 — Parkeringsinformasjon [Medium]
**Som en turdeltaker**, ønsker jeg å se parkeringsinformasjon og koordinater for turutgangspunktet, slik at jeg finner startpunktet uten å måtte google det separat.

**Datakilder:** Kartverket (koordinater), Intern/DNT (parkeringsinfo, avgift)
**Scenarioer:** Scenario 4 (Morten får parkeringskoordinater — slipper å bomme på parkeringen)

**Akseptansekriterier:**
- Gitt at en tur har et definert startpunkt, når turdetaljene vises, så inkluderes parkeringsplass med koordinater og eventuell avgift.
- Gitt at brukeren trykker på parkeringskoordinatene, når navigasjonsappen åpnes, så settes destinasjonen automatisk.

#### T3 — Delt posisjon [Lav]
**Som en gruppeleder**, ønsker jeg å dele posisjon med gruppen under turen, slik at vi vet hvor alle er hvis vi sprer oss eller går i ulikt tempo.

**Datakilder:** Intern (GPS-deling, opt-in)

**Akseptansekriterier:**
- Gitt at delt lokasjon er aktivert (opt-in), når gruppemedlemmene har appen åpen, så vises alles posisjon på kartet.
- Gitt at en deltaker deaktiverer deling, når innstillingen endres, så fjernes posisjonen fra gruppekartet umiddelbart.

#### T4 — Sjekk inn ved hytte [Lav]
**Som en turdeltaker**, ønsker jeg å sjekke inn ved ankomst til en hytte, slik at gruppen og systemet vet at jeg har kommet trygt frem.

**Datakilder:** Intern (GPS-posisjon, etappestatus)
**Scenarioer:** Scenario 2 (check-in ved ankomst hytte)

**Akseptansekriterier:**
- Gitt at deltakeren er i nærheten av en hytte på ruten, når hen trykker «Sjekk inn», så registreres ankomsten og gruppen varsles.
- Gitt at alle i gruppen har sjekket inn, når siste person registrerer seg, så oppdateres etappestatusen til «fullført».

#### T5 — GPX-eksport [Medium]
**Som en soloturer**, ønsker jeg å eksportere GPX-ruten til klokke eller annen GPS-enhet, slik at jeg kan navigere via klokka uten å ha telefonen fremme hele tiden.

**Datakilder:** Kartverket/DNT (rutegeometri → GPX-format)
**Scenarioer:** Scenario 2 (GPX-spor til klokka), Scenario 4 (GPX-fil til klokka)

**Akseptansekriterier:**
- Gitt at en tur har en definert rute, når brukeren trykker «Eksporter GPX», så genereres en standard GPX-fil klar for nedlasting.
- Gitt at brukeren har en tilkoblet Garmin eller lignende, når GPX-filen overføres, så vises ruten på klokka med waypoints for hytter og viktige punkt.

#### T6 — Nødkontakter offline [Høy]
**Som en turplanlegger**, ønsker jeg å ha nødkontakter og nødtelefonnumre tilgjengelig offline, slik at vi vet hvem vi skal ringe og hvor vi skal henvende oss hvis noe skjer.

**Datakilder:** Intern (nødkontakter for gruppen), Statiske data (113, legevakt, nærmeste bemannede hytte)
**Scenarioer:** Scenario 2 (nødinformasjon tilgjengelig offline under flerdag)

**Akseptansekriterier:**
- Gitt at en tur er lastet ned for offline bruk, når brukeren åpner nødinfo, så vises redningstelefon (113), nærmeste legevakt og nærmeste bemannede hytte — også uten nettilgang.
- Gitt at turplanleggeren har lagt inn nødkontakter for gruppen, når en deltaker åpner nødinfo, så vises kontaktinformasjonen offline og kan ringes direkte når enheten har dekning.

#### T7 — Dele estimert hjemkomsttid [Lav]
**Som en soloturer**, ønsker jeg å dele estimert hjemkomsttid med en kontaktperson, slik at noen hjemme vet når de kan forvente meg tilbake, og kan reagere om det tar for lang tid.

**Datakilder:** Intern (ETA-beregning, kontaktperson, varsel)
**Scenarioer:** Scenario 4 (Morten deler estimert hjemkomsttid med kjæresten på ett trykk)

**Akseptansekriterier:**
- Gitt at turen har en beregnet varighet, når brukeren aktiverer ETA-deling, så sendes en melding til valgt kontaktperson med forventet hjemkomst.
- Gitt at brukeren er vesentlig forsinket i forhold til ETA, når forsinkelsen passerer en terskel, så mottar kontaktpersonen et oppdatert varsel.

#### T8 — Sanntidsnavigasjon med kompass [Høy]
**Som en turdeltaker**, ønsker jeg å følge ruten i sanntid med kompass og retningsanvisning til neste waypoint, slik at jeg kan navigere trygt uten å måtte bruke en egen kartapp ved siden av.

**Datakilder:** Kartverket (nedlastede kartdata), DNT (waypoints for hytter), GPS (enhetsposisjon, kompass)

**Akseptansekriterier:**
- Gitt at en etappe er startet, når GPS-posisjon oppdateres, så vises en retningspil mot neste waypoint og estimert distanse og tid igjen på etappen.
- Gitt at brukeren åpner navigasjonsvisningen, når kompasset vises, så peker det mot neste hytte eller veipunkt på ruten.
- Gitt at brukeren avviker vesentlig fra ruten, når avviket oppdages, så vises et varsel med forslag om å komme tilbake på ruten.
- Gitt at enheten er offline, når navigasjonen brukes, så fungerer kompass og rute-follow basert på nedlastede data og GPS.

### Return

#### R1b — Vipps-betalingsforespørsel [Lav]
**Som en gruppeleder**, ønsker jeg å sende betalingsforespørsel via Vipps direkte fra appen, slik at deltakerne kan betale sin andel med étt trykk uten manuell overføring.

**Datakilder:** Vipps (betalingslenke, betalingsstatus)
**Scenarioer:** Scenario 1 (Kari bruker Vipps-lenka og gjør opp med Marie)

**Akseptansekriterier:**
- Gitt at splitten er klar, når brukeren trykker «Send betalingsforespørsel», så genereres en Vipps-lenke med riktig beløp til hver person.
- Gitt at en deltaker har betalt via Vipps, når betalingen bekreftes, så oppdateres statusen i appen automatisk.

#### R2 — Delt turalbum [Lav]
**Som en turdeltaker**, ønsker jeg å laste opp bilder til et delt turalbum, slik at vi samler alle bildene på étt sted i stedet for å sende dem i chat.

**Datakilder:** Intern (bildelagring, kronologisk sortering)
**Scenarioer:** Scenario 1 (bilder havner i et delt album)

**Akseptansekriterier:**
- Gitt at turen er fullført, når en deltaker laster opp bilder, så legges de til i et delt album synlig for alle i gruppen.
- Gitt at flere deltakere laster opp, når albumet vises, så er bildene sortert kronologisk med hvem som tok dem.

#### R3 — Gjenbruk tur som mal [Medium]
**Som en turplanlegger**, ønsker jeg å gjenbruke en tidligere tur som mal for neste år, slik at vi slipper å planlegge alt fra bunnen av når vi vil gjenta turen.

**Datakilder:** Intern (turmal, ny tilgjengelighetssjekk), DNT/iNatur (tilgjengelighet for nye datoer)
**Scenarioer:** Scenario 1 (turen lagres i historikk og dukker opp som forslag neste år), Scenario 2 («planlegg neste år»-knapp beholder rutevalg)

**Akseptansekriterier:**
- Gitt at en tur er fullført og lagret, når brukeren trykker «Gjenta denne turen», så opprettes en ny tur med samme rute, hytter og deltakere, men med nye datoer.
- Gitt at en gjentatt tur opprettes, når datoene velges, så sjekkes tilgjengelighet på nytt for de nye datoene.
- Gitt at en tur ble gjennomført for omtrent ett år siden, når sesongen nærmer seg igjen, så får turplanleggeren et proaktivt forslag om å gjenta turen med oppdaterte datoer.

#### R4 — Turhistorikk og statistikk [Lav]
**Som en turdeltaker**, ønsker jeg å se turhistorikk og statistikk over mine gjennomførte turer, slik at jeg har en oversikt over hva jeg har gjort og kan dele det med andre.

**Datakilder:** Intern (turdata, distanse, høydemeter)

**Akseptansekriterier:**
- Gitt at brukeren har gjennomført minst én tur, når historikksiden åpnes, så vises alle turer med dato, rute, distanse og høydemeter.
- Gitt at brukeren åpner en tidligere tur, når detaljene vises, så kan hen se deltakere, bilder og pakkeliste fra den gang.

#### R5 — Turanmeldelse [Lav]
**Som en turdeltaker**, ønsker jeg å skrive en kort anmeldelse av turen og dele den med fellesskapet, slik at andre brukere får førstehånds erfaringer som hjelper dem å velge tur.

**Datakilder:** Intern (anmeldelser, tagger, poeng)

**Akseptansekriterier:**
- Gitt at turen er fullført, når brukeren åpner «Skriv anmeldelse», så kan hen gi poeng (1–5), velge tagger (f.eks. «familievennlig», «krevende») og skrive fritekst.
- Gitt at anmeldelsen er publisert, når andre brukere ser den aktuelle ruten, så vises anmeldelsen med dato, sesong og gruppestørrelse som kontekst.

#### R6 — Grafisk høydeprofil og statistikk [Lav]
**Som en turdeltaker**, ønsker jeg å se grafisk høydeprofil og samlet statistikk for gjennomførte turer, slik at jeg kan sammenligne turer over tid og se utviklingen min visuelt.

**Datakilder:** Kartverket (høydedata), Intern (turstatistikk, sammenligning)

**Akseptansekriterier:**
- Gitt at en tur er fullført, når tursiden åpnes, så vises en graf med høyde over avstand for hele ruten, med etapper markert.
- Gitt at brukeren har gjennomført flere turer, når statistikksiden åpnes, så vises samlet distanse, høydemeter og antall turer per sesong.
- Gitt at brukeren åpner statistikken, når de siste turene vises, så kan hen sammenligne to turer side om side på høydeprofil og tempo.

### System og administrasjon

#### S1 — API-konfigurasjon [Høy]
**Som en administrator**, ønsker jeg å konfigurere API-nøkler og datakilde-tilganger for alle team, slik at ingen team trenger å bruke tid på autentisering på hackathon-dagen.

**Datakilder:** Alle eksterne API-er (Yr, Kartverket, DNT, Entur, Varsom, iNatur, AirBnB, Vipps, Google Maps)

**Akseptansekriterier:**
- Gitt at et nytt team opprettes, når miljøvariablene settes, så har teamet tilgang til alle forhåndskonfigurerte API-er.
- Gitt at en API-nøkkel utløper under hackathonen, når feilen oppdages, så logges den sentralt og administrator varsles.

#### S2 — Fallback-data [Høy]
**Som en administrator**, ønsker jeg å tilby fallback-data når et eksternt API er nede eller utilgjengelig, slik at teamene kan jobbe videre selv om en datakilde feiler.

**Datakilder:** Forhåndslastede snapshots av DNT, Yr, Kartverket m.fl.

**Akseptansekriterier:**
- Gitt at DNT-APIet ikke svarer, når appen forsøker å hente hyttedata, så brukes det forhåndslastede snapshot automatisk.
- Gitt at fallback-data brukes, når dataene vises i appen, så markeres det tydelig at dataene kan være utdaterte.

#### S3 — AI-transparens [Høy]
**Som en turplanlegger**, ønsker jeg å få tydelig beskjed når AI foreslår noe versus når data er faktisk, slik at jeg stoler på det jeg ser og vet hva som er sikkert og hva som er anslag.

**Datakilder:** Intern (merking av AI-generert vs. faktisk data)
**Designprinsipp:** Gjelder alle AI-funksjoner: pakkeliste (P1), turforslag (D3/D8), omplanlegging (B10), rutevurdering (B8), hytte-sammenligning (B14), kompromissforslag (G7), matplan (P5), datoforslag (B13).

**Akseptansekriterier:**
- Gitt at AI genererer en pakkeliste, når listen vises, så er AI-genererte elementer visuelt skilt fra brukerdefinerte.
- Gitt at en værprognose har lav pålitelighet, når den vises, så er usikkerheten synlig for brukeren.
- Gitt at AI foreslår en alternativ rute, når forslaget vises, så forklares kort hvorfor endringen er foreslått.

---

## Summary

| Status | Count |
|--------|-------|
| MVP | 9 |
| Backlog | 54 |
| **Total** | **63** |
