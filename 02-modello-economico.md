# Modello economico

**In sintesi**: un m³ di refluo vale quanto l'urea che sostituisce, mentre il suo trasporto costa di più a ogni chilometro. Con le ipotesi di questo documento il liquame così com'è conviene fino a circa **3,5 km** e il digestato fino a circa **6,7 km**. Oltre quella distanza serve un contributo di chi cede, oppure un trattamento.

## 1. Il raggio di convenienza

Il conto si fa sull'**azoto utile**, cioè la parte che la coltura usa davvero.

```
valore per m³ = (prezzo dell'urea per kg ÷ 0,46) × kg di azoto per m³ × efficienza
```

- L'urea contiene il 46% di azoto. A 700 €/t, quindi, un kg di azoto costa circa 1,52 €.
- **Liquame**: 1,52 × 4 kg/m³ × 0,55 = circa 3,35 €/m³.
- **Digestato**: 1,52 × 4 kg/m³ × 0,80 = circa 4,87 €/m³.

**Costo di trasporto e spandimento** (Manuale CIB 2024, €/m³):

| Distanza | Carrobotte da 22 m³ | Autocisterna da 31 m³ con mezzo da campo |
| --- | --- | --- |
| 1 km | 2,2 | 4,8 |
| 3 km | 3,1 | 5,3 |
| 5 km | 4,1 | 5,7 |
| 10 km | 6,4 | 6,8 |
| 20 km | 11,0 | 9,0 |

Il raggio è la distanza alla quale il costo raggiunge il valore. Fino a circa 11,7 km conviene il carrobotte, oltre l'autocisterna.

**Come si sposta il raggio** (calcolo, stessi costi e ipotesi):

| Prezzo dell'urea | Liquame | Liquame con contributo di 1 €/m³ | Liquame con contributo di 2 €/m³ | Digestato |
| --- | --- | --- | --- | --- |
| 500 €/t | 1,4 km | 3,6 km | 5,6 km | 3,8 km |
| 700 €/t | 3,5 km | 5,5 km | 7,7 km | 6,7 km |
| 900 €/t | 5,5 km | 7,6 km | 9,8 km | 9,7 km |
| 1.000 €/t | 6,5 km | 8,7 km | 10,8 km | 11,2 km |

**Un carico d'esempio**: 20 m³ di liquame a 2 km costano circa 53 € di trasporto e spandimento. Sostituiscono circa 96 kg di urea, cioè 67 €. Chi riceve risparmia circa 14 € a carico, 0,70 €/m³.

**Limiti del calcolo**

- È prudente: non conta il valore di fosforo e potassio né il costo di spargere l'urea. Contando anche fosforo e potassio, UniMi stimava circa 4 €/m³ per un liquame lombardo medio, contro circa 3 €/m³ di costo medio di distribuzione.
- I costi dei cantieri vengono da un manuale del Nord Italia e vanno confrontati con le tariffe dei contoterzisti casertani.
- Prezzo dell'urea, azoto per m³ ed efficienza sono ipotesi. Nell'app il raggio si ricalcola con i prezzi del momento e con l'azoto misurato.
- Verifica: con i prezzi del 2022 (urea a circa 1.000 €/t) e un digestato da 5 kg di azoto per m³, il modello dà circa 19 km. È vicino ai 20 km stimati allora dalla rivista Contoterzista.

## 2. Il valore per ogni attore

| Attore | Cosa ci guadagna | Ordine di grandezza |
| --- | --- | --- |
| Azienda ricevente | Azoto che costa meno dell'urea e di cui conosce la quantità | Circa 0,3–1 €/m³ di risparmio dentro il raggio |
| Allevatore | Vasche svuotate in tempo, meno sanzioni, documenti pronti, nessun costo per i carichi dentro il raggio | Per la stalla d'esempio, cedere 1.600 m³ evita un trattamento da circa 9.600 € l'anno |
| Contoterzista | Giornate pianificate, meno viaggi a vuoto, documenti già compilati | Più carichi per giornata (da misurare nel pilota) |
| Impianto di biogas | Biomassa programmata in ingresso e uno sbocco per il digestato, che arriva fino a circa 6,7 km | Da misurare nel pilota |
| Regione e ARPAC | Carichi tracciati, controlli mirati, dati confrontabili | Meno controlli a vuoto |

**La stalla d'esempio**: 200 bufale in lattazione producono circa 12,6 t di azoto e 3.200 m³ di liquame l'anno. In zona vulnerabile servono almeno 74 ettari per spanderlo, e circa 160 viaggi da 20 m³ (calcolo sulle tabelle del DM 5046).

## 3. Il modello di business

- **Il cliente è il gruppo**, non il singolo allevatore. Un'associazione, una cooperativa o un impianto di biogas coordina 10–20 stalle e le aziende intorno, e paga un abbonamento per ogni azienda.
- **La Regione** paga una licenza per la vista di controllo e può finanziare il pilota.
- **Gli allevatori** pagano i sensori sulle vasche. **I contoterzisti** investono nel NIR, perché lo usano su molte stalle.
- **Niente percentuale sui risparmi**: il risparmio è difficile da misurare, dipende dal prezzo dell'urea, e una percentuale renderebbe il piano meno neutrale agli occhi di chi controlla.
- **Il prezzo** deve restare sotto il valore creato per azienda e sopra il costo per stalla a regime (vedi [01-stima-dei-costi.md](01-stima-dei-costi.md)).

## 4. Perché nessuno lo fa già

Il freno è fisico ed economico: si trasporta soprattutto acqua, oltre pochi chilometri non conviene, nessuno misura cosa c'è nel carico e ogni passaggio è una pratica. Una bacheca che mette in contatto le aziende non risolve nessuno di questi punti. La soluzione li affronta con il calcolo del raggio, le misure, i tempi del piano e i documenti automatici.

## Fonti

- [Consorzio Italiano Biogas, Manuale sul digestato](https://consorziobiogas.it/wp-content/uploads/2026/05/Digestato-Manuale-B5-2024-WEB-1.pdf)
- [UniMi, progetto Geseffe](https://costruzionirurali.unimi.it/wp-content/uploads/2020/01/libretto-informativo-Geseffe_compressed.pdf)
- [Contoterzista, digestato o concime minerale](https://contoterzista.edagricole.it/tecnica/digestato-o-concime-minerale-ecco-i-costi-della-fertilizzazione/)
- [Tabelle del DM 5046/2016](https://legislazionetecnica.it/bcksistemone/files/regulations/pdf/XLMDBGR2M2020XI_2893_P02.pdf)
- [Regione Campania, progetto RiduciN](https://agricoltura.regione.campania.it/reflui/pdf/riducin-relazione-divulgativa.pdf)
