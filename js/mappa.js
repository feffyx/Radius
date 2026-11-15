/* ===========================
   Radius – Logica Mappa Reale Interattiva (Leaflet.js)
   Territorio: Basso Volturno (Cancello ed Arnone, Grazzanise, Capua, Santa Maria la Fossa)
   =========================== */

let leafletMap = null;
let currentTileLayer = null;
let rawRadiusCircle = null;
let digRadiusCircle = null;
let zvnPolygonLayer = null;
let markersGroup = null;
let routesGroup = null;

// Tile layers reali (Google Maps diretto senza blocchi, OpenStreetMap, Satellite Hybrid)
const TILE_PROVIDERS = {
  street: {
    name: 'Google Maps Stradale',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: 'Dati mappa © Google'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: 'Dati mappa © <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>'
  },
  satellite: {
    name: 'Google Satellite Hybrid',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: 'Immagini © Google'
  }
};

let currentProviderKey = 'street'; // Inizializza direttamente su Google Maps Stradale

function initMappa() {
  loadSharedState();
  updateSharedDisplayValues();

  // Selettore stalla
  const farmSelect = document.getElementById('map-farm-select');
  if (farmSelect && state.selectedMapFarm) {
    farmSelect.value = state.selectedMapFarm;
  }

  updateHubButtonState();
  initLeafletMapInstance();
  renderMapLayers();
  updateMapInspector();
}

/* ---------- Inizializzazione Mappa Leaflet Reale ---------- */
function initLeafletMapInstance() {
  const mapContainer = document.getElementById('real-map');
  if (!mapContainer || leafletMap) return;

  const activeFarm = getActiveFarm();

  // Centra sulla Piana del Volturno (baricentro Cancello ed Arnone - Grazzanise)
  leafletMap = L.map('real-map', {
    center: [activeFarm.lat, activeFarm.lng],
    zoom: 13,
    minZoom: 11,
    maxZoom: 19,
    zoomControl: false // Riposizioniamo in alto a destra per pulizia
  });

  // Aggiungi zoom control in alto a destra
  L.control.zoom({ position: 'topright' }).addTo(leafletMap);

  // Imposta tile layer iniziale (Google Maps Stradale)
  setMapLayer(currentProviderKey);

  // Gruppi layer per facile aggiornamento
  markersGroup = L.layerGroup().addTo(leafletMap);
  routesGroup = L.layerGroup().addTo(leafletMap);
}

function setMapLayer(providerKey) {
  currentProviderKey = providerKey;
  if (!leafletMap) return;

  if (currentTileLayer) {
    leafletMap.removeLayer(currentTileLayer);
  }

  const p = TILE_PROVIDERS[providerKey] || TILE_PROVIDERS.street;
  const options = {
    maxZoom: p.maxZoom || 19,
    attribution: p.attribution
  };
  if (p.subdomains) {
    options.subdomains = p.subdomains;
  }

  currentTileLayer = L.tileLayer(p.url, options).addTo(leafletMap);

  // Aggiorna bottoni interfaccia
  document.querySelectorAll('.map-layer-btn').forEach(btn => {
    if (btn.dataset.layer === providerKey) {
      btn.classList.add('bg-forest-800', 'text-white', 'border-forest-800');
      btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
    } else {
      btn.classList.remove('bg-forest-800', 'text-white', 'border-forest-800');
      btn.classList.add('bg-white', 'text-slate-700', 'border-slate-300');
    }
  });
}

function toggleZvnOverlay() {
  if (!leafletMap) return;
  const btn = document.getElementById('zvn-toggle-btn');

  if (zvnPolygonLayer) {
    leafletMap.removeLayer(zvnPolygonLayer);
    zvnPolygonLayer = null;
    if (btn) {
      btn.classList.remove('bg-amber-100', 'border-amber-500', 'text-amber-900');
      btn.classList.add('bg-white', 'border-slate-300', 'text-slate-700');
    }
  } else {
    drawZvnPolygon();
    if (btn) {
      btn.classList.add('bg-amber-100', 'border-amber-500', 'text-amber-900');
      btn.classList.remove('bg-white', 'border-slate-300', 'text-slate-700');
    }
  }
}

function drawZvnPolygon() {
  if (!leafletMap || zvnPolygonLayer) return;

  zvnPolygonLayer = L.polygon(mapEntities.zvnPolygon, {
    color: '#D97706',
    weight: 2.5,
    dashArray: '6, 6',
    fillColor: '#F59E0B',
    fillOpacity: 0.18
  }).addTo(leafletMap);

  zvnPolygonLayer.bindTooltip('<strong>Area ZVN Basso Volturno</strong><br>Limite di legge: max 170 kg N/ha/anno (DGR 762/2017)', {
    sticky: true
  });
}

function getActiveFarm() {
  return mapEntities.farms.find(f => f.id === state.selectedMapFarm) || mapEntities.farms[0];
}

/* ---------- Rendering Geometrie, Raggi e Nodi ---------- */
function renderMapLayers() {
  if (!leafletMap || !markersGroup || !routesGroup) return;

  const activeFarm = getActiveFarm();
  const { rawRNum, digRNum } = getCalculatedRadii();

  markersGroup.clearLayers();
  routesGroup.clearLayers();

  // 1. Disegna Poligono ZVN se non presente
  if (!zvnPolygonLayer) {
    drawZvnPolygon();
  }

  // 2. CERCHI DEI RAGGI ECONOMICI REALI (raggio in metri su coordinate GPS)
  if (rawRadiusCircle) leafletMap.removeLayer(rawRadiusCircle);
  if (digRadiusCircle) leafletMap.removeLayer(digRadiusCircle);

  // Cerchio Raggio Digestato (verde)
  digRadiusCircle = L.circle([activeFarm.lat, activeFarm.lng], {
    radius: digRNum * 1000, // km -> metri
    color: '#059669',
    weight: 2.5,
    fillColor: '#10B981',
    fillOpacity: 0.14
  }).addTo(leafletMap);

  digRadiusCircle.bindTooltip(`<strong>Raggio Digestato: ${digRNum} km</strong><br>Area economicamente conveniente post-trattamento biogas`, {
    sticky: true
  });

  // Cerchio Raggio Liquame Tal Quale (ambra/arancione)
  rawRadiusCircle = L.circle([activeFarm.lat, activeFarm.lng], {
    radius: rawRNum * 1000, // km -> metri
    color: '#D97706',
    weight: 2.5,
    dashArray: '6, 6',
    fillColor: '#F59E0B',
    fillOpacity: 0.22
  }).addTo(leafletMap);

  rawRadiusCircle.bindTooltip(`<strong>Raggio Tal Quale: ${rawRNum} km</strong><br>Oltre questa distanza il costo del gasolio supera il valore concime`, {
    sticky: true
  });

  // 3. ROTTE VERSO I CAMPI ED IL BIOGAS
  mapEntities.fields.forEach(field => {
    const distKm = getGeoDistanceKm(activeFarm.lat, activeFarm.lng, field.lat, field.lng);
    const reachableByRaw = distKm <= rawRNum;
    const reachableByDig = distKm <= digRNum;

    let routeColor = '#94A3B8';
    let dash = '4, 4';
    let weight = 2;

    if (reachableByRaw) {
      routeColor = '#D97706';
      dash = '6, 4';
      weight = 3;
    } else if (reachableByDig) {
      routeColor = '#059669';
      dash = '6, 4';
      weight = 3;
    }

    const polyline = L.polyline([
      [activeFarm.lat, activeFarm.lng],
      [field.lat, field.lng]
    ], {
      color: routeColor,
      weight: weight,
      dashArray: dash,
      opacity: 0.85
    }).addTo(routesGroup);

    polyline.bindTooltip(`Tratta: ${activeFarm.name} &rarr; ${field.name}<br>Distanza effettiva: <strong>${distKm} km</strong> (${reachableByRaw ? 'Conveniente tal quale' : (reachableByDig ? 'Conveniente solo con digestato' : 'In perdita economica')})`);
  });

  // Rotta stalla -> Impianto Biogas
  const hub = mapEntities.hubs[0];
  const distHub = getGeoDistanceKm(activeFarm.lat, activeFarm.lng, hub.lat, hub.lng);
  const hubLine = L.polyline([
    [activeFarm.lat, activeFarm.lng],
    [hub.lat, hub.lng]
  ], {
    color: '#059669',
    weight: 3.5,
    dashArray: '8, 4',
    opacity: 0.95
  }).addTo(routesGroup);
  hubLine.bindTooltip(`Conferimento ad Impianto Biogas Volturno<br>Distanza: <strong>${distHub} km</strong>`);

  // 4. MARKER PERSONALIZZATI LEAFLET
  
  // Stalle Bufaline
  mapEntities.farms.forEach(farm => {
    const isActive = farm.id === activeFarm.id;
    const size = isActive ? 44 : 36;
    const icon = L.divIcon({
      className: '',
      html: `
        <div class="custom-leaflet-marker ${isActive ? 'marker-farm-active' : 'marker-farm'}" style="width: ${size}px; height: ${size}px;" title="${farm.name}">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });

    const marker = L.marker([farm.lat, farm.lng], { icon: icon }).addTo(markersGroup);
    marker.on('click', () => {
      selectMapFarm(farm.id);
    });

    marker.bindPopup(`
      <div class="p-4 bg-white space-y-2 min-w-[240px]">
        <div class="flex items-center justify-between border-b pb-2">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-forest-700">Stalla Bufalina</span>
          <span class="px-2 py-0.5 rounded bg-forest-100 text-forest-900 font-bold text-[11px]">${farm.town}</span>
        </div>
        <h4 class="font-display font-bold text-base text-slate-900">${farm.name}</h4>
        <div class="text-xs text-slate-600 space-y-1">
          <div>Codice ASL: <strong>${farm.aslCode}</strong></div>
          <div>Capi presenti: <strong>${farm.heads} Bufale</strong></div>
          <div>Produzione liquame: <strong>${farm.dailySlurryM3} m³/giorno</strong></div>
          <div>Stato vasca: <strong class="text-amber-700">${farm.tankM3} m³ (${farm.tankFill})</strong></div>
        </div>
        <button onclick="selectMapFarm('${farm.id}')" class="w-full mt-2 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-700">
          Seleziona Questa Stalla
        </button>
      </div>
    `);
  });

  // Impianto Biogas
  mapEntities.hubs.forEach(h => {
    const size = 42;
    const icon = L.divIcon({
      className: '',
      html: `
        <div class="custom-leaflet-marker marker-hub" style="width: ${size}px; height: ${size}px;" title="${h.name}">
          <svg class="w-5 h-5 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });

    const marker = L.marker([h.lat, h.lng], { icon: icon }).addTo(markersGroup);
    marker.bindPopup(`
      <div class="p-4 bg-white space-y-2 min-w-[250px]">
        <div class="flex items-center justify-between border-b pb-2">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Hub Trattamento Biogas</span>
          <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">${h.powerKw} kW</span>
        </div>
        <h4 class="font-display font-bold text-base text-slate-900">${h.name}</h4>
        <div class="text-xs text-slate-600 space-y-1">
          <div>Ubicazione: <strong>${h.address} (${h.town})</strong></div>
          <div>Capacità ritiro: <strong>${h.intakeCapacityM3Year.toLocaleString('it-IT')} m³/anno</strong></div>
          <div>Produzione: <strong>Digestato chiarificato con N ad alta efficienza</strong></div>
        </div>
        <div class="p-2 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-semibold">
          Nota agronomica: consente di espandere il raggio logistico fino a ${digRNum} km.
        </div>
      </div>
    `);
  });

  // Campi Coltivati
  mapEntities.fields.forEach(field => {
    const distKm = getGeoDistanceKm(activeFarm.lat, activeFarm.lng, field.lat, field.lng);
    const reachable = distKm <= digRNum;
    const size = 34;

    const icon = L.divIcon({
      className: '',
      html: `
        <div class="custom-leaflet-marker ${reachable ? 'marker-field' : 'bg-slate-500 text-white'}" style="width: ${size}px; height: ${size}px;" title="${field.name}">
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });

    const marker = L.marker([field.lat, field.lng], { icon: icon }).addTo(markersGroup);
    marker.bindPopup(`
      <div class="p-4 bg-white space-y-2 min-w-[240px]">
        <div class="flex items-center justify-between border-b pb-2">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Terreno Coltivato</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${field.isZvn ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'}">${field.isZvn ? 'ZVN 170 kg N/ha' : 'Fuori ZVN'}</span>
        </div>
        <h4 class="font-display font-bold text-base text-slate-900">${field.name}</h4>
        <div class="text-xs text-slate-600 space-y-1">
          <div>Comune: <strong>${field.town}</strong></div>
          <div>Superficie: <strong>${field.ha} ettari (${field.crop})</strong></div>
          <div>Distanza da stalla attiva: <strong>${distKm} km</strong></div>
          <div>Stato economico: <strong class="${reachable ? 'text-emerald-700' : 'text-red-700'}">${reachable ? 'Raggiungibile con risparmio netto' : 'Fuori convenienza economica'}</strong></div>
        </div>
      </div>
    `);
  });
}

function selectMapFarm(farmId) {
  state.selectedMapFarm = farmId;
  saveSharedState();

  const farm = getActiveFarm();
  if (leafletMap) {
    leafletMap.flyTo([farm.lat, farm.lng], 13, { duration: 1.2 });
  }

  renderMapLayers();
  updateMapInspector();
}

function toggleStrategicHub() {
  state.hubSimulated = !state.hubSimulated;
  saveSharedState();
  updateHubButtonState();
  updateSharedDisplayValues();
  renderMapLayers();
  updateMapInspector();

  if (state.hubSimulated) {
    showToast(
      'Simulazione Separatore Attiva',
      'Il separatore centrifugo solido/liquido consortile incrementa la concentrazione di azoto: il raggio utile passa a oltre 9,9 km raggiungendo anche i campi oltre Capua.',
      'success'
    );
  } else {
    showToast(
      'Separatore Disattivato',
      'Raggio utile ricalcolato sulla situazione attuale delle stalle della Piana del Volturno.',
      'info'
    );
  }
}

function updateHubButtonState() {
  const btn = document.getElementById('hub-sim-btn');
  const ind = document.getElementById('hub-sim-indicator');
  if (!btn || !ind) return;

  if (state.hubSimulated) {
    btn.classList.remove('bg-white', 'border-slate-300', 'text-slate-800');
    btn.classList.add('bg-emerald-50', 'border-emerald-600', 'text-emerald-950');
    ind.classList.remove('bg-slate-300');
    ind.classList.add('bg-emerald-600');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    btn.classList.add('bg-white', 'border-slate-300', 'text-slate-800');
    btn.classList.remove('bg-emerald-50', 'border-emerald-600', 'text-emerald-950');
    ind.classList.add('bg-slate-300');
    ind.classList.remove('bg-emerald-600');
    btn.setAttribute('aria-pressed', 'false');
  }
}

function updateMapInspector() {
  const card = document.getElementById('map-inspector-card');
  if (!card) return;

  const activeFarm = getActiveFarm();
  const { rawR, digR, nitrogenPricePerKg } = getCalculatedRadii();

  card.innerHTML = `
    <div>
      <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Stalla di Riferimento Selezionata</span>
      <h3 class="font-display font-extrabold text-xl text-slate-900 mt-0.5">${activeFarm.name}</h3>
      <p class="text-xs text-slate-500">${activeFarm.address} · ${activeFarm.town} (CE)</p>
    </div>

    <div class="space-y-2 pt-1 text-xs">
      <div class="inspector-stat-box flex justify-between items-center">
        <div>
          <span class="text-slate-500 block">Raggio Liquame Grezzo:</span>
          <strong class="text-amber-800 text-sm font-extrabold">${rawR} km</strong>
        </div>
        <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">Tal Quale (2,8 kg N/m³)</span>
      </div>

      <div class="inspector-stat-box flex justify-between items-center">
        <div>
          <span class="text-slate-500 block">Raggio Digestato Chiarificato:</span>
          <strong class="text-emerald-800 text-sm font-extrabold">${digR} km</strong>
        </div>
        <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">${state.hubSimulated ? '+3,2 km Separatore' : 'Biogas (4,5 kg N/m³)'}</span>
      </div>

      <div class="inspector-stat-box flex justify-between items-center">
        <div>
          <span class="text-slate-500 block">Consistenza Stalla:</span>
          <strong class="text-slate-800 text-sm font-extrabold">${activeFarm.heads} Bufale (${activeFarm.dailySlurryM3} m³/giorno)</strong>
        </div>
        <span class="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[11px]">${activeFarm.tankFill} Piena</span>
      </div>
    </div>

    <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
      <div class="font-bold text-slate-800">Calcolo agronomico & di mercato reale:</div>
      <div>• Costo azoto chimico da Urea: <strong>${nitrogenPricePerKg.toFixed(2)} €/kg N</strong> (a ${state.ureaPrice} €/t urea).</div>
      <div>• Valore fertilizzante digestato: <strong>${((4.5 * nitrogenPricePerKg) + 1.20).toFixed(2)} €/m³</strong>.</div>
      <div>• Costo cantiere botte: <strong>2,10 €/m³ fissi + 0,38 €/m³/km</strong>.</div>
      <div class="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
        ${state.hubSimulated 
          ? '✓ <strong>Impianto separatore attivo:</strong> il digestato concentrato consente trasporti fino a oltre 9,9 km con bilancio economico positivo.' 
          : '⚠️ Oltre i ' + rawR + ' km il liquame grezzo genera una perdita a causa dell\'eccessivo volume d\'acqua trasportato.'}
      </div>
    </div>
  `;
}

function onEconomicModelUpdated() {
  renderMapLayers();
  updateMapInspector();
}

function onSeasonModeUpdated() {
  renderMapLayers();
  updateMapInspector();
}

document.addEventListener('DOMContentLoaded', initMappa);
