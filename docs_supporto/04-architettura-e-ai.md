# Architettura e ruolo dell'AI

**In sintesi**: l'AI fa tre previsioni (quando si riempiono le vasche, quanto azoto c'è nel carico, quali giorni si può spandere). Un ottimizzatore usa queste previsioni per proporre il piano settimanale a costo minimo. Un modello linguistico spiega le proposte e legge i referti. Le aziende decidono.

## 1. I componenti

| Componente | Cosa fa | Tecnologia ipotizzata |
| --- | --- | --- |
| Raccolta dati | Livelli delle vasche, azoto dei carichi, meteo, suolo, mappe, distanze su strada | Sensori LoRaWAN, letture NIR, referti di laboratorio, API esterne |
| Motore settimanale | Previsioni e piano a costo minimo | Python, modelli statistici, OR-Tools o HiGHS |
| App del contoterzista | Carichi del giorno, percorso GPS, scarico, lettura NIR | App nativa: GPS in background e funzionamento senza rete |
| Registro dei carichi | Ogni carico salvato senza possibilità di modifica: un errore si corregge con una nuova riga | PostgreSQL con PostGIS |
| Documenti | Documento di trasporto, registro delle utilizzazioni, bozza di contratto, dati per RefluiZoo | Modelli compilati dai dati, senza AI |
| Interfacce per ruolo | Allevatore, azienda ricevente, contoterzista, coordinatore, Regione e ARPAC | Web e mobile su un'unica API (FastAPI) |

## 2. L'AI pezzo per pezzo

| Pezzo | Dati in ingresso | Metodo | Uscita | Come si valida |
| --- | --- | --- | --- | --- |
| Livello delle vasche | Letture del sensore ogni ora, capi per categoria, acqua di lavaggio stimata, pioggia, carichi già fatti | Bilancio tra ingressi e uscite, corretto con le letture (filtro di Kalman) | Data prevista di vasca piena, con intervallo; volume da cedere per settimana | Confronto tra livello previsto e letto |
| Azoto del carico | Letture NIR se presenti, analisi di laboratorio, tabelle del DM 5046, stalla e stagione | Calibrazione NIR (regressione PLS) e un modello che impara da poche analisi per stalla (effetti misti) | kg di azoto per m³ di ogni carico, con intervallo di incertezza | Validazione lasciando fuori una stalla alla volta |
| Giorni utili | Calendario dei divieti e delle sospensioni, previsioni meteo, umidità e tessitura del suolo, coltura | Regole e bilancio idrico del suolo | Giorni in cui ogni campo si può lavorare nei prossimi 7 giorni | Confronto con i giorni di lavoro reali |
| Piano settimanale | Le tre previsioni, azoto ancora ammesso per campo, contratti di cessione validi, distanze su strada, mezzi disponibili, prezzo dell'urea, stato sanitario | Ottimizzazione a costo minimo (flusso a costo minimo o programmazione lineare intera) | Chi manda quanto, a chi e quando, tra stalle, impianti e campi; costo per kg di azoto | Confronto con i piani fatti a mano nel pilota |
| Siti per nuovi impianti | Flussi e volumi, impianti esistenti, costi di trattamento | Modelli di localizzazione degli impianti | Dove un impianto allunga di più il raggio, con i volumi attesi | Analisi di scenari |
| Spiegazioni | Il piano e i suoi dati | Modello linguistico via API con risposta in formato fisso; un controllo automatico verifica che ogni numero del testo sia nei dati | Un testo breve per ogni azienda: cosa, quando, perché | Nessun numero che non sia nei dati |
| Lettura dei referti | PDF dei laboratori | Modello linguistico con schema JSON; OCR per le scansioni | Azoto totale, ammoniacale, fosforo, potassio, sostanza secca, data, laboratorio | Doppio controllo a campione |
| Anomalie | Registro dei carichi, tracce GPS, calendario | Regole e statistiche semplici | Segnalazioni: velocità impossibili, spandimenti in giorni vietati, azoto oltre il limite | Revisione con l'ARPAC |

**Scelte di fondo**

- **Niente addestramento di modelli linguistici.** Servono modelli piccoli e spiegabili; il modello linguistico si usa via API solo per testi e lettura di documenti.
- **Ogni stima ha un intervallo.** Il piano dosa in modo prudente quando l'incertezza è alta.
- **Si impara dai carichi.** La piattaforma sceglie quali carichi far analizzare per imparare di più con meno analisi (apprendimento attivo).
- **Le decisioni restano alle aziende.** La piattaforma propone e motiva, le aziende accettano o modificano.

**Il sensore NIR in pratica**: è montato sul tubo del carrobotte e legge il liquame che passa, sia in carica sia in campo, con migliaia di misure al secondo. Le calibrazioni provate dalla DLG riguardano liquame bovino, suino e digestato: per quello bufalino il pilota raccoglie analisi per calibrare.

## 3. Fonti dati e API

| Fase | Servizio | Cosa dà | Condizioni |
| --- | --- | --- | --- |
| Azoto | John Deere Operations Center | Letture del sensore HarvestLab 3000 | Account sviluppatore; servizio per i reflui solo in alcuni paesi |
| Azoto | Claude API (Haiku 5.5) | Lettura dei PDF e testi con output strutturato | 0,10 $ per milione di token in ingresso, 0,50 $ in uscita |
| Azoto | Mistral OCR | Testo dai referti scansionati | 4 $ ogni 1.000 pagine |
| Vasche | The Things Network o ChirpStack | Rete LoRaWAN per i sensori | TTN: 30 secondi di trasmissione e 10 messaggi in discesa al giorno per sensore |
| Giorni utili | Open-Meteo | Previsioni, umidità del suolo, evapotraspirazione | Gratuito solo per uso non commerciale |
| Giorni utili | SoilGrids (ISRIC) | Proprietà del suolo, tra cui acqua trattenuta a 33 e 1500 kPa | API in beta |
| Piano | openrouteservice | Matrici di distanze su strada | Piano gratuito: 500 matrici al giorno; installabile sui propri server |
| Piano | Catasto dell'Agenzia delle Entrate | Particelle in WMS, WFS e download | Uso commerciale citando la fonte |
| Piano | Regione Campania | Strato delle zone vulnerabili | Servizio pubblico non trovato: da richiedere |
| Hub | Atlaimpianti del GSE | Impianti a biogas esistenti | Download in Excel |
| Hub | Copernicus Data Space | Immagini Sentinel per colture e fabbisogni | Gratuito fino a 10.000 unità di elaborazione al mese |
| Prezzi | BMTI e Camere di commercio | Prezzo dell'urea | Listini in PDF, letti con il modello linguistico |
| Regione | RefluiZoo | Comunicazione ufficiale | API pubblica non trovata |

Per la demo bastano Open-Meteo, una chiave gratuita di openrouteservice e la Claude API, con dati dei sensori simulati. Le API esterne stanno dietro il backend, con una cache.

## 4. Dati, privacy e sicurezza

- I dati restano delle aziende. Ogni ruolo vede solo ciò che gli serve: chi riceve vede le offerte, non la stalla intera; Regione e ARPAC vedono codici aziendali e anomalie.
- Il registro dei carichi non si modifica: ogni correzione lascia traccia.
- Prima del pilota servono la valutazione d'impatto privacy e accordi scritti sull'uso dei dati.

## 5. Cosa c'è nella demo

- Tre schermate di esempio: allevatore, azienda ricevente, contoterzista.
- Il calcolo del raggio con i cursori per prezzo dell'urea e contributo.
- Dati simulati: nessun dato reale di aziende.

## Fonti

- [DLG, prova del sensore HarvestLab 3000 su digestato](https://www.dlg.org/en/tests/agricultural-technology-and-farm-inputs/test-reports/test-john-deere-harvestlab-3000-sw132-lks05-18)
- [John Deere, HarvestLab 3000](https://deere.com/en/technology-products/precision-ag-technology/data-management/harvest-lab-3000)
- [Prezzi dei modelli Claude](https://claude.com/pricing)
- [Prezzi di Mistral](https://mistral.ai/pricing/api/)
- [The Things Network, regola di uso corretto](https://thethingsnetwork.org/forum/t/the-things-network-fair-use-policy/47689)
- [Open-Meteo, piani](https://open-meteo.com/en/pricing)
- [openrouteservice, piani](https://openrouteservice.org/plans/)
