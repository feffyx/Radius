# Stima dei costi

**In sintesi**

- Un pilota di 12 mesi con 15 stalle costa circa **125.000–205.000 €**. Circa tre quarti sono persone.
- L'AI costa pochissimo: nel pilota le chiamate ai modelli via API valgono **pochi dollari l'anno**. I modelli di previsione e ottimizzazione girano su un normale server, senza GPU e senza addestrare modelli linguistici.
- A regime la piattaforma va in pari a circa **780–1.110 € per stalla l'anno con 300 stalle**, e a circa **490–730 € con 600 stalle**.

Tutti gli importi sono intervalli basati su ipotesi dichiarate, IVA esclusa. I calcoli sono ripetibili con i parametri indicati.

## 1. Il pilota

Perimetro ipotizzato: 12 mesi, 15 stalle, le aziende riceventi intorno, 1–2 contoterzisti, un coordinatore (associazione, cooperativa o impianto di biogas).

| Voce | Ipotesi | Costo (€) |
| --- | --- | --- |
| **Persone** | | **92.100–141.000** |
| Sviluppo dell'MVP | 2 sviluppatori per 6 mesi | 42.000–66.000 |
| Design dell'esperienza utente | 1 designer per 3 mesi | 9.000–13.500 |
| Manutenzione durante la stagione | 1 sviluppatore al 50% per 6 mesi | 10.500–16.500 |
| Agronomo | 50% per 12 mesi: piano di campionamento, rapporti con le aziende, relazioni tecniche | 18.000–27.000 |
| Coordinamento | 30% per 12 mesi: gruppo, Regione, ARPAC, servizi veterinari | 12.600–18.000 |
| **Hardware** | | **8.540–15.320** |
| Sensori di livello sulle vasche | 22 sensori (circa 1,5 vasche per stalla) a 270–460 € | 5.940–10.120 |
| Gateway LoRaWAN da esterno | 3 a 500–1.000 € | 1.500–3.000 |
| Installazione dei sensori | 22 a 50–100 € | 1.100–2.200 |
| **Analisi** | | **9.000–18.000** |
| Analisi di laboratorio del liquame | 200 campioni a 40–80 € | 8.000–16.000 |
| Logistica dei campioni | contenitori, conservazione, spedizioni | 1.000–2.000 |
| **Servizi digitali** | | **810–3.800** |
| Server cloud | macchina virtuale, PostgreSQL con PostGIS, backup: 12 mesi a 50–150 € | 600–1.800 |
| Modello linguistico e OCR via API | vedi paragrafo 2, con ampio margine | 10–100 |
| Dati meteo con licenza commerciale | il piano gratuito di Open-Meteo vale solo per uso non commerciale | 0–1.500 |
| Account sviluppatore per le app e dominio | | 200–400 |
| **Altro** | | **3.000–8.000** |
| Privacy e contratti tipo | valutazione d'impatto, informative, modello di contratto di cessione | 2.000–5.000 |
| Incontri e formazione per le aziende | | 1.000–3.000 |
| **Subtotale** | | **113.450–186.120** |
| Contingenza | 10% | 11.345–18.612 |
| **Totale pilota** | | **124.795–204.732** |

Costo per persona al mese, inteso come costo per l'azienda (ipotesi): sviluppatore 3.500–5.500 €, designer 3.000–4.500 €, agronomo 3.000–4.500 €, coordinatore 3.500–5.000 €.

Il pilota costa quindi circa 8.300–13.600 € per stalla. È un costo di avvio: serve soprattutto a raccogliere le analisi che mancano sul liquame bufalino e a misurare il risparmio reale.

**Non incluso**

- Il sensore NIR sul carrobotte, previsto in fase 2: serve un preventivo del concessionario e va verificato che il servizio per i reflui sia offerto in Italia.
- Il costo dei carichi: trasporto e spandimento li pagano le aziende come oggi (vedi paragrafo 4).
- Il lavoro del team durante l'hackathon.

**Come si può finanziare**

Con un bando per i gruppi operativi dell'innovazione (intervento SRG01 del CSR Campania 2023–2027), un contributo della Regione e una quota del gruppo. Importi e percentuali di contributo vanno verificati sul bando.

## 2. Il costo dell'AI

| Uso | Volume nel pilota (ipotesi) | Consumo stimato | Costo all'anno |
| --- | --- | --- | --- |
| Spiegazione di ogni proposta | 60 a settimana per 40 settimane, cioè 2.400 | 2.000 token in ingresso e 300 in uscita ciascuna | circa 0,84 $ |
| Lettura dei referti di laboratorio | 200 referti di 3 pagine | circa 3.000 token per pagina, 500 in uscita | circa 0,23 $ |
| OCR dei referti scansionati | 600 pagine | 4 $ ogni 1.000 pagine | circa 2,40 $ |
| **Totale pilota** | | | **meno di 5 $** |

Prezzi usati: Claude Haiku 5.5 a 0,10 $ per milione di token in ingresso e 0,50 $ in uscita; Mistral OCR a 4 $ ogni 1.000 pagine.

A regime, con 500 stalle (circa 2.000 spiegazioni a settimana e 5.000 referti l'anno), si arriva a circa 100 $ l'anno.

I modelli che fanno le previsioni (regressioni, filtro di Kalman, calibrazione PLS) e l'ottimizzazione (OR-Tools o HiGHS) girano sulla CPU dello stesso server. Non serve una GPU e non serve addestrare o modificare un modello linguistico.

Il costo vero dell'intelligenza non è il calcolo ma la qualità dei dati, cioè le analisi di laboratorio che insegnano ai modelli com'è il liquame bufalino.

## 3. I costi a regime

**Costi fissi all'anno (ipotesi)**

| Voce | Ipotesi | Costo (€) |
| --- | --- | --- |
| Team | 3,5 persone (2 sviluppatori, 1 agronomo per l'assistenza, mezza persona commerciale) a 4.000–5.000 € al mese | 168.000–210.000 |
| Cloud | | 3.000–8.000 |
| Legale, assicurazione, varie | | 5.000–10.000 |
| **Totale fissi** | | **176.000–228.000** |

**Costi variabili per stalla all'anno (ipotesi)**: 2 sensori ammortizzati in 5 anni (108–184 €), quota cloud (5–10 €), 2–4 ore di assistenza a 40 € (80–160 €). Totale **193–354 €**.

**Punto di pareggio per stalla all'anno**

| Stalle servite | Costo per stalla (€) |
| --- | --- |
| 100 | 1.953–2.634 |
| 300 | 780–1.114 |
| 600 | 486–734 |

La piattaforma regge solo con qualche centinaio di stalle. Per arrivarci ci sono due strade: allargarsi ad altre zone bufaline, come la piana del Sele, e ad altri allevamenti, come bovini e suini, cambiando solo le tabelle.

Il prezzo va confrontato con il valore per chi alleva. Per una stalla con 200 bufale in lattazione, cedere dentro il raggio metà del liquame (circa 1.600 m³) evita, per esempio, un trattamento a circa 6 €/m³, cioè circa 9.600 € l'anno. Il calcolo è in [02-modello-economico.md](02-modello-economico.md).

## 4. Chi paga cosa

| Chi paga | A chi | Per cosa | Quanto |
| --- | --- | --- | --- |
| Azienda ricevente | Contoterzista | Trasporto e spandimento dentro il raggio | Da 2,2 a 4,1 €/m³ entro 5 km (Manuale CIB) |
| Allevatore | Contoterzista o azienda ricevente | Contributo per i carichi oltre il raggio | Per esempio 0,55 €/m³ a 4,6 km (calcolo) |
| Allevatore | Fornitori | Sensori sulle vasche | 270–460 € a sensore (ipotesi) |
| Contoterzista | Fornitori | Sensore NIR, in fase 2 | Da preventivo |
| Coordinatore del gruppo | La piattaforma | Abbonamento per ogni azienda | Da definire, sotto il valore creato |
| Regione | La piattaforma | Vista di controllo; finanziamento del pilota | Licenza annuale; bando |

Il modello di business esclude una percentuale sui risparmi: il risparmio è difficile da misurare, e una percentuale spingerebbe a proporre più carichi del necessario.

## Fonti dei prezzi

- [Prezzi dei modelli Claude](https://claude.com/pricing)
- [Prezzi di Mistral, OCR](https://mistral.ai/pricing/api/)
- [Piani di Open-Meteo](https://open-meteo.com/en/pricing)
- [Consorzio Italiano Biogas, Manuale sul digestato (costi dei cantieri)](https://consorziobiogas.it/wp-content/uploads/2026/05/Digestato-Manuale-B5-2024-WEB-1.pdf)
- [Regione Campania, progetto RiduciN (costo del trattamento)](https://agricoltura.regione.campania.it/reflui/pdf/riducin-relazione-divulgativa.pdf)
