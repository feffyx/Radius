/* ===========================
   Radius – Logica Agricoltore
   =========================== */

function initAgricoltore() {
  loadSharedState();
  updateSharedDisplayValues();
  updateFarmerUi();
  renderFarmerOffers();
}

function updateFarmerUi() {
  const maxTotalN = state.farmerAreaHa * state.farmerMaxNPerHa; // 20 * 170 = 3400 kg
  const remainingN = Math.max(0, maxTotalN - state.farmerUsedN);
  const remainingM3 = Math.floor(remainingN / 4.0); // circa 4 kg N per m3 di digestato/liquame
  const usedPerHa = Math.round(state.farmerUsedN / state.farmerAreaHa);
  const pct = Math.min(100, Math.round((state.farmerUsedN / maxTotalN) * 100));

  const savingsEl = document.getElementById('farmer-accumulated-savings');
  const remM3El = document.getElementById('zvn-remaining-m3');
  const usedHaEl = document.getElementById('zvn-used-ha');
  const usedKgEl = document.getElementById('zvn-used-kg');
  const barEl = document.getElementById('zvn-progress-bar');

  if (savingsEl) savingsEl.textContent = `${state.farmerSavings.toLocaleString('it-IT')} €`;
  if (remM3El) remM3El.textContent = `${remainingM3} m³`;
  if (usedHaEl) usedHaEl.textContent = usedPerHa;
  if (usedKgEl) usedKgEl.textContent = `${state.farmerUsedN.toLocaleString('it-IT')} kg`;

  if (barEl) {
    barEl.style.width = `${pct}%`;
    if (pct >= 95) {
      barEl.className = 'h-full bg-red-600 rounded-full transition-all duration-500';
    } else if (pct >= 85) {
      barEl.className = 'h-full bg-amber-500 rounded-full transition-all duration-500';
    } else {
      barEl.className = 'h-full bg-forest-700 rounded-full transition-all duration-500';
    }
  }
}

function calculateOfferSavingPerM3(offer) {
  // Prezzo reale azoto chimico da Urea 46% (€/kg N)
  const nitrogenPricePerKg = (state.ureaPrice / 1000) / AGRONOMIC_CONSTANTS.ureaN_Percentage;
  
  // Apporto di N per m3 del carico
  const nPerM3 = offer.nitrogenKg / offer.volumeM3;
  // Valore concime organico (azoto chimico sostituito + fosforo P2O5 e potassio K2O organico)
  const isDigestate = offer.type.includes('Digestato');
  const pkValue = isDigestate ? 1.20 : 0.40;
  const fertilizerValuePerM3 = (nPerM3 * nitrogenPricePerKg) + pkValue;

  // Costo logistico cantiere botte contoterzista
  const transportCostPerM3 = AGRONOMIC_CONSTANTS.fixedOperationCostPerM3 + (AGRONOMIC_CONSTANTS.transportCostPerKmPerM3 * offer.distanceKm);

  // Risparmio netto rispetto all'acquisto di concimi chimici di sintesi
  return Math.max(0.35, fertilizerValuePerM3 - transportCostPerM3 + (state.subsidyActive ? 1.0 : 0));
}

function renderFarmerOffers() {
  const container = document.getElementById('agricoltore-offers-list');
  if (!container) return;

  const isWinterBan = state.seasonMode === 'divieto';
  const maxTotalN = state.farmerAreaHa * state.farmerMaxNPerHa;
  const remainingN = Math.max(0, maxTotalN - state.farmerUsedN);

  container.innerHTML = farmerOfferCandidates.map(offer => {
    const isAccepted = state.acceptedOffers.includes(offer.id);
    const savingPerM3 = calculateOfferSavingPerM3(offer);
    const totalBatchSaving = Math.round(savingPerM3 * offer.volumeM3);
    const exceedsLimit = !isAccepted && (offer.nitrogenKg > remainingN);

    let statusPill = '';
    if (isAccepted) {
      statusPill = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">Prenotata ✓</span>`;
    } else if (isWinterBan) {
      statusPill = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Blocco Invernale ZVN</span>`;
    } else if (exceedsLimit) {
      statusPill = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">Supera Tetto 170 kg/ha</span>`;
    } else {
      statusPill = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Disponibile</span>`;
    }

    return `
      <div class="offer-card bg-white rounded-3xl p-6 border-2 ${isAccepted ? 'offer-card-accepted' : 'border-slate-200'} shadow-xs flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-xs font-bold text-slate-500 uppercase">${offer.type}</span>
              <h3 class="font-display font-extrabold text-lg text-slate-900 mt-0.5">${offer.supplier}</h3>
            </div>
            <div>${statusPill}</div>
          </div>

          <div class="flex items-center gap-2">
            <span class="badge-npk">${offer.ureaEqTons}t Urea Eq.</span>
            <span class="text-xs font-bold text-slate-600">Distanza: ${offer.distanceKm} km</span>
          </div>

          <p class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            ${offer.note}
          </p>

          <div class="space-y-1.5 text-xs text-slate-700 pt-1">
            <div class="flex justify-between border-b pb-1">
              <span>Volume carico:</span>
              <strong class="text-slate-900">${offer.volumeM3} m³</strong>
            </div>
            <div class="flex justify-between border-b pb-1">
              <span>Azoto apportato:</span>
              <strong class="text-slate-900">${offer.nitrogenKg} kg N</strong>
            </div>
            <div class="flex justify-between border-b pb-1">
              <span>Risparmio netto stimato:</span>
              <strong class="text-emerald-700 font-extrabold">${savingPerM3.toFixed(2)} €/m³ (~${totalBatchSaving} €)</strong>
            </div>
          </div>
        </div>

        <div class="pt-2">
          ${!isAccepted ? `
            <button onclick="acceptOffer('${offer.id}')" ${isWinterBan || exceedsLimit ? 'disabled' : ''} class="w-full min-h-[46px] rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition ${isWinterBan || exceedsLimit ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-forest-800 hover:bg-forest-700'}">
              ${isWinterBan ? 'Spandimento non consentito' : (exceedsLimit ? 'Rischio multa: supera 170 kg/ha' : 'Prenota Consegna in Campo')}
            </button>
          ` : `
            <button onclick="openDocModal('ddt', {
              id: '${offer.id}',
              origin: '${offer.supplier.replace(/'/g, "\\'")}',
              destination: 'Tenuta Mazzoni (Mais)',
              type: '${offer.type}',
              volumeM3: ${offer.volumeM3},
              distanceKm: ${offer.distanceKm},
              plate: 'CE 451 CD',
              driver: 'Antonio Rea'
            })" class="w-full min-h-[46px] rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm hover:bg-emerald-100">
              Vedi Ricevuta & DDT
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function acceptOffer(offerId) {
  const offer = farmerOfferCandidates.find(o => o.id === offerId);
  if (!offer) return;

  if (state.seasonMode === 'divieto') {
    showToast('Blocco Invernale', 'In questo periodo è vietato spandere su terreni ZVN.', 'warning');
    return;
  }

  const maxTotalN = state.farmerAreaHa * state.farmerMaxNPerHa;
  if (state.farmerUsedN + offer.nitrogenKg > maxTotalN) {
    showToast('Limite Superato', 'Non puoi accettare questo carico: supereresti il tetto legale di 170 kg/ha!', 'error');
    return;
  }

  const savingPerM3 = calculateOfferSavingPerM3(offer);
  const totalBatchSaving = Math.round(savingPerM3 * offer.volumeM3);

  state.farmerSavings += totalBatchSaving;
  state.farmerUsedN += offer.nitrogenKg;

  if (!state.acceptedOffers.includes(offerId)) {
    state.acceptedOffers.push(offerId);
  }

  saveSharedState();
  updateFarmerUi();
  renderFarmerOffers();

  showToast(
    'Consegna Prenotata!',
    `Hai risparmiato circa ${totalBatchSaving} € rispetto al concime chimico. Registro nitrati aggiornato a norma.`,
    'success'
  );
}

function resetFarmerZvn() {
  state.farmerSavings = 1120;
  state.farmerUsedN = 2420;
  state.acceptedOffers = [];
  saveSharedState();
  updateFarmerUi();
  renderFarmerOffers();
  showToast('Dati Reinizializzati', 'I valori dei campi demo sono stati ripristinati.', 'info');
}

function onEconomicModelUpdated() {
  renderFarmerOffers();
}

function onSeasonModeUpdated() {
  renderFarmerOffers();
}

// Avvio automatico al caricamento della pagina
document.addEventListener('DOMContentLoaded', initAgricoltore);
