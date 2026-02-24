/**
 * utils-form.js
 * Fonctions génériques partagées entre form-client.js
 * et form-prospect.js
 *
 * Chaque fonction reçoit "messagesErreur" en paramètre
 * pour rester indépendante du formulaire appelant.
 */

// ─────────────────────────────────────────────
// 1. Récupère le message d'erreur personnalisé
// ─────────────────────────────────────────────
function getMessageErreur(champ, messagesErreur) {
    const validite = champ.validity;
    const messages = messagesErreur[champ.id];

    if (!messages) return champ.validationMessage;

    // Les états sont testés dans l'ordre : valueMissing en premier
    const etats = [
        "valueMissing",
        "typeMismatch",
        "patternMismatch",
        "rangeUnderflow",
        "tooShort",
        "badInput"
    ];

    for (const etat of etats) {
        if (validite[etat] && messages[etat]) return messages[etat];
    }

    return champ.validationMessage;
}

// ─────────────────────────────────────────────
// 2. Affiche / masque l'erreur sur un champ
// ─────────────────────────────────────────────
function afficherErreur(champ, messagesErreur) {
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
            zoneErreur.textContent = getMessageErreur(champ, messagesErreur);
            zoneErreur.hidden = false;
        }
    }
}

// ─────────────────────────────────────────────
// 3. Branche blur + input sur tous les champs
// ─────────────────────────────────────────────
function brancherValidation(messagesErreur) {
    Object.keys(messagesErreur).forEach(function (id) {
        const champ = document.getElementById(id);
        if (!champ) return;

        champ.addEventListener("blur", function () {
            afficherErreur(champ, messagesErreur);
        });

        champ.addEventListener("input", function () {
            if (champ.classList.contains("is-invalid")) {
                afficherErreur(champ, messagesErreur);
            }
        });
    });
}

// ─────────────────────────────────────────────
// 4. Met à jour le badge brouillon dans le header
// ─────────────────────────────────────────────
function mettreAJourBadgeBrouillon(statut) {
    const badge = document.querySelector("[data-badge-brouillon]");
    if (!badge) return;

    if (statut === "en-cours") {
        badge.textContent = "📄 Sauvegarde…";
        badge.className = "badge bg-light text-secondary border";
    } else if (statut === "sauvegarde") {
        badge.textContent = "✅ Brouillon sauvegardé";
        badge.className = "badge bg-success text-white border";

        setTimeout(function () {
            badge.textContent = "📄 Brouillon auto";
            badge.className = "badge bg-light text-secondary border";
        }, 2000);
    }
}

// ─────────────────────────────────────────────
// 5. Auto-sauvegarde : setInterval + debounce
// ─────────────────────────────────────────────
function brancherAutoSauvegarde(form, CLE_BROUILLON) {
    // Toutes les 30 secondes
    setInterval(function () {
        const donnees = lireFormulaire(form);
        const aucuneDonnee = Object.values(donnees).every(function (v) {
            return v === "";
        });

        if (!aucuneDonnee) {
            sauvegarderBrouillon(CLE_BROUILLON, donnees);
            mettreAJourBadgeBrouillon("sauvegarde");
            console.log("⏱️ Auto-sauvegarde déclenchée");
        }
    }, 30000);

    // À chaque frappe (debounce 1s)
    form.addEventListener("input", function () {
        clearTimeout(form._debounceTimer);
        form._debounceTimer = setTimeout(function () {
            sauvegarderBrouillon(CLE_BROUILLON, lireFormulaire(form));
            console.log("✏️ Auto-sauvegarde après frappe");
        }, 1000);
    });
}

// ─────────────────────────────────────────────
// 6. Bouton Annuler avec confirmation si brouillon
// ─────────────────────────────────────────────
function brancherBoutonAnnuler(btnId, CLE_BROUILLON) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener("click", function (evenement) {
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
    });
}
