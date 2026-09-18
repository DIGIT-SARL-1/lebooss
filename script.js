const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

function closeMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('is-open');
  const openSubmenu = mainNav.querySelector('.nav-menu.is-open');
  openSubmenu?.classList.remove('is-open');
  openSubmenu?.querySelector('.nav-menu__trigger')?.setAttribute('aria-expanded', 'false');
  const submenuPanel = openSubmenu?.querySelector('.nav-menu__panel');
  if (submenuPanel) submenuPanel.hidden = true;
  document.body.classList.remove('menu-open');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const servicesMenu = document.querySelector('#servicesMenu');
const servicesMenuTrigger = servicesMenu?.querySelector('.nav-menu__trigger');
const servicesMenuPanel = document.querySelector('#servicesMenuPanel');

function closeServicesMenu() {
  servicesMenu?.classList.remove('is-open');
  servicesMenuTrigger?.setAttribute('aria-expanded', 'false');
  if (servicesMenuPanel) servicesMenuPanel.hidden = true;
}

servicesMenuTrigger?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = servicesMenuTrigger.getAttribute('aria-expanded') === 'true';
  servicesMenuTrigger.setAttribute('aria-expanded', String(!isOpen));
  servicesMenu?.classList.toggle('is-open', !isOpen);
  if (servicesMenuPanel) servicesMenuPanel.hidden = isOpen;
});

document.addEventListener('click', (event) => {
  if (!servicesMenu?.contains(event.target)) closeServicesMenu();
});

const searchToggle = document.querySelector('#searchToggle');
const searchPanel = document.querySelector('#siteSearchPanel');
const searchClose = document.querySelector('#searchClose');
const searchForm = document.querySelector('#siteSearchForm');
const searchInput = document.querySelector('#siteSearchInput');
const searchResults = document.querySelector('#siteSearchResults');
const searchablePages = [
  { title: 'CoVoiturage', href: '#covoiturage', keywords: 'trajet voiture mobilité' },
  { title: 'CoMotorage', href: '#comotorage', keywords: 'trajet moto mobilité' },
  { title: 'Copacketage', href: '#copacketage', keywords: 'colis livraison logistique' },
  { title: 'Où passer la nuit', href: '#hebergement', keywords: 'hébergement hôtel dormir' },
  { title: 'Racoleur', href: '#racoleur', keywords: 'accompagnement local' },
  { title: 'Touriste', href: '#touriste', keywords: 'voyage séjour' },
  { title: 'Billets & Tickets', href: '#billetterie', keywords: 'concert match bus train billetterie' },
  { title: 'Certificat de bonité', href: '#offre', keywords: 'solvabilité particulier' },
  { title: 'LeBooss Rating', href: '#rating', keywords: 'score croissance entreprise' },
  { title: 'Taux d’arnaque par ville', href: '#observatoire', keywords: 'escroquerie fraude indicateur' },
  { title: 'Négociation', href: '#arrangement', keywords: 'scénarios arrangement solution' },
  { title: 'Lanceur d’alerte', href: '#', keywords: 'fraude plainte signalement abus', action: 'report' }
];

function normalizeSearch(value) {
  return value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function renderSearchResults() {
  if (!searchResults) return;
  const query = normalizeSearch(searchInput?.value.trim() || '');
  if (!query) {
    searchResults.innerHTML = '<p>Saisissez un mot-clé pour retrouver un service ou une information.</p>';
    return;
  }
  const matches = searchablePages.filter((item) => normalizeSearch(`${item.title} ${item.keywords}`).includes(query));
  searchResults.innerHTML = matches.length
    ? matches.map((item) => `<a href="${item.href}"${item.action ? ` data-search-action="${item.action}"` : ''}>${item.title}</a>`).join('')
    : '<p>Aucun résultat. Essayez un autre mot-clé.</p>';
}

function closeSearch() {
  if (!searchPanel) return;
  searchPanel.hidden = true;
  searchToggle?.setAttribute('aria-expanded', 'false');
}

searchToggle?.addEventListener('click', () => {
  const willOpen = searchPanel?.hidden;
  closeMenu();
  if (!searchPanel) return;
  searchPanel.hidden = !willOpen;
  searchToggle.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) {
    renderSearchResults();
    searchInput?.focus();
  }
});
searchClose?.addEventListener('click', closeSearch);
searchForm?.addEventListener('submit', (event) => event.preventDefault());
searchInput?.addEventListener('input', renderSearchResults);
searchResults?.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  if (link.dataset.searchAction === 'report') {
    event.preventDefault();
    openReport();
  }
  closeSearch();
});

document.querySelectorAll('[data-segment]').forEach((button) => {
  button.addEventListener('click', () => {
    const segment = button.dataset.segment;

    document.querySelectorAll('[data-segment]').forEach((item) => {
      item.setAttribute('aria-selected', String(item === button));
    });

    document.querySelectorAll('[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== segment;
    });
  });
});

const payments = document.querySelector('#payments');
const identity = document.querySelector('#identity');
const history = document.querySelector('#history');
const requests = document.querySelector('#requests');
const scoreValue = document.querySelector('#scoreValue');
const scoreLabel = document.querySelector('#scoreLabel');
const scoreBar = document.querySelector('#scoreBar');
const historyValue = document.querySelector('#historyValue');
const requestsValue = document.querySelector('#requestsValue');

function updateScore() {
  if (!payments || !identity || !history || !requests) return;

  const paymentPenalty = Number(payments.value);
  const identityPenalty = Number(identity.value);
  const historyPenalty = Math.max(0, 10 - Number(history.value)) * 9;
  const requestPenalty = Number(requests.value) * 8;
  const score = Math.min(600, Math.round(130 + paymentPenalty + identityPenalty + historyPenalty + requestPenalty));
  const percentage = Math.max(4, Math.min(100, ((score - 100) / 500) * 100));

  scoreValue.textContent = String(score);
  historyValue.textContent = `${history.value} an${Number(history.value) > 1 ? 's' : ''}`;
  requestsValue.textContent = `${requests.value} demande${Number(requests.value) > 1 ? 's' : ''}`;
  scoreBar.style.width = `${percentage}%`;

  if (score <= 220) {
    scoreLabel.textContent = 'Profil très favorable';
    scoreLabel.style.color = '#0e785b';
    scoreBar.style.background = '#0e785b';
  } else if (score <= 340) {
    scoreLabel.textContent = 'Profil favorable';
    scoreLabel.style.color = '#6d8216';
    scoreBar.style.background = '#96a92c';
  } else if (score <= 460) {
    scoreLabel.textContent = 'Profil à consolider';
    scoreLabel.style.color = '#a56a00';
    scoreBar.style.background = '#e0a726';
  } else {
    scoreLabel.textContent = 'Profil sensible';
    scoreLabel.style.color = '#b44332';
    scoreBar.style.background = '#d9604e';
  }
}

[payments, identity, history, requests].forEach((control) => control?.addEventListener('input', updateScore));
updateScore();

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const contactForm = document.querySelector('#contactForm');
const formStatus = document.querySelector('#formStatus');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim().split(' ')[0];
  formStatus.textContent = `Merci ${name || ''}. Votre demande est prête à être transmise à l’équipe LeBooss.`;
  contactForm.reset();
});

document.querySelectorAll('[data-propose-trip]').forEach((button) => {
  button.addEventListener('click', () => {
    const subject = contactForm?.querySelector('select[name="subject"]');
    if (subject) subject.value = 'Proposer un trajet';
    closeMenu();
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  });
});

const accountToggle = document.querySelector('#accountToggle');
const accountDialog = document.querySelector('#accountDialog');
const accountForm = document.querySelector('#accountForm');
const accountStatus = document.querySelector('#accountStatus');

accountToggle?.addEventListener('click', () => {
  closeMenu();
  accountStatus.textContent = '';
  accountDialog?.showModal();
  accountForm?.querySelector('input')?.focus();
});
document.querySelectorAll('[data-close-account]').forEach((button) => {
  button.addEventListener('click', () => accountDialog?.close());
});
accountDialog?.addEventListener('click', (event) => {
  if (event.target === accountDialog) accountDialog.close();
});
accountForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const action = event.submitter?.value === 'signup' ? 'création de compte' : 'connexion';
  accountStatus.textContent = `Votre demande de ${action} est prête. La connexion sécurisée sera activée avec le service membre.`;
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeServicesMenu();
  closeSearch();
});

const cookieBanner = document.querySelector('#cookieBanner');
const cookieAccept = document.querySelector('#cookieAccept');
if (sessionStorage.getItem('lebooss-cookie-notice') === 'accepted') {
  cookieBanner?.classList.add('is-hidden');
}

cookieAccept?.addEventListener('click', () => {
  sessionStorage.setItem('lebooss-cookie-notice', 'accepted');
  cookieBanner?.classList.add('is-hidden');
});

document.querySelector('#year').textContent = String(new Date().getFullYear());

// Indicateur pilote par ville. Ces valeurs restent explicitement présentées comme données de démonstration.
const cityProfiles = {
  douala: { name: 'Douala', score: 68, level: 'Vigilance élevée', reports: '1 284', change: '+12%', trend: 'Forte concentration de signalements liés aux paiements mobiles et aux faux commerces en ligne.', bars: [41, 30, 19, 10] },
  yaounde: { name: 'Yaoundé', score: 61, level: 'Vigilance soutenue', reports: '1 016', change: '+8%', trend: 'Les usurpations institutionnelles et les fausses offres professionnelles sont les signaux dominants.', bars: [32, 24, 29, 15] },
  bafoussam: { name: 'Bafoussam', score: 46, level: 'Vigilance modérée', reports: '438', change: '+3%', trend: 'Les litiges de commerce social et les avances de livraison concentrent les alertes.', bars: [35, 38, 15, 12] },
  garoua: { name: 'Garoua', score: 38, level: 'Vigilance mesurée', reports: '291', change: '-2%', trend: 'Les demandes de transfert urgent et les faux gains restent les scénarios les plus observés.', bars: [44, 18, 21, 17] },
  limbe: { name: 'Limbé', score: 42, level: 'Vigilance modérée', reports: '326', change: '+4%', trend: 'Les réservations, locations et faux comptes marchands composent la majorité des alertes.', bars: [27, 36, 22, 15] },
  kribi: { name: 'Kribi', score: 35, level: 'Vigilance mesurée', reports: '214', change: '+1%', trend: 'Les annonces de location et les paiements d’acompte avant vérification dominent les signalements.', bars: [24, 42, 18, 16] }
};

const citySelect = document.querySelector('#citySelect');
const cityCustom = document.querySelector('#cityCustom');
const cityScore = document.querySelector('#cityScore');
const cityGauge = document.querySelector('#cityGauge');
const cityName = document.querySelector('#cityName');
const cityLevel = document.querySelector('#cityLevel');
const cityTrend = document.querySelector('#cityTrend');
const cityReports = document.querySelector('#cityReports');
const cityChange = document.querySelector('#cityChange');

function renderCity(key) {
  const city = cityProfiles[key];
  if (!city) return;
  cityScore.textContent = String(city.score);
  cityName.textContent = city.name;
  cityLevel.textContent = city.level;
  cityTrend.textContent = city.trend;
  cityReports.textContent = city.reports;
  cityChange.textContent = city.change;
  cityGauge.style.background = `conic-gradient(#ff23b5 0 ${city.score}%, rgba(255,255,255,.1) ${city.score}%)`;
  document.querySelectorAll('#riskBars > div').forEach((row, index) => {
    const value = city.bars[index];
    row.querySelector('b').style.width = `${value * 2}%`;
    row.querySelector('strong').textContent = `${value}%`;
  });
}

function renderCustomCity(value) {
  const city = value.trim();
  cityScore.textContent = '—';
  cityName.textContent = city || 'Votre ville';
  cityLevel.textContent = city ? 'Données en attente' : 'Ville personnalisée';
  cityTrend.textContent = city
    ? 'Cette ville a bien été prise en compte. Les indicateurs seront affichés dès que suffisamment de signalements vérifiés seront disponibles.'
    : 'Écrivez le nom de votre ville dans le champ prévu à cet effet.';
  cityReports.textContent = 'À venir';
  cityChange.textContent = '—';
  cityGauge.style.background = 'rgba(255,255,255,.1)';
  document.querySelectorAll('#riskBars > div').forEach((row) => {
    row.querySelector('b').style.width = '0%';
    row.querySelector('strong').textContent = '—';
  });
}

citySelect?.addEventListener('change', () => {
  const isCustomCity = citySelect.value === 'custom';
  cityCustom.hidden = !isCustomCity;
  if (isCustomCity) {
    renderCustomCity(cityCustom.value);
    cityCustom.focus();
  } else {
    renderCity(citySelect.value);
  }
});

cityCustom?.addEventListener('input', () => renderCustomCity(cityCustom.value));

// Formulaire progressif de signalement avec brouillon local.
const reportDialog = document.querySelector('#reportDialog');
const reportForm = document.querySelector('#reportForm');
const reportNext = document.querySelector('#reportNext');
const reportBack = document.querySelector('#reportBack');
const reportSubmit = document.querySelector('#reportSubmit');
const reportStatus = document.querySelector('#reportStatus');
const maxReportSteps = 5;
let currentReportStep = 1;

function showReportStep(step) {
  currentReportStep = Math.max(1, Math.min(maxReportSteps, step));
  reportForm?.querySelectorAll('[data-step]').forEach((panel) => {
    const active = Number(panel.dataset.step) === currentReportStep;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  document.querySelectorAll('[data-progress]').forEach((item) => {
    item.classList.toggle('is-active', Number(item.dataset.progress) <= currentReportStep);
  });
  reportBack.hidden = currentReportStep === 1;
  reportNext.hidden = currentReportStep === maxReportSteps;
  reportSubmit.hidden = currentReportStep !== maxReportSteps;
  reportDialog?.querySelector('.report-shell')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function openReport() {
  if (!reportDialog) return;
  reportSubmit.disabled = false;
  reportStatus.textContent = '';
  reportDialog.showModal();
  document.body.classList.add('dialog-open');
  showReportStep(currentReportStep);
}

function closeReport() {
  reportDialog?.close();
  document.body.classList.remove('dialog-open');
}

document.querySelectorAll('[data-open-report]').forEach((button) => button.addEventListener('click', openReport));
document.querySelectorAll('[data-close-report]').forEach((button) => button.addEventListener('click', closeReport));
reportDialog?.addEventListener('click', (event) => {
  if (event.target === reportDialog) closeReport();
});
reportDialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));

function validateReportStep() {
  const step = reportForm?.querySelector(`[data-step="${currentReportStep}"]`);
  const fields = step ? [...step.querySelectorAll('input, select, textarea')] : [];
  const invalid = fields.find((field) => !field.checkValidity());
  if (invalid) {
    invalid.reportValidity();
    return false;
  }
  return true;
}

reportNext?.addEventListener('click', () => {
  if (validateReportStep()) showReportStep(currentReportStep + 1);
});
reportBack?.addEventListener('click', () => showReportStep(currentReportStep - 1));

const previousAddress = document.querySelector('#previousAddress');
const addressChangedControls = document.querySelectorAll('input[name="addressChanged"]');
function updatePreviousAddress() {
  const hasChanged = reportForm?.elements.addressChanged?.value === 'yes';
  if (previousAddress) previousAddress.hidden = !hasChanged;
  previousAddress?.querySelectorAll('[data-required-if-previous]').forEach((field) => {
    field.required = hasChanged;
  });
}
addressChangedControls.forEach((control) => control.addEventListener('change', updatePreviousAddress));

const documentType = document.querySelector('#documentType');
const documentRegions = document.querySelectorAll('input[name="documentRegion"]');
const documentTypeOptions = {
  africa: ['Carte nationale d’identité', 'Passeport', 'Carte d’électeur', 'Justificatif de résidence'],
  international: ['Passeport', 'Attestation de résidence', 'Carte d’enregistrement']
};
function updateDocumentTypes() {
  if (!documentType) return;
  const region = reportForm?.elements.documentRegion?.value || 'africa';
  documentType.innerHTML = '<option value="">Choisir un document</option>';
  documentTypeOptions[region].forEach((label) => {
    const option = document.createElement('option');
    option.value = label;
    option.textContent = label;
    documentType.append(option);
  });
}
documentRegions.forEach((control) => control.addEventListener('change', updateDocumentTypes));
updateDocumentTypes();

reportForm?.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener('change', () => {
    const oversized = [...input.files].some((file) => file.size > 10 * 1024 * 1024);
    input.setCustomValidity(oversized ? 'Chaque fichier doit peser au maximum 10 Mo.' : '');
    if (oversized) input.reportValidity();
  });
});

function saveReportDraft() {
  if (!reportForm) return;
  const draft = {};
  [...reportForm.elements].forEach((field) => {
    if (!field.name || field.type === 'file') return;
    if (field.type === 'radio') {
      if (field.checked) draft[field.name] = field.value;
    } else if (field.type === 'checkbox') {
      draft[field.name] ??= [];
      if (field.checked) draft[field.name].push(field.value || 'on');
    } else {
      draft[field.name] = field.value;
    }
  });
  localStorage.setItem('lebooss-report-draft', JSON.stringify(draft));
}

function restoreReportDraft() {
  if (!reportForm) return;
  try {
    const draft = JSON.parse(localStorage.getItem('lebooss-report-draft') || '{}');
    [...reportForm.elements].forEach((field) => {
      if (!field.name || !(field.name in draft) || field.type === 'file') return;
      if (field.type === 'radio') field.checked = draft[field.name] === field.value;
      else if (field.type === 'checkbox') field.checked = Array.isArray(draft[field.name]) && draft[field.name].includes(field.value || 'on');
      else field.value = draft[field.name];
    });
  } catch (_) {
    localStorage.removeItem('lebooss-report-draft');
  }
}

restoreReportDraft();
updateDocumentTypes();
restoreReportDraft();
updatePreviousAddress();
reportForm?.addEventListener('input', saveReportDraft);
reportForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!reportForm.checkValidity()) {
    reportForm.reportValidity();
    return;
  }
  const reference = `LB-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  reportStatus.textContent = `Dossier complété · Référence ${reference}. La transmission sécurisée à l’équipe de traitement sera activée lors du prochain sprint.`;
  localStorage.removeItem('lebooss-report-draft');
  reportForm.reset();
  updatePreviousAddress();
  updateDocumentTypes();
  reportSubmit.disabled = true;
});

document.querySelectorAll('[data-scenario]').forEach((button) => {
  button.addEventListener('click', () => {
    const subject = document.querySelector('#contactForm select[name="subject"]');
    if (subject) subject.value = 'Négociation';
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Bascule linguistique FR / EN sur les zones principales du parcours.
const translations = {
  fr: {
    topline: 'LeBooss aujourd’hui : l’actualité autour des escroqueries en général.', news: 'Actualités', help: 'Besoin d’aide ?', individuals: 'Particuliers', companies: 'Entreprises', scoring: 'Scoring & données', about: 'À propos', report: 'Lanceur d’alerte', heroEyebrow: 'La confiance dans l’économie africaine', heroTitle: 'Comprendre la solvabilité.<br><span>Décider avec confiance.</span>', heroLead: 'LeBooss aujourd’hui : une actualité claire autour des escroqueries en général, pour mieux les comprendre et les éviter.', certificate: 'Obtenir mon certificat', discover: 'Découvrir comment ça marche', riskTitle: 'Le risque d’arnaque, ville par ville.', ecosystemTitle: 'Huit expertises, un même réflexe de confiance.', ratingTitle: 'Bonité aujourd’hui. Capacité de croissance demain.', arrangementTitle: 'Trois scénarios pour renouer le dialogue.', reportIntro: 'Votre récit peut être complété progressivement. Commencez avec ce que vous savez aujourd’hui.', continue: 'Continuer', sendReport: 'Envoyer le signalement'
  },
  en: {
    topline: 'LeBooss today: news and insights about scams in general.', news: 'News', help: 'Need help?', individuals: 'Individuals', companies: 'Businesses', scoring: 'Scoring & data', about: 'About', report: 'Whistleblower', heroEyebrow: 'Trust in the African economy', heroTitle: 'Understand creditworthiness.<br><span>Decide with confidence.</span>', heroLead: 'LeBooss today: clear news and insights about scams in general, to better understand and avoid them.', certificate: 'Get my certificate', discover: 'See how it works', riskTitle: 'Scam risk, city by city.', ecosystemTitle: 'Eight areas of expertise, one trust reflex.', ratingTitle: 'Creditworthiness today. Growth capacity tomorrow.', arrangementTitle: 'Three scenarios to reopen dialogue.', reportIntro: 'Your report can be completed progressively. Start with what you know today.', continue: 'Continue', sendReport: 'Send report'
  }
};

const languageSelect = document.querySelector('#languageSelect');
function setLanguage(language) {
  const selected = translations[language] ? language : 'fr';
  document.documentElement.lang = selected;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = translations[selected][element.dataset.i18n];
    if (value) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const value = translations[selected][element.dataset.i18nHtml];
    if (value) element.innerHTML = value;
  });
  document.title = selected === 'en' ? 'LeBooss — Scam news' : 'LeBooss — Actualité des escroqueries';
  localStorage.setItem('lebooss-language', selected);
}
const preferredLanguage = localStorage.getItem('lebooss-language') || 'fr';
if (languageSelect) languageSelect.value = preferredLanguage;
setLanguage(preferredLanguage);
languageSelect?.addEventListener('change', () => setLanguage(languageSelect.value));
