/**
 * Module Brouillon - LocalStorage
 * Gestion de la sauvegarde/restauration des formulaires
 */

/**
 * PHASE JS-2 : Lire tous les champs d'un formulaire
 * et retourner un objet clé/valeur
 *
 * @param {HTMLFormElement} formulaire
 * @returns {Object} données du formulaire
 */
function lireFormulaire(formulaire) {
    const donnees = {};

    /*
     * Champs exclus de la lecture :
     * - Les checkboxes de consentement RGPD ne doivent jamais
     *   être sauvegardées (Art. 25 RGPD – Privacy by Design)
     * - L'utilisateur doit recocher explicitement à chaque visite
     */
    // const formData = new FormData(formulaire);
    const CHAMPS_EXCLUS = [
        "consentement",
        "consentement-client",
        "consentement-prospect",
    ];

    // formData.forEach(function (valeur, cle) {
    //     donnees[cle] = valeur;
    // })
    const elements = formulaire.elements;
    for (let i = 0; i < elements.length; i++) {
        const champ = elements[i];
        // Ignorer les champs sans ID ou exclus
        if (!champ.id || CHAMPS_EXCLUS.includes(champ.id)) continue;

        // Ignorer les boutons
        if (champ.type === "submit" || champ.type === "button") continue;

        // Lire la valeur
        donnees[champ.id] = champ.value || "";
    }

    return donnees;
}

/**
 * Sauvegarder le brouillon dans LocalStorage
 *
 * @param {string} cle       - Identifiant du brouillon (ex: "brouillon-client")
 * @param {Object} donnees   - Données à sauvegarder
 */
function sauvegarderBrouillon(cle, donnees) {
    // Ajouter l'heure de sauvegarde pour info
    donnees._sauvegardeLe = new Date().toLocaleDateString("fr-FR");

    // JSON.stringify : convertit l'objet en string pour LocalStorage
    localStorage.setItem(cle, JSON.stringify(donnees));

    console.log("Brouillon sauvegardé : ", donnees);
}

/**
 * Afficher un message de confirmation discret sous le bouton brouillon
 *
 * @param {HTMLButtonElement} bouton
 */
function afficherConfirmationBrouillon(bouton) {
    // Chercher ou créer la zone de confirmation
    let zone = document.getElementById('msg-brouillon');

    if (!zone) {
        zone = document.createElement('small');
        zone.id = 'msg-brouillon';
        zone.className = 'text-success ms-2';
        zone.setAttribute("role", 'status'); // Pour les lecteurs d'écran
        zone.setAttribute('aria-live', 'polite'); // Annonce discrète
        bouton.parentNode.appendChild(zone);
    }

    zone.textContent = 'Brouillon sauvegardé à ' + new Date().toLocaleTimeString("fr-FR" )

    // Effacer le message après 3 secondes
    setTimeout(function () {
        zone.textContent = '';
    }, 3000);
}

/**
 * PHASE JS-3 : Lire le brouillon depuis LocalStorage
 *
 * @param {string} cle
 * @returns {Object|null} données sauvegardées ou null
 */
function lireBrouillon(cle) {
    const json = localStorage.getItem(cle);

    // Si rien n'est sauvegardé, retourner null
    if (!json) return null;

    try {
        // JSON.parse : convertit la string en objet
        return JSON.parse(json);
    } catch (erreur) {
        // Si le string est corrompue, on nettoie et retourne null
        console.warn("⚠️ Brouillon corrompu, supprimé.", erreur);
        localStorage.removeItem(cle);
        return null;
    }
}

/**
 * Restaurer les données d'un brouillon dans un formulaire
 *
 * @param {HTMLFormElement} formulaire
 * @param {Object} donnees
 */
function restaurerFormulaire(formulaire, donnees) {
    Object.keys(donnees).forEach(function (cle) {
        // Ignorer les clés internes (commençant par _)
        if (cle.startsWith("_")) return;

        // Chercher le champ correspondant via son attribut name
        const champ = formulaire.querySelector("[name='" + cle + "']");

        if (!champ) return;

        // Adapter selon le type de champ
        if (champ.type === "checkbox") {
            // Checkbox : valeur booléenne
            champ.checked = donnees[cle] === "on";
        } else if (champ.tagName === "SELECT") {
            // Select : sélectionner l'option correspondante
            champ.value = donnees[cle];
        } else {
            // Inputs texte, email, tel, number, date...
            champ.value = donnees[cle];
        }
    });
}

/**
 * Afficher une bannière "Brouillon restauré"
 *
 * @param {HTMLFormElement} formulaire
 * @param {string} heureSauvegarde
 */
function afficherBanniereBrouillon(formulaire, heureSauvegarde) {
    const banniere = document.createElement("div");
    banniere.className = "alert alert-info alert-dismissible d-flex align-items-center gap-2 mb-4";
    banniere.setAttribute("role", "alert");
    banniere.innerHTML =
        "<span>📄</span>" +
        "<span>Brouillon restauré (sauvegardé à " + heureSauvegarde + "). " +
        "Vous pouvez continuer votre saisie.</span>" +
        "<button type='button' class='btn-close' data-bs-dismiss='alert' " +
        "aria-label='Fermer cette notification'></button>";

    // Insérer avant le premier élément du formulaire
    formulaire.insertBefore(banniere, formulaire.firstChild);
}

/**
 * PHASE JS-5 : Effacer le brouillon
 *
 * @param {string} cle
 */
function effacerBrouillon(cle) {
    localStorage.removeItem(cle);
    console.log("🗑️ Brouillon effacé pour la clé :", cle);
}

