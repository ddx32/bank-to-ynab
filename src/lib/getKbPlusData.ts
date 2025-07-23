import { parse } from "csv-parse/browser/esm";
import type { CSVBody } from "../types";

const csvOptions = { delimiter: ";" };

export function preprocessKbPlusData(csvString: string): string {
  const rows = csvString.split("\n");
  const nonEmptyRows = rows.filter((row) => row.length > 0);
  const headerIndex = nonEmptyRows.findIndex((row) =>
    row.startsWith("Datum zauctovani"),
  );
  const result = nonEmptyRows.reduce((acc, current, index) => {
    if (index < headerIndex) return acc;

    if (current.startsWith("Datum zauctovani")) {
      acc += current + "\n";
      return acc;
    }

    const fields = current.split(";");
    const currency = fields[5];
    if (currency !== "CZK") return acc;
    acc += current + "\n";

    return acc;
  }, "");

  // remove last empty line
  const lastEmptyLineIndex = result.lastIndexOf("\n");
  const resultWithoutLastEmptyLine =
    lastEmptyLineIndex > 0 ? result.substring(0, lastEmptyLineIndex) : result;

  return resultWithoutLastEmptyLine;
}

export function getKbPlusData(csvString: string): Promise<CSVBody> {
  return new Promise((resolve, reject) => {
    parse(csvString, csvOptions, (err, records) => {
      if (err) {
        reject(err);
        return;
      }

      const dataArray = records.slice(1).map((rowRaw: Array<string>) => {
        const row = rowRaw.map((field) => field.trim());
        const date = row[18].length ? row[18].replace(/\s+.*$/, "") : row[0];
        const payee = (row[15].length && row[15]) || row[3];
        const memo = row[13];
        const amount = row[4];

        return [date, payee, memo, amount];
      });

      resolve(dataArray);
    });
  });
}
