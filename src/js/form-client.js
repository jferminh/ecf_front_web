/**
 * form-client.js
 * Spécifique au formulaire client.
 * Les fonctions génériques sont dans utils-form.js
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-client");
    if (!form) return;

    // ─────────────────────────────────────────
    // Configuration propre au formulaire client
    // ─────────────────────────────────────────

    const CLE_BROUILLON = "brouillon-client";

    const messagesErreur = {
        "raison-sociale": {
            valueMissing: "La raison sociale est obligatoire.",
            tooShort:     "La raison sociale doit contenir au moins 2 caractères."
        },
        "email-client": {
            valueMissing:  "L'adresse email est obligatoire.",
            typeMismatch:  "Format invalide. Exemple attendu : contact@societe.fr",
        },
        "telephone": {
            valueMissing:     "Le numéro de téléphone est obligatoire.",
            patternMismatch:  "Le téléphone doit contenir exactement 10 chiffres.",
        },
        "ca-annuel": {
            valueMissing:    "Le chiffre d'affaires est obligatoire.",
            rangeUnderflow:  "Le CA annuel doit être supérieur ou égal à 200€.",
            badInput:        "Veuillez saisir un nombre valide.",
        },
        "nb-employes": {
            valueMissing:    "Le nombre d'employés est obligatoire.",
            rangeUnderflow:  "Le nombre d'employés doit être supérieur ou égal à 1.",
            badInput:        "Veuillez saisir un nombre entier valide.",
        },
        "rue": {
            valueMissing: "La rue est obligatoire.",
        },
        "code-postal": {
            valueMissing:     "Le code postal est obligatoire.",
            patternMismatch:  "Le code postal doit contenir exactement 5 chiffres.",
        },
        "ville": {
            valueMissing: "La ville est obligatoire.",
        },
    };

    // ─────────────────────────────────────────
    // Branchements (utils-form.js)
    // ─────────────────────────────────────────

    brancherValidation(messagesErreur);
    brancherBoutonBrouillon("btn-brouillon", form, CLE_BROUILLON);
    brancherAutoSauvegarde(form, CLE_BROUILLON);
    brancherBoutonAnnuler("btn-annuler", CLE_BROUILLON);
    restaurerAvecEtatVisuel(form, messagesErreur, CLE_BROUILLON);
    brancherSoumission(form, messagesErreur, CLE_BROUILLON);
});
