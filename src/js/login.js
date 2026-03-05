document.addEventListener("DOMContentLoaded", function() {
    // Identifiants de démo (front-end only, ECF)
    const DEMO_USER = "admin";
    const DEMO_MDP = "afpa2026";

    // ── Helpers validation ────────────────────────────────────────────
    function validerChamp(champ, erreurId) {
        const zone = document.getElementById(erreurId);
        if (champ.validity.valid) {
            champ.classList.remove("is-invalid");
            champ.classList.add("is-valid");
            champ.removeAttribute("aria-invalid");
            if (zone) {
                zone.textContent = "";
                zone.hidden = true;
            }
            return true
        } else {
            champ.classList.remove("is-valid");
            champ.classList.add("is-invalid");
            champ.setAttribute("aria-invalid", "true");
            if (zone) {
                zone.textContent = champ.validity.valueMissing
                ? (champ.id.includes("mdp")
                    ? "Le mot de passe est obligatoire."
                    : "L\'identifiante est obligatoire.")
                    : champ.validationMessage;
                zone.hidden = false;
            }
            return false;
        }
    }

    // ── Afficher/masquer mot de passe ────────────────────────────────
    function brancherToggleMdp(inputId, btnId) {
        const input = document.getElementById(inputId);
        const btn   = document.getElementById(btnId);
        if (!input || !btn) return;
        btn.addEventListener('click', function () {
            const estVisible = input.type === 'text';
            input.type = estVisible ? 'password' : 'text';
            btn.setAttribute('aria-pressed', String(!estVisible));
            btn.setAttribute('aria-label',
                estVisible ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
            btn.textContent = estVisible ? '👁' : '🙈';
            input.focus();
        });
    }

    brancherToggleMdp('hero-mdp',   'btn-toggle-hero-mdp');
    brancherToggleMdp('modal-mdp',  'btn-toggle-modal-mdp');

    // ── Logique de soumission commune ────────────────────────────────
    function soumettre(identifiantId, mdpId, identifiantErrId, mdpErrId) {
        const champId  = document.getElementById(identifiantId);
        const champMdp = document.getElementById(mdpId);
        if (!champId || !champMdp) return;

        const okId  = validerChamp(champId,  identifiantErrId);
        const okMdp = validerChamp(champMdp, mdpErrId);

        if (!okId) { champId.focus();  return; }
        if (!okMdp) { champMdp.focus(); return; }

        // Vérification identifiants (démo front-end)
        if (champId.value === DEMO_USER && champMdp.value === DEMO_MDP) {
            // Stocker la session
            localStorage.setItem('user-session', JSON.stringify({
                user: champId.value,
                date: Date.now()
            }));
            // Rediriger vers le tableau de bord
            window.location.href = 'index.html';
        } else {
            // Mauvais identifiants : afficher erreur sur les deux champs
            [champId, champMdp].forEach(function(c) {
                c.classList.add('is-invalid');
                c.classList.remove('is-valid');
            });
            const zoneId = document.getElementById(identifiantErrId);
            if (zoneId) {
                zoneId.textContent = 'Identifiant ou mot de passe incorrect.';
                zoneId.hidden = false;
            }
            champId.focus();
        }
    }

    // ── Formulaire carte HERO (desktop) ─────────────────────────────
    const formHero = document.getElementById('form-connexion-hero');
    if (formHero) {
        ['hero-identifiant', 'hero-mdp'].forEach(function(id) {
            const champ = document.getElementById(id);
            if (!champ) return;
            champ.addEventListener('blur', function() {
                validerChamp(champ, id + '-erreur');
            });
            champ.addEventListener('input', function() {
                if (champ.classList.contains('is-invalid'))
                    validerChamp(champ, id + '-erreur');
            });
        });

        formHero.addEventListener('submit', function(e) {
            e.preventDefault();
            soumettre('hero-identifiant', 'hero-mdp',
                'hero-identifiant-erreur', 'hero-mdp-erreur');
        });
    }

    // ── Formulaire MODAL (mobile) ────────────────────────────────────
    const formModal = document.getElementById('form-connexion-modal');
    if (formModal) {
        ['modal-identifiant', 'modal-mdp'].forEach(function(id) {
            const champ = document.getElementById(id);
            if (!champ) return;
            champ.addEventListener('blur', function() {
                validerChamp(champ, id.replace('modal-', 'modal-') + '-erreur'
                    .replace('modal-identifiant-erreur', 'modal-id-erreur'));
            });
        });

        formModal.addEventListener('submit', function(e) {
            e.preventDefault();
            soumettre('modal-identifiant', 'modal-mdp',
                'modal-id-erreur', 'modal-mdp-erreur');
        });
    }
});