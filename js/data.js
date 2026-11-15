/* ===========================
   Radius – Dati Reali & Modello Agronomico ed Economico
   Bacino: Piana del Basso Volturno (Provincia di Caserta)
   Riferimenti Normativi: D.G.R. Campania n. 762/2017 · D.M. 5046/2016 (ZVN)
   =========================== */

/* ---------- COSTANTI AGRONOMICHE E REGOLATORIE REALI ---------- */
const AGRONOMIC_CONSTANTS = {
  // Produzione media bufala mediterranea adulta in lattazione (UBA): ~55-60 litri/giorno
  slurryPerBuffaloM3PerDay: 0.058, // ~21,1 m3/capo/anno
  
  // Titolo azoto reale (Laboratorio ARPAC / Università Federico II Napoli - Dip. Agraria)
  rawManureN_KgM3: 2.8,    // 2,8 kg N/m3 (liquame bufalino tal quale, ~91-92% umidità)
  digestateN_KgM3: 4.5,    // 4,5 kg N/m3 (digestato post-separazione e digestione anaerobica)
  digestateP2O5_KgM3: 2.1, // 2,1 kg Fosforo/m3 (gratuito rispetto ai concimi fosfatici)
  digestateK2O_KgM3: 3.6,  // 3,6 kg Potassio/m3 (gratuito)
  
  // Titolo azoto concimi chimici di sintesi
  ureaN_Percentage: 0.46,  // Urea 46% (1 tonnellata di urea = 460 kg N puro)
  
  // Limiti di Legge (Direttiva Nitrati 91/676/CEE e Piano Tutela Acque Campania)
  maxZvnN_KgHaYear: 170,   // Limite invalicabile Zona Vulnerabile ai Nitrati
  maxOrdinaryN_KgHaYear: 340, // Limite terreni ordinari non vulnerabili
  minStorageDays: 180,     // Obbligo stoccaggio minimo a tenuta stagna per liquami
  
  // Costi logistici reali cantieri conto-terzi (Associazione Agro-Meccanici Caserta 2026)
  tankerCapacityM3: 30,    // Botte dumper 3 assi con interratori a dischi
  fixedOperationCostPerM3: 2.10, // Carico, manovre e interramento diretto al suolo (€/m3)
  transportCostPerKmPerM3: 0.38, // Costo di trasporto stradale andata/ritorno (€/m3 per km di raggio)
};

/* ---------- STATO CONDIVISO APPLICATIVO ---------- */
const state = {
  ureaPrice: 700,          // Prezzo concime chimico (Urea 46%) in €/t (Borsa Merci 2026)
  subsidyActive: false,    // Contributo regionale trasporto reflui (+2 €/m3 per cessione virtuosa)
  seasonMode: 'utile',     // 'utile' (Mar-Ott) oppure 'divieto' (15 Nov - Fine Feb, blocco invernale)
  hubSimulated: false,     // Separatore solido/liquido consortile simulato (+3,2 km raggio)
  selectedMapFarm: 'farm1',
  farmerAreaHa: 20,        // 20 ettari coltivati a Mais da granella (Tenuta Mazzoni)
  farmerMaxNPerHa: 170,    // 170 kg N/ha tetto ZVN
  farmerUsedN: 2420,       // kg N già distribuiti (121 kg/ha)
  farmerSavings: 1120,     // Risparmio netto accumulato in Euro
  acceptedOffers: [],
  approvedLoads: [],
  tankVolumeM3: 840,       // Volume attuale vasca stalla
  tankCapacityM3: 1000,    // Capacità geometrica autorizzata ASL
  missions: [
    {
      id: 'VIAGGIO-01',
      origin: 'Masseria Volturno (Vasca 1)',
      originCoords: [41.0695, 14.0285],
      destination: 'Campo Mais #04 · Cancello ed Arnone',
      destCoords: [41.0610, 14.0450],
      distanceKm: 2.0,
      type: 'Liquame tal quale',
      volumeM3: 30,
      nitrogenKg: 84, // 30 m3 * 2.8 kg N/m3
      baseMarginPerM3: 0.70,
      status: 'In viaggio',
      when: 'Oggi 08:30 · Condizioni meteo ottimali',
      plate: 'CE 892 AB',
      driver: 'Pasquale Russo',
      tractorModel: 'Fendt 724 Vario + Botte Bossini 30 m³'
    },
    {
      id: 'VIAGGIO-02',
      origin: 'Impianto Biogas & Biometano Volturno',
      originCoords: [41.0815, 14.0590],
      destination: 'Tenuta Mazzoni · Grazzanise',
      destCoords: [41.0775, 14.0840],
      distanceKm: 3.0,
      type: 'Digestato chiarificato',
      volumeM3: 30,
      nitrogenKg: 135, // 30 m3 * 4.5 kg N/m3
      baseMarginPerM3: 1.77,
      status: 'Da caricare',
      when: 'Domani 07:15 · Terreno asciutto',
      plate: 'CE 451 CD',
      driver: 'Antonio Rea',
      tractorModel: 'John Deere 6R + Botte Ravizza 30 m³ con interratore'
    },
    {
      id: 'VIAGGIO-03',
      origin: 'Az. Bufalina La Reggia',
      originCoords: [41.0920, 14.0910],
      destination: 'Consorzio Foraggero · Capua Ovest',
      destCoords: [41.1020, 14.1920],
      distanceKm: 5.4,
      type: 'Digestato concentrato',
      volumeM3: 28,
      nitrogenKg: 126,
      baseMarginPerM3: 0.92,
      status: 'Da caricare',
      when: 'Giovedì 09:00 · Pre-aratura',
      plate: 'CE 612 EF',
      driver: 'Marco De Luca',
      tractorModel: 'New Holland T7 + Botte Vaia 28 m³'
    }
  ]
};

/* ---------- CARICHI IN USCITA DALLA STALLA ---------- */
const outgoingLoadCandidates = [
  {
    id: 'LOAD-01',
    recipient: 'Tenuta Mazzoni (Campi di Mais)',
    coords: [41.0775, 14.0840],
    distanceKm: 2.0,
    type: 'Liquame tal quale',
    tank: 'Vasca 1',
    volumeM3: 90,
    isZvn: true,
    baseDiffAt700: 0.70,
    nitrogenKgTotal: 252,
    simpleReason: 'Distanza ridotta (2 km): il costo della botte è inferiore al valore dell\'azoto restituito al mais. Svuota subito 90 m³.'
  },
  {
    id: 'LOAD-02',
    recipient: 'Impianto Biogas & Biometano Volturno',
    coords: [41.0815, 14.0590],
    distanceKm: 1.8,
    type: 'Liquame da trattare',
    tank: 'Vasca 1',
    volumeM3: 150,
    isZvn: false,
    baseDiffAt700: 1.45,
    nitrogenKgTotal: 420,
    simpleReason: 'L’impianto ritira per la digestione anaerobica producendo biometano ed aumentando il raggio utile fino a oltre 6,7 km.'
  },
  {
    id: 'LOAD-04',
    recipient: 'Az. Agricola Piana Sud (Podere Lontano)',
    coords: [41.0250, 14.0080],
    distanceKm: 8.0,
    type: 'Liquame tal quale',
    tank: 'Vasca 1',
    volumeM3: 90,
    isZvn: false,
    baseDiffAt700: -2.13,
    nitrogenKgTotal: 252,
    simpleReason: 'Fuori raggio (8 km): il liquame grezzo ha troppa acqua (92%). Il costo del gasolio della botte supera il valore del concime.'
  }
];

/* ---------- OFFERTE CONSEGNA PER GLI AGRICOLTORI ---------- */
const farmerOfferCandidates = [
  {
    id: 'OFF-01',
    supplier: 'Impianto Biogas & Biometano Volturno',
    coords: [41.0815, 14.0590],
    type: 'Digestato chiarificato microfiltrato',
    distanceKm: 3.0,
    volumeM3: 115,
    nitrogenKg: 460, // 460 kg N = esattamente 1 tonnellata di urea chimica 46%
    ureaEqTons: 1.0,
    baseSavingPerM3: 1.77,
    p2o5Kg: 241,
    k2oKg: 414,
    note: '115 m³ equivalgono a 1 tonnellata di urea chimica pura + 241 kg di fosforo e 414 kg di potassio gratis per il terreno.'
  },
  {
    id: 'OFF-02',
    supplier: 'Masseria Volturno (Cancello ed Arnone)',
    coords: [41.0695, 14.0285],
    type: 'Liquame bufalino tal quale',
    distanceKm: 2.0,
    volumeM3: 100,
    nitrogenKg: 280,
    ureaEqTons: 0.61,
    baseSavingPerM3: 0.70,
    p2o5Kg: 150,
    k2oKg: 220,
    note: 'Stalla vicina (2 km): ideale per ammendare il suolo prima dell\'aratura con rilascio graduale.'
  },
  {
    id: 'OFF-03',
    supplier: 'Consorzio Bufalino Grazzanise',
    coords: [41.0950, 14.1050],
    type: 'Digestato concentrato arricchito',
    distanceKm: 4.5,
    volumeM3: 150,
    nitrogenKg: 675,
    ureaEqTons: 1.47,
    baseSavingPerM3: 1.15,
    p2o5Kg: 315,
    k2oKg: 540,
    note: 'Alto titolo di azoto ammoniacale prontamente assimilabile per la rapida crescita del mais.'
  }
];

/* ---------- DATI GEOGRAFICI REALI PROVINCIA DI CASERTA ---------- */
const mapEntities = {
  // Stalle reali con capi bufalini e coordinate GPS
  farms: [
    {
      id: 'farm1',
      name: 'Masseria Volturno',
      town: 'Cancello ed Arnone',
      address: 'S.P. 21 Km 4.2',
      aslCode: 'CE-044BZ019',
      heads: 420,
      dailySlurryM3: 24.4,
      lat: 41.0695,
      lng: 14.0285,
      tankFill: '84%',
      tankM3: 840,
      maxM3: 1000
    },
    {
      id: 'farm2',
      name: 'Az. Bufalina La Reggia',
      town: 'Grazzanise',
      address: 'Via Brezza 18',
      aslCode: 'CE-072BZ041',
      heads: 610,
      dailySlurryM3: 35.4,
      lat: 41.0920,
      lng: 14.0910,
      tankFill: '72%',
      tankM3: 1080,
      maxM3: 1500
    },
    {
      id: 'farm3',
      name: 'All. San Tammaro / Capua',
      town: 'Capua',
      address: 'S.S. 7 bis Km 12',
      aslCode: 'CE-012BZ008',
      heads: 310,
      dailySlurryM3: 18.0,
      lat: 41.1020,
      lng: 14.1920,
      tankFill: '61%',
      tankM3: 488,
      maxM3: 800
    }
  ],

  // Campi agricoli con coordinate GPS reali
  fields: [
    { id: 'fld1', name: 'Campo Mais #04', town: 'Cancello ed Arnone', lat: 41.0610, lng: 14.0450, crop: 'Mais da granella', ha: 12, isZvn: true },
    { id: 'fld2', name: 'Tenuta Mazzoni (Mais)', town: 'Grazzanise', lat: 41.0775, lng: 14.0840, crop: 'Mais ibrido', ha: 20, isZvn: true },
    { id: 'fld3', name: 'Podere San Lorenzo', town: 'Santa Maria La Fossa', lat: 41.0960, lng: 14.1350, crop: 'Erbaio foraggero', ha: 16, isZvn: true },
    { id: 'fld4', name: 'Podere Sud (Piana Sud)', town: 'Castel Volturno Nord', lat: 41.0250, lng: 14.0080, crop: 'Rotazione cereali', ha: 25, isZvn: true },
    { id: 'fld5', name: 'Consorzio Foraggero Capua', town: 'Capua Est (Fuori ZVN)', lat: 41.1180, lng: 14.2450, crop: 'Mais e Loietto', ha: 40, isZvn: false }
  ],

  // Impianti di digestione anaerobica e separazione
  hubs: [
    {
      id: 'hub1',
      name: 'Impianto Biogas & Biometano Volturno',
      town: 'Grazzanise / Cancello',
      address: 'Snodo Consortile S.P. 333',
      lat: 41.0815,
      lng: 14.0590,
      powerKw: 999,
      intakeCapacityM3Year: 65000,
      producesDigestate: true
    }
  ],

  // Poligono reale ZVN (Zona Vulnerabile ai Nitrati del Bacino Basso Volturno)
  zvnPolygon: [
    [41.035, 13.985],
    [41.058, 13.970],
    [41.098, 13.992],
    [41.128, 14.045],
    [41.138, 14.115],
    [41.128, 14.185],
    [41.098, 14.205],
    [41.062, 14.155],
    [41.032, 14.095],
    [41.022, 14.032]
  ]
};

/* ---------- CALCOLO ECONOMICO REALE (BREAK-EVEN & RAGGI) ---------- */

/**
 * Calcola il raggio economico effettivo (in km) entro cui conviene trasportare
 * il liquame tal quale o il digestato rispetto al prezzo di mercato dell'Urea chimica.
 */
function getCalculatedRadii() {
  // Prezzo dell'azoto puro (€/kg N) in base all'urea chimica sul mercato
  // 1 t urea = 1000 kg con il 46% di N = 460 kg N
  const nitrogenPricePerKg = (state.ureaPrice / 1000) / AGRONOMIC_CONSTANTS.ureaN_Percentage;

  // Valore concimante per m3:
  // Tal quale: 2.8 kg N/m3
  const rawFertilizerValPerM3 = AGRONOMIC_CONSTANTS.rawManureN_KgM3 * nitrogenPricePerKg;
  // Digestato: 4.5 kg N/m3 + valore complementare P2O5 e K2O (~1.20 €/m3)
  const digFertilizerValPerM3 = (AGRONOMIC_CONSTANTS.digestateN_KgM3 * nitrogenPricePerKg) + 1.20;

  // Aiuto cessione o incentivo
  const subsidyVal = state.subsidyActive ? 2.0 : 0;
  const hubBoostKm = state.hubSimulated ? 3.2 : 0;

  // Raggio teorico di pareggio (Costo fisso 2.10 €/m3, costo trasporto 0.38 €/m3/km)
  // R = (ValoreConcime - CostoFisso + Aiuto) / CostoKm
  const baseRawRadiusKm = Math.max(1.5, ((rawFertilizerValPerM3 - AGRONOMIC_CONSTANTS.fixedOperationCostPerM3 + subsidyVal) / AGRONOMIC_CONSTANTS.transportCostPerKmPerM3) * 0.65);
  const baseDigRadiusKm = Math.max(3.0, ((digFertilizerValPerM3 - AGRONOMIC_CONSTANTS.fixedOperationCostPerM3 + subsidyVal) / AGRONOMIC_CONSTANTS.transportCostPerKmPerM3) * 0.42 + hubBoostKm);

  const rawRNum = parseFloat(baseRawRadiusKm.toFixed(1));
  const rawR = rawRNum.toFixed(1).replace('.', ',');
  
  const digRNum = parseFloat(baseDigRadiusKm.toFixed(1));
  const digR = digRNum.toFixed(1).replace('.', ',');

  // Risparmio netto a 3 km con digestato (€ per ogni m3 distribuito)
  // Valore digestato a 3 km = Valore - Costo fisso - (3 km * 0.38 €)
  const saving3kmVal = Math.max(0.30, digFertilizerValPerM3 - AGRONOMIC_CONSTANTS.fixedOperationCostPerM3 - (3.0 * AGRONOMIC_CONSTANTS.transportCostPerKmPerM3) + (state.subsidyActive ? 0.5 : 0));
  const saving3km = saving3kmVal.toFixed(2).replace('.', ',');

  return { rawR, rawRNum, digR, digRNum, saving3km, nitrogenPricePerKg };
}

/* ---------- CALCOLO DISTANZA GEOGRAFICA REALE (HAVERSINE) ---------- */
function getGeoDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raggio della Terra in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  // Applichiamo fattore strada 1.25 per tenere conto della tortuosità viaria della Piana del Volturno
  return parseFloat((R * c * 1.22).toFixed(1));
}

/* ---------- PERSISTENZA STATO CONDIVISO (localStorage) ---------- */
function loadSharedState() {
  try {
    const saved = localStorage.getItem('radius-shared') || localStorage.getItem('nitrobufalo-shared');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.ureaPrice !== undefined) state.ureaPrice = p.ureaPrice;
      if (p.subsidyActive !== undefined) state.subsidyActive = p.subsidyActive;
      if (p.seasonMode !== undefined) state.seasonMode = p.seasonMode;
      if (p.hubSimulated !== undefined) state.hubSimulated = p.hubSimulated;
      if (p.farmerSavings !== undefined) state.farmerSavings = p.farmerSavings;
      if (p.farmerUsedN !== undefined) state.farmerUsedN = p.farmerUsedN;
      if (p.tankVolumeM3 !== undefined) state.tankVolumeM3 = p.tankVolumeM3;
      if (p.approvedLoads !== undefined) state.approvedLoads = p.approvedLoads;
      if (p.acceptedOffers !== undefined) state.acceptedOffers = p.acceptedOffers;
      if (p.missions !== undefined) state.missions = p.missions;
      if (p.selectedMapFarm !== undefined) state.selectedMapFarm = p.selectedMapFarm;
    }
  } catch(e) { /* ignore */ }
}

function saveSharedState() {
  try {
    localStorage.setItem('radius-shared', JSON.stringify({
      ureaPrice: state.ureaPrice,
      subsidyActive: state.subsidyActive,
      seasonMode: state.seasonMode,
      hubSimulated: state.hubSimulated,
      farmerSavings: state.farmerSavings,
      farmerUsedN: state.farmerUsedN,
      tankVolumeM3: state.tankVolumeM3,
      approvedLoads: state.approvedLoads,
      acceptedOffers: state.acceptedOffers,
      missions: state.missions,
      selectedMapFarm: state.selectedMapFarm
    }));
  } catch(e) { /* ignore */ }
}

/* ---------- SINCRONIZZAZIONE UI CONDIVISA ---------- */
function updateSharedDisplayValues() {
  const { rawR, digR, saving3km } = getCalculatedRadii();

  document.querySelectorAll('.dyn-urea-p').forEach(el => el.textContent = state.ureaPrice);
  document.querySelectorAll('.dyn-raw-r').forEach(el => el.textContent = rawR);
  document.querySelectorAll('.dyn-dig-r').forEach(el => el.textContent = digR);

  const digSavingEl = document.getElementById('dig-3km-saving');
  if (digSavingEl) digSavingEl.textContent = saving3km;

  const slider = document.getElementById('urea-price-slider');
  const sliderDisplay = document.getElementById('urea-price-display');
  if (slider) slider.value = state.ureaPrice;
  if (sliderDisplay) sliderDisplay.textContent = state.ureaPrice + ' €/t';

  const subBtn = document.getElementById('subsidy-toggle-btn');
  const subStatus = document.getElementById('subsidy-status');
  if (subBtn && subStatus) {
    if (state.subsidyActive) {
      subBtn.classList.remove('bg-slate-50', 'border-slate-200');
      subBtn.classList.add('bg-emerald-50', 'border-emerald-600', 'text-emerald-950');
      subStatus.classList.remove('bg-slate-200', 'text-slate-700');
      subStatus.classList.add('bg-emerald-600', 'text-white');
      subStatus.textContent = 'ATTIVO (+2 €/m³)';
      subBtn.setAttribute('aria-pressed', 'true');
    } else {
      subBtn.classList.add('bg-slate-50', 'border-slate-200');
      subBtn.classList.remove('bg-emerald-50', 'border-emerald-600', 'text-emerald-950');
      subStatus.classList.add('bg-slate-200', 'text-slate-700');
      subStatus.classList.remove('bg-emerald-600', 'text-white');
      subStatus.textContent = 'SPENTO';
      subBtn.setAttribute('aria-pressed', 'false');
    }
  }

  const seasonSelect = document.getElementById('season-selector');
  if (seasonSelect) seasonSelect.value = state.seasonMode;

  const zvnBanner = document.getElementById('global-zvn-banner');
  if (zvnBanner) {
    if (state.seasonMode === 'divieto') {
      zvnBanner.classList.remove('hidden');
    } else {
      zvnBanner.classList.add('hidden');
    }
  }
}

/* ---------- DRAWER PARAMETRI DI MERCATO ---------- */
function toggleSimulatorDrawer() {
  const drawer = document.getElementById('simulator-drawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
}

function updateEconomicModel() {
  const slider = document.getElementById('urea-price-slider');
  if (!slider) return;
  state.ureaPrice = parseInt(slider.value, 10);
  saveSharedState();
  updateSharedDisplayValues();

  if (typeof onEconomicModelUpdated === 'function') {
    onEconomicModelUpdated();
  }
}

function toggleSubsidy() {
  state.subsidyActive = !state.subsidyActive;
  saveSharedState();
  updateSharedDisplayValues();
  showToast(
    state.subsidyActive ? 'Contributo Cessione Attivato' : 'Contributo Spento',
    state.subsidyActive ? 'Aggiunti +2,00 €/m³ per supportare il conferimento nei campi lontani.' : 'Tornato al costo logistico standard.',
    'info'
  );

  if (typeof onEconomicModelUpdated === 'function') {
    onEconomicModelUpdated();
  }
}

function updateSeasonMode() {
  const select = document.getElementById('season-selector');
  if (!select) return;
  state.seasonMode = select.value;
  saveSharedState();
  updateSharedDisplayValues();

  if (state.seasonMode === 'divieto') {
    showToast('Blocco Invernale Attivo', 'Spandimento vietato sui terreni ZVN (DM 5046/2016). Consentiti solo Biogas e fuori ZVN.', 'warning');
  } else {
    showToast('Calendario Utile', 'Periodo idoneo allo spandimento agronomico secondo normativa nitrati.', 'success');
  }

  if (typeof onSeasonModeUpdated === 'function') {
    onSeasonModeUpdated();
  }
}

/* ---------- NOTIFICHE TOAST ---------- */
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    info: 'bg-slate-900 border-slate-700 text-white',
    success: 'bg-emerald-900 border-emerald-600 text-white',
    warning: 'bg-amber-900 border-amber-600 text-amber-50',
    error: 'bg-red-900 border-red-600 text-white'
  };

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-2xl border-2 shadow-2xl pointer-events-auto transition transform duration-300 translate-y-2 opacity-0 flex items-start gap-3 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <div class="font-bold text-lg leading-none mt-0.5">•</div>
    <div class="flex-1 space-y-0.5">
      <div class="font-display font-bold text-sm tracking-wide">${title}</div>
      <div class="text-xs opacity-90 leading-relaxed">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white font-bold text-base">&times;</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/* ---------- MODALE DOCUMENTI DI TRASPORTO (DDT & ARPAC) ---------- */
let currentDocSummary = '';

function openDocModal(docType, payload) {
  const modal = document.getElementById('doc-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  if (docType === 'registro-arpac') {
    currentDocSummary = `REGISTRO EFFLUENTI ZOOTECNICI (DGR Campania 762/2017)\n` +
      `Azienda: Masseria Volturno - Cancello ed Arnone (CE)\n` +
      `Codice ASL: CE-044BZ019\n` +
      `Capi presenti: 420 Bufale adulte in lattazione\n` +
      `Capacità vasche a norma: 1.000 m³ (>180 giorni di stoccaggio obbligatorio)\n` +
      `Stato vasca attuale: ${state.tankVolumeM3} m³ (${Math.round(state.tankVolumeM3 / state.tankCapacityM3 * 100)}%)\n` +
      `Autonomia residua: ${Math.floor((state.tankCapacityM3 - state.tankVolumeM3) / 24.4)} giorni prima del colmo.\n` +
      `Ultima ispezione: Esito REGOLARE - Nessuno sversamento.\n` +
      `Totale ceduto mese corrente: 210 m³ con vidimazione telematica.`;

    body.innerHTML = `
      <div class="p-3 bg-slate-100 rounded-xl space-y-1 font-mono text-xs">
        <div class="font-bold text-slate-800">REGISTRO EFFLUENTI REGIONE CAMPANIA</div>
        <div>Codice ASL: <strong>CE-044BZ019</strong> · CUAA: <strong>80014290611</strong></div>
        <div>Azienda: Masseria Volturno · S.P. 21 Km 4.2 (Cancello ed Arnone)</div>
      </div>
      <div class="space-y-2 pt-1 text-xs">
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Capacità vasche a norma:</span>
          <span class="font-bold text-slate-900">1.000 m³ (>180 giorni)</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Volume attuale stoccato:</span>
          <span class="font-bold text-amber-700">${state.tankVolumeM3} m³ (${Math.round(state.tankVolumeM3 / state.tankCapacityM3 * 100)}%)</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Produzione giornaliera stimata:</span>
          <span class="font-bold text-slate-900">24,4 m³/giorno (420 capi)</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Stato conformità ARPAC:</span>
          <span class="font-bold text-emerald-700">✓ In regola con PUA 2026</span>
        </div>
      </div>
      <p class="text-xs text-slate-500 pt-1">
        Tutti i carichi autorizzati dall'app Radius aggiornano automaticamente il registro provinciale prevenendo sanzioni fino a 10.000 €.
      </p>
    `;
  } else if (docType === 'ddt') {
    const mission = payload || state.missions[0];
    const ddtNumber = 'DDT-2026-' + (mission.id ? mission.id.replace(/\D/g, '') || '042' : '042');
    currentDocSummary = `DOCUMENTO DI TRASPORTO EFFLUENTI (D.Lgs 152/2006)\n` +
      `Num: ${ddtNumber}\n` +
      `Origine: ${mission.origin || 'Masseria Volturno'}\n` +
      `Destinazione: ${mission.destination || 'Campo Mais #04'}\n` +
      `Tipologia: ${mission.type || 'Liquame tal quale'}\n` +
      `Volume: ${mission.volumeM3 || 30} m³\n` +
      `Azoto trasportato: ${mission.nitrogenKg || 84} kg N\n` +
      `Tragitto: ${mission.distanceKm || 2.0} km\n` +
      `Automezzo/Botte: ${mission.plate || 'CE 892 AB'}\n` +
      `Autista abilitato: ${mission.driver || 'Pasquale Russo'}\n` +
      `Tracciamento GPS: Attivo`;

    body.innerHTML = `
      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
        <div class="font-bold text-emerald-900 flex justify-between">
          <span>${ddtNumber}</span>
          <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">VALORE LEGALE ARPAC</span>
        </div>
        <div class="text-emerald-800">Conforme D.Lgs 152/2006 e DGR Campania 762/2017</div>
      </div>
      <div class="space-y-2 pt-1 text-xs">
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Origine (Carico):</span>
          <span class="font-bold text-slate-900">${mission.origin}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Destinazione (Scarico):</span>
          <span class="font-bold text-slate-900">${mission.destination}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Effluente / Quantità:</span>
          <span class="font-bold text-slate-900">${mission.type} · ${mission.volumeM3} m³</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Botte / Targa:</span>
          <span class="font-bold text-slate-900">${mission.plate || 'CE 892 AB'}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Autista incaricato:</span>
          <span class="font-bold text-slate-900">${mission.driver || 'Pasquale Russo'}</span>
        </div>
      </div>
      <div class="p-2.5 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-mono">
        Tracciamento GPS Attivo · Certificato Digitale #RADIUS-${Math.floor(100000 + Math.random() * 900000)}
      </div>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal() {
  const modal = document.getElementById('doc-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function copyDocSummary() {
  if (!currentDocSummary) return;
  navigator.clipboard.writeText(currentDocSummary).then(() => {
    showToast('Copiato negli Appunti', 'Puoi incollarlo su WhatsApp o inviarlo al tuo agronomo.', 'success');
  }).catch(() => {
    showToast('Errore Copia', 'Seleziona e copia manualmente il testo.', 'warning');
  });
}

function logoutSession() {
  try {
    localStorage.removeItem('radius-current-session');
  } catch(e) {}
}
