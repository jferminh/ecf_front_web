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

    // FormData permet de lire tous les champs d'un formulaire
    // en une seule instruction, sans les nommer un par un
    const formData = new FormData(formulaire);

    formData.forEach(function (valeur, cle) {
        donnees[cle] = valeur;
    })

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