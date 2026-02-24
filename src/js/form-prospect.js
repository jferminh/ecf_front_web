/**
 * Formulaire Prospect
 * Validation + Brouillon LocalStorage
 */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-prospect")

    // Sécurité : si le formulaire n'existe pas, on sort
    if (!form) return;

    // =====================================================
    // PHASE VP-1 : Messages d'erreur personnalisés
    // =====================================================

    /*
     * Les IDs correspondent aux champs de form-prospect.html :
     * raison-sociale-p, email-prospect, telephone-p,
     * rue-p, cp-p, ville-p
     *
     * Les champs optionnels (interet-prospect, date-prospection)
     * ne sont pas dans cette table car ils n'ont pas de required
     */
    const messagesErreur = {
        "raison-sociale-p": {
            valueMissing:  "La raison sociale est obligatoire.",
            tooShort:      "La raison sociale doit contenir au moins 2 caractères.",
        },
        "email-prospect": {
            valueMissing:  "L'adresse email est obligatoire.",
            typeMismatch:  "Format invalide. Exemple attendu : contact@societe.fr",
        },
        "telephone-p": {
            valueMissing:     "Le numéro de téléphone est obligatoire.",
            patternMismatch:  "Le téléphone doit contenir exactement 10 chiffres.",
        },
        "rue-p": {
            valueMissing:  "La rue est obligatoire.",
        },
        "code-postal-p": {
            valueMissing:     "Le code postal est obligatoire.",
            patternMismatch:  "Le code postal doit contenir exactement 5 chiffres.",
        },
        "ville-p": {
            valueMissing:  "La ville est obligatoire.",
        },
    };

    /*
     * Récupère le message d'erreur selon l'état de validité du champ
     * Même logique que form-client.js
     */
    function getMessageErreur(champ) {
        const id       = champ.id;
        const validite = champ.validity;
        const messages = messagesErreur[id];

        if (!messages) return champ.validationMessage;

        if (validite.valueMissing    && messages.valueMissing)    return messages.valueMissing;
        if (validite.typeMismatch    && messages.typeMismatch)    return messages.typeMismatch;
        if (validite.patternMismatch && messages.patternMismatch) return messages.patternMismatch;
        if (validite.tooShort        && messages.tooShort)        return messages.tooShort;

        return champ.validationMessage;
    }

    // =====================================================
    // PHASE VP-2 : Validation blur + correction temps réel
    // =====================================================

    /*
     * Affiche ou masque l'erreur sur un champ
     * Même logique que form-client.js
     */
    function afficherErreur(champ) {
        const zoneErreur = document.getElementById(champ.id + "-erreur");

        if (champ.validity.valid) {
            // ✅ Champ valide
            champ.classList.remove("is-invalid");
            champ.classList.add("is-valid");
            champ.removeAttribute("aria-invalid");

            if (zoneErreur) {
                zoneErreur.textContent = "";
                zoneErreur.hidden = true;
            }
        } else {
            // ❌ Champ invalide
            champ.classList.remove("is-valid");
            champ.classList.add("is-invalid");
            champ.setAttribute("aria-invalid", "true");

            if (zoneErreur) {
                zoneErreur.textContent = getMessageErreur(champ);
                zoneErreur.hidden = false;
            }
        }
    }

    // Brancher blur + input sur chaque champ à valider
    Object.keys(messagesErreur).forEach(function (id) {
        const champ = document.getElementById(id);
        if (!champ) return;

        // Validation au départ du champ
        champ.addEventListener("blur", function () {
            afficherErreur(champ);
        });

        // Correction en temps réel si le champ était en erreur
        champ.addEventListener("input", function () {
            if (champ.classList.contains("is-invalid")) {
                afficherErreur(champ);
            }
        });
    });


    /*
   * Clé LocalStorage différente du client :
   * "brouillon-client" → "brouillon-prospect"
   * Évite d'écraser le brouillon client si les deux
   * formulaires sont ouverts en même temps
   */
    const CLE_BROUILLON = "brouillon-prospect";

    // =====================================================
    // PHASE BP-1 : Sauvegarde manuelle
    // =====================================================
    const btnBrouillon = document.getElementById("btn-brouillon-p");

    if (btnBrouillon) {
        btnBrouillon.addEventListener("click", () => {
            // Réutilisation directe des fonctions de brouillon.js
            const donnees = lireFormulaire(form);
            sauvegarderBrouillon(CLE_BROUILLON, donnees);
            afficherConfirmationBrouillon(btnBrouillon);
        })
    }

    // =====================================================
    // PHASE VP-4 : Restauration brouillon + état visuel
    // (remplace le bloc BP-2)
    // =====================================================

    const brouillonSauvegarde = lireBrouillon(CLE_BROUILLON);

    if (brouillonSauvegarde) {
        // 1. Remplir les champs
        restaurerFormulaire(form, brouillonSauvegarde);

        /*
         * 2. Mettre à jour l'état visuel de chaque champ restauré
         *
         * Sans cette étape, les champs sont remplis mais sans
         * bordure verte → l'utilisateur ne sait pas si ses
         * données sont valides ou non.
         *
         * On appelle afficherErreur() sur chaque champ restauré
         * pour appliquer is-valid ou is-invalid selon son contenu.
         */
        Object.keys(messagesErreur).forEach(function (id) {
            const champ = document.getElementById(id);
            if (!champ) return;

            /*
             * On ne valide que les champs qui ont une valeur
             * Les champs vides restent neutres (ni vert ni rouge)
             * pour ne pas agresser l'utilisateur dès l'ouverture
             */
            if (champ.value.trim() !== "") {
                afficherErreur(champ);
            }
        });

        // 3. Afficher la bannière
        const heure = brouillonSauvegarde._sauvegardeLe || "heure inconnue";
        afficherBanniereBrouillon(form, heure);
    }


    // =====================================================
    // PHASE BP-3 : Auto-sauvegarde
    // =====================================================

    /*
     * Même logique que form-client.js :
     * - setInterval toutes les 30 secondes
     * - Debounce 1s sur event input
     * - Mise à jour du badge dans le header
     */

    function mettreAJourBadgeBrouillonProspect(statut) {
        const badge = document.querySelector("[data-badge-brouillon]");
        if (!badge) return;

        if (statut === "sauvegarde") {
            badge.textContent = "✅ Brouillon sauvegardé";
            badge.className = "badge bg-success text-white border";

            setTimeout(function () {
                badge.textContent = "📄 Brouillon auto";
                badge.className = "badge bg-light text-secondary border";
            }, 2000);
        }
    }

    // Auto-sauvegarde toutes les 30 secondes
    setInterval(function () {
        const donnees = lireFormulaire(form);

        // Ne sauvegarder que si au moins un champ est rempli
        const aucuneDonnee = Object.values(donnees).every(function (v) {
            return v === "";
        });

        if (!aucuneDonnee) {
            sauvegarderBrouillon(CLE_BROUILLON, donnees);
            mettreAJourBadgeBrouillonProspect("sauvegarde");
            console.log("⏱️ Auto-sauvegarde prospect déclenchée");
        }
    }, 30000);

    // Auto-sauvegarde à chaque modification (debounce 1s)
    form.addEventListener("input", function () {
        clearTimeout(form._debounceTimer);
        form._debounceTimer = setTimeout(function () {
            sauvegarderBrouillon(CLE_BROUILLON, lireFormulaire(form));
            console.log("✏️ Auto-sauvegarde prospect après frappe");
        }, 1000);
    });

    // =====================================================
    // PHASE VP-3 : Interception de la soumission
    // (remplace le submit de BP-4)
    // =====================================================

    form.addEventListener("submit", function (evenement) {
        evenement.preventDefault();

        let formulaireValide = true;
        let premierChampInvalide = null;

        // Valider tous les champs de la table messagesErreur
        Object.keys(messagesErreur).forEach(function (id) {
            const champ = document.getElementById(id);
            if (!champ) return;

            afficherErreur(champ);

            if (!champ.validity.valid) {
                formulaireValide = false;
                if (!premierChampInvalide) premierChampInvalide = champ;
            }
        });

        if (!formulaireValide) {
            // Bloquer la soumission + focus sur le premier champ invalide
            if (premierChampInvalide) premierChampInvalide.focus();
            return;
        }

        // ✅ Formulaire valide
        effacerBrouillon(CLE_BROUILLON);
        console.log("✅ Formulaire prospect valide, brouillon effacé.");

        // Redirection temporaire (sans backend)
        window.location.href = "../../index.html";
    });


    // =====================================================
    // PHASE BP-4b : Confirmation avant Annuler
    // =====================================================

    const btnAnnuler = document.getElementById("btn-annuler-p");

    if (btnAnnuler) {
        btnAnnuler.addEventListener("click", function (evenement) {

            // Vérifier si un brouillon prospect existe
            const brouillon = lireBrouillon(CLE_BROUILLON);

            if (brouillon) {
                evenement.preventDefault();

                const confirme = window.confirm(
                    "Vous avez un brouillon non soumis.\n\n" +
                    "Voulez-vous vraiment quitter sans enregistrer ?"
                );

                if (confirme) {
                    effacerBrouillon(CLE_BROUILLON);
                    window.location.href = "../../index.html";
                }
            }
            // Si pas de brouillon → navigation normale
        });
    }

});