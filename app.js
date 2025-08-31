// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Inicializar base de datos
    await initDatabase();

    // Inicializar DataTable
    initDataTable();

    // Cargar transacciones existentes
    await loadTransactions();

    // Manejar envío del formulario
    document
      .getElementById("expenseForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const description = document.getElementById("description").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const category = document.getElementById("category").value;
        const date = document.getElementById("date").value;
        const type = document.getElementById("type").value;

        const transaction = {
          description,
          amount,
          category,
          date,
          type,
        };

        try {
          await addTransaction(transaction);
          await loadTransactions();

          // Resetear formulario
          document.getElementById("expenseForm").reset();
          document.getElementById("date").valueAsDate = new Date();

          showToast("Transacción agregada correctamente", "success");
        } catch (error) {
          showToast("Error al agregar la transacción", "danger");
        }
      });

    // Establecer fecha actual por defecto
    document.getElementById("date").valueAsDate = new Date();

    // Manejar carga de archivo CSV
    document.getElementById("csvFile").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const content = event.target.result;
          pendingImport = processCSV(content);

          // Mostrar vista previa en lugar de importar directamente
          showImportPreview(pendingImport);
        } catch (error) {
          console.error("Error al procesar CSV:", error);
          showToast("Error al procesar el archivo CSV", "danger");
        }
      };

      reader.readAsText(file);
    });

    // Confirmar importación
    document
      .getElementById("confirmImport")
      .addEventListener("click", async () => {
        if (pendingImport.length === 0) return;

        try {
          showLoading(true);
          // Agregar todas las transacciones a la base de datos
          for (const transaction of pendingImport) {
            await addTransaction(transaction);
          }

          // Recargar la vista
          await loadTransactions();
          hideImportPreview();
          showToast(
            `${pendingImport.length} transacciones importadas con éxito`,
            "success"
          );
        } catch (error) {
          console.error("Error al importar transacciones:", error);
          showToast("Error al importar las transacciones", "danger");
        } finally {
          showLoading(false);
        }
      });

    // Cancelar importación
    document.getElementById("cancelImport").addEventListener("click", () => {
      hideImportPreview();
    });

    // Hacer que el área de dropzone funcione
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("csvFile");

    dropZone.addEventListener("click", () => {
      fileInput.click();
    });

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("active");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("active");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("active");

      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        const event = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    });

    // Manejar exportación a CSV
    document.getElementById("exportBtn").addEventListener("click", async () => {
      try {
        const transactions = await getAllTransactions();
        exportToCSV(transactions);
        showToast("Datos exportados correctamente", "success");
      } catch (error) {
        showToast("Error al exportar los datos", "danger");
      }
    });

    // Manejar limpieza de datos
    document.getElementById("clearBtn").addEventListener("click", async () => {
      if (
        confirm(
          "¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer."
        )
      ) {
        try {
          await clearAllTransactions();
          await loadTransactions();
          showToast("Todos los datos han sido eliminados", "info");
        } catch (error) {
          showToast("Error al limpiar los datos", "danger");
        }
      }
    });

    // Guardar transacción editada
    document
      .getElementById("saveEditTransaction")
      .addEventListener("click", async () => {
        await saveEditedTransaction();
      });

    // Limpiar filtros
    document.getElementById("clearFilters").addEventListener("click", () => {
      clearFilters();
    });
  } catch (error) {
    console.error("Error al inicializar la aplicación:", error);
    showToast("Error al inicializar la aplicación", "danger");
  }
});
