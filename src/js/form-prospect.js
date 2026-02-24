/**
 * Formulaire Prospect
 * Validation + Brouillon LocalStorage
 */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-prospect")

    // Sécurité : si le formulaire n'existe pas, on sort
    if (!form) return;

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
    // PHASE BP-2 : Restauration au chargement
    // =====================================================

    const brouillonSauvegarde = lireBrouillon(CLE_BROUILLON);

    if (brouillonSauvegarde) {
        // Remplir les champs avec les données sauvegardées
        restaurerFormulaire(form, brouillonSauvegarde);

        // Afficher la bannière d'information
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
    // PHASE BP-4a : Effacement après soumission
    // =====================================================

    form.addEventListener("submit", function (evenement) {
        evenement.preventDefault();

        /*
         * Pour l'instant pas encore de validation JS sur ce formulaire
         * (sera ajouté en Phase JS validation prospect).
         * On efface le brouillon et on redirige directement.
         */

        // Effacer le brouillon prospect
        effacerBrouillon(CLE_BROUILLON);

        console.log("✅ Formulaire prospect soumis, brouillon effacé.");

        // Redirection vers la liste (temporaire, sans backend)
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