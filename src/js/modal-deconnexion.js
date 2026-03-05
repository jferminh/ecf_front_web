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

            // Met à jour UI
            document.getElementById("btn-connexion").textContent = "Se connecter";
            document.getElementById("btn-connexion").classList.remove("btn-outline-light");
            document.getElementById("btn-connexion").innerHTML = "<span class='me-1'>🔓</span> Se connecter";

            // Cache dropdown
            document.querySelector(".dropdown").classList.add("d-none");
            document.querySelector(".dropdown").classList.add("d-lg-flex");

            // Ferme modale
            modalDeconnexion.hide();

            // Message de confirmation
            const alert = document.createElement("div");
            alert.className = "alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 z-3";
            alert.style.maxWidth = "400px";
            alert.innerHTML = `
                <strong>Déconnexion réussie</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert"</button>
            `;
            document.body.prepend(alert);

            // Auto-disparition
            setTimeout(() => alert.remove(), 4000);
        });
    }
});