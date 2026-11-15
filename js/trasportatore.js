/* ===========================
   Radius – Logica Trasportatore
   =========================== */

function initTrasportatore() {
  loadSharedState();
  updateSharedDisplayValues();
  renderTrasportatoreMissions();
}

function calculateMissionMargin(mission) {
  const ureaDiff = (state.ureaPrice - 700) / 100 * 0.15;
  const sub = state.subsidyActive ? 2.0 : 0;
  return Math.max(0.40, mission.baseMarginPerM3 + ureaDiff + sub);
}

function renderTrasportatoreMissions() {
  const container = document.getElementById('trasportatore-missions-list');
  if (!container) return;

  container.innerHTML = state.missions.map(m => {
    const marginPerM3 = calculateMissionMargin(m);
    const totalTripMargin = Math.round(marginPerM3 * m.volumeM3);
    const isCompleted = m.status === 'Consegnato';

    let badgeClass = 'badge-status-pending';
    if (m.status === 'In viaggio') badgeClass = 'badge-status-traveling';
    if (m.status === 'Consegnato') badgeClass = 'badge-status-completed';

    return `
      <div class="mission-card bg-white rounded-3xl p-6 border-2 ${isCompleted ? 'mission-card-completed' : 'border-slate-200'} shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="font-mono text-xs font-bold text-slate-500 uppercase">${m.id}</span>
            <span class="px-3 py-1 rounded-full text-xs font-extrabold ${badgeClass}">${m.status}</span>
            <span class="text-xs text-slate-500">${m.when}</span>
          </div>
          <div class="text-xs sm:text-sm font-bold text-slate-800">
            Guadagno netto botte: <strong class="text-emerald-700 font-extrabold text-base">${totalTripMargin} €</strong> (${marginPerM3.toFixed(2)} €/m³)
          </div>
        </div>

        <!-- Tratta con puntatori -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div class="flex items-start gap-3">
            <div class="route-step-dot route-step-origin mt-1.5"></div>
            <div>
              <span class="text-[11px] font-bold text-slate-500 uppercase">Punto di Carico</span>
              <h4 class="font-display font-bold text-slate-900">${m.origin}</h4>
              <p class="text-xs text-slate-600">${m.type} · ${m.volumeM3} m³</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="route-step-dot route-step-dest mt-1.5"></div>
            <div>
              <span class="text-[11px] font-bold text-slate-500 uppercase">Punto di Scarico</span>
              <h4 class="font-display font-bold text-slate-900">${m.destination}</h4>
              <p class="text-xs text-slate-600">Tragitto botte: <strong>${m.distanceKm} km</strong></p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="text-xs text-slate-500 flex items-center gap-2">
            <span>Autista: <strong>${m.driver}</strong></span>
            <span>•</span>
            <span>Targa: <strong>${m.plate}</strong></span>
          </div>

          <div class="flex items-center gap-2.5">
            <button onclick="openDocModal('ddt', {
              id: '${m.id}',
              origin: '${m.origin.replace(/'/g, "\\'")}',
              destination: '${m.destination.replace(/'/g, "\\'")}',
              type: '${m.type}',
              volumeM3: ${m.volumeM3},
              distanceKm: ${m.distanceKm},
              plate: '${m.plate}',
              driver: '${m.driver}'
            })" class="min-h-[42px] px-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800">
              Vedi DDT Digitale
            </button>

            ${!isCompleted ? `
              <button onclick="completeMission('${m.id}')" class="min-h-[42px] px-5 rounded-xl bg-forest-800 hover:bg-forest-700 text-xs sm:text-sm font-bold text-white shadow-xs transition">
                Conferma Scarico
              </button>
            ` : `
              <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl">
                Completato & Archiviato
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function completeMission(missionId) {
  const m = state.missions.find(item => item.id === missionId);
  if (!m) return;

  m.status = 'Consegnato';
  saveSharedState();
  renderTrasportatoreMissions();

  showToast(
    'Viaggio Concluso!',
    `Scaricati regolarmente ${m.volumeM3} m³ a ${m.destination}. DDT telemetrico inviato a registro ARPAC.`,
    'success'
  );
}

function optimizeBackhaul() {
  showToast(
    'Giro Botte Ottimizzato!',
    'Pianificato carico di ritorno: la botte scarica al Campo Mais #04 e riparte direttamente dall\'Impianto Biogas senza tornare vuota. Risparmiati 14 km e 18L di gasolio.',
    'success'
  );
}

function onEconomicModelUpdated() {
  renderTrasportatoreMissions();
}

function onSeasonModeUpdated() {
  renderTrasportatoreMissions();
}

// Avvio automatico al caricamento della pagina
document.addEventListener('DOMContentLoaded', initTrasportatore);
