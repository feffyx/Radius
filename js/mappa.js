/* ===========================
   Radius – Logica Mappa Interattiva
   =========================== */

const MAP_PIXELS_PER_KM = 23; // Scala geografica calibrata su Piana del Volturno

function initMappa() {
  loadSharedState();
  updateSharedDisplayValues();

  // Selettore stalla
  const farmSelect = document.getElementById('map-farm-select');
  if (farmSelect && state.selectedMapFarm) {
    farmSelect.value = state.selectedMapFarm;
  }

  updateHubButtonState();
  renderMap();
  updateMapInspector();
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

function selectMapFarm(farmId) {
  state.selectedMapFarm = farmId;
  saveSharedState();
  renderMap();
  updateMapInspector();
}

function toggleStrategicHub() {
  state.hubSimulated = !state.hubSimulated;
  saveSharedState();
  updateHubButtonState();
  updateSharedDisplayValues();
  renderMap();
  updateMapInspector();

  if (state.hubSimulated) {
    showToast(
      'Simulazione Impianto Attiva',
      'Il separatore solido/liquido consortile concentra l\'azoto: il raggio utile aumenta di +3,2 km permettendo di raggiungere anche i terreni oltre Capua.',
      'success'
    );
  } else {
    showToast(
      'Impianto Disattivato',
      'Raggio utile ricalcolato sulla situazione attuale delle stalle.',
      'info'
    );
  }
}

function getActiveFarm() {
  return mapEntities.farms.find(f => f.id === state.selectedMapFarm) || mapEntities.farms[0];
}

function calculateDistanceKm(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const pixels = Math.sqrt(dx * dx + dy * dy);
  return (pixels / MAP_PIXELS_PER_KM).toFixed(1);
}

function renderMap() {
  const activeFarm = getActiveFarm();
  const { rawRNum, digRNum } = getCalculatedRadii();

  const radiiGroup = document.getElementById('map-radii-group');
  const routesGroup = document.getElementById('map-routes-group');
  const nodesGroup = document.getElementById('map-nodes-group');

  if (!radiiGroup || !routesGroup || !nodesGroup) return;

  const rawRadiusPx = rawRNum * MAP_PIXELS_PER_KM;
  const digRadiusPx = digRNum * MAP_PIXELS_PER_KM;

  // 1. RAGGI ECONOMICI (Cerchi intorno alla stalla attiva)
  radiiGroup.innerHTML = `
    <!-- Raggio Digestato Trattato -->
    <circle cx="${activeFarm.x}" cy="${activeFarm.y}" r="${digRadiusPx}" class="radius-digestate" />
    
    <!-- Raggio Tal Quale -->
    <circle cx="${activeFarm.x}" cy="${activeFarm.y}" r="${rawRadiusPx}" class="radius-raw" />

    <!-- Anello Pulsante Stalla Attiva -->
    <circle cx="${activeFarm.x}" cy="${activeFarm.y}" r="22" fill="#14532D" fill-opacity="0.2" class="farm-pulse-ring" />
  `;

  // 2. LINEE DI ROTTA VERSO CAMPI E HUB
  let routesHtml = '';
  
  // Rotte verso campi
  mapEntities.fields.forEach(field => {
    const dist = parseFloat(calculateDistanceKm(activeFarm, field));
    const reachableByRaw = dist <= rawRNum;
    const reachableByDig = dist <= digRNum;

    let strokeColor = '#94A3B8';
    let strokeWidth = '1.5';
    let isFlow = false;

    if (reachableByRaw) {
      strokeColor = '#D97706';
      strokeWidth = '2.5';
      isFlow = true;
    } else if (reachableByDig) {
      strokeColor = '#059669';
      strokeWidth = '2.5';
      isFlow = true;
    }

    routesHtml += `
      <line x1="${activeFarm.x}" y1="${activeFarm.y}" x2="${field.x}" y2="${field.y}" 
            stroke="${strokeColor}" stroke-width="${strokeWidth}" 
            stroke-dasharray="${isFlow ? '6 4' : '3 3'}" 
            class="${isFlow ? 'map-flow-route' : ''}" opacity="0.75" />
    `;
  });

  // Rotta verso Hub Biogas
  const hub = mapEntities.hubs[0];
  routesHtml += `
    <line x1="${activeFarm.x}" y1="${activeFarm.y}" x2="${hub.x}" y2="${hub.y}" 
          stroke="#059669" stroke-width="3" stroke-dasharray="6 4" class="map-flow-route" />
  `;

  routesGroup.innerHTML = routesHtml;

  // 3. NODI INTERATTIVI
  let nodesHtml = '';

  // Stalle
  mapEntities.farms.forEach(farm => {
    const isActive = farm.id === activeFarm.id;
    nodesHtml += `
      <g class="map-node" onclick="selectMapFarm('${farm.id}')">
        <circle cx="${farm.x}" cy="${farm.y}" r="${isActive ? '15' : '11'}" 
                fill="${isActive ? '#0F3D2E' : '#334155'}" stroke="#FFFFFF" stroke-width="2.5" />
        <text x="${farm.x}" y="${farm.y + 4}" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">S</text>
        <text x="${farm.x}" y="${farm.y - 17}" font-size="11" font-weight="800" fill="#0F172A" text-anchor="middle">${farm.name}</text>
      </g>
    `;
  });

  // Hub Biogas
  mapEntities.hubs.forEach(h => {
    nodesHtml += `
      <g class="map-node" onclick="inspectNode('hub', '${h.id}')">
        <circle cx="${h.x}" cy="${h.y}" r="14" fill="#059669" stroke="#FFFFFF" stroke-width="2.5" />
        <text x="${h.x}" y="${h.y + 4}" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">⚡</text>
        <text x="${h.x}" y="${h.y + 26}" font-size="11" font-weight="800" fill="#065F46" text-anchor="middle">${h.name}</text>
      </g>
    `;
  });

  // Campi
  mapEntities.fields.forEach(field => {
    const dist = parseFloat(calculateDistanceKm(activeFarm, field));
    const reachable = dist <= digRNum;
    nodesHtml += `
      <g class="map-node" onclick="inspectNode('field', '${field.id}')">
        <rect x="${field.x - 8}" y="${field.y - 8}" width="16" height="16" rx="4" 
              fill="${reachable ? '#10B981' : '#CBD5E1'}" stroke="#FFFFFF" stroke-width="2" />
        <text x="${field.x}" y="${field.y + 22}" font-size="10" font-weight="700" fill="#475569" text-anchor="middle">${field.name}</text>
      </g>
    `;
  });

  nodesGroup.innerHTML = nodesHtml;
}

function updateMapInspector(selectedNode) {
  const card = document.getElementById('map-inspector-card');
  if (!card) return;

  const activeFarm = getActiveFarm();
  const { rawR, digR } = getCalculatedRadii();

  card.innerHTML = `
    <div>
      <span class="text-xs font-bold uppercase tracking-wider text-forest-700">Stalla Selezionata</span>
      <h3 class="font-display font-extrabold text-xl text-slate-900">${activeFarm.name}</h3>
      <p class="text-xs text-slate-500">${activeFarm.town} · ${activeFarm.heads} Bufale</p>
    </div>

    <div class="space-y-2 pt-1 text-xs">
      <div class="inspector-stat-box flex justify-between items-center">
        <div>
          <span class="text-slate-500 block">Raggio Liquame Grezzo:</span>
          <strong class="text-amber-800 text-sm font-extrabold">${rawR} km</strong>
        </div>
        <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">Tal Quale</span>
      </div>

      <div class="inspector-stat-box flex justify-between items-center">
        <div>
          <span class="text-slate-500 block">Raggio con Trattamento:</span>
          <strong class="text-emerald-800 text-sm font-extrabold">${digR} km</strong>
        </div>
        <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">${state.hubSimulated ? '+3,2 km HUB' : 'Biogas'}</span>
      </div>

      <div class="inspector-stat-box flex justify-between items-center">
        <div>
          <span class="text-slate-500 block">Stato Vasca:</span>
          <strong class="text-slate-800 text-sm font-extrabold">${activeFarm.tankFill} Piena</strong>
        </div>
        <span class="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[11px]">Sensor OK</span>
      </div>
    </div>

    <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
      ${state.hubSimulated 
        ? '💡 <strong>Impianto attivo:</strong> La separazione della frazione solida permette di trasportare il digestato concentrato fino a oltre 9 km senza andare in perdita economica.' 
        : '💡 Oltre i ' + rawR + ' km il trasporto del liquame grezzo non è conveniente rispetto all\'acquisto dell\'urea concime.'}
    </p>
  `;
}

function inspectNode(type, id) {
  const activeFarm = getActiveFarm();

  if (type === 'hub') {
    const hub = mapEntities.hubs.find(h => h.id === id);
    const dist = calculateDistanceKm(activeFarm, hub);
    showToast(
      hub.name,
      `Distanza da ${activeFarm.name}: ${dist} km. L'impianto ritira liquame grezzo e distribuisce digestato concentrato con alto titolo di azoto.`,
      'info'
    );
  } else if (type === 'field') {
    const field = mapEntities.fields.find(f => f.id === id);
    const dist = calculateDistanceKm(activeFarm, field);
    const { rawRNum, digRNum } = getCalculatedRadii();
    const canRaw = parseFloat(dist) <= rawRNum;
    const canDig = parseFloat(dist) <= digRNum;

    let msg = `Distanza: ${dist} km. ${field.isZvn ? 'Zona Vulnerabile Nitrati (ZVN).' : 'Fuori ZVN.'} `;
    if (canRaw) {
      msg += 'Raggiungibile sia con liquame tal quale che con digestato.';
    } else if (canDig) {
      msg += 'Conveniente SOLO con digestato (il tal quale è troppo lontano).';
    } else {
      msg += 'Oltre il raggio di convenienza economica attuale.';
    }

    showToast(field.name, msg, canDig ? 'success' : 'warning');
  }
}

function onEconomicModelUpdated() {
  renderMap();
  updateMapInspector();
}

function onSeasonModeUpdated() {
  renderMap();
  updateMapInspector();
}

// Avvio automatico al caricamento della pagina
document.addEventListener('DOMContentLoaded', initMappa);
