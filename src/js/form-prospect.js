/**
 * form-prospect.js
 * Spécifique au formulaire prospect.
 * Les fonctions génériques sont dans utils-form.js
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-prospect");
    if (!form) return;

    // ─────────────────────────────────────────
    // Ce qui est PROPRE au formulaire prospect
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
    // Appels aux fonctions génériques (utils-form.js)
    // ─────────────────────────────────────────

    // 1. Validation blur + input
    brancherValidation(messagesErreur);

    // 2. Auto-sauvegarde (30s + debounce)
    brancherAutoSauvegarde(form, CLE_BROUILLON);

    // 3. Bouton annuler avec confirmation
    brancherBoutonAnnuler("btn-annuler-p", CLE_BROUILLON);

    // ─────────────────────────────────────────
    // Bouton "Enregistrer brouillon" (manuel)
    // ─────────────────────────────────────────

    const btnBrouillon = document.getElementById("btn-brouillon-p");

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
        console.log("✅ Formulaire prospect valide, brouillon effacé.");
        window.location.href = "../../index.html";
    });
});
