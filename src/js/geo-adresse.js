/**
 * geo-adresse.js
 * Auto-complétion d'adresse via l'API adresse.data.gouv.fr
 * Générique : fonctionne pour form-client et form-prospect
 */

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const URL_API_ADRESSE = "https://api-adresse.data.gouv.fr/search/";
const NB_SUGGESTIONS = 5;
const DELAI_DEBOUNCE = 400; // ms après la dernière frappe

// ─────────────────────────────────────────────
// Appel API adresse.data.gouv.fr
// ─────────────────────────────────────────────

/**
 * Interroge l'API et retourne un tableau de suggestions
 * @param {string} recherche - Texte saisi par l'utilisateur
 * @returns {Promise<Array>} - Tableau de features GeoJSON
 */
async function rechercherAdresse(recherche) {
    // Ne pas appeler l'API si moins de 3 caractères
    if (recherche.trim().length < 3) return [];

    const params = new URLSearchParams({
        q: recherche,
        limit: NB_SUGGESTIONS,
    });

    try {
        const response = await fetch(`${URL_API_ADRESSE}?${params}`);

        // Vérifier que la réponse HTTP est correcte
        if (!response.ok) {
            console.error("Erreur API adresse :", response.status);
            return [];
        }

        const donnees = await response.json();

        // L'API retourne {features: [...] }
        return donnees.features || [];
    } catch (error) {
        // Pas de connexion réseau ou API indisponible
        console.error("API adresse insdisponible :", error);
        return [];
    }
}

// ─────────────────────────────────────────────
// Affichage des suggestions dans la liste
// ─────────────────────────────────────────────

/**
 * Remplit la liste <ul> avec les suggestions reçues
 * @param {HTMLElement} liste    - L'élément <ul> des suggestions
 * @param {Array}       features - Tableau de features GeoJSON
 * @param {Function}    onChoix  - Callback appelé au clic sur une suggestion
 */
function afficherSuggestions(liste, features, onChoix) {
    // Vider la liste précédente
    liste.innerHTML = '';

    if (features.length === 0) {
        liste.classList.add('d-none');
        return;
    }

    // Créer un <li> pour chaque suggestion
    features.forEach(feature => {
        const props = feature.properties;
        /*
         * L'API retourne dans properties :
         * - label       : adresse complète formatée
         * - housenumber : numéro de rue
         * - street      : nom de la rue
         * - postcode    : code postal
         * - city        : ville
         * - name        : numéro + rue (sans ville)
         */

        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";

    })
}