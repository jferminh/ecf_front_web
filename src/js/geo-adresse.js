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
        console.error("API adresse indisponible :", error);
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
         * - label : adresse complète formatée
         * - housenumber : numéro de rue
         * - street : nom de la rue
         * - postcode : code postal
         * - city : ville
         * - name : numéro + rue (sans ville)
         */

        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.setAttribute("role", "option");
        li.setAttribute("tabindex", "0");
        li.textContent = props.label;

        // Clic souris
        li.addEventListener("click", () => {
            onChoix(props);
            masquerSuggestions(liste)
        })

        // Navigation clavier (Entrée ou Espace
        li.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChoix(props);
                masquerSuggestions(liste);
            }
        });

        liste.appendChild(li);
    });

    // Afficher la liste
    liste.classList.remove('d-none');
}

// ─────────────────────────────────────────────
// Masquer la liste des suggestions
// ─────────────────────────────────────────────
function masquerSuggestions(liste) {
    liste.innerHTML = '';
    liste.classList.add('d-none');
}

// ─────────────────────────────────────────────
// Remplissage des champs adresse après sélection
// ─────────────────────────────────────────────

/**
 * Remplit les champs rue, code postal et ville
 * depuis les propriétés GeoJSON sélectionnées
 *
 * @param {Object} props      - feature.properties de l'API
 * @param {string} idRue      - ID du champ rue
 * @param {string} idCp       - ID du champ code postal
 * @param {string} idVille    - ID du champ ville
 * @param {Object} messagesErreur - table de validation du formulaire
 */
function remplirChampsAdresse(props, idRue, idCp,idVille, messagesErreur) {
    const champRue = document.getElementById(idRue);
    const champCp = document.getElementById(idCp);
    const champVille = document.getElementById(idVille);

    if (champRue) {
        champRue.value = props.name || "";
    }
    if (champCp) {
        champCp.value = props.postcode || "";
    }
    if (champVille) {
        champVille.value = props.city || "";
    }

    if (champRue) afficherErreur(champRue, messagesErreur);
    if (champCp) afficherErreur(champCp, messagesErreur);
    if (champVille) afficherErreur(champVille, messagesErreur);
}

// ─────────────────────────────────────────────
// Fonction principale : branche tout sur un formulaire
// ─────────────────────────────────────────────

/**
 * Initialise la géolocalisation d'adresse sur un formulaire
 *
 * @param {Object} config - Configuration spécifique au formulaire
 * @param {string} config.idRue            - ID champ rue
 * @param {string} config.idCp             - ID champ code postal
 * @param {string} config.idVille          - ID champ ville
 * @param {string} config.idBtnGeo         - ID bouton 📍
 * @param {string} config.idSuggestions    - ID de la <ul> suggestions
 * @param {Object} config.messagesErreur   - table de validation
 */
function brancherGeoAdresse(config) {
    const champRue = document.getElementById(config.idRue);
    const btnGeo = document.getElementById(config.idBtnGeo);
    const liste = document.getElementById(config.idSuggestions);

    // Sécurité : si les éléments n'existent pas sur la page, on sort
    if (!champRue || !btnGeo || !liste) return;

    // -- Clic sur le bouton
    btnGeo.addEventListener("click", async () => {
        const valeur = champRue.value.trim();

        if (valeur.length < 3) {
            champRue.focus();
            return;
        }

        // Indiquer visuellement que la recherche est en cours
        btnGeo.textContent = "⏳";
        btnGeo.disabled = true;

        const features = await rechercherAdresse(valeur);

        // Remettre le bouton dans son état normal
        btnGeo.textContent = "📍";
        btnGeo.disabled = false;

        // Affichet les suggestions avec le callback de sélection
        afficherSuggestions(liste, features, function (props) {
            remplirChampsAdresse(
                props,
                config.idRue,
                config.idCp,
                config.idVille,
                config.messagesErreur
            );
        });
    });

    // Frappe dans le champ rue (debounce)
    let debounceGeo;

    champRue.addEventListener("input", () => {
        clearTimeout(debounceGeo);

        // Masquer les suggestions si le champ est trop court
        if (champRue.value.trim().length < 3) {
            masquerSuggestions(liste);
            return;
        }

        debounceGeo = setTimeout(async () => {

            const features = await rechercherAdresse(champRue.value.trim());
            afficherSuggestions(liste, features, function (props) {
                remplirChampsAdresse(
                    props,
                    config.idRue,
                    config.idCp,
                    config.idVille,
                    config.messagesErreur
                );
            });
        }, DELAI_DEBOUNCE);
    });

    // Fermer les suggestions si clic ailleurs
    document.addEventListener("click", (e) => {
        if (!liste.contains(e.target) && e.target !== champRue) {
            masquerSuggestions(liste);
        }
    });

    // Fermer les suggestions avec échap
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            masquerSuggestions(liste);
            champRue.focus();
        }
    });
}