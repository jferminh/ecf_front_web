/**
 * Modal Connexion
 * Phase MX-1 : Ouverture + focus automatique
 */

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("modal-connexion");

    // Sécurité : si la modal n'existe pas sur la page, on sort
    if (!modal) return;

    const champIdentifiant = document.getElementById("login-identifiant");

    /**
     * Bootstrap émet des événements sur la modal :
     * - "show.bs.modal"   → juste avant l'ouverture (animation pas encore finie)
     * - "shown.bs.modal"  → après l'ouverture complète (animation terminée)
     * - "hide.bs.modal"   → juste avant la fermeture
     * - "hidden.bs.modal" → après la fermeture complète
     *
     * On écoute "shown.bs.modal" (avec 'n') car le focus
     * ne fonctionne que quand la modal est VISIBLE.
     */
    modal.addEventListener("shown.bs.modal", function () {
        if (champIdentifiant) {
            champIdentifiant.focus();
            console.log("🎯 Focus placé sur le champ Identifiant");
        }
    });

    // =====================================================
    // PHASE MX-2 : Afficher / Masquer le mot de passe
    // =====================================================

    const champMdp    = document.getElementById("login-mdp");
    const btnToggleMdp = document.getElementById("btn-toggle-mdp");

    if (btnToggleMdp && champMdp) {

        btnToggleMdp.addEventListener("click", function () {

            /*
             * Si le type est "password" → on le passe en "text" (visible)
             * Si le type est "text"     → on le repasse en "password" (masqué)
             */
            const estVisible = champMdp.type === "text";

            champMdp.type = estVisible ? "password" : "text";

            /*
             * aria-pressed : indique l'état du bouton toggle
             * "true"  = bouton enfoncé = mot de passe visible
             * "false" = bouton relâché = mot de passe masqué
             */
            btnToggleMdp.setAttribute("aria-pressed", String(!estVisible));

            /*
             * aria-label : doit refléter l'ACTION disponible,
             * pas l'état actuel
             * → si visible  : proposer "Masquer"
             * → si masqué   : proposer "Afficher"
             */
            btnToggleMdp.setAttribute(
                "aria-label",
                estVisible ? "Afficher le mot de passe" : "Masquer le mot de passe"
            );

            // Icône visuelle
            btnToggleMdp.textContent = estVisible ? "👁️" : "🙈";

            // Remettre le focus sur le champ mot de passe
            // pour ne pas perdre l'utilisateur clavier
            champMdp.focus();

            console.log("👁️ Mot de passe", estVisible ? "masqué" : "affiché");
        });
    }

    // =====================================================
    // PHASE MX-3 : Validation des champs
    // =====================================================

    const formConnexion = document.getElementById("form-connexion");

    if (formConnexion) {

        /**
         * Messages d'erreur personnalisés par champ
         */
        const messagesErreur = {
            "login-identifiant": {
                valueMissing: "L'identifiant est obligatoire.",
            },
            "login-mdp": {
                valueMissing: "Le mot de passe est obligatoire.",
            },
        };

        /**
         * Récupère le message d'erreur selon l'état du champ
         */
        function getMessageErreurConnexion(champ) {
            const messages  = messagesErreur[champ.id];
            const validite  = champ.validity;

            if (!messages) return champ.validationMessage;
            if (validite.valueMissing && messages.valueMissing) return messages.valueMissing;

            return champ.validationMessage;
        }

        /**
         * Affiche ou masque l'erreur sur un champ
         */
        function afficherErreurConnexion(champ) {
            const zoneErreur = document.getElementById(champ.id + "-erreur");

            if (champ.validity.valid) {
                champ.classList.remove("is-invalid");
                champ.classList.add("is-valid");
                champ.removeAttribute("aria-invalid");
                if (zoneErreur) {
                    zoneErreur.textContent = "";
                    zoneErreur.hidden = true;
                }
            } else {
                champ.classList.remove("is-valid");
                champ.classList.add("is-invalid");
                champ.setAttribute("aria-invalid", "true");
                if (zoneErreur) {
                    zoneErreur.textContent = getMessageErreurConnexion(champ);
                    zoneErreur.hidden = false;
                }
            }
        }

        // Validation au départ du champ (blur)
        ["login-identifiant", "login-mdp"].forEach(function (id) {
            const champ = document.getElementById(id);
            if (!champ) return;

            champ.addEventListener("blur", function () {
                afficherErreurConnexion(champ);
            });

            // Correction en temps réel si le champ était en erreur
            champ.addEventListener("input", function () {
                if (champ.classList.contains("is-invalid")) {
                    afficherErreurConnexion(champ);
                }
            });
        });

        /**
         * Interception de la soumission
         */
        formConnexion.addEventListener("submit", function (evenement) {
            evenement.preventDefault();

            let formulaireValide = true;
            let premierChampInvalide = null;

            ["login-identifiant", "login-mdp"].forEach(function (id) {
                const champ = document.getElementById(id);
                if (!champ) return;

                afficherErreurConnexion(champ);

                if (!champ.validity.valid) {
                    formulaireValide = false;
                    if (!premierChampInvalide) premierChampInvalide = champ;
                }
            });

            if (!formulaireValide) {
                // Focus sur le premier champ invalide
                if (premierChampInvalide) premierChampInvalide.focus();
                return;
            }

            // ✅ Formulaire valide
            // Plus tard : fetch() vers l'API backend
            console.log("✅ Connexion valide, prêt à envoyer.");
        });

    }

    // =====================================================
    // PHASE MX-4 : Réinitialisation à la fermeture
    // =====================================================

    /**
     * Bootstrap émet "hidden.bs.modal" après la fermeture complète
     * (animation de disparition terminée).
     * C'est le bon moment pour réinitialiser : la modal
     * n'est plus visible donc l'utilisateur ne voit pas le reset.
     */
    modal.addEventListener("hidden.bs.modal", function () {

        // 1. Remettre le formulaire à zéro (vide tous les champs)
        if (formConnexion) {
            formConnexion.reset();
        }

        // 2. Retirer les classes Bootstrap is-valid / is-invalid
        //    sur tous les champs de la modal
        ["login-identifiant", "login-mdp"].forEach(function (id) {
            const champ = document.getElementById(id);
            if (!champ) return;

            champ.classList.remove("is-valid", "is-invalid");
            champ.removeAttribute("aria-invalid");

            // Vider aussi les zones d'erreur
            const zoneErreur = document.getElementById(id + "-erreur");
            if (zoneErreur) {
                zoneErreur.textContent = "";
                zoneErreur.hidden = true;
            }
        });

        // 3. Réinitialiser le bouton toggle mot de passe
        //    (remettre en mode "masqué" si l'utilisateur
        //    avait cliqué sur 👁️ avant de fermer)
        if (champMdp) {
            champMdp.type = "password";
        }
        if (btnToggleMdp) {
            btnToggleMdp.textContent = "👁️";
            btnToggleMdp.setAttribute("aria-pressed", "false");
            btnToggleMdp.setAttribute("aria-label", "Afficher le mot de passe");
        }

        console.log("🔄 Modal connexion réinitialisée");
    });

});
