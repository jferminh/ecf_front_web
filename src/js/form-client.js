/**
 * Validation progressive du formulaire client
 * - Sans JS : validation HTML5 native du navigateur
 * - Avec JS : messages personnalisés + meilleure UX
 */

// On attend que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-client');

    // Sécurité : si le formulaire n'existe pas sur la page, on sort
    if (!form) return;

    /**
     * ÉTAPE 3.1 : Messages d'erreur personnalisés
     * On surcharge les messages HTML5 natifs
     */
    const messagesErreur = {
        "raison-sociale": {
            valueMissing: "La raison sociale est obligatoire.",
            tooShort: "La raison sociale doit contenir au moins 2 caractères."
        },
        "email-client": {
            valueMissing: "L'adresse email est obligatoire.",
            typeMismatch: "Format invalide. Exemple attendu : contact@societe.fr",
        },
        "telephone": {
            valueMissing: "Le numéro de téléphone est obligatoire.",
            patternMismatch: "Le téléphone doit contenir exactement 10 chiffres.",
        },
        "ca-annuel": {
            valueMissing: "Le chiffre d'affaires est obligatoire.",
            rangeUnderflow: "Le CA annuel doit être supérieur ou égal à 200€.",
            badInput: "Veuillez saisir un nombre valide.",
        },
        "nb-employes": {
            valueMissing: "Le nombre d'employés est obligatoire.",
            rangeUnderflow: "Le nombre d'employés doit être supérieur ou égal à 1.",
            badInput: "Veuillez saisir un nombre entier valide.",
        },
        "rue": {
            valueMissing: "La rue est obligatoire.",
        },
        "code-postal": {
            valueMissing: "Le code postal est obligatoire.",
            patternMismatch: "Le code postal doit contenir exactement 5 chiffres.",
        },
        "ville": {
            valueMissing: "La ville est obligatoire.",
        },
    };

    /**
     * ÉTAPE 3.2 : Récupère le message d'erreur personnalisé
     * selon l'état de validité du champ
     */
    function getMessageErreur(champ) {
        const id = champ.id;
        const validite = champ.validity;
        const messages = messagesErreur[id];

        // Si pas de config pour ce champ, retourner le message natif
        if (!messages) return champ.validationMessage;

        // Parcourir les états d'erreur possibles
        if (validite.valueMissing && messages.valueMissing) return messages.valueMissing;
        if (validite.typeMismatch && messages.typeMismatch) return messages.typeMismatch;
        if (validite.patternMismatch && messages.patternMismatch) return messages.patternMismatch;
        if (validite.rangeUnderflow && messages.rangeUnderflow) return messages.rangeUnderflow;
        if (validite.tooShort && messages.tooShort) return messages.tooShort;
        if (validite.badInput && messages.badInput) return messages.badInput;

        // Fallback sur le message natif HTML5
        return champ.validationMessage;
    }

    /**
     * ÉTAPE 3.3 : Affiche ou masque l'erreur sur un champ
     */
    function afficherErreur(champ) {
        const idErreur = champ.id + "-erreur";
        const zoneErreur = document.getElementById(idErreur);

        if (champ.validity.valid) {
            // Champ valide : retirer les classes d'erreur
            champ.classList.remove("is-invalid");
            champ.classList.add("is-valid");
            champ.removeAttribute("aria-invalid");

            if (zoneErreur) {
                zoneErreur.textContent = "";
                zoneErreur.hidden = true;
            }

        } else {
            // Champ invalide : afficher l'erreur
            champ.classList.remove("is-valid");
            champ.classList.add("is-invalid");
            champ.setAttribute("aria-invalid", "true");

            if (zoneErreur) {
                zoneErreur.textContent = getMessageErreur(champ);
                zoneErreur.hidden = false;
            }
        }
    }

    /**
     * ÉTAPE 3.4 : Validation en temps réel
     * Dès que l'utilisateur quitte un champ (blur)
     */
    const champsAValider = Object.keys(messagesErreur);

    champsAValider.forEach(function (id) {
        const champ = document.getElementById(id);
        if (!champ) return;

        // Validation au départ du champ (blur)
        champ.addEventListener("blur", function () {
            afficherErreur(champ);
        });

        // Correction en temps réel pendant la frappe (input)
        // Uniquement si le champ était déjà en erreur
        champ.addEventListener("input", function () {
            if (champ.classList.contains("is-invalid")) {
                afficherErreur(champ);
            }
        });
    });

    /**
     * ÉTAPE 3.5 : Interception de la soumission du formulaire
     * Valide tous les champs avant envoi
     */
    form.addEventListener("submit", function (evenement) {

        let formulaireValide = true;
        let premierChampInvalide = null;

        // Valider tous les champs
        champsAValider.forEach(function (id) {
            const champ = document.getElementById(id);
            if (!champ) return;

            afficherErreur(champ);

            if (!champ.validity.valid) {
                formulaireValide = false;

                // Mémoriser le premier champ invalide pour y mettre le focus
                if (!premierChampInvalide) {
                    premierChampInvalide = champ;
                }
            }
        });

        if (!formulaireValide) {
            // Bloquer la soumission
            evenement.preventDefault();

            // Mettre le focus sur le premier champ invalide
            // (important pour l'accessibilité RGAA)
            if (premierChampInvalide) {
                premierChampInvalide.focus();
            }

            return;
        }

        // ✅ Formulaire valide :
        // 1. Effacer le brouillon (plus besoin)
        effacerBrouillon(CLE_BROUILLON);

        // 2. Plus tard : remplacer par fetch() vers l'API backend
        console.log("✅ Formulaire soumis, brouillon effacé.");

        // Pour l'ECF (sans backend) : rediriger vers la liste
        evenement.preventDefault(); // À retirer quand on aura un backend
        window.location.href = "../../index.html";
    });

    // =====================================================
    // PHASE JS-2 : Bouton "Enregistrer brouillon"
    // =====================================================

    const btnBrouillon = document.getElementById("btn-brouillon");
    const CLE_BROUILLON = "brouillon-client";

    if (btnBrouillon) {
        btnBrouillon.addEventListener("click", function () {
            // 1. Lire tous les champs du formulaire
            const donnees = lireFormulaire(form);

            // 2. Sauvegarder dans LocalStorage
            sauvegarderBrouillon(CLE_BROUILLON, donnees);

            // 3. Confirmer visuellement à l'utilisateur
            afficherConfirmationBrouillon(btnBrouillon);
        });
    }

    // =====================================================
    // PHASE JS-3 : Restaurer le brouillon au chargement
    // =====================================================

    const brouillonSauvegarde = lireBrouillon(CLE_BROUILLON);

    if (brouillonSauvegarde) {
        // Remplir les champs avec les données sauvegardées
        restaurerFormulaire(form, brouillonSauvegarde);

        // Afficher une bannière pour informer l'utilisateur
        const heure = brouillonSauvegarde._sauvegardeLe || "heure inconnue";
        afficherBanniereBrouillon(form, heure);
    }

    // =====================================================
    // PHASE JS-4 : Auto-sauvegarde
    // =====================================================

    /**
     * Indicateur visuel d'auto-sauvegarde (dans le header)
     * On met à jour le badge "Brouillon auto"
     */
    function mettreAJourBadgeBrouillon(statut) {
        const badge = document.querySelector("[data-badge-brouillon]");
        if (!badge) return;

        if (statut === "en-cours") {
            badge.textContent = "📄 Sauvegarde…";
            badge.className = "badge bg-light text-secondary border";
        } else if (statut === "sauvegarde") {
            badge.textContent = "✅ Brouillon sauvegardé";
            badge.className = "badge bg-success text-white border";

            // Remettre le badge normal après 2 secondes
            setTimeout(function () {
                badge.textContent = "📄 Brouillon auto";
                badge.className = "badge bg-light text-secondary border";
            }, 2000);
        }
    }

// --- Auto-sauvegarde toutes les 30 secondes ---
    const INTERVALLE_AUTO = 30000; // 30 000 ms = 30 secondes

    setInterval(function () {
        const donnees = lireFormulaire(form);

        // Ne sauvegarder que si au moins un champ est rempli
        const aucuneDonnee = Object.values(donnees).every(function (v) {
            return v === "";
        });

        if (!aucuneDonnee) {
            sauvegarderBrouillon(CLE_BROUILLON, donnees);
            mettreAJourBadgeBrouillon("sauvegarde");
            console.log("⏱️ Auto-sauvegarde déclenchée");
        }
    }, INTERVALLE_AUTO);

// --- Auto-sauvegarde à chaque modification ---
// On écoute "input" sur tous les champs du formulaire
    form.addEventListener("input", function () {
        // Utiliser un délai (debounce) : attendre 1s après
        // la dernière frappe avant de sauvegarder
        // Évite de sauvegarder à chaque lettre tapée
        clearTimeout(form._debounceTimer);
        form._debounceTimer = setTimeout(function () {
            sauvegarderBrouillon(CLE_BROUILLON, lireFormulaire(form));
            console.log("✏️ Auto-sauvegarde après frappe");
        }, 1000); // 1 seconde après la dernière frappe
    });

    // =====================================================
    // PHASE JS-6 : Confirmation avant Annuler
    // =====================================================

    const btnAnnuler = document.getElementById("btn-annuler");

    if (btnAnnuler) {
        btnAnnuler.addEventListener("click", function (evenement) {

            // Vérifier si un brouillon existe
            const brouillon = lireBrouillon(CLE_BROUILLON);

            if (brouillon) {
                // Empêcher la navigation immédiate
                evenement.preventDefault();

                /*
                * window.confirm() : boîte de dialogue native du navigateur
                * Retourne true si l'utilisateur clique "OK"
                * Retourne false si l'utilisateur clique "Annuler"
                *
                */
                const confirme = window.confirm(
                    "Vous avez un brouillon non soumis.\n\n" +
                    "Voulez-vous vraiment quitter sans enregistree ?"
                );

                if (confirme) {
                    // L'utilisateur accepte de perdre le brouillon
                    effacerBrouillon(CLE_BROUILLON);
                    window.location.href = "../../index.html";
                }
                // Sinon : on reste sur la page, rien ne se passe
            }
            // Si pas de brouillon -> navigation normale vers index.html
        });
    }
});