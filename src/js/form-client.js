/**
 * form-client.js
 * Spécifique au formulaire client.
 * Les fonctions génériques sont dans utils-form.js
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-client");
    if (!form) return;

    // ─────────────────────────────────────────
    // Ce qui est PROPRE au formulaire client
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
    // Appels aux fonctions génériques (utils-form.js)
    // ─────────────────────────────────────────

    // 1. Validation blur + input
    brancherValidation(messagesErreur);

    // 2. Auto-sauvegarde (30s + debounce)
    brancherAutoSauvegarde(form, CLE_BROUILLON);

    // 3. Bouton annuler avec confirmation
    brancherBoutonAnnuler("btn-annuler", CLE_BROUILLON);

    // ─────────────────────────────────────────
    // Bouton "Enregistrer brouillon" (manuel)
    // ─────────────────────────────────────────

    const btnBrouillon = document.getElementById("btn-brouillon");

    if (btnBrouillon) {
        btnBrouillon.addEventListener("click", function () {
            sauvegarderBrouillon(CLE_BROUILLON, lireFormulaire(form));
            afficherConfirmationBrouillon(btnBrouillon);
        });
    }

    // ─────────────────────────────────────────
    // Restauration du brouillon + état visuel
    // ─────────────────────────────────────────

    const brouillonSauvegarde = lireBrouillon(CLE_BROUILLON);

    if (brouillonSauvegarde) {
        restaurerFormulaire(form, brouillonSauvegarde);

        Object.keys(messagesErreur).forEach(function (id) {
            const champ = document.getElementById(id);
            if (!champ) return;
            if (champ.value.trim() !== "") {
                afficherErreur(champ, messagesErreur);
            }
        });

        const heure = brouillonSauvegarde._sauvegardeLe || "heure inconnue";
        afficherBanniereBrouillon(form, heure);
    }

    // ─────────────────────────────────────────
    // Soumission du formulaire
    // ─────────────────────────────────────────

    form.addEventListener("submit", function (evenement) {
        evenement.preventDefault();

        let formulaireValide = true;
        let premierChampInvalide = null;

        Object.keys(messagesErreur).forEach(function (id) {
            const champ = document.getElementById(id);
            if (!champ) return;

            afficherErreur(champ, messagesErreur);

            if (!champ.validity.valid) {
                formulaireValide = false;
                if (!premierChampInvalide) premierChampInvalide = champ;
            }
        });

        if (!formulaireValide) {
            if (premierChampInvalide) premierChampInvalide.focus();
            return;
        }

        effacerBrouillon(CLE_BROUILLON);
        console.log("✅ Formulaire client valide, brouillon effacé.");
        window.location.href = "../../index.html";
    });
});
