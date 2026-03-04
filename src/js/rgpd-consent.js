// ================================================
// RGPD-2 : Gestion consentement LocalStorage
// ================================================

const CONSENT_KEY = 'rgpd-consent';
const CONSENT_DELAY = 30 * 24 * 60 * 60 * 1000; // 30 jours en ms

// Lire le consentement stocké
function getConsent() {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch { return null; }
}

// Vérifier si le consentement est encore valide
function isConsentValid(){
    const consent = getConsent();
    if (!consent || consent.value !== 'accepted') return false;

    const age = Date.now() - consent.date;
    return age < CONSENT_DELAY;
}

// ── Afficher / cacher le bandeau ─────────────────
function showBanner()  {
    document.getElementById('rgpd-banner').removeAttribute('hidden');
}
function hideBanner() {
    document.getElementById('rgpd-banner').setAttribute('hidden', '');
}

// ── Accepter ─────────────────────────────────────
function acceptConsent() {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
        value : 'accepted',
        date  : Date.now()
    }));
    hideBanner();
}

// ── Refuser ──────────────────────────────────────
function refuseConsent() {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
        value : 'refused',
        date  : Date.now()
    }));
    hideBanner();
}

// ── Initialisation au chargement ─────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Consentement expiré → on nettoie
    const consent = getConsent();
    if (consent && Date.now() - consent.date >= CONSENT_DELAY) {
        localStorage.removeItem(CONSENT_KEY);
    }

    // Afficher le bandeau si pas de consentement valide
    if (!isConsentValid()) showBanner();

    // Boutons
    document.getElementById('btn-rgpd-accepter')
        .addEventListener('click', acceptConsent);

    document.getElementById('btn-rgpd-refuser')
        .addEventListener('click', refuseConsent);
});