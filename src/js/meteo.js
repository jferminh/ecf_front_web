/**
 * meteo.js
 * Affichage météo sur les pages détail client/prospect
 *
 * Flux :
 * 1. Lire la ville depuis la page (detail.html)
 * 2. Géocoder la ville → (lat, lon) via API adresse.gouv.fr
 * 3. Appeler Open-Meteo avec (lat, lon) → données météo
 * 4. Afficher les données dans la section #section-meteo
 */

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const URL_GEOCODAGE = "https://api-adresse.data.gouv.fr/search/";
const URL_OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

// ─────────────────────────────────────────────
// Étape 1 : Géocodage ville → coordonnées GPS
// ─────────────────────────────────────────────

/**
 * Convertit un nom de ville en coordonnées GPS
 * Réutilise la même API que geo-adresse.js
 *
 * @param  {string} ville - Nom de la ville (ex : "Paris")
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
async function geocoderVille(ville) {
    if (!ville || !ville.trim() === "") return null;

    const params = new URLSearchParams({
        q: ville,
        limit: 1,
        type: "municipality", // On veut uniquement des villes, pas des rues
    });

    try {
        const reponse = await fetch(`${URL_GEOCODAGE}?${params}`);
        if (!reponse.ok) return null;

        const donnees = await reponse.json();
        const features = donnees.features;

        // Aucun résultat trouvé pour cette ville
        if (!features || features.length === 0) return null;

        /*
         * L'API GeoJSON retourne les coordonnées dans :
         * feature.geometry.coordinates = [longitude, latitude]
         * ⚠️ Attention : l'ordre est [lon, lat] en GeoJSON
         * mais Open-Meteo attend latitude, longitude
         */
        const coords = features[0].geometry.coordinates;

        return {
            lon: coords[0],
            lat: coords[1],
        };
    } catch (error) {
        console.error("Erreur géocodage :", error);
        return null;
    }
}

// ─────────────────────────────────────────────
// Étape 2 : Gestion des états d'affichage
// ─────────────────────────────────────────────

/**
 * Affiche l'état "chargement" : spinner visible,
 * erreur et données masquées
 */
function afficherEtatChargement() {
    document.getElementById("meteo-chargement").classList.remove("d-none");
    document.getElementById("meteo-erreur").classList.add("d-none");
    document.getElementById("meteo-donnees").classList.add("d-none");
}

/**
 * Affiche l'état "erreur" : message d'erreur visible,
 * spinner et données masquées
 */
function afficherEtatErreur() {
    document.getElementById("meteo-chargement").classList.add("d-none");
    document.getElementById("meteo-erreur").classList.remove("d-none");
    document.getElementById("meteo-donnees").classList.add("d-none");
}

/**
 * Affiche l'état "données" : résultats visibles,
 * spinner et erreur masqués
 */
function afficherEtatDonnees() {
    document.getElementById("meteo-chargement").classList.add("d-none");
    document.getElementById("meteo-erreur").classList.add("d-none");
    document.getElementById("meteo-donnees").classList.remove("d-none");
}

// ─────────────────────────────────────────────
// Correspondance code météo → emoji + description
// WMO Weather interpretation codes
// https://open-meteo.com/en/docs#weathervariables
// ─────────────────────────────────────────────
const CODES_METEO = {
    0: {icone: "☀️", description: "Ciel dégagé"},
    1: {icone: "🌤️", description: "Peu nuageux"},
    2: {icone: "⛅", description: "Partiellement nuageux"},
    3: {icone: "☁️", description: "Couvert"},
    45: {icone: "🌫️", description: "Brouillard"},
    48: {icone: "🌫️", description: "Brouillard givrant"},
    51: {icone: "🌦️", description: "Bruine légère"},
    53: {icone: "🌦️", description: "Bruine modérée"},
    55: {icone: "🌧️", description: "Bruine dense"},
    61: {icone: "🌧️", description: "Pluie légère"},
    63: {icone: "🌧️", description: "Pluie modérée"},
    65: {icone: "🌧️", description: "Pluie forte"},
    71: {icone: "🌨️", description: "Neige légère"},
    73: {icone: "🌨️", description: "Neige modérée"},
    75: {icone: "❄️", description: "Neige forte"},
    80: {icone: "🌦️", description: "Averses légères"},
    81: {icone: "🌧️", description: "Averses modérées"},
    82: {icone: "⛈️", description: "Averses violentes"},
    95: {icone: "⛈️", description: "Orage"},
    99: {icone: "⛈️", description: "Orage avec grêle"},
};

// ─────────────────────────────────────────────
// Étape 3 : Appel Open-Meteo
// ─────────────────────────────────────────────

/**
 * Récupère la météo actuelle depuis Open-Meteo
 *
 * @param  {number} lat
 * @param  {number} lon
 * @returns {Promise<Object|null>} - Données météo ou null si erreur
 */
async function recupererMeteo(lat, lon) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "windspeed_10m",
            "weathercode",
        ].join(","),
        timezone: "Europe/Paris",
        forecast_days: 1,
    });

    try {
        const reponse = await fetch(`${URL_OPEN_METEO}?${params}`);
        if (!reponse.ok) return null;

        const donnees = await reponse.json();

        /*
         * Open-Meteo retourne :
         * {
         *   current: {
         *     temperature_2m:        22.4,
         *     relative_humidity_2m:  58,
         *     windspeed_10m:         12.3,
         *     weathercode:           2,
         *     time:                  "2026-03-03T13:00"
         *   }
         * }
         */
        return donnees.current || null;
    } catch (erreur) {
        console.error("Erreur Open-Meteo", erreur);
        return null;
    }
}

// ─────────────────────────────────────────────
// Étape 4 : Affichage des données dans le HTML
// ─────────────────────────────────────────────

/**
 * Injecte les données météo dans les éléments du DOM
 * @param {Object} meteo  - Objet current retourné par Open-Meteo
 * @param {string} ville  - Nom de la ville pour le titre
 */
function afficherDonneesMeteo(meteo, ville) {
    // Récupérer l'emoji + description depuis la table des codes
    const code = meteo.weathercode;
    const infos = CODES_METEO[code] || {icone: "🌡️", description: "Inconnu"};

    // Formater l'heure de mise à jour
    // meteo.time = "2026-03-03T13:00" → "13:00"
    const heure = meteo.time
        ? new Date(meteo.time).toLocaleDateString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "-";

    // Injecter dans le DOM
    document.getElementById("meteo-ville").textContent = ville;
    document.getElementById("meteo-icone").textContent = infos.icone;
    document.getElementById("meteo-description").textContent = infos.description;
    document.getElementById("meteo-temperature").textContent = meteo.temperature_2m;
    document.getElementById("meteo-vent").textContent = meteo.windspeed_10m;
    document.getElementById("meteo-humidite").textContent = meteo.relative_humidity_2m;
    document.getElementById("meteo-maj").textContent = heure;

    // Afficher le bloc données, masquer chargement + erreur
    afficherEtatDonnees();
}

// ─────────────────────────────────────────────
// Étape 5 : Fonction principale d'orchestration
// ─────────────────────────────────────────────

/**
 * Point d'entrée : chaîne complète géocodage → météo → affichage
 * @param {string} ville - Ville du client/prospect
 */
async function lancerMeteo(ville) {
    // 1. Afficher le spinner
    afficherEtatChargement();

    // 2. Géocoder la ville
    const coords = await geocoderVille(ville);

    if (!coords) {
        afficherEtatErreur();
        return;
    }

    // 3. Récupérer la météo
    const meteo = await recupererMeteo(coords.lat, coords.lon);
    if (!meteo) {
        afficherEtatErreur();
        return;
    }

    // 4. Afficher les données
    afficherDonneesMeteo(meteo, ville);
}
