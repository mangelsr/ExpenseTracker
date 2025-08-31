// Variables globales
let db;
const DB_NAME = "ExpenseTrackerDB";
const DB_VERSION = 1;
const STORE_NAME = "transactions";
let dataTable; // Variable para almacenar la instancia de DataTable
let categoryChart; // Gráfico de categorías
let pendingImport = []; // Transacciones pendientes de importación

// Inicializar la base de datos
function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Base de datos abierta con éxito");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Crear object store si no existe
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        // Crear índices para búsquedas
        store.createIndex("date", "date", { unique: false });
        store.createIndex("amount", "amount", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("type", "type", { unique: false });
      }
    };
  });
}

// Agregar una transacción
function addTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.add(transaction);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al agregar la transacción");
    };
  });
}

// Actualizar una transacción
function updateTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.put(transaction);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al actualizar la transacción");
    };
  });
}

// Obtener todas las transacciones
function getAllTransactions() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al obtener las transacciones");
    };
  });
}

// Obtener una transacción por ID
function getTransaction(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al obtener la transacción");
    };
  });
}

// Eliminar una transacción
function deleteTransaction(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject("Error al eliminar la transacción");
    };
  });
}

// Limpiar todas las transacciones
function clearAllTransactions() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject("Error al limpiar las transacciones");
    };
  });
}

// Calcular resumen financiero
function calculateSummary(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "ingreso") {
      totalIncome += parseFloat(transaction.amount);
    } else {
      totalExpense += parseFloat(transaction.amount);
    }
  });

  return {
    income: totalIncome,
    expense: totalExpense,
    balance: totalIncome - totalExpense,
  };
}

// Inicializar DataTable
function initDataTable() {
  if ($.fn.DataTable.isDataTable("#transactionsTable")) {
    dataTable.destroy();
    $("#transactionsTable").empty();
  }

  dataTable = $("#transactionsTable").DataTable({
    responsive: true,
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
    },
    dom: '<"row"<"col-md-6"B><"col-md-6"f>>rtip',
    buttons: [
      {
        extend: "csv",
        text: '<i class="fas fa-file-export me-2"></i>Exportar CSV',
        className: "btn btn-sm btn-outline-primary",
        title: "transacciones",
      },
      {
        extend: "print",
        text: '<i class="fas fa-print me-2"></i>Imprimir',
        className: "btn btn-sm btn-outline-secondary",
        title: "Historial de Transacciones",
        customize: function (win) {
          $(win.document.body)
            .css("font-size", "10pt")
            .prepend(
              '<h2 class="text-center">Historial de Transacciones</h2>' +
                '<div class="text-center">Generado el: ' +
                new Date().toLocaleDateString() +
                "</div>"
            );

          $(win.document.body)
            .find("table")
            .addClass("compact")
            .css("font-size", "inherit");
        },
      },
    ],
    order: [[0, "desc"]], // Ordenar por fecha descendente por defecto
    columnDefs: [
      {
        targets: 4, // Columna de monto
        className: "dt-body-right",
        render: function (data, type, row) {
          if (type === "display" || type === "filter") {
            const amount = parseFloat(data);
            const type = row[3]; // Tipo de transacción
            const colorClass = type === "ingreso" ? "income" : "expense";
            const sign = type === "gasto" ? "-" : "";
            return `<span class="${colorClass}">${sign}$${amount.toFixed(
              2
            )}</span>`;
          }
          return data;
        },
      },
      {
        targets: 5, // Columna de acciones
        orderable: false,
        searchable: false,
        className: "dt-body-center",
      },
      {
        targets: 3, // Columna de tipo
        render: function (data, type, row) {
          if (type === "display" || type === "filter") {
            const badgeClass = data === "ingreso" ? "bg-success" : "bg-danger";
            return `<span class="badge ${badgeClass}">${data}</span>`;
          }
          return data;
        },
      },
      {
        targets: 2, // Columna de categoría
        render: function (data, type, row) {
          if (type === "display" || type === "filter") {
            return `<span class="badge bg-secondary">${data}</span>`;
          }
          return data;
        },
      },
    ],
  });

  // Aplicar filtros
  $('#categoryFilter, #typeFilter').on('change', function() {
    dataTable.draw();
  });

  // Filtro personalizado para categoría
  $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
    const category = $('#categoryFilter').val();
    const type = $('#typeFilter').val();
    
    const rowCategory = data[2]; // Columna de categoría
    const rowType = data[3]; // Columna de tipo
    
    if ((category === '' || rowCategory === category) && 
        (type === '' || rowType === type)) {
      return true;
    }
    return false;
  });
}

// Mostrar transacciones en la tabla
function displayTransactions(transactions) {
  // Limpiar la tabla
  if (dataTable) {
    dataTable.clear().draw();
  } else {
    $("#transactionsBody").empty();
  }

  // Ordenar por fecha (más reciente primero)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Agregar filas a DataTable
  transactions.forEach((transaction) => {
    // Formatear fecha
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString();

    // Formatear monto
    const amountFormatted = parseFloat(transaction.amount).toFixed(2);

    // Crear fila para DataTable
    const row = [
      formattedDate,
      transaction.description,
      transaction.category,
      transaction.type,
      amountFormatted,
      `<div class="transaction-actions">
          <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${transaction.id}">
              <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${transaction.id}">
              <i class="fas fa-trash"></i>
          </button>
      </div>`,
    ];

    if (dataTable) {
      dataTable.row.add(row).draw(false);
    } else {
      const tbody = document.getElementById("transactionsBody");
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td><span class="badge bg-secondary">${
                  transaction.category
                }</span></td>
                <td><span class="badge ${
                  transaction.type === "ingreso" ? "bg-success" : "bg-danger"
                }">${transaction.type}</span></td>
                <td class="text-end ${
                  transaction.type === "ingreso" ? "income" : "expense"
                }">
                    ${
                      transaction.type === "gasto" ? "-" : ""
                    }$${amountFormatted}
                </td>
                <td class="text-center">
                    <div class="transaction-actions">
                        <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${
                          transaction.id
                        }">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                          transaction.id
                        }">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

      tbody.appendChild(tr);
    }
  });

  // Agregar event listeners a los botones de eliminar
  $(document)
    .off("click", ".delete-btn")
    .on("click", ".delete-btn", function () {
      const id = Number($(this).data("id"));
      deleteTransactionAndRefresh(id);
    });

  // Agregar event listeners a los botones de editar
  $(document)
    .off("click", ".edit-btn")
    .on("click", ".edit-btn", function () {
      const id = Number($(this).data("id"));
      editTransaction(id);
    });

  // Actualizar resumen
  updateSummary(transactions);
  
  // Actualizar gráfico
  updateCategoryChart(transactions);
}

// Actualizar el resumen financiero
function updateSummary(transactions) {
  const summary = calculateSummary(transactions);

  document.getElementById(
    "totalIncome"
  ).textContent = `$${summary.income.toFixed(2)}`;
  document.getElementById(
    "totalExpense"
  ).textContent = `$${summary.expense.toFixed(2)}`;
  document.getElementById(
    "totalBalance"
  ).textContent = `$${summary.balance.toFixed(2)}`;

  // Cambiar color del balance según si es positivo o negativo
  const balanceElement = document.getElementById("totalBalance");
  if (summary.balance < 0) {
    balanceElement.classList.remove("text-primary");
    balanceElement.classList.add("text-danger");
  } else {
    balanceElement.classList.remove("text-danger");
    balanceElement.classList.add("text-primary");
  }
}

// Actualizar gráfico de categorías
function updateCategoryChart(transactions) {
  // Filtrar solo gastos
  const expenses = transactions.filter(t => t.type === 'gasto');
  
  // Agrupar por categoría
  const categories = {};
  expenses.forEach(expense => {
    if (!categories[expense.category]) {
      categories[expense.category] = 0;
    }
    categories[expense.category] += parseFloat(expense.amount);
  });
  
  // Preparar datos para el gráfico
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  
  // Colores para las categorías
  const backgroundColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
    '#FF9F40', '#FF6384', '#C9CBCF', '#7CFC00', '#20B2AA'
  ];
  
  // Destruir gráfico existente si hay uno
  if (categoryChart) {
    categoryChart.destroy();
  }
  
  // Crear nuevo gráfico
  const ctx = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Eliminar transacción y actualizar la vista
async function deleteTransactionAndRefresh(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta transacción?")) {
    try {
      await deleteTransaction(id);
      await loadTransactions();
      showToast("Transacción eliminada correctamente", "success");
    } catch (error) {
      showToast("Error al eliminar la transacción", "danger");
    }
  }
}

// Editar transacción
async function editTransaction(id) {
  try {
    const transaction = await getTransaction(id);
    
    // Llenar el formulario de edición
    document.getElementById('editId').value = transaction.id;
    document.getElementById('editDescription').value = transaction.description;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editCategory').value = transaction.category;
    document.getElementById('editDate').value = transaction.date;
    document.getElementById('editType').value = transaction.type;
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    modal.show();
    
  } catch (error) {
    console.error("Error al cargar transacción para editar:", error);
    showToast("Error al cargar la transacción", "danger");
  }
}

// Guardar transacción editada
async function saveEditedTransaction() {
  const id = document.getElementById('editId').value;
  const description = document.getElementById('editDescription').value;
  const amount = parseFloat(document.getElementById('editAmount').value);
  const category = document.getElementById('editCategory').value;
  const date = document.getElementById('editDate').value;
  const type = document.getElementById('editType').value;

  const transaction = {
    id: Number(id),
    description,
    amount,
    category,
    date,
    type,
  };

  try {
    await updateTransaction(transaction);
    await loadTransactions();
    
    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editTransactionModal'));
    modal.hide();
    
    showToast("Transacción actualizada correctamente", "success");
  } catch (error) {
    console.error("Error al actualizar la transacción:", error);
    showToast("Error al actualizar la transacción", "danger");
  }
}

// Cargar transacciones desde la base de datos
async function loadTransactions() {
  try {
    showLoading(true);
    const transactions = await getAllTransactions();
    displayTransactions(transactions);
    showLoading(false);
  } catch (error) {
    console.error("Error al cargar transacciones:", error);
    showToast("Error al cargar las transacciones", "danger");
    showLoading(false);
  }
}

// Mostrar/ocultar pantalla de carga
function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (show) {
    overlay.classList.remove('d-none');
  } else {
    overlay.classList.add('d-none');
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

// Función para categorizar automáticamente basada en la descripción
function categorizeTransaction(description) {
  const desc = description.toLowerCase();

  // Transporte
  if (
    desc.includes("uber") ||
    desc.includes("didi") ||
    desc.includes("rides") ||
    desc.includes("taxi") ||
    desc.includes("transporte") ||
    desc.includes("gasolina") ||
    desc.includes("estacionamiento")
  ) {
    return "Transporte";
  }

  // Comida y restaurantes
  if (
    desc.includes("mcdonald") ||
    desc.includes("dunkin") ||
    desc.includes("donut") ||
    desc.includes("xochimilco") ||
    desc.includes("pycca") ||
    desc.includes("eats") ||
    desc.includes("restaurant") ||
    desc.includes("comida") ||
    desc.includes("almuerzo") ||
    desc.includes("cena") ||
    desc.includes("desayuno") ||
    desc.includes("supermercado") ||
    desc.includes("mercado") ||
    desc.includes("kfc") ||
    desc.includes("pizza") ||
    desc.includes("burger")
  ) {
    return "Comida";
  }

  // Entretenimiento
  if (
    desc.includes("cine") ||
    desc.includes("multicine") ||
    desc.includes("supercine") ||
    desc.includes("steam") ||
    desc.includes("netflix") ||
    desc.includes("disney") ||
    desc.includes("spotify") ||
    desc.includes("youtube") ||
    desc.includes("musica") ||
    desc.includes("pelicula") ||
    desc.includes("video") ||
    desc.includes("juego") ||
    desc.includes("entretenimiento")
  ) {
    return "Entretenimiento";
  }

  // Compras
  if (
    desc.includes("miniso") ||
    desc.includes("el español") ||
    desc.includes("xtrim") ||
    desc.includes("tienda") ||
    desc.includes("shop") ||
    desc.includes("store") ||
    desc.includes("ropa") ||
    desc.includes("zapatos") ||
    desc.includes("compras") ||
    desc.includes("market") ||
    desc.includes("mall") ||
    desc.includes("centro comercial")
  ) {
    return "Compras";
  }

  // Educación
  if (
    desc.includes("instituto") ||
    desc.includes("educa") ||
    desc.includes("flywire") ||
    desc.includes("universidad") ||
    desc.includes("colegio") ||
    desc.includes("escuela") ||
    desc.includes("curso") ||
    desc.includes("libro") ||
    desc.includes("material") ||
    desc.includes("educacion") ||
    desc.includes("estudio")
  ) {
    return "Educación";
  }

  // Servicios digitales
  if (
    desc.includes("servicio digital") ||
    desc.includes("iva servicio") ||
    desc.includes("app store") ||
    desc.includes("google play") ||
    desc.includes("software") ||
    desc.includes("app") ||
    desc.includes("hosting") ||
    desc.includes("dominio") ||
    desc.includes("vpn")
  ) {
    return "Servicios Digitales";
  }

  // Transferencias y comisiones bancarias
  if (
    desc.includes("transferencia") ||
    desc.includes("comision") ||
    desc.includes("cargo serv") ||
    desc.includes("interbanc") ||
    desc.includes("pago directo") ||
    desc.includes("banred") ||
    desc.includes("banco") ||
    desc.includes("tarjeta") ||
    desc.includes("comisión") ||
    desc.includes("intereses") ||
    desc.includes("seguro")
  ) {
    return "Comisiones Bancarias";
  }

  // Salud
  if (
    desc.includes("farmacia") ||
    desc.includes("medicina") ||
    desc.includes("hospital") ||
    desc.includes("doctor") ||
    desc.includes("clinica") ||
    desc.includes("salud") ||
    desc.includes("farma") ||
    desc.includes("medico")
  ) {
    return "Salud";
  }

  // Servicios del hogar
  if (
    desc.includes("luz") ||
    desc.includes("agua") ||
    desc.includes("telefono") ||
    desc.includes("internet") ||
    desc.includes("cable") ||
    desc.includes("electricidad") ||
    desc.includes("agua") ||
    desc.includes("gas") ||
    desc.includes("mantenimiento") ||
    desc.includes("hogar") ||
    desc.includes("casa")
  ) {
    return "Servicios del Hogar";
  }

  // Por defecto
  return "Otros";
}

// Procesar archivo CSV con estructura bancaria específica
function processCSV(content) {
  const lines = content.split("\n");
  const transactions = [];

  // Ignorar las primeras 6 líneas que contienen metadatos
  // La línea 7 contiene los encabezados de las columnas de datos
  // Los datos comienzan desde la línea 8
  const startLine = 7; // Empezar desde la línea 8 (0-indexed)

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Manejar posibles comillas en los valores CSV
    const values = [];
    let inQuotes = false;
    let currentValue = "";

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    // Estructura esperada según el encabezado proporcionado:
    // No, Fecha, Ref., Lugar, Detalle, Secuencial, (+/-), Valor, Saldo Disponible, Saldo Contable, Descripción
    if (values.length >= 8) {
      // Determinar el tipo basado en la columna (+/-)
      const type = values[6].trim() === "(+)" ? "ingreso" : "gasto";

      // Formatear la fecha (formato DD/MM/YYYY)
      const dateParts = values[1].split("/");
      let formattedDate = values[1]; // Valor por defecto si el formato no es el esperado

      if (dateParts.length === 3) {
        // Asegurarse de que día y mes tengan 2 dígitos
        const day = dateParts[0].padStart(2, "0");
        const month = dateParts[1].padStart(2, "0");
        const year = dateParts[2];
        formattedDate = `${year}-${month}-${day}`;
      }

      // Obtener descripción (usar Detalle o Lugar)
      const description =
        values[4] || values[3] || "Transacción sin descripción";

      const transaction = {
        date: formattedDate,
        description: description,
        amount: Math.abs(parseFloat(values[7].replace(",", ""))), // Valor absoluto del valor
        category: categorizeTransaction(description), // Categoría automática
        type: type,
      };

      transactions.push(transaction);
    }
  }

  return transactions;
}

// Mostrar vista previa de importación
function showImportPreview(transactions) {
  const previewBody = document.getElementById('previewBody');
  previewBody.innerHTML = '';
  
  // Mostrar máximo 5 transacciones en la vista previa
  const previewTransactions = transactions.slice(0, 5);
  
  previewTransactions.forEach(transaction => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(transaction.date).toLocaleDateString()}</td>
      <td>${transaction.description}</td>
      <td><span class="badge bg-secondary">${transaction.category}</span></td>
      <td class="${transaction.type === 'ingreso' ? 'income' : 'expense'}">
        ${transaction.type === 'gasto' ? '-' : ''}$${parseFloat(transaction.amount).toFixed(2)}
      </td>
    `;
    previewBody.appendChild(tr);
  });
  
  // Mostrar contador si hay más transacciones
  if (transactions.length > 5) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="4" class="text-center small text-muted">
        + ${transactions.length - 5} transacciones más...
      </td>
    `;
    previewBody.appendChild(tr);
  }
  
  // Mostrar el panel de vista previa
  document.getElementById('importPreview').classList.remove('d-none');
}

// Ocultar vista previa de importación
function hideImportPreview() {
  document.getElementById('importPreview').classList.add('d-none');
  document.getElementById('csvFile').value = '';
  pendingImport = [];
}

// Exportar a CSV
function exportToCSV(transactions) {
  let csvContent = "date,description,amount,category,type\n";

  transactions.forEach((transaction) => {
    csvContent += `${transaction.date},${transaction.description},${transaction.amount},${transaction.category},${transaction.type}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "gastos.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Limpiar filtros
function clearFilters() {
  $('#categoryFilter').val('');
  $('#typeFilter').val('');
  if (dataTable) {
    dataTable.draw();
  }
}

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
    document.getElementById("confirmImport").addEventListener("click", async () => {
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
    document.getElementById("saveEditTransaction").addEventListener("click", async () => {
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