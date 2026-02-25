/**
 * form-prospect.js
 * Données et configuration spécifiques au formulaire prospect.
 * Toute la logique est dans utils-form.js
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-prospect");
    if (!form) return;

    // ─────────────────────────────────────────
    // Configuration propre au formulaire prospect
    // ─────────────────────────────────────────
    const CLE_BROUILLON = "brouillon-prospect";

    const messagesErreur = {
        "raison-sociale-p": {
            valueMissing: "La raison sociale est obligatoire.",
            tooShort:     "La raison sociale doit contenir au moins 2 caractères.",
        },
        "email-prospect": {
            valueMissing: "L'adresse email est obligatoire.",
            typeMismatch: "Format invalide. Exemple attendu : contact@societe.fr",
        },
        "telephone-p": {
            valueMissing:    "Le numéro de téléphone est obligatoire.",
            patternMismatch: "Le téléphone doit contenir exactement 10 chiffres.",
        },
        "rue-p": {
            valueMissing: "La rue est obligatoire.",
        },
        "code-postal-p": {
            valueMissing:    "Le code postal est obligatoire.",
            patternMismatch: "Le code postal doit contenir exactement 5 chiffres.",
        },
        "ville-p": {
            valueMissing: "La ville est obligatoire.",
        },
    };

    // ─────────────────────────────────────────
    // Branchements (utils-form.js)
    // ─────────────────────────────────────────
    brancherValidation(messagesErreur);
    brancherBoutonBrouillon("btn-brouillon-p", form, CLE_BROUILLON);
    brancherAutoSauvegarde(form, CLE_BROUILLON);
    brancherBoutonAnnuler("btn-annuler-p", CLE_BROUILLON);
    restaurerAvecEtatVisuel(form, messagesErreur, CLE_BROUILLON);
    brancherSoumission(form, messagesErreur, CLE_BROUILLON);
});
