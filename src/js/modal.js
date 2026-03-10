document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // 1. MODALE SUPPRESSION
    // ============================================================
    const modalSuppression = document.getElementById('modal-suppression');

    if (modalSuppression) {
        // Affiche le nom de l'entité dans la modale depuis data-nom
        modalSuppression.addEventListener('show.bs.modal', function (e) {
            const btnDeclencheur = e.relatedTarget;
            const nom = btnDeclencheur
                ? btnDeclencheur.getAttribute('data-nom')
                : null;
            const spanNom = document.getElementById('nom-entite-suppression');
            if (spanNom) {
                spanNom.textContent = nom || 'cet élément';
            }
        });

        // Confirmation suppression
        const btnConfirmerSuppression = document.getElementById('btn-confirmer-suppression');
        if (btnConfirmerSuppression) {
            btnConfirmerSuppression.addEventListener('click', function () {
                // Ferme la modale
                bootstrap.Modal.getInstance(modalSuppression).hide();
                // TODO : appel fetch DELETE vers l'API backend (phase JakartaEE)
                console.log('Suppression confirmée.');
            });
        }
    }

    // ============================================================
    // 2. MODALE DÉCONNEXION — confirmation avant redirection
    // ============================================================
    const btnDeconnexion = document.getElementById('btn-deconnexion');
    const modalDeconnexion = document.getElementById('modal-deconnexion');

    if (btnDeconnexion && modalDeconnexion) {
        const bsModalDeconnexion = new bootstrap.Modal(modalDeconnexion);

        // Ouvre la modale au clic sur "Déconnexion"
        btnDeconnexion.addEventListener('click', function () {
            bsModalDeconnexion.show();
        });

        // Confirmation : efface la session et redirige vers login
        const btnConfirmerDeconnexion = document.getElementById('confirm-deconnexion');
        if (btnConfirmerDeconnexion) {
            btnConfirmerDeconnexion.addEventListener('click', function () {
                localStorage.removeItem('user-session');
                window.location.replace('login.html');
            });
        }
    }

    // ============================================================
    // 3. AFFICHER LE NOM DE L'UTILISATEUR CONNECTÉ DANS LE HEADER
    // ============================================================
    const spanNomUtilisateur = document.getElementById('nom-utilisateur');
    if (spanNomUtilisateur) {
        try {
            const session = JSON.parse(localStorage.getItem('user-session'));
            if (session && session.user) {
                spanNomUtilisateur.textContent = session.user;
            }
        } catch (e) {
            // session corrompue — auth-guard.js s'en occupera au prochain chargement
        }
    }

});
