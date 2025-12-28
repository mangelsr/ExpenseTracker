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
    document.getElementById("editId").value = transaction.id;
    document.getElementById("editDescription").value = transaction.description;
    document.getElementById("editAmount").value = transaction.amount;
    document.getElementById("editCategory").value = transaction.category;
    document.getElementById("editDate").value = transaction.date;
    document.getElementById("editType").value = transaction.type;

    // Mostrar el modal
    const modal = new bootstrap.Modal(
      document.getElementById("editTransactionModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error al cargar transacción para editar:", error);
    showToast("Error al cargar la transacción", "danger");
  }
}

// Guardar transacción editada
async function saveEditedTransaction() {
  const id = document.getElementById("editId").value;
  const description = document.getElementById("editDescription").value;
  const amount = parseFloat(document.getElementById("editAmount").value);
  const category = document.getElementById("editCategory").value;
  const date = document.getElementById("editDate").value;
  const type = document.getElementById("editType").value;

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
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editTransactionModal")
    );
    modal.hide();

    showToast("Transacción actualizada correctamente", "success");
  } catch (error) {
    console.error("Error al actualizar la transacción:", error);
    showToast("Error al actualizar la transacción", "danger");
  }
}

// Cargar transacciones desde la base de datos, solo las nuevas si se indica lastId
async function loadTransactions(lastId = null) {
  try {
    showLoading(true);
    let transactions;
    if (lastId !== null) {
      // Obtener solo las transacciones con id mayor a lastId
      transactions = await getTransactionsAfterId(lastId);
      // Agregar solo las nuevas a la tabla existente
      if (transactions && transactions.length > 0) {
        transactions.forEach((t) =>
          dataTable.row
            .add([
              `<span data-order='${new Date(t.date).getTime()}'>${formatDateDMY(
                t.date
              )}</span>`,
              t.description,
              t.category,
              t.type,
              parseFloat(t.amount).toFixed(2),
              `<div class="transaction-actions">
              <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${t.id}">
                  <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${t.id}">
                  <i class="fas fa-trash"></i>
              </button>
          </div>`,
            ])
            .draw(false)
        );
        updateSummary([...dataTable.rows().data().toArray(), ...transactions]);
        updateCategoryChart([
          ...dataTable.rows().data().toArray(),
          ...transactions,
        ]);
      }
    } else {
      transactions = await getAllTransactions();
      displayTransactions(transactions);
    }
    showLoading(false);
  } catch (error) {
    console.error("Error al cargar transacciones:", error);
    showToast("Error al cargar las transacciones", "danger");
    showLoading(false);
  }
}

// Helper para mostrar fecha en formato DD/MM/YYYY
function formatDateDMY(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
