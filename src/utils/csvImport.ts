import { Transaction } from "../types";

export function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();

  if (
    desc.includes("uber") || desc.includes("didi") || desc.includes("rides") ||
    desc.includes("taxi") || desc.includes("transporte") || desc.includes("gasolina") ||
    desc.includes("estacionamiento")
  ) {
    return "Transporte";
  }

  if (
    desc.includes("mcdonald") || desc.includes("dunkin") || desc.includes("donut") ||
    desc.includes("xochimilco") || desc.includes("pycca") || desc.includes("eats") ||
    desc.includes("restaurant") || desc.includes("comida") || desc.includes("almuerzo") ||
    desc.includes("cena") || desc.includes("desayuno") || desc.includes("supermercado") ||
    desc.includes("mercado") || desc.includes("kfc") || desc.includes("pizza") ||
    desc.includes("burger")
  ) {
    return "Comida";
  }

  if (
    desc.includes("cine") || desc.includes("multicine") || desc.includes("supercine") ||
    desc.includes("steam") || desc.includes("netflix") || desc.includes("disney") ||
    desc.includes("spotify") || desc.includes("youtube") || desc.includes("musica") ||
    desc.includes("pelicula") || desc.includes("video") || desc.includes("juego") ||
    desc.includes("entretenimiento")
  ) {
    return "Entretenimiento";
  }

  if (
    desc.includes("miniso") || desc.includes("el español") || desc.includes("xtrim") ||
    desc.includes("tienda") || desc.includes("shop") || desc.includes("store") ||
    desc.includes("ropa") || desc.includes("zapatos") || desc.includes("compras") ||
    desc.includes("market") || desc.includes("mall") || desc.includes("centro comercial")
  ) {
    return "Compras";
  }

  if (
    desc.includes("instituto") || desc.includes("educa") || desc.includes("flywire") ||
    desc.includes("universidad") || desc.includes("colegio") || desc.includes("escuela") ||
    desc.includes("curso") || desc.includes("libro") || desc.includes("material") ||
    desc.includes("educacion") || desc.includes("estudio")
  ) {
    return "Educación";
  }

  if (
    desc.includes("servicio digital") || desc.includes("iva servicio") ||
    desc.includes("app store") || desc.includes("google play") || desc.includes("software") ||
    desc.includes("app") || desc.includes("hosting") || desc.includes("dominio") ||
    desc.includes("vpn")
  ) {
    return "Servicios Digitales";
  }

  if (
    desc.includes("transferencia") || desc.includes("comision") || desc.includes("cargo serv") ||
    desc.includes("interbanc") || desc.includes("pago directo") || desc.includes("banred") ||
    desc.includes("banco") || desc.includes("tarjeta") || desc.includes("comisión") ||
    desc.includes("intereses") || desc.includes("seguro")
  ) {
    return "Comisiones Bancarias";
  }

  if (
    desc.includes("farmacia") || desc.includes("medicina") || desc.includes("hospital") ||
    desc.includes("doctor") || desc.includes("clinica") || desc.includes("salud") ||
    desc.includes("farma") || desc.includes("medico")
  ) {
    return "Salud";
  }

  if (
    desc.includes("luz") || desc.includes("agua") || desc.includes("telefono") ||
    desc.includes("internet") || desc.includes("cable") || desc.includes("electricidad") ||
    desc.includes("gas") || desc.includes("mantenimiento") || desc.includes("hogar") ||
    desc.includes("casa")
  ) {
    return "Servicios del Hogar";
  }

  return "Otros";
}

export function processCSV(content: string): Transaction[] {
  const lines = content.split("\n");
  const transactions: Transaction[] = [];

  const startLine = 7; 

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
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

    if (values.length >= 8) {
      const type = values[6].trim() === "(+)" ? "ingreso" : "gasto";

      const dateParts = values[1].split("/");
      let formattedDate = values[1]; 

      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, "0");
        const month = dateParts[1].padStart(2, "0");
        const year = dateParts[2];
        formattedDate = `${year}-${month}-${day}`;
      }

      const description = values[4] || values[3] || "Transacción sin descripción";

      const transaction: Transaction = {
        date: formattedDate,
        description: description,
        amount: Math.abs(parseFloat(values[7].replace(",", ""))),
        category: categorizeTransaction(description),
        type: type,
      };

      transactions.push(transaction);
    }
  }

  return transactions;
}
