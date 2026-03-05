// Déconnexion avec confirmation
document.addEventListener("DOMContentLoaded", function() {
    const btnDeconnexion = document.getElementById("btn-deconnexion");
    const confirmDeconnexion = document.getElementById("confirm-deconnexion");
    const modalDeconnexion = new bootstrap.Modal(document.getElementById("modal-deconnexion"));

    if (btnDeconnexion) {
        btnDeconnexion.addEventListener("click", function(e) {
            e.preventDefault();
            modalDeconnexion.show();
        });
    }

    if (confirmDeconnexion) {
        confirmDeconnexion.addEventListener("click", function() {
            // Simule déconnexion (efface LocalStorage session si backend)
            localStorage.removeItem("user-session"); // Optionnel

            // Ferme modale
            modalDeconnexion.hide();
            location.reload()
        });
    }
});