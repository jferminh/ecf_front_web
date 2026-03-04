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
    // évite des espaces parasites dans la requête API si un champ est manquant
    return [rue, cp, ville]
        .filter(val => val && val.trim() !== "")
        .join(" ");
}

// ─────────────────────────────────────────────
// Instance Leaflet (variable module)
// ─────────────────────────────────────────────

/*
 * On stocke l'instance de la carte dans une variable
 * pour pouvoir la détruire si besoin (évite les doublons
 * si lancerCarte() est appelée plusieurs fois)
 */
let carteLeaflet = null;

// ─────────────────────────────────────────────
// Initialisation de la carte Leaflet
// ─────────────────────────────────────────────

/**
 * Crée la carte Leaflet, ajoute les tuiles OSM et le marqueur
 *
 * @param {number} lat    - Latitude
 * @param {number} lon    - Longitude
 * @param {string} label  - Adresse formatée pour la popup
 * @param {string} nom    - Nom du client/prospect pour la popup
 */
function initialiserCarte(lat, lon, label, nom) {

    // Détruire la carte existante si on en recrée une
    if (carteLeaflet) {
        carteLeaflet.remove();
        carteLeaflet = null;
    }

    /*
     * Afficher le conteneur AVANT d'initialiser Leaflet
     * Leaflet a besoin que le div soit visible pour
     * calculer ses dimensions
     */
    afficherEtatCarteDonnees();

    // ── Initialiser la carte ──────────────────
    carteLeaflet = L.map("carte-leaflet").setView([lat, lon], 15);

    /*
     * Couche de tuiles OpenStreetMap
     * attribution obligatoire (licence ODbL)
     */
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(carteLeaflet);

    // ── Marqueur + popup ──────────────────────
    const marqueur = L.marker([lat, lon]).addTo(carteLeaflet);

    /*
     * Contenu HTML de la popup
     * label = adresse formatée par l'API (ex: "10 Rue de la Paix 75002 Paris")
     * nom   = raison sociale du client/prospect
     */
    marqueur.bindPopup(`
        <div style="min-width: 150px;">
            <strong>${nom}</strong><br>
            <span class="text-muted">${label}</span>
        </div>
    `).openPopup();

    /*
     * Forcer le recalcul de la taille de la carte
     * Nécessaire quand le conteneur était masqué (d-none)
     * au moment de l'initialisation
     */
    setTimeout(function () {
        carteLeaflet.invalidateSize();
    }, 100);
}

// ─────────────────────────────────────────────
// Fonction principale d'orchestration
// ─────────────────────────────────────────────

/**
 * Point d'entrée : chaîne complète géocodage → carte
 *
 * @param {Object}  donnees   - Données brouillon LocalStorage
 * @param {boolean} estClient - true = client, false = prospect
 */
async function lancerCarte(donnees, estClient) {

    // 1. Afficher le spinner
    afficherEtatCartChargement();

    // 2. Construire l'adresse complète
    const adresse = construireAdresse(donnees, estClient);

    if (!adresse || adresse.trim() === "") {
        afficherEtatCarteErreur();
        return;
    }

    // Afficher l'adresse dans le titre de la section
    const titreAdresse = document.getElementById("carte-adresse");
    if (titreAdresse) titreAdresse.textContent = adresse;

    // 3. Géocoder l'adresse
    const coords = await geocoderAdresse(adresse);

    if (!coords) {
        afficherEtatCarteErreur();
        return;
    }

    /*
     * Vérifier la pertinence du résultat
     * Un score < 0.3 signifie que l'API n'a pas trouvé
     * une adresse correspondante fiable
     */
    if (coords.score < 0.3) {
        console.warn("Score géocodage trop faible :", coords.score);
        afficherEtatCarteErreur();
        return;
    }

    // 4. Récupérer le nom (raison sociale)
    const nom = estClient
        ? (donnees["raison-sociale"]   || "Client")
        : (donnees["raison-sociale-p"] || "Prospect");

    // 5. Initialiser la carte
    initialiserCarte(coords.lat, coords.lon, coords.label, nom);
}
