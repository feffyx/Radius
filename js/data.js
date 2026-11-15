/* ===========================
   NitroBufalo – Dati e Stato Condiviso
   =========================== */

const state = {
  ureaPrice: 700,
  subsidyActive: false,
  seasonMode: 'utile',
  hubSimulated: false,
  selectedMapFarm: 'farm1',
  farmerAreaHa: 20,
  farmerMaxNPerHa: 170,
  farmerUsedN: 2420,
  farmerSavings: 1120,
  acceptedOffers: [],
  approvedLoads: [],
  tankVolumeM3: 840,
  tankCapacityM3: 1000,
  missions: [
    {
      id: 'VIAGGIO-01',
      origin: 'Masseria Volturno (Vasca 1)',
      destination: 'Campo Mais #04 · Cancello ed Arnone',
      distanceKm: 2.0,
      type: 'Liquame tal quale',
      volumeM3: 30,
      baseMarginPerM3: 0.70,
      status: 'In viaggio',
      when: 'Oggi mattina · Tempo asciutto',
      plate: 'CE 892 AB',
      driver: 'Pasquale Russo'
    },
    {
      id: 'VIAGGIO-02',
      origin: 'Impianto Biogas Volturno',
      destination: 'Tenuta Mazzoni · Grazzanise',
      distanceKm: 3.0,
      type: 'Digestato chiarificato',
      volumeM3: 30,
      baseMarginPerM3: 1.77,
      status: 'Da caricare',
      when: 'Domani 07:30 · Tempo asciutto',
      plate: 'CE 451 CD',
      driver: 'Antonio Rea'
    },
    {
      id: 'VIAGGIO-03',
      origin: 'Az. Bufalina La Reggia',
      destination: 'Consorzio Foraggero · Capua',
      distanceKm: 5.4,
      type: 'Digestato concentrato',
      volumeM3: 28,
      baseMarginPerM3: 0.92,
      status: 'Da caricare',
      when: 'Giovedì mattina · Tempo asciutto',
      plate: 'CE 612 EF',
      driver: 'Marco De Luca'
    }
  ]
};

const outgoingLoadCandidates = [
  {
    id: 'LOAD-01',
    recipient: 'Tenuta Mazzoni (Campi di Mais)',
    distanceKm: 2.0,
    type: 'Liquame tal quale',
    tank: 'Vasca 1',
    volumeM3: 90,
    isZvn: true,
    baseDiffAt700: 0.70,
    simpleReason: 'È a soli 2 km: ti costa meno del concime chimico e svuota subito Vasca 1.'
  },
  {
    id: 'LOAD-02',
    recipient: 'Impianto Biogas & Separatore Volturno',
    distanceKm: 1.8,
    type: 'Liquame da trattare',
    tank: 'Vasca 1',
    volumeM3: 150,
    isZvn: false,
    baseDiffAt700: 1.45,
    simpleReason: 'L’impianto concentra il liquame così puoi mandarlo anche a 6,7 km di distanza.'
  },
  {
    id: 'LOAD-04',
    recipient: 'Az. Agricola Piana Sud',
    distanceKm: 8.0,
    type: 'Liquame tal quale',
    tank: 'Vasca 1',
    volumeM3: 90,
    isZvn: false,
    baseDiffAt700: -2.13,
    simpleReason: 'Troppo lontano (8 km): il gasolio della botte costa più del concime trasportato.'
  }
];

const farmerOfferCandidates = [
  {
    id: 'OFF-01',
    supplier: 'Impianto Biogas Volturno',
    type: 'Digestato chiarificato',
    distanceKm: 3.0,
    volumeM3: 115,
    nitrogenKg: 460,
    ureaEqTons: 1.0,
    baseSavingPerM3: 1.77,
    note: 'Equivale a 1 tonnellata di urea + fosforo e potassio gratis per il mais.'
  },
  {
    id: 'OFF-02',
    supplier: 'Az. Bufalina San Lorenzo',
    type: 'Liquame tal quale',
    distanceKm: 2.0,
    volumeM3: 100,
    nitrogenKg: 260,
    ureaEqTons: 0.56,
    baseSavingPerM3: 0.70,
    note: 'Stalla vicinissima (2 km): consegna rapida prima delle piogge.'
  },
  {
    id: 'OFF-03',
    supplier: 'Consorzio Grazzanise',
    type: 'Digestato concentrato',
    distanceKm: 4.5,
    volumeM3: 150,
    nitrogenKg: 600,
    ureaEqTons: 1.30,
    baseSavingPerM3: 1.15,
    note: 'Ottimo apporto di azoto pronto per la crescita.'
  }
];

const mapEntities = {
  farms: [
    { id: 'farm1', name: 'Masseria Volturno', town: 'Cancello ed Arnone', heads: 420, x: 310, y: 280, tankFill: '84%' },
    { id: 'farm2', name: 'Az. La Reggia', town: 'Grazzanise', heads: 610, x: 430, y: 235, tankFill: '72%' },
    { id: 'farm3', name: 'All. San Tammaro', town: 'Capua', heads: 310, x: 560, y: 175, tankFill: '61%' }
  ],
  fields: [
    { id: 'fld1', name: 'Campo Mais (2 km)', x: 265, y: 240, isZvn: true },
    { id: 'fld2', name: 'Tenuta Mazzoni (3 km)', x: 385, y: 325, isZvn: true },
    { id: 'fld3', name: 'Campo Nord (5,5 km)', x: 465, y: 145, isZvn: true },
    { id: 'fld4', name: 'Podere Sud (8 km - No)', x: 210, y: 465, isZvn: true },
    { id: 'fld5', name: 'Capua Est (Fuori ZVN)', x: 650, y: 210, isZvn: false }
  ],
  hubs: [
    { id: 'hub1', name: 'Impianto Biogas Volturno', x: 375, y: 245 }
  ]
};

/* ---------- Calcolo Raggi Economici ---------- */
function getCalculatedRadii() {
  const ureaFactor = state.ureaPrice / 700;
  const subsidyBoostRaw = state.subsidyActive ? 1.0 : 0;
  const subsidyBoostDig = state.subsidyActive ? 1.2 : 0;
  const hubBoost = state.hubSimulated ? 3.2 : 0;

  const rawR = Math.max(1.5, (3.5 * ureaFactor + subsidyBoostRaw)).toFixed(1).replace('.', ',');
  const rawRNum = parseFloat(3.5 * ureaFactor + subsidyBoostRaw);
  const digR = Math.max(2.5, (6.7 * ureaFactor + subsidyBoostDig + hubBoost)).toFixed(1).replace('.', ',');
  const digRNum = parseFloat(6.7 * ureaFactor + subsidyBoostDig + hubBoost);

  // Risparmio digestato a 3 km (€/m3)
  const saving3km = Math.max(0.20, (state.ureaPrice / 115) - 4.31 + (state.subsidyActive ? 0.5 : 0)).toFixed(2).replace('.', ',');

  return { rawR, rawRNum, digR, digRNum, saving3km };
}

/* ---------- Persistenza stato tra pagine (localStorage) ---------- */
function loadSharedState() {
  try {
    const saved = localStorage.getItem('nitrobufalo-shared');
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
    localStorage.setItem('nitrobufalo-shared', JSON.stringify({
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

/* ---------- Sincronizzazione UI Comune (Header, Drawer, ZVN Banner) ---------- */
function updateSharedDisplayValues() {
  const { rawR, digR, saving3km } = getCalculatedRadii();

  // Aggiorna tutti gli span dinamici
  document.querySelectorAll('.dyn-urea-p').forEach(el => el.textContent = state.ureaPrice);
  document.querySelectorAll('.dyn-raw-r').forEach(el => el.textContent = rawR);
  document.querySelectorAll('.dyn-dig-r').forEach(el => el.textContent = digR);

  const digSavingEl = document.getElementById('dig-3km-saving');
  if (digSavingEl) digSavingEl.textContent = saving3km;

  // Slider Urea
  const slider = document.getElementById('urea-price-slider');
  const sliderDisplay = document.getElementById('urea-price-display');
  if (slider) slider.value = state.ureaPrice;
  if (sliderDisplay) sliderDisplay.textContent = state.ureaPrice + ' €/t';

  // Toggle Contributo
  const subBtn = document.getElementById('subsidy-toggle-btn');
  const subStatus = document.getElementById('subsidy-status');
  if (subBtn && subStatus) {
    if (state.subsidyActive) {
      subBtn.classList.remove('bg-slate-50', 'border-slate-200');
      subBtn.classList.add('bg-emerald-50', 'border-emerald-600', 'text-emerald-950');
      subStatus.classList.remove('bg-slate-200', 'text-slate-700');
      subStatus.classList.add('bg-emerald-600', 'text-white');
      subStatus.textContent = 'ATTIVO';
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

  // Selettore Stagione
  const seasonSelect = document.getElementById('season-selector');
  if (seasonSelect) seasonSelect.value = state.seasonMode;

  // Banner Divieto ZVN
  const zvnBanner = document.getElementById('global-zvn-banner');
  if (zvnBanner) {
    if (state.seasonMode === 'divieto') {
      zvnBanner.classList.remove('hidden');
    } else {
      zvnBanner.classList.add('hidden');
    }
  }
}

/* ---------- Gestione Drawer Simulatore ---------- */
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

  // Se c'è una funzione specifica della pagina, chiamala
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
    state.subsidyActive ? 'Aggiunti +2,00 €/m³ per supportare il trasporto lontano.' : 'Tornato al costo standard.',
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
    showToast('Calendario Utile', 'Periodo idoneo allo spandimento secondo normativa nitrati.', 'success');
  }

  if (typeof onSeasonModeUpdated === 'function') {
    onSeasonModeUpdated();
  }
}

/* ---------- Toast Notifiche Grandi & Chiare ---------- */
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

/* ---------- Modale Documenti / Ricevuta (DDT, ARPAC) ---------- */
let currentDocSummary = '';

function openDocModal(docType, payload) {
  const modal = document.getElementById('doc-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  if (docType === 'registro-arpac') {
    currentDocSummary = `REGISTRO EFFLUENTI ZOOTECNICI (ARPAC Campania)\n` +
      `Azienda: Masseria Volturno - Cancello ed Arnone (CE)\n` +
      `Codice ASL: CE-044BZ019\n` +
      `Capi presenti: 420 Bufale in lattazione\n` +
      `Capacità stoccaggio: 1.000 m³ (Conforme > 180 gg stoccaggio obbligatorio)\n` +
      `Stato vasca attuale: ${state.tankVolumeM3} m³ (${Math.round(state.tankVolumeM3 / state.tankCapacityM3 * 100)}%)\n` +
      `Ultima ispezione: Esito REGOLARE - Nessuno sversamento.\n` +
      `Totale ceduto mese corrente: 210 m³ con vidimazione telematica.`;

    body.innerHTML = `
      <div class="p-3 bg-slate-100 rounded-xl space-y-1 font-mono text-xs">
        <div class="font-bold text-slate-800">REGISTRO EFFLUENTI REGIONE CAMPANIA</div>
        <div>Codice ASL: <strong>CE-044BZ019</strong></div>
        <div>Azienda: Masseria Volturno (Cancello ed Arnone)</div>
      </div>
      <div class="space-y-2 pt-1 text-xs">
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Capacità vasche a norma:</span>
          <span class="font-bold text-slate-900">1.000 m³ (>180 giorni)</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Volume attuale stoccato:</span>
          <span class="font-bold text-amber-700">${state.tankVolumeM3} m³</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Stato controllo ARPAC:</span>
          <span class="font-bold text-emerald-700">✓ In regola</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">PUA (Piano Utilizz. Agronomica):</span>
          <span class="font-bold text-slate-900">Approvato 2026/2027</span>
        </div>
      </div>
      <p class="text-xs text-slate-500 pt-1">
        Tutti i viaggi autorizzati dall'app vengono registrati automaticamente per tutelarti durante i controlli.
      </p>
    `;
  } else if (docType === 'ddt') {
    const mission = payload || state.missions[0];
    const ddtNumber = 'DDT-2026-' + (mission.id ? mission.id.replace(/\D/g, '') || '042' : '042');
    currentDocSummary = `DOCUMENTO DI TRASPORTO (DDT Reflui Zootecnici)\n` +
      `Num: ${ddtNumber}\n` +
      `Origine: ${mission.origin || 'Masseria Volturno'}\n` +
      `Destinazione: ${mission.destination || 'Campo Mais'}\n` +
      `Tipologia: ${mission.type || 'Liquame'}\n` +
      `Quantità: ${mission.volumeM3 || 30} m³\n` +
      `Distanza tragitto: ${mission.distanceKm || 2.0} km\n` +
      `Automezzo/Botte: ${mission.plate || 'CE 892 AB'}\n` +
      `Conducente: ${mission.driver || 'Pasquale Russo'}\n` +
      `Tracciabilità GPS: Attiva`;

    body.innerHTML = `
      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
        <div class="font-bold text-emerald-900 flex justify-between">
          <span>${ddtNumber}</span>
          <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">VALORE LEGALE</span>
        </div>
        <div class="text-emerald-800">Conforme D.Lgs 152/2006 e DGR Campania</div>
      </div>
      <div class="space-y-2 pt-1 text-xs">
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Origine (Carico):</span>
          <span class="font-bold text-slate-900">${mission.origin}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Destinazione:</span>
          <span class="font-bold text-slate-900">${mission.destination}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Prodotto:</span>
          <span class="font-bold text-slate-900">${mission.type} (${mission.volumeM3} m³)</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Botte / Targa:</span>
          <span class="font-bold text-slate-900">${mission.plate || 'CE 892 AB'}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-slate-600">Autista:</span>
          <span class="font-bold text-slate-900">${mission.driver || 'Pasquale Russo'}</span>
        </div>
      </div>
      <div class="p-2.5 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-mono">
        Tracciamento GPS Attivo · Certificato Digitale #NITRO-${Math.floor(100000 + Math.random() * 900000)}
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
