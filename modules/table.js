let dataTable; // Variable para almacenar la instancia de DataTable

// Inicializar DataTable
function initDataTable() {
  if ($.fn.DataTable.isDataTable("#transactionsTable")) {
    dataTable.destroy();
    $("#transactionsTable").empty();
  }

  dataTable = $("#transactionsTable").DataTable({
    responsive: true,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
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
  $("#categoryFilter, #typeFilter").on("change", function () {
    dataTable.draw();
  });

  // Filtro personalizado para categoría
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    const category = $("#categoryFilter").val();
    const type = $("#typeFilter").val();

    const rowCategory = data[2]; // Columna de categoría
    const rowType = data[3]; // Columna de tipo

    if (
      (category === "" || rowCategory === category) &&
      (type === "" || rowType === type)
    ) {
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
