/**
 * Modal Suppression
 * Gestion dynamique du nom de l'entité à supprimer
 */

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("modal-suppression");

    // Sécurité : si la modal n'existe pas sur la page, on sort
    if (!modal) return;

    /**
     * Bootstrap émet "show.bs.modal" juste avant l'ouverture.
     * L'événement contient "relatedTarget" : le bouton
     * qui a déclenché l'ouverture de la modal.
     *
     * C'est ici qu'on lit data-nom sur le bouton déclencheur.
     */
    modal.addEventListener("show.bs.modal", function (evenement) {

        const boutonDeClencheur = evenement.relatedTarget;

        if (!boutonDeClencheur) {
            console.warn("⚠️ Aucun déclencheur trouvé pour la modal suppression");
            return;
        }

        const nom = boutonDeClencheur.dataset.nom;

        // =====================================================
        // PHASE MS-2 : Injecter le nom dans la modal
        // =====================================================

        /*
         * On cible le <strong id="nom-entite-suppression">
         * qu'on a préparé dans le HTML de la modal :
         * <strong id="nom-entite-suppression">"…"</strong>
         */
        const zoneNom = document.getElementById("nom-entite-suppression");

        if (zoneNom) {
            /*
             * On affiche le nom entre guillemets français
             * pour que le texte soit naturel :
             * "Êtes-vous sûr de vouloir supprimer "ACME Corporation" ?"
             */
            zoneNom.textContent = "\u00AB\u00A0" + nom + "\u00A0\u00BB";
        }

        /*
         * On mémorise aussi le nom sur la modal elle-même
         * via un attribut data-nom-courant.
         * MS-3 en aura besoin pour savoir quoi "supprimer".
         */
        modal.dataset.nomCourant = nom;

        console.log("🗑️ Modal prête pour suppression de :", nom);
    });


    // =====================================================
    // PHASE MS-3 : Bouton "Supprimer définitivement"
    // =====================================================

    const btnConfirmer = document.getElementById("btn-confirmer-suppression");

    if (btnConfirmer) {

        btnConfirmer.addEventListener("click", function () {

            /*
             * Récupérer le nom mémorisé en MS-2
             * sur l'attribut data-nom-courant de la modal
             */
            const nom = modal.dataset.nomCourant;
            console.log("Nom lu au clic :", nom);
            // const nom = modal.dataset.

            if (!nom) {
                console.warn("⚠️ Aucun nom trouvé pour la suppression");
                return;
            }

            /*
             * Feedback visuel immédiat :
             * Désactiver le bouton + afficher "Suppression en cours…"
             * pour éviter un double-clic pendant l'appel API futur
             */
            btnConfirmer.disabled = true;
            btnConfirmer.textContent = "⏳ Suppression en cours…";

            /*
             * Pour l'ECF (sans backend) :
             * On simule un délai réseau de 800ms puis on ferme la modal.
             *
             * Plus tard, ce setTimeout sera remplacé par :
             * fetch("/api/clients/" + id, { method: "DELETE" })
             *   .then(...)
             *   .catch(...)
             */
            setTimeout(function () {

                console.log("🗑️ Suppression confirmée pour :", nom);

                /*
                 * Fermer la modal programmatiquement via l'API Bootstrap :
                 * bootstrap.Modal.getInstance(element) récupère l'instance
                 * Bootstrap déjà créée sur cet élément.
                 */
                const instanceModal = bootstrap.Modal.getInstance(modal);
                if (instanceModal) {
                    instanceModal.hide();
                }

            }, 800);

        });

        // =====================================================
        // PHASE MS-4 : Réinitialisation à la fermeture
        // =====================================================

        /*
         * On écoute "hidden.bs.modal" (après fermeture complète)
         * pour réinitialiser sans que l'utilisateur voie le reset
         */
        modal.addEventListener("hidden.bs.modal", function () {

            // 1. Remettre le bouton dans son état initial
            if (btnConfirmer) {
                btnConfirmer.disabled = false;
                btnConfirmer.textContent = "Supprimer définitivement";
            }

            // 2. Vider le nom mémorisé sur la modal
            delete modal.dataset.nomCourant;

            // 3. Remettre le texte par défaut dans la zone nom
            const zoneNom = document.getElementById("nom-entite-suppression");
            if (zoneNom) {
                zoneNom.textContent = "\u00AB\u00A0\u2026\u00A0\u00BB";
            }

            console.log("🔄 Modal suppression réinitialisée");
        });

    }


});
