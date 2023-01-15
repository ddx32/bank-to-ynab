
import { stringify } from "csv-stringify/browser/esm";
import type { Bank, CSVBody } from "../types";
import { getKbData } from "./getKbData";
import { getAirBankData } from "./getAirBankData";

function getCsvString(csvData: CSVBody): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(
      csvData,
      {
        delimiter: ";",
        quoted: true,
      },
      (err, output) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(output);
      }
    );
  });
}

function getDownloadUrl(textContents: string) {
  const blob = new Blob([textContents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return url;
}

function getCsvData(fileContent: string, bankId: string) {
  switch (bankId) {
    case "kb":
      return getKbData(fileContent);
    case "air_bank":
      return getAirBankData(fileContent);
    default:
      throw new Error('Invalid bank ID');
  }
}

/**
 * We need to use the older FileReader API because of cp1250 encoding
 */
function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const result = reader.result as string;
      resolve(result)
    }, false);

    if (file) {
      reader.readAsText(file, 'cp1250');
    } else {
      reject("No file specified")
    }
  })
}

export async function getYnabCsv(item: DataTransferItem, bank: Bank): Promise<string> {
  if (item.kind !== "file" || item.type !== "text/csv") {
    console.error("Error, go home");
    return;
  }

  const file = <File>item.getAsFile();
  const fileContent = await readTextFile(file);
  const csvData = await getCsvData(fileContent, bank.id);

  const headerRow = ["Date", "Payee", "Memo", "Amount"];
  const csvArray = [headerRow, ...csvData];

  const csvResult = await getCsvString(csvArray);
  return getDownloadUrl(csvResult);
}
