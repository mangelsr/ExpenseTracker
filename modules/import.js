let pendingImport = []; // Transacciones pendientes de importación

// Mostrar vista previa de importación
function showImportPreview(transactions) {
  const previewBody = document.getElementById("previewBody");
  previewBody.innerHTML = "";

  // Mostrar máximo 5 transacciones en la vista previa
  const previewTransactions = transactions.slice(0, 5);

  previewTransactions.forEach((transaction) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(transaction.date).toLocaleDateString()}</td>
      <td>${transaction.description}</td>
      <td><span class="badge bg-secondary">${transaction.category}</span></td>
      <td class="${transaction.type === "ingreso" ? "income" : "expense"}">
        ${transaction.type === "gasto" ? "-" : ""}$${parseFloat(
      transaction.amount
    ).toFixed(2)}
      </td>
    `;
    previewBody.appendChild(tr);
  });

  // Mostrar contador si hay más transacciones
  if (transactions.length > 5) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="4" class="text-center small text-muted">
        + ${transactions.length - 5} transacciones más...
      </td>
    `;
    previewBody.appendChild(tr);
  }

  // Mostrar el panel de vista previa
  document.getElementById("importPreview").classList.remove("d-none");
}

// Ocultar vista previa de importación
function hideImportPreview() {
  document.getElementById("importPreview").classList.add("d-none");
  document.getElementById("csvFile").value = "";
  pendingImport = [];
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
