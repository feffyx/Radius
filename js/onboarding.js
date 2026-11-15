/* ===========================
   Radius – Logica Onboarding & Auth
   =========================== */

let currentAuthMode = 'login';
let selectedRole = 'allevatore';

function initOnboarding() {
  loadSharedState();
  updateSharedDisplayValues();

  // Se c'è già un profilo registrato, mostra un messaggio di bentornato opzionale
  try {
    const profile = JSON.parse(localStorage.getItem('radius-user-profile') || '{}');
    if (profile && profile.companyName) {
      const banner = document.getElementById('welcome-back-banner');
      const companyEl = document.getElementById('welcome-company-name');
      if (banner && companyEl) {
        companyEl.textContent = profile.companyName;
        banner.classList.remove('hidden');
      }
    }
  } catch(e) { /* ignore */ }
}

/* ---------- Gestione Modale Login / Registrazione ---------- */

function openAuthModal(mode = 'login', presetRole = null) {
  currentAuthMode = mode;
  if (presetRole) {
    selectRole(presetRole);
  }

  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  switchAuthTab(mode);
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function switchAuthTab(mode) {
  currentAuthMode = mode;
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const formLogin = document.getElementById('auth-form-login');
  const formRegister = document.getElementById('auth-form-register');
  const modalTitle = document.getElementById('auth-modal-title');

  if (mode === 'login') {
    tabLogin.className = 'flex-1 py-2.5 rounded-xl font-bold text-sm bg-white text-forest-800 shadow-xs transition';
    tabRegister.className = 'flex-1 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-900 transition';
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Accedi a Radius';
  } else {
    tabRegister.className = 'flex-1 py-2.5 rounded-xl font-bold text-sm bg-white text-forest-800 shadow-xs transition';
    tabLogin.className = 'flex-1 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-900 transition';
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Registra la tua Attività';
  }
}

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-option-btn').forEach(btn => {
    if (btn.dataset.role === role) {
      btn.classList.add('border-forest-800', 'bg-forest-50', 'text-forest-900');
      btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
    } else {
      btn.classList.remove('border-forest-800', 'bg-forest-50', 'text-forest-900');
      btn.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
    }
  });
}

/* ---------- Login Veloce Demo per Ruolo ---------- */

function quickLoginAs(role) {
  const roleRedirects = {
    allevatore: 'allevatore.html',
    agricoltore: 'agricoltore.html',
    trasportatore: 'trasportatore.html',
    mappa: 'mappa.html'
  };

  const names = {
    allevatore: 'Masseria Volturno (Allevatore)',
    agricoltore: 'Tenuta Mazzoni (Agricoltore)',
    trasportatore: 'AgroLogistica Volturno (Botte)',
    mappa: 'Consorzio Territoriale (Mappa & Zone)'
  };

  showToast('Accesso in corso...', `Benvenuto ${names[role] || ''}`, 'success');

  try {
    localStorage.setItem('radius-current-session', JSON.stringify({
      role: role,
      name: names[role],
      loginTime: new Date().toISOString()
    }));
  } catch(e) {}

  setTimeout(() => {
    window.location.href = roleRedirects[role] || 'allevatore.html';
  }, 600);
}

/* ---------- Gestione Invio Form Login Standard ---------- */

function handleLoginSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById('login-email');
  const roleSelect = document.getElementById('login-role-select');

  const role = roleSelect ? roleSelect.value : 'allevatore';
  const roleRedirects = {
    allevatore: 'allevatore.html',
    agricoltore: 'agricoltore.html',
    trasportatore: 'trasportatore.html',
    mappa: 'mappa.html'
  };

  showToast('Accesso Eseguito', 'Reindirizzamento al tuo pannello operativo...', 'success');

  try {
    localStorage.setItem('radius-current-session', JSON.stringify({
      role: role,
      email: emailInput ? emailInput.value : '',
      loginTime: new Date().toISOString()
    }));
  } catch(e) {}

  setTimeout(() => {
    window.location.href = roleRedirects[role] || 'allevatore.html';
  }, 700);
}

/* ---------- Gestione Invio Form Registrazione ---------- */

function handleRegisterSubmit(event) {
  event.preventDefault();
  const companyName = document.getElementById('reg-company-name').value;
  const aslCode = document.getElementById('reg-asl-code').value;
  const town = document.getElementById('reg-town').value;

  if (!companyName || !town) {
    showToast('Campi Obbligatori', 'Inserisci il nome dell\'azienda e il comune.', 'warning');
    return;
  }

  const newProfile = {
    companyName: companyName,
    aslCode: aslCode || 'CE-REG-' + Math.floor(1000 + Math.random() * 9000),
    town: town,
    role: selectedRole,
    registeredAt: new Date().toISOString()
  };

  try {
    localStorage.setItem('radius-user-profile', JSON.stringify(newProfile));
    localStorage.setItem('radius-current-session', JSON.stringify({
      role: selectedRole,
      name: companyName,
      loginTime: new Date().toISOString()
    }));
  } catch(e) {}

  showToast(
    'Attività Registrata!',
    `Profilo creato con successo per ${companyName}. Configurazione spazio di lavoro in corso...`,
    'success'
  );

  const roleRedirects = {
    allevatore: 'allevatore.html',
    agricoltore: 'agricoltore.html',
    trasportatore: 'trasportatore.html',
    mappa: 'mappa.html'
  };

  setTimeout(() => {
    window.location.href = roleRedirects[selectedRole] || 'allevatore.html';
  }, 900);
}

// Inizializzazione automatica
document.addEventListener('DOMContentLoaded', initOnboarding);
