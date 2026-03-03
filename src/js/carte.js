/**
 * carte.js
 * Carte interactive Leaflet sur les pages détail client/prospect
 *
 * Flux :
 * 1. Construire l'adresse complète depuis les données LocalStorage
 * 2. Géocoder l'adresse → (lat, lon) via API adresse.gouv.fr
 * 3. Initialiser la carte Leaflet + marqueur + popup
 */

// ─────────────────────────────────────────────
// Constante
// ─────────────────────────────────────────────
const URL_GEOCODAGE_CARTE = "https://api-adresse.data.gouv.fr/search/";

// ─────────────────────────────────────────────
// Gestion des états d'affichage (même pattern que meteo.js)
// ─────────────────────────────────────────────

function afficherEtatCartChargement() {
    document.getElementById("carte-chargement").classList.remove("d-none");
    document.getElementById("carte-erreur").classList.add("d-none");
    document.getElementById("carte-leaflet").classList.add("d-none");
}

function afficherEtatCarteErreur() {
    document.getElementById("carte-chargement").classList.add("d-none");
    document.getElementById("carte-erreur").classList.remove("d-none");
    document.getElementById("carte-leaflet").classList.add("d-none");
}

function afficherEtatCarteDonnees() {
    document.getElementById("carte-chargement").classList.add("d-none");
    document.getElementById("carte-erreur").classList.add("d-none");
    document.getElementById("carte-leaflet").classList.remove("d-none");
}

// ─────────────────────────────────────────────
// Géocodage adresse complète → coordonnées GPS
// ─────────────────────────────────────────────

/**
 * Convertit une adresse complète en coordonnées GPS
 *
 * @param  {string} adresse - Adresse complète (ex: "10 rue de la Paix 75002 Paris")
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
async function geocoderAdresse(adresse) {
    if (!adresse || adresse.trim() === "") return null;

    const params = new URLSearchParams({
        q:     adresse,
        limit: 1,
    });

    try {
        const reponse = await fetch(`${URL_GEOCODAGE_CARTE}?${params}`);
        if (!reponse.ok) return null;

        const donnees = await reponse.json();
        const features = donnees.features;

        if (!features || features.length === 0) return null;

        /*
         * GeoJSON : coordinates = [longitude, latitude]
         * ⚠️ Ordre inversé par rapport à Leaflet
         * Leaflet attend : L.latLng(latitude, longitude)
         */
        const coords = features[0].geometry.coordinates;

        return {
            lon:    coords[0],
            lat:    coords[1],
            label:  features[0].properties.label,  // Adresse formatée par l'API
            score:  features[0].properties.score,   // Pertinence du résultat (0 à 1)
        };

    } catch (erreur) {
        console.error("Erreur géocodage carte :", erreur);
        return null;
    }
}

// ─────────────────────────────────────────────
// Construction de l'adresse complète
// depuis les données LocalStorage
// ─────────────────────────────────────────────

/**
 * Assemble rue + code postal + ville en une seule chaîne
 *
 * @param  {Object}  donnees   - Données du brouillon LocalStorage
 * @param  {boolean} estClient - true = client, false = prospect
 * @returns {string} - Adresse complète ou chaîne vide
 */
function construireAdresse(donnees, estClient) {
    /*
     * Les IDs des champs diffèrent entre client et prospect :
     * Client  : rue, code-postal, ville
     * Prospect : rue-p, code-postal-p, ville-p
     */
    const rue = estClient ? donnees["rue"] : donnees["rue-p"];
    const cp = estClient ? donnees["code-postal"] : donnees["code-postal-p"];
    const ville = estClient ? donnees["ville"] : donnees["ville-p"];

    // Filtrer les valeurs vides avant de joindre
    return [rue, cp, ville]
        .filter(val => val && val.trim() !== "")
        .join(" ");
}
