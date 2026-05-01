import { Transaction, CategoryRule } from "../types";

export function categorizeTransaction(description: string, rules: CategoryRule[]): string {
  const desc = description.toLowerCase();

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => desc.includes(keyword.toLowerCase()))) {
      return rule.name;
    }
  }

  return "Otros";
}

export function processCSV(content: string, rules: CategoryRule[]): Transaction[] {
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
        category: categorizeTransaction(description, rules),
        type: type,
      };

      transactions.push(transaction);
    }
  }

  return transactions;
}
