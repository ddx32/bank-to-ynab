import { parse } from "csv-parse/browser/esm";
import type { CSVBody } from "../types";

const csvOptions = { delimiter: ";" };

function parseCsvString(csvString: string): Promise<CSVBody> {
  return new Promise((resolve, reject) => {
    parse(csvString, csvOptions, (err, records) => {
      if (err) {
        reject(err);
        return;
      }
      const dataArray = records.slice(1).map((rowRaw: Array<string>) => {
        const row = rowRaw.map((field) => field.trim());
        const date = row[0];
        const payee = row[9];
        const memo = row[18];
        const amount = row[5];

        return [date, payee, memo, amount];
      });

      resolve(dataArray);
    });
  });
}

export function getAirBankData(csvFileContents: string) {
  return parseCsvString(csvFileContents)
}
