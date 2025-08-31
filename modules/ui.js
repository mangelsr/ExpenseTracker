// Mostrar/ocultar pantalla de carga
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (show) {
    overlay.classList.remove("d-none");
  } else {
    overlay.classList.add("d-none");
  }
}

// Mostrar notificación toast
function showToast(message, type = "info") {
  // Crear toast container si no existe
  if (!$("#toastContainer").length) {
    $("body").append(`
            <div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3">
            </div>
        `);
  }

  const toastId = "toast-" + Date.now();
  const toast = $(`
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);

  $("#toastContainer").append(toast);

  const bsToast = new bootstrap.Toast(toast[0]);
  bsToast.show();

  // Eliminar el toast del DOM después de que se oculte
  toast[0].addEventListener("hidden.bs.toast", function () {
    toast.remove();
  });
}

// Limpiar filtros
function clearFilters() {
  $("#categoryFilter").val("");
  $("#typeFilter").val("");
  if (dataTable) {
    dataTable.draw();
  }
}