/* ===========================
   Radius – Logica Allevatore
   =========================== */

function initAllevatore() {
  loadSharedState();
  updateSharedDisplayValues();
  updateAllevatoreKpi();
  renderAllevatoreLoads();
}

function updateAllevatoreKpi() {
  const pct = Math.round((state.tankVolumeM3 / state.tankCapacityM3) * 100);
  
  const pctEl = document.getElementById('kpi-tank-pct');
  const volEl = document.getElementById('kpi-tank-vol');
  const barEl = document.getElementById('kpi-tank-bar');
  const daysEl = document.getElementById('kpi-days-full');

  if (pctEl) pctEl.textContent = `${pct}%`;
  if (volEl) volEl.textContent = `${state.tankVolumeM3} m³ su ${state.tankCapacityM3} m³`;
  if (barEl) {
    barEl.style.width = `${pct}%`;
    if (pct >= 85) {
      barEl.className = 'h-full bg-red-500 rounded-full transition-all duration-500';
    } else if (pct >= 65) {
      barEl.className = 'h-full bg-amber-500 rounded-full transition-all duration-500';
    } else {
      barEl.className = 'h-full bg-emerald-500 rounded-full transition-all duration-500';
    }
  }

  if (daysEl) {
    const dailyProduction = 24.4; // m3/giorno generati da 420 bufale in lattazione (58L/capo/giorno)
    const remainingVol = state.tankCapacityM3 - state.tankVolumeM3;
    const daysLeft = Math.max(1, Math.floor(remainingVol / dailyProduction));
    daysEl.textContent = `${daysLeft} giorni`;
    if (daysLeft <= 4) {
      daysEl.className = 'text-red-700 underline font-extrabold';
    } else {
      daysEl.className = 'text-amber-700 underline font-bold';
    }
  }
}

function calculateLoadMargin(load) {
  // Prezzo dell'azoto puro (€/kg N) in base al valore dell'urea chimica sul mercato
  const nitrogenPricePerKg = (state.ureaPrice / 1000) / AGRONOMIC_CONSTANTS.ureaN_Percentage;
  
  // Titolo azoto: 2.8 kg N/m3 per liquame grezzo, 4.5 kg N/m3 per digestato
  const nContent = load.type.includes('Digestato') || load.type.includes('trattare') ? 4.5 : 2.8;
  const fertilizerValuePerM3 = nContent * nitrogenPricePerKg;

  // Costo effettivo cantiere botte (tariffa contoterzisti Caserta: 2.10 fisso carico/scarico + 0.38/km)
  const transportCostPerM3 = AGRONOMIC_CONSTANTS.fixedOperationCostPerM3 + (AGRONOMIC_CONSTANTS.transportCostPerKmPerM3 * load.distanceKm);
  const subsidyVal = state.subsidyActive ? 2.0 : 0;

  return (fertilizerValuePerM3 - transportCostPerM3 + subsidyVal);
}

function renderAllevatoreLoads() {
  const container = document.getElementById('allevatore-loads-list');
  if (!container) return;

  const isWinterBan = state.seasonMode === 'divieto';

  container.innerHTML = outgoingLoadCandidates.map(load => {
    const margin = calculateLoadMargin(load);
    const isApproved = state.approvedLoads.includes(load.id);
    const isBlockedByZvn = isWinterBan && load.isZvn;
    const isFavorable = margin > 0 && !isBlockedByZvn;

    let statusBadge = '';
    if (isApproved) {
      statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white">Ritiro Programmato ✓</span>`;
    } else if (isBlockedByZvn) {
      statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300">Bloccato da Divieto ZVN</span>`;
    } else if (isFavorable) {
      statusBadge = `<span class="load-badge-favorable px-3 py-1 rounded-full text-xs font-extrabold">Ti Conviene (+${margin.toFixed(2)} €/m³)</span>`;
    } else {
      statusBadge = `<span class="load-badge-unfavorable px-3 py-1 rounded-full text-xs font-extrabold">In Perdita (${margin.toFixed(2)} €/m³)</span>`;
    }

    return `
      <div class="load-card bg-white rounded-2xl p-5 sm:p-6 border-2 ${isApproved ? 'load-card-approved' : 'border-slate-200'} space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-500 uppercase">${load.tank} · ${load.type}</span>
              ${load.isZvn ? '<span class="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Terreno ZVN</span>' : '<span class="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Fuori ZVN / Hub</span>'}
            </div>
            <h3 class="font-display text-lg font-bold text-slate-900">${load.recipient}</h3>
            <p class="text-xs text-slate-600">Distanza dalla stalla: <strong class="text-slate-900">${load.distanceKm} km</strong> · Quantità prevista: <strong class="text-slate-900">${load.volumeM3} m³</strong></p>
          </div>
          <div>${statusBadge}</div>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
          ${load.simpleReason}
        </p>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div class="text-xs text-slate-500">
            ${isBlockedByZvn ? '⚠️ Spandimento vietato fino a fine Febbraio.' : (isFavorable ? '✓ Risparmi sui costi di stoccaggio e gasolio.' : '✗ Sconsigliato: costo di trasporto superiore al beneficio.')}
          </div>

          <div class="flex items-center gap-2.5">
            <button onclick="openDocModal('ddt', {
              id: '${load.id}',
              origin: 'Masseria Volturno (Vasca 1)',
              destination: '${load.recipient.replace(/'/g, "\\'")}',
              type: '${load.type}',
              volumeM3: ${load.volumeM3},
              distanceKm: ${load.distanceKm},
              plate: 'CE 892 AB',
              driver: 'Pasquale Russo'
            })" class="min-h-[42px] px-3.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800">
              Anteprima DDT
            </button>

            ${!isApproved ? `
              <button onclick="approveLoad('${load.id}')" ${isBlockedByZvn ? 'disabled' : ''} class="min-h-[42px] px-5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition ${isBlockedByZvn ? 'bg-slate-300 cursor-not-allowed' : (isFavorable ? 'bg-forest-800 hover:bg-forest-700' : 'bg-slate-700 hover:bg-slate-800')}">
                ${isBlockedByZvn ? 'Spandimento Vietato' : 'Approva Ritiro Botte'}
              </button>
            ` : `
              <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl">
                Botte Notificata
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function approveLoad(loadId) {
  const load = outgoingLoadCandidates.find(l => l.id === loadId);
  if (!load) return;

  if (state.seasonMode === 'divieto' && load.isZvn) {
    showToast('Azione non consentita', 'Questo terreno ricade in ZVN ed è in vigore il blocco invernale.', 'error');
    return;
  }

  // Svuota parzialmente la vasca
  const drainedM3 = Math.min(state.tankVolumeM3 - 100, load.volumeM3);
  state.tankVolumeM3 = Math.max(100, state.tankVolumeM3 - drainedM3);

  if (!state.approvedLoads.includes(loadId)) {
    state.approvedLoads.push(loadId);
  }

  saveSharedState();
  updateAllevatoreKpi();
  renderAllevatoreLoads();

  showToast(
    'Ritiro Approvato con Successo!',
    `Scaricati ${drainedM3} m³ da Vasca 1. La botte AgroLogistica è stata notificata ed il DDT è pronto.`,
    'success'
  );
}

function onEconomicModelUpdated() {
  renderAllevatoreLoads();
}

function onSeasonModeUpdated() {
  renderAllevatoreLoads();
}

// Avvio automatico al caricamento della pagina
document.addEventListener('DOMContentLoaded', initAllevatore);
